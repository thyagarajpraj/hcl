import nodemailer from "nodemailer";
import logger from "./logger.js";

// Configure your email service here
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendFeedbackNotification(recipientEmail, recipientName, feedback) {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn("Email service not configured. Skipping notification.");
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `New Feedback from ${feedback.givenBy}`,
      html: `
        <h2>Hello ${recipientName},</h2>
        <p>You have received new feedback:</p>
        <div style="border-left: 4px solid #10b981; padding-left: 16px; margin: 16px 0;">
          <p><strong>From:</strong> ${feedback.givenBy}</p>
          <p><strong>Rating:</strong> ${feedback.rating}/5 ⭐</p>
          <p><strong>Comment:</strong></p>
          <p>${feedback.comment}</p>
        </div>
        <p>Log in to the feedback portal to view all your feedback.</p>
        <p>Best regards,<br/>Employee Feedback Portal Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Feedback notification sent to ${recipientEmail}`);
  } catch (error) {
    logger.error(`Failed to send feedback notification to ${recipientEmail}: ${error}`);
    // Don't throw - email failures shouldn't block the main operation
  }
}

export async function sendWeeklyReminder(recipientEmail, recipientName, pendingFeedbackCount) {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn("Email service not configured. Skipping reminder.");
      return;
    }

    if (pendingFeedbackCount === 0) {
      return; // No need to send reminder if no pending feedback
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipientEmail,
      subject: `Weekly Feedback Reminder - ${pendingFeedbackCount} pending`,
      html: `
        <h2>Hello ${recipientName},</h2>
        <p>This is your weekly reminder to give feedback to your colleagues.</p>
        <p>You have <strong>${pendingFeedbackCount}</strong> people you haven't given feedback yet this month.</p>
        <p>
          <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
             style="display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 6px;">
            Give Feedback
          </a>
        </p>
        <p>Best regards,<br/>Employee Feedback Portal Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Weekly reminder sent to ${recipientEmail}`);
  } catch (error) {
    logger.error(`Failed to send weekly reminder to ${recipientEmail}: ${error}`);
  }
}

export async function sendAdminAlert(adminEmail, alertType, data) {
  try {
    if (!process.env.SMTP_USER) {
      logger.warn("Email service not configured. Skipping alert.");
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject: `[ADMIN] ${alertType}`,
      html: `
        <h2>Admin Alert: ${alertType}</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Alert sent to admin ${adminEmail}`);
  } catch (error) {
    logger.error(`Failed to send admin alert: ${error}`);
  }
}
