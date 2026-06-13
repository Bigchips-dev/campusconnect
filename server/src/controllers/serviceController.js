const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const prisma = new PrismaClient();

async function getServices(req, res, next) {
  try {
    const {
      category,
      search,
      pricingType,
      minPrice,
      maxPrice,
      providerId,
      includeInactive,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const where = {};
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    if (providerId) where.providerId = providerId;
    if (category) {
      if (category.includes(',')) {
        where.category = { in: category.split(',') };
      } else {
        where.category = category;
      }
    }
    if (pricingType) where.pricingType = pricingType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          provider: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true, university: true },
          },
          _count: { select: { reviews: true, bookings: true } },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.service.count({ where }),
    ]);

    // Calculate average rating for each service
    const servicesWithRating = await Promise.all(
      services.map(async (service) => {
        const avgRating = await prisma.review.aggregate({
          where: { serviceId: service.id },
          _avg: { rating: true },
        });
        return { ...service, avgRating: avgRating._avg.rating || 0 };
      })
    );

    res.json({
      success: true,
      data: {
        services: servicesWithRating,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getServiceById(req, res, next) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            bio: true,
            university: true,
            faculty: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { bookings: true } },
      },
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    const avgRating = await prisma.review.aggregate({
      where: { serviceId: service.id },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      data: { ...service, avgRating: avgRating._avg.rating || 0 },
    });
  } catch (error) {
    next(error);
  }
}

async function createService(req, res, next) {
  try {
    const { title, description, category, price, pricingType, imageUrl } = req.body;

    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        pricingType: pricingType || 'FIXED',
        imageUrl,
        providerId: req.user.id,
      },
      include: {
        provider: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    // Add PROVIDER role if user doesn't already have it
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        activeRoles: {
          push: 'PROVIDER',
        },
      },
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Service not found');
    if (existing.providerId !== req.user.id) throw new ForbiddenError('Not your service');

    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        provider: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new NotFoundError('Service not found');
    if (existing.providerId !== req.user.id) throw new ForbiddenError('Not your service');

    await prisma.service.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'Service deactivated' });
  } catch (error) {
    next(error);
  }
}

module.exports = { getServices, getServiceById, createService, updateService, deleteService };
