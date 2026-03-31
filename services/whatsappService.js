import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  
  if (!sid || !token || sid.includes('your-twilio-sid')) {
    return null;
  }
  return twilio(sid, token);
};

export const sendReportWhatsApp = async (patientPhone, patientName, testType, reportUrl) => {
  const client = getTwilioClient();
  if (!client) {
    console.error('WhatsApp Service: Credentials not configured in .env (Add them to server/.env)');
    return { success: false, error: 'WhatsApp credentials not configured' };
  }
  // Ensure phone number starts with 'whatsapp:' and includes a country code
  const to = patientPhone.startsWith('whatsapp:') ? patientPhone : `whatsapp:${patientPhone.startsWith('+') ? patientPhone : '+' + patientPhone}`;
  const from = process.env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') ? process.env.TWILIO_WHATSAPP_NUMBER : `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

  const messageBody = `Hello ${patientName}, your diagnostic report for ${testType} is ready at BioCore Pathology. 
  
You can download it here: ${reportUrl}

Track all your reports anytime at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/report`;

  try {
    const message = await client.messages.create({
      body: messageBody,
      from: from,
      to: to
    });
    console.log('WhatsApp message sent: ' + message.sid);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    return { success: false, error };
  }
};
