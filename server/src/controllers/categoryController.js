const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/categories — all categories with subcategories
async function getAll(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, sortOrder: true },
        },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories/:id — single category with subcategories
async function getById(req, res, next) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, sortOrder: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

// GET /api/categories/virtual — virtual-eligible categories only
async function getVirtual(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      where: { isVirtualEligible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true },
        },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, getVirtual };
