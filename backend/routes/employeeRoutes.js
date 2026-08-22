const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { requireRole } = require('../middleware/authMiddleware');
const { sendNewRequestEmail } = require('../services/emailService');

// Protect all routes
router.use(requireRole(['EMPLOYEE', 'ADMIN', 'TECHNICIAN']));

// Create a maintenance request
router.post('/', async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !description || !category || !priority) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Phase 7: Auto-Assignment Logic
    // Find an active technician. In a real system, you'd match by category/workload.
    const availableTechnician = await prisma.user.findFirst({
      where: { role: 'TECHNICIAN', isActive: true }
    });

    const request = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        category,
        priority,
        status: 'PENDING', // Will wait for Tech to accept
        employeeId: req.user.id,
        technicianId: availableTechnician ? availableTechnician.id : null,
      },
    });

    if (availableTechnician) {
      sendNewRequestEmail(request, availableTechnician).catch(err => console.error(err));
    }

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get my requests
router.get('/my', async (req, res) => {
  try {
    const isTechnician = req.user.role === 'TECHNICIAN';
    const whereClause = isTechnician 
      ? { technicianId: req.user.id } 
      : { employeeId: req.user.id };

    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        technician: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get request details
router.get('/:id', async (req, res) => {
  try {
    const isTechnician = req.user.role === 'TECHNICIAN';
    
    // We don't filter by employeeId/technicianId if they are ADMIN, but since this route is mainly
    // used by employee/technician, let's filter appropriately to ensure they only see their own stuff.
    // Actually, EmployeeDashboard is used by both. Let's just find by ID, and if it belongs to them.
    const request = await prisma.maintenanceRequest.findFirst({
      where: {
        id: req.params.id,
        ...(req.user.role === 'EMPLOYEE' ? { employeeId: req.user.id } : {}),
        ...(req.user.role === 'TECHNICIAN' ? { technicianId: req.user.id } : {})
      },
      include: {
        technician: {
          select: { id: true, name: true, email: true },
        },
        escalationLogs: true,
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Resolve a request (For Technicians)
router.patch('/:id/resolve', async (req, res) => {
  try {
    if (req.user.role !== 'TECHNICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const request = await prisma.maintenanceRequest.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error('Resolve request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Accept a request (For Technicians)
router.patch('/:id/accept', async (req, res) => {
  try {
    if (req.user.role !== 'TECHNICIAN' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const request = await prisma.maintenanceRequest.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS', acceptedAt: new Date() },
    });

    res.json({ success: true, request });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
