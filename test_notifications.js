import { sendReportEmail } from './services/emailService.js';
import { sendReportWhatsApp } from './services/whatsappService.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * TEST SCRIPT: Run this to verify your Email and WhatsApp credentials.
 * Usage: node test_notifications.js <email> <phone>
 */

const test = async () => {
  const email = process.argv[2] || process.env.GMAIL_USER;
  const phone = process.argv[3] || "919876543210"; // Test phone
  
  console.log('--- NOTIFICATION TEST START ---');
  console.log(`Target Email: ${email}`);
  console.log(`Target Phone: ${phone}`);

  console.log('\n1. Testing Email...');
  const emailRes = await sendReportEmail(
    email, 
    "Test User", 
    "Blood Sugar Test", 
    "https://example.com/test-report.pdf"
  );
  console.log(emailRes.success ? '✅ Email sent successfully!' : '❌ Email failed: ' + emailRes.error);

  console.log('\n2. Testing WhatsApp...');
  const waRes = await sendReportWhatsApp(
    phone, 
    "Test User", 
    "Blood Sugar Test", 
    "https://example.com/test-report.pdf"
  );
  console.log(waRes.success ? '✅ WhatsApp sent successfully!' : '❌ WhatsApp failed: ' + waRes.error);

  console.log('\n--- TEST COMPLETE ---');
  process.exit();
};

test();
