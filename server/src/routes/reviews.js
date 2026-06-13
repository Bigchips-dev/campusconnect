const { Router } = require('express');
const { z } = require('zod');
const { createReview, getServiceReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

const createReviewSchema = z.object({
  serviceId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

router.post('/', authenticate, validate(createReviewSchema), createReview);
router.get('/service/:serviceId', getServiceReviews);

module.exports = router;
