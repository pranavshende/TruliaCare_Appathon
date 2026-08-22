const nodemailer = require('nodemailer');
const prisma = require('../prismaClient');
require('dotenv').config();

// Create transporter using SMTP settings from .env
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Using Gmail as indicated by the user
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

/**
 * Sends an escalation email and logs the attempt to the database.
 * @param {Object} request - The maintenance request object
 */
const sendEscalationEmail = async (request) => {
  const adminEmail = 'mayankgotmare0915@gmail.com'; // User requested specific admin email

  const mailOptions = {
    from: `"${process.env.SMTP_NAME || 'Smart Maintenance System'}" <${process.env.SMTP_EMAIL}>`,
    to: adminEmail,
    subject: `Maintenance Request #${request.id.slice(-4)} Escalated`,
    text: `Maintenance Request Escalation\n\n` +
          `Request ID: ${request.id}\n` +
          `Issue: ${request.title}\n` +
          `Description: ${request.description}\n` +
          `Category: ${request.category}\n` +
          `Priority: ${request.priority}\n` +
          `Current Status: ESCALATED\n\n` +
          `Please review and take appropriate action.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Escalation email sent to Admin (${adminEmail}) | MessageID: ${info.messageId}`);

    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: adminEmail,
        subject: mailOptions.subject,
        notificationType: 'REQUEST_ESCALATED',
        status: 'SENT',
        messageId: info.messageId
      }
    });
  } catch (error) {
    console.error('Error sending escalation email:', error);
    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: adminEmail,
        subject: 'Escalation Alert',
        notificationType: 'REQUEST_ESCALATED',
        status: 'FAILED',
        error: error.message || 'Failed'
      }
    });
  }
};

const sendNewRequestEmail = async (request, technician, isAccepted = false) => {
  if (!technician || !technician.email) return;

  try {
    const actionText = isAccepted 
      ? `You have successfully accepted a maintenance request.`
      : `A new maintenance request has been assigned to you. Please log in to the dashboard to accept/resolve this ticket.`;

    const techEmail = 'hannaturkey15@gmail.com'; // User requested specific technician email

    const mailOptions = {
      from: `"${process.env.SMTP_NAME || 'TruliaCare'}" <${process.env.SMTP_EMAIL}>`,
      to: techEmail,
      subject: isAccepted ? `Ticket Accepted: #${request.id.slice(-4)}` : `New Ticket Assigned: #${request.id.slice(-4)}`,
      text: `Hello ${technician.name},\n\n${actionText}\n\nTitle: ${request.title}\nCategory: ${request.category}\nPriority: ${request.priority}`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`New request email sent to Tech (${techEmail}) | MessageID: ${info.messageId}`);

    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: techEmail,
        subject: mailOptions.subject,
        notificationType: 'REQUEST_ASSIGNED',
        status: 'SENT',
        messageId: info.messageId
      }
    });
  } catch (error) {
    console.error('Error sending tech assignment email:', error);
  }
};

const sendTicketCreatedEmail = async (request, employeeId) => {
  try {
    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee || !employee.email) return;

    const empEmail = 'pranavshende97@gmail.com'; // User requested specific employee email

    const mailOptions = {
      from: `"${process.env.SMTP_NAME || 'TruliaCare'}" <${process.env.SMTP_EMAIL}>`,
      to: empEmail,
      subject: `Ticket Created: #${request.id.slice(-4)}`,
      text: `Hello ${employee.name},\n\nYour maintenance request has been successfully created and is currently pending assignment.\n\nTitle: ${request.title}\nCategory: ${request.category}\nPriority: ${request.priority}\n\nWe will notify you when its status updates.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Creation email sent to Employee (${empEmail}) | MessageID: ${info.messageId}`);

    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: empEmail,
        subject: mailOptions.subject,
        notificationType: 'REQUEST_CREATED',
        status: 'SENT',
        messageId: info.messageId
      }
    });
  } catch (error) {
    console.error('Error sending creation email:', error);
  }
};

const sendStatusUpdateEmail = async (request, employeeId, status) => {
  try {
    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee || !employee.email) return;

    const empEmail = 'pranavshende97@gmail.com'; // User requested specific employee email

    const mailOptions = {
      from: `"${process.env.SMTP_NAME || 'TruliaCare'}" <${process.env.SMTP_EMAIL}>`,
      to: empEmail,
      subject: `Ticket Update: #${request.id.slice(-4)}`,
      text: `Hello ${employee.name},\n\nYour maintenance request "${request.title}" has been updated.\n\nNew Status: ${status}\n\nPlease check the dashboard for more details.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to Employee (${empEmail}) | MessageID: ${info.messageId}`);

    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: empEmail,
        subject: mailOptions.subject,
        notificationType: 'REQUEST_STATUS_UPDATED',
        status: 'SENT',
        messageId: info.messageId
      }
    });
  } catch (error) {
    console.error('Error sending status update email:', error);
  }
};

module.exports = {
  sendEscalationEmail,
  sendNewRequestEmail,
  sendTicketCreatedEmail,
  sendStatusUpdateEmail
};
