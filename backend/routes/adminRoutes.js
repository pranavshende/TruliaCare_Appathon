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

    res.json({
      success: true,
      stats: { total, pending, inProgress, escalated, resolved }
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
    const { sendNewRequestEmail } = require('../services/emailService');
    sendNewRequestEmail(request, request.technician, false).catch(err => console.error("Email failed:", err));

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
      select: { id: true, name: true, email: true },
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
