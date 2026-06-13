const { Router } = require('express');
const { z } = require('zod');
const { getMe, updateMe, getUserById, getProviders } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

const updateMeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  university: z.string().min(1).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  activeRoles: z.array(z.enum(['SEEKER', 'PROVIDER'])).min(1).optional(),
});

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, validate(updateMeSchema), updateMe);
router.get('/providers', getProviders);
router.get('/:id', getUserById);

module.exports = router;
