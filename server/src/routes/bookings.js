const { Router } = require('express');
const { z } = require('zod');
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  message: z.string().max(500).optional(),
  scheduledAt: z.string().datetime().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
});

router.post('/', authenticate, validate(createBookingSchema), createBooking);
router.get('/my', authenticate, getMyBookings);
router.patch('/:id/status', authenticate, validate(updateStatusSchema), updateBookingStatus);

module.exports = router;
