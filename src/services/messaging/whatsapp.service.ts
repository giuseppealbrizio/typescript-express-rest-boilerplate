import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const companyNumber = process.env.TWILIO_PHONE_NUMBER;

/**
 * Send a message to a user
 * @param toNumber
 */
export const sendWhatsappMessage = async (toNumber: string) => {
  try {
    const client = new Twilio(<string>accountSid, <string>authToken);

    const message = await client.messages.create({
      body: 'You can use only registered template on Twilio',
      from: `whatsapp:${companyNumber}`,
      to: `whatsapp:${toNumber}`,
    });

    if (message.sid) {
      return {
        success: true,
        message: 'Message sent successfully',
        response: message,
      };
    }

    return message;
  } catch (error) {
    return error;
  }
};
