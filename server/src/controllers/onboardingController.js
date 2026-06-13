const { PrismaClient } = require('@prisma/client');
const { BadRequestError } = require('../utils/errors');

const prisma = new PrismaClient();

// GET /api/onboarding/progress
async function getProgress(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { providerSkills: true },
    });

    res.json({
      success: true,
      data: {
        step: user.onboardingStep,
        complete: user.onboardingComplete,
        roles: user.activeRoles,
        profile: {
          phone: user.phone, gender: user.gender, faculty: user.faculty,
          level: user.level, bio: user.bio, avatarUrl: user.avatarUrl,
        },
        interests: user.interests,
        skills: user.providerSkills,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/onboarding/profile
async function saveProfile(req, res, next) {
  try {
    const { phone, gender, faculty, level, bio, avatarUrl } = req.body;
    if (!phone) throw new BadRequestError('Phone number is required');
    if (!faculty) throw new BadRequestError('Faculty is required');

    const current = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { onboardingStep: true },
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        phone, gender, faculty, level, bio, avatarUrl,
        onboardingStep: Math.max(1, current.onboardingStep),
      },
    });

    res.json({ success: true, data: { step: 1 } });
  } catch (error) {
    next(error);
  }
}

// PUT /api/onboarding/interests
async function saveInterests(req, res, next) {
  try {
    const { interests } = req.body;
    if (!interests || interests.length === 0) {
      throw new BadRequestError('Select at least one interest');
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { interests, onboardingStep: 2 },
    });

    res.json({ success: true, data: { step: 2 } });
  } catch (error) {
    next(error);
  }
}

// PUT /api/onboarding/skills
async function saveSkills(req, res, next) {
  try {
    const { skills } = req.body; // [{ category, subcategory, description, pricingType, experience, portfolioUrls }]

    // Delete existing and replace
    await prisma.providerSkill.deleteMany({ where: { userId: req.user.id } });

    if (skills && skills.length > 0) {
      await prisma.providerSkill.createMany({
        data: skills.map((s) => ({
          userId: req.user.id,
          category: s.category,
          subcategory: s.subcategory,
          description: s.description || null,
          pricingType: s.pricingType || 'FIXED',
          experience: parseInt(s.experience) || 0,
          portfolioUrls: s.portfolioUrls || [],
        })),
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingStep: 3 },
    });

    res.json({ success: true, data: { step: 3 } });
  } catch (error) {
    next(error);
  }
}

// POST /api/onboarding/complete
async function complete(req, res, next) {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingComplete: true, onboardingStep: 4 },
      select: {
        id: true, firstName: true, lastName: true, activeRoles: true,
        onboardingComplete: true, onboardingStep: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProgress, saveProfile, saveInterests, saveSkills, complete };
