const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { requireRole } = require('../middleware/authMiddleware');

// Protect all routes - ADMIN only
router.use(requireRole(['ADMIN']));

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const total = await prisma.maintenanceRequest.count();
    const pending = await prisma.maintenanceRequest.count({ where: { status: 'PENDING' } });
    const inProgress = await prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS' } });
    const escalated = await prisma.maintenanceRequest.count({ where: { status: 'ESCALATED' } });
    const resolved = await prisma.maintenanceRequest.count({ where: { status: 'RESOLVED' } });

    // 1. Total Cost
    const costAgg = await prisma.maintenanceRequest.aggregate({
      _sum: { cost: true }
    });
    const totalCost = costAgg._sum.cost || 0;

    // 2. Unreported Issues (Location Feedback)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const negativeFeedback = await prisma.locationFeedback.findMany({
      where: { rating: { lte: 2 }, createdAt: { gte: sevenDaysAgo } }
    });
    const negativeCounts = {};
    negativeFeedback.forEach(f => {
      if (f.location) {
        negativeCounts[f.location] = (negativeCounts[f.location] || 0) + 1;
      }
    });
    const unreportedIssues = Object.entries(negativeCounts)
      .filter(([loc, count]) => count >= 3)
      .map(([loc, count]) => ({ location: loc, count }));

    // 3. Chronic Issues (Recurring Tickets in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTickets = await prisma.maintenanceRequest.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } }
    });
    const ticketCounts = {};
    recentTickets.forEach(t => {
      if (t.location && t.category) {
        const key = `${t.location}::${t.category}`;
        ticketCounts[key] = (ticketCounts[key] || 0) + 1;
      }
    });
    const chronicIssues = Object.entries(ticketCounts)
      .filter(([key, count]) => count >= 3)
      .map(([key, count]) => {
        const [location, category] = key.split('::');
        return { location, category, count };
      });

    res.json({
      success: true,
      stats: { total, pending, inProgress, escalated, resolved, totalCost },
      unreportedIssues,
      chronicIssues
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all requests
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status && status !== 'ALL' ? { status } : {};

    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        employee: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Admin get requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single request details
router.get('/requests/:id', async (req, res) => {
  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: req.params.id },
      include: {
        employee: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
        escalationLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    res.json({ success: true, request });
  } catch (error) {
    console.error('Admin get request details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Assign technician
router.patch('/requests/:id/assign', async (req, res) => {
  const { technicianId } = req.body;
  try {
    const request = await prisma.maintenanceRequest.update({
      where: { id: req.params.id },
      data: {
        technicianId,
        status: 'IN_PROGRESS', // automatically update status
      },
      include: {
        technician: { select: { id: true, name: true, email: true } },
      },
    });

    // Send email to assigned technician
    const { sendNewRequestEmail, sendStatusUpdateEmail } = require('../services/emailService');
    sendNewRequestEmail(request, request.technician, false).catch(err => console.error("Email failed:", err));

    // Send status update to employee
    sendStatusUpdateEmail(request, request.employeeId, 'IN_PROGRESS (Technician Assigned)').catch(err => console.error("Email failed:", err));

    res.json({ success: true, request, message: 'Technician assigned successfully' });
  } catch (error) {
    console.error('Admin assign technician error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update status
router.patch('/requests/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    const request = await prisma.maintenanceRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    const { sendStatusUpdateEmail } = require('../services/emailService');
    sendStatusUpdateEmail(request, request.employeeId, status).catch(err => console.error("Email failed:", err));

    res.json({ success: true, request, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Admin update status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Manually escalate request
router.post('/requests/:id/escalate', async (req, res) => {
  const { reason } = req.body;
  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: req.params.id }
    });

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    if (request.status === 'RESOLVED') return res.status(400).json({ success: false, message: 'Cannot escalate a resolved request' });
    if (request.status === 'ESCALATED') return res.status(400).json({ success: false, message: 'Request is already escalated' });

    const updatedRequest = await prisma.$transaction([
      prisma.maintenanceRequest.update({
        where: { id: req.params.id },
        data: {
          status: 'ESCALATED',
          escalatedAt: new Date(),
        },
      }),
      prisma.escalationLog.create({
        data: {
          requestId: req.params.id,
          previousStatus: request.status,
          newStatus: 'ESCALATED',
          reason: reason || 'Manually escalated by Admin',
          escalatedTo: req.user.id,
          escalationType: 'MANUAL',
        },
      })
    ]);

    const { sendEscalationEmail } = require('../services/emailService');
    sendEscalationEmail(updatedRequest[0]).catch(err => console.error("Email failed:", err));

    res.json({ success: true, request: updatedRequest[0], message: 'Request escalated successfully' });
  } catch (error) {
    console.error('Admin escalate error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get technicians list
router.get('/technicians', async (req, res) => {
  try {
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' },
      select: { id: true, name: true, email: true, skills: true },
    });

    res.json({ success: true, technicians });
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
