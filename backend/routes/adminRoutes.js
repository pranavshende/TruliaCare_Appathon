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

// Fetch all technicians with their live workload count and availability
router.get('/technicians/status', async (req, res) => {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        pushToken: true,
        requestsAssigned: {
          where: {
            status: { in: ['IN_PROGRESS', 'ESCALATED'] }
          },
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            status: true,
          }
        }
      }
    });

    const formattedTechnicians = technicians.map(tech => {
      const activeTicketCount = tech.requestsAssigned.length;
      
      let availability = 'AVAILABLE';
      if (activeTicketCount >= 3) {
        availability = 'BUSY';
      } else if (activeTicketCount >= 1) {
        availability = 'MODERATE';
      }

      return {
        id: tech.id,
        name: tech.name || tech.email,
        email: tech.email,
        activeTicketCount: activeTicketCount,
        availability: availability,
        currentTickets: tech.requestsAssigned,
      };
    });

    return res.json({
      success: true,
      data: formattedTechnicians
    });
  } catch (err) {
    console.error('Error fetching technician statuses:', err);
    return res.status(500).json({ success: false, message: 'Server error fetching technician statuses' });
  }
});

// Reassign an escalated or pending ticket to an available technician
router.put('/requests/:id/reassign', async (req, res) => {
  const { id } = req.params;
  const { technicianId, reason } = req.body;
  const currentUser = req.user;

  if (!technicianId) {
    return res.status(400).json({ success: false, message: 'Please provide a valid technicianId' });
  }

  try {
    const targetTech = await prisma.user.findFirst({
      where: { id: technicianId, role: 'TECHNICIAN', isActive: true }
    });

    if (!targetTech) {
      return res.status(404).json({ success: false, message: 'Selected technician not found or inactive' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentReq = await tx.maintenanceRequest.findUnique({
        where: { id: id },
        include: { employee: true }
      });

      if (!currentReq) {
        throw new Error('Ticket not found');
      }

      const previousStatus = currentReq.status;

      const updatedReq = await tx.maintenanceRequest.update({
        where: { id: id },
        data: {
          technicianId: targetTech.id,
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
        include: { employee: true, technician: true }
      });

      await tx.escalationLog.create({
        data: {
          requestId: id,
          previousStatus: previousStatus,
          newStatus: 'IN_PROGRESS',
          reason: reason || `Admin reassigned ticket to ${targetTech.name || targetTech.email}`,
          escalatedTo: currentUser.id,
          escalationType: 'MANUAL',
        }
      });

      return updatedReq;
    });

    const { sendNewRequestEmail } = require('../services/emailService');
    await sendNewRequestEmail(result, targetTech, false);

    if (req.io) {
      req.io.emit('ticket_accepted', result);
    }

    return res.json({
      success: true,
      message: `Ticket successfully reassigned to ${targetTech.name || targetTech.email}`,
      data: result
    });
  } catch (err) {
    console.error('Error reassigning ticket:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error reassigning ticket' });
  }
});

module.exports = router;
