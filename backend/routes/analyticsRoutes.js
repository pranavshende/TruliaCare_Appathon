const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { requireRole } = require('../middleware/authMiddleware');

// Protect all routes - ADMIN only
router.use(requireRole(['ADMIN']));

// Get advanced analytics
router.get('/', async (req, res) => {
  try {
    const totalRequests = await prisma.maintenanceRequest.count();
    
    // Category distribution
    const categoryGroup = await prisma.maintenanceRequest.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    const categories = categoryGroup.map(c => ({ category: c.category, count: c._count.category }));

    // Priority distribution
    const priorityGroup = await prisma.maintenanceRequest.groupBy({
      by: ['priority'],
      _count: { priority: true }
    });
    const priorities = priorityGroup.map(c => ({ priority: c.priority, count: c._count.priority }));

    res.json({
      success: true,
      analytics: {
        totalRequests,
        categories,
        priorities
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
