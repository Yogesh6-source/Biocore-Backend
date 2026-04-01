import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendReportEmail } from './services/emailService.js';
import { sendReportWhatsApp } from './services/whatsappService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BioCore Pathology API is running' });
});

const logFile = path.join(process.cwd(), 'notification_debug.log');
const debugLog = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line);
};

app.post('/api/notify', async (req, res) => {
  debugLog(`Request received for: ${req.body.patientEmail}`);
  const { patientEmail, patientName, patientPhone, testType, reportUrl } = req.body;

  if (!patientEmail || !patientName || !testType || !reportUrl) {
    debugLog('Error: Missing required fields');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const results = { email: null };

  try {
    // Send Email
    debugLog(`Attempting to send email to ${patientEmail}...`);
    results.email = await sendReportEmail(patientEmail, patientName, testType, reportUrl);
    debugLog(`Email result: ${JSON.stringify(results.email)}`);

    res.json({ 
      success: results.email.success, 
      message: results.email.success ? 'Email sent successfully' : 'Email failed to send', 
      results 
    });
  } catch (error) {
    debugLog(`CRITICAL ERROR in /api/notify: ${error.message}\n${error.stack}`);
    res.status(500).json({ error: 'Internal server error while sending notifications' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
