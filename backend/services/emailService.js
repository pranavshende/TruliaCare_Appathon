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
 * @param {String} adminEmail - The recipient admin's email
 */
const sendEscalationEmail = async (request, adminEmail = process.env.SMTP_EMAIL) => {
  const mailOptions = {
    from: `"${process.env.SMPT_NAME || 'Smart Maintenance System'}" <${process.env.SMTP_EMAIL}>`,
    to: adminEmail, // We default to the admin's own email for demonstration
    subject: `Maintenance Request #${request.id} Escalated`,
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
    console.log('Escalation email sent:', info.messageId);

    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: process.env.SMTP_EMAIL || 'admin@truliacare.com',
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
        recipient: process.env.SMTP_EMAIL || 'admin@truliacare.com',
        subject: 'Escalation Alert',
        notificationType: 'REQUEST_ESCALATED',
        status: 'FAILED',
        error: error.message
      }
    });
  }
};

const sendNewRequestEmail = async (request, technician) => {
  if (!technician || !technician.email) return;

  try {
    const mailOptions = {
      from: `"${process.env.SMTP_NAME || 'TruliaCare'}" <${process.env.SMTP_EMAIL}>`,
      to: technician.email,
      subject: `New Ticket Assigned: #${request.id.slice(-4)}`,
      text: `Hello ${technician.name},\n\nA new maintenance request has been automatically assigned to you.\n\nTitle: ${request.title}\nCategory: ${request.category}\nPriority: ${request.priority}\n\nPlease log in to the dashboard to accept this ticket.`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('New request email sent to Tech:', info.messageId);

    await prisma.emailLog.create({
      data: {
        requestId: request.id,
        recipient: technician.email,
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

module.exports = {
  sendEscalationEmail,
  sendNewRequestEmail
};
