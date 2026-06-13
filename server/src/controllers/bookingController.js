const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

const prisma = new PrismaClient();

async function createBooking(req, res, next) {
  try {
    const { serviceId, message, scheduledAt } = req.body;

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) throw new NotFoundError('Service not found');
    if (!service.isActive) throw new BadRequestError('Service is not available');
    if (service.providerId === req.user.id) {
      throw new BadRequestError('Cannot book your own service');
    }

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        seekerId: req.user.id,
        message,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        service: {
          select: { id: true, title: true, price: true, pricingType: true },
        },
        seeker: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const { role = 'seeker', status } = req.query;

    const where = {};
    if (role === 'seeker') {
      where.seekerId = req.user.id;
    } else {
      where.service = { providerId: req.user.id };
    }
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: {
          include: {
            provider: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        seeker: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { service: true },
    });

    if (!booking) throw new NotFoundError('Booking not found');

    // Provider can accept/reject/complete; seeker can cancel
    const isProvider = booking.service.providerId === req.user.id;
    const isSeeker = booking.seekerId === req.user.id;

    if (!isProvider && !isSeeker) {
      throw new ForbiddenError('Not authorized');
    }

    if (isSeeker && status !== 'CANCELLED') {
      throw new ForbiddenError('Seekers can only cancel bookings');
    }

    if (isProvider && !['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
      throw new ForbiddenError('Invalid status transition for provider');
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        service: { select: { id: true, title: true } },
        seeker: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = { createBooking, getMyBookings, updateBookingStatus };
