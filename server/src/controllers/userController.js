const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../utils/errors');

const prisma = new PrismaClient();

const userSelectPublic = {
  id: true,
  firstName: true,
  lastName: true,
  university: true,
  phone: true,
  gender: true,
  faculty: true,
  level: true,
  avatarUrl: true,
  bio: true,
  activeRoles: true,
  interests: true,
  createdAt: true,
};

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        ...userSelectPublic,
        email: true,
        onboardingComplete: true,
        onboardingStep: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
    if (!user) throw new NotFoundError('User not found');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const { firstName, lastName, university, bio, avatarUrl, activeRoles } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(university && { university }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(activeRoles && { activeRoles }),
      },
      select: { ...userSelectPublic, email: true },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: userSelectPublic,
    });
    if (!user) throw new NotFoundError('User not found');

    const [services, completedBookingsCount] = await Promise.all([
      prisma.service.findMany({
        where: { providerId: user.id, isActive: true },
        include: {
          _count: { select: { reviews: true, bookings: true } },
        },
      }),
      prisma.booking.count({
        where: {
          service: { providerId: user.id },
          status: 'COMPLETED',
        },
      }),
    ]);

    res.json({
      success: true,
      data: { ...user, services, completedBookingsCount },
    });
  } catch (error) {
    next(error);
  }
}

async function getProviders(req, res, next) {
  try {
    const { category, search } = req.query;

    const where = {
      activeRoles: { has: 'PROVIDER' },
    };

    if (category) {
      where.OR = [
        { services: { some: { category, isActive: true } } },
        { providerSkills: { some: { category } } },
      ];
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const providers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        university: true,
        bio: true,
        services: {
          where: { isActive: true, ...(category && { category }) },
          select: {
            id: true,
            title: true,
            price: true,
            pricingType: true,
            category: true,
            imageUrl: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        reviews: {
          select: { rating: true },
        },
        bookings: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
      },
    });

    const processedProviders = providers.map((p) => {
      const totalRatings = p.reviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = p.reviews.length > 0 ? totalRatings / p.reviews.length : 0;

      return {
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        avatarUrl: p.avatarUrl,
        university: p.university,
        bio: p.bio,
        avgRating,
        completedCount: p.bookings.length,
        topListing: p.services[0] || null,
        hasActiveListings: p.services.length > 0,
      };
    });

    processedProviders.sort((a, b) => {
      if (a.hasActiveListings && !b.hasActiveListings) return -1;
      if (!a.hasActiveListings && b.hasActiveListings) return 1;

      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      return b.avgRating - a.avgRating;
    });

    res.json({ success: true, data: processedProviders });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMe, updateMe, getUserById, getProviders };
