import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const getTransporter = () => {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass || user.includes('your-email')) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};

export const sendReportEmail = async (patientEmail, patientName, testType, reportUrl) => {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.error('Email Service: Credentials not configured in .env (Add them to server/.env)');
    return { success: false, error: 'Email credentials not configured' };
  }
  const mailOptions = {
    from: `"BioCore Pathology" <${process.env.GMAIL_USER}>`,
    to: patientEmail,
    subject: `Your Diagnostic Report for ${testType} is Ready`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">Hello ${patientName},</h2>
        <p>Your diagnostic report for <strong>${testType}</strong> is now available.</p>
        <p>You can download it directly using the link below:</p>
        <a href="${reportUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Download Report</a>
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">You can also access all your historical reports at any time by visiting our portal and using your registered email: ${patientEmail}.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 0.8em; color: #999;">© 2026 BioCore Pathology Labs. Professional Diagnostic Services.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true, info };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};
