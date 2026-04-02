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
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];
const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(process.env.NODE_ENV !== 'production' ? localOrigins : [])
]);

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.size === 0 || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  }
}));
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

    if (!results.email.success) {
      return res.status(500).json({
        success: false,
        message: 'Email failed to send',
        error: results.email.error?.message || 'Unknown error',
        results
      });
    }

    res.json({ success: true, message: 'Email sent successfully', results });
  } catch (error) {
    debugLog(`CRITICAL ERROR in /api/notify: ${error.message}\n${error.stack}`);
    res.status(500).json({ error: 'Internal server error while sending notifications' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
