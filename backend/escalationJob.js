const cron = require('node-cron');
const prisma = require('./prismaClient');
const { sendEscalationEmail } = require('./services/emailService');

// Priority-based SLA Thresholds in MS (for Resolution once accepted)
const SLA_THRESHOLDS = {
  CRITICAL: 15 * 1000,
  HIGH: 30 * 1000,
  MEDIUM: 60 * 1000,
  LOW: 120 * 1000,
};

// Time-to-Accept SLA in MS
const TIME_TO_ACCEPT_MS = 60 * 1000;

const startEscalationJob = () => {
  // Run every 5 seconds
  cron.schedule('*/5 * * * * *', async () => {
    try {
      const now = new Date();

      const unresolvedRequests = await prisma.maintenanceRequest.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        include: { technician: true }
      });

      const overdueRequests = unresolvedRequests.filter(req => {
        if (req.status === 'PENDING') {
          // Fallback Time-to-Accept SLA
          const reqAgeMs = now.getTime() - new Date(req.createdAt).getTime();
          return reqAgeMs > TIME_TO_ACCEPT_MS;
        } else if (req.status === 'IN_PROGRESS' && req.acceptedAt) {
          // Priority-based Resolution SLA
          const threshold = SLA_THRESHOLDS[req.priority] || SLA_THRESHOLDS.MEDIUM;
          const processingTimeMs = now.getTime() - new Date(req.acceptedAt).getTime();
          return processingTimeMs > threshold;
        }
        return false;
      });

      if (overdueRequests.length > 0) {
        console.log(`[Escalation Job] Found ${overdueRequests.length} overdue requests.`);

        for (const req of overdueRequests) {
          const reason = req.status === 'PENDING' 
            ? `SLA Breached (Not Accepted within 60s)` 
            : `SLA Breached (${req.priority} priority resolution)`;

          await prisma.$transaction([
            prisma.maintenanceRequest.update({
              where: { id: req.id },
              data: {
                status: 'ESCALATED',
                escalatedAt: new Date()
              }
            }),
            prisma.escalationLog.create({
              data: {
                requestId: req.id,
                previousStatus: req.status,
                newStatus: 'ESCALATED',
                reason: reason,
                escalatedTo: 'SYSTEM',
                escalationType: 'AUTOMATIC'
              }
            })
          ]);
          console.log(`[Escalation Job] Escalated request #${req.id} - ${reason}`);
          
          sendEscalationEmail(req).catch(err => console.error("Email failed:", err));

          // Simulate Push Notification
          if (req.technician && req.technician.pushToken) {
            console.log(`[Push Notification] Dispatched to Technician ${req.technician.name} for Escalated Request #${req.id}`);
          }
        }
      }
    } catch (error) {
      console.error('[Escalation Job] Error running escalation check:', error);
    }
  });

  console.log('Escalation background job started with Acceptance SLAs.');
};

module.exports = { startEscalationJob };
