const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../prismaClient');
const supabase = require('../services/supabase');
const { requireRole } = require('../middleware/authMiddleware');
const { sendNewRequestEmail } = require('../services/emailService');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protect all routes
router.use(requireRole(['EMPLOYEE', 'ADMIN', 'TECHNICIAN']));

// Create a maintenance request
router.post('/', upload.single('photo'), async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !description || !category || !priority) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    let imageUrl = null;

    if (req.file) {
      const fileName = `${uuidv4()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        category,
        priority,
        imageUrl,
        status: 'PENDING',
        employeeId: req.user.id,
        technicianId: null,
      },
    });

    if (req.io) {
      req.io.emit('ticket_created', request);
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
    
    if (isTechnician) {
      const assignedTickets = await prisma.maintenanceRequest.findMany({
        where: { technicianId: req.user.id },
        include: { employee: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      const availableTickets = await prisma.maintenanceRequest.findMany({
        where: { status: 'PENDING', technicianId: null },
        include: { employee: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, assignedTickets, availableTickets });
    } else {
      const requests = await prisma.maintenanceRequest.findMany({
        where: { employeeId: req.user.id },
        include: { technician: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, requests });
    }
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

    if (req.io) req.io.emit('ticket_resolved', request);

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

    // Atomic update
    const result = await prisma.maintenanceRequest.updateMany({
      where: { id: req.params.id, status: 'PENDING', technicianId: null },
      data: { status: 'IN_PROGRESS', acceptedAt: new Date(), technicianId: req.user.id },
    });

    if (result.count === 0) {
      return res.status(409).json({ success: false, message: 'Ticket already assigned or not available' });
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id: req.params.id },
      include: { technician: { select: { id: true, name: true } } }
    });

    if (req.io) req.io.emit('ticket_accepted', request);

    res.json({ success: true, request });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
