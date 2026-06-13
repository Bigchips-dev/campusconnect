const { Router } = require('express');
const { getAll, getById, getVirtual } = require('../controllers/categoryController');

const router = Router();

// Public routes — no auth required
router.get('/', getAll);
router.get('/virtual', getVirtual);
router.get('/:id', getById);

module.exports = router;
