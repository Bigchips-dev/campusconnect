const { Router } = require('express');
const { z } = require('zod');
const { getServices, getServiceById, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

const createServiceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(2000),
  category: z.enum([
    'ACADEMIC_TUTORING',
    'FOOD_CATERING',
    'BEAUTY_GROOMING',
    'TECH_DIGITAL',
    'FASHION_CLOTHING',
    'HOME_REPAIR',
    'HEALTH_WELLNESS',
    'CREATIVE_ARTS',
    'LOGISTICS_ERRANDS',
    'SPIRITUAL_CULTURAL',
    'WRITING_HELP',
    'PHONE_LAPTOP_REPAIR',
    'RESEARCH_STUDY_HELP',
    'SPORTS_FITNESS',
    'HOUSING_CAMPUS_LIFE',
    'PRINTING_MEDIA',
    'BUY_SELL_RENT',
    'CAREER_SELF_GROWTH',
  ]),
  price: z.number().min(0),
  pricingType: z.enum(['HOURLY', 'FIXED', 'FREE']).optional(),
  imageUrl: z.string().url().optional(),
});

const updateServiceSchema = createServiceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authenticate, validate(createServiceSchema), createService);
router.put('/:id', authenticate, validate(updateServiceSchema), updateService);
router.delete('/:id', authenticate, deleteService);

module.exports = router;
