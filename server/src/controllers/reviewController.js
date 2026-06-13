const { PrismaClient } = require('@prisma/client');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

const prisma = new PrismaClient();

async function createReview(req, res, next) {
  try {
    const { serviceId, rating, comment } = req.body;

    // Check that the user has a completed booking for this service
    const completedBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        seekerId: req.user.id,
        status: 'COMPLETED',
      },
    });

    if (!completedBooking) {
      throw new BadRequestError('You can only review services you have completed a booking for');
    }

    // Check for existing review
    const existingReview = await prisma.review.findUnique({
      where: {
        serviceId_reviewerId: { serviceId, reviewerId: req.user.id },
      },
    });

    if (existingReview) {
      throw new ConflictError('You have already reviewed this service');
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        serviceId,
        reviewerId: req.user.id,
      },
      include: {
        reviewer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}

async function getServiceReviews(req, res, next) {
  try {
    const reviews = await prisma.review.findMany({
      where: { serviceId: req.params.serviceId },
      include: {
        reviewer: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = await prisma.review.aggregate({
      where: { serviceId: req.params.serviceId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          average: avgRating._avg.rating || 0,
          count: avgRating._count.rating,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createReview, getServiceReviews };
