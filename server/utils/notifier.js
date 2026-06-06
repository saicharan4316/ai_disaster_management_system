import twilio from 'twilio';
import NotificationLog from '../models/NotificationLog.js';

/**
 * Dispatches an alert to a subscriber (either via real Twilio or mock console log)
 * and records the action in NotificationLog
 * 
 * @param {object} params
 * @param {string} [params.disasterId] - ID of the disaster causing the alert
 * @param {string} [params.subscriberId] - ID of the subscriber
 * @param {string} params.recipientNumber - Target phone number
 * @param {string} params.state - Target region
 * @param {string} params.language - Language used
 * @param {string} params.originalText - Original english message
 * @param {string} params.translatedText - Translated regional language message
 * @returns {Promise<object>} - Logged notification record
 */
export const sendNotification = async ({
  disasterId = null,
  subscriberId = null,
  recipientNumber,
  state,
  language,
  originalText,
  translatedText
}) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER || '+919032533828';

  let status = 'sent';
  let errorMsg = null;
  let isRealSms = false;

  const formattedMsg = `[DISASTER ALERT - ${state.toUpperCase()}]\n${translatedText}`;

  if (accountSid && authToken && accountSid.trim() !== '' && authToken.trim() !== '') {
    try {
      const client = twilio(accountSid, authToken);
      const message = await client.messages.create({
        body: formattedMsg,
        from: fromNumber,
        to: recipientNumber
      });
      console.log(`Real SMS sent via Twilio to ${recipientNumber}. Message SID: ${message.sid}`);
      isRealSms = true;
    } catch (err) {
      console.error(`Twilio SMS failed to ${recipientNumber}. Error: ${err.message}`);
      status = 'failed';
      errorMsg = err.message;
    }
  } else {
    // Mock SMS execution
    console.log('\n--- SIMULATED SMS BROADCAST ---');
    console.log(`From (Govt Official): ${fromNumber}`);
    console.log(`To (Public Subscriber): ${recipientNumber}`);
    console.log(`Region: ${state}`);
    console.log(`Language Code: ${language}`);
    console.log(`Original English: "${originalText}"`);
    console.log(`Broadcast Message:\n${formattedMsg}`);
    console.log('--------------------------------\n');
  }

  // Create log in DB
  try {
    const log = await NotificationLog.create({
      disasterId,
      subscriberId,
      recipientNumber,
      state,
      language,
      originalText,
      translatedText,
      status,
      error: errorMsg
    });
    return log;
  } catch (err) {
    console.error('Failed to save notification log:', err.message);
    throw err;
  }
};
