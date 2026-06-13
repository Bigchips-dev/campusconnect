const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } = require('../utils/errors');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const prisma = new PrismaClient();

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true,
  university: true, phone: true, gender: true, faculty: true,
  level: true, avatarUrl: true, bio: true, activeRoles: true,
  interests: true, onboardingComplete: true, onboardingStep: true,
  emailVerified: true, createdAt: true,
};

async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, roles } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email, passwordHash, firstName, lastName,
        activeRoles: roles || ['SEEKER'],
        verificationToken,
      },
      select: USER_SELECT,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send verification email in background — never blocks response
    (async () => {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailErr) {
        console.error('Verification email failed:', emailErr);
      } finally {
        // intentionally empty — response always proceeds
      }
    })();

    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (error) {
    console.error('Registration full error trace:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed due to an unknown error', stack: error.stack });
  }
}

async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, rememberMe);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, verificationToken: __, resetToken: ___, resetTokenExpiry: ____, ...userData } = user;

    res.json({ success: true, data: { user: userData, accessToken } });
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedError('No refresh token');

    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new UnauthorizedError('User not found');

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, data: { accessToken } });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: new Date(Date.now() + 3600000) }, // 1 hour
    });

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailErr) {
      console.error('Reset email failed:', emailErr);
    } finally {
      // intentionally empty
    }

    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw new BadRequestError('Token and password required');

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });
    if (!user) throw new BadRequestError('Invalid or expired reset token');

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.query;
    if (!token) throw new BadRequestError('Verification token required');

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });
    if (!user) throw new BadRequestError('Invalid verification token');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail };
