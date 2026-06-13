const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getProgress, saveProfile, saveInterests, saveSkills, complete } = require('../controllers/onboardingController');

const router = Router();

router.use(authenticate); // All onboarding routes require auth

router.get('/progress', getProgress);
router.put('/profile', saveProfile);
router.put('/interests', saveInterests);
router.put('/skills', saveSkills);
router.post('/complete', complete);

module.exports = router;
