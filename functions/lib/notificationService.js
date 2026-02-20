import { Resend } from 'resend';
import { Twilio } from 'twilio';
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
export const sendWhatsAppAlert = async (to, message) => {
    try {
        await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`,
            body: `🧘 ZenFinance Alert: ${message}`
        });
        return { success: true };
    }
    catch (error) {
        console.error("WhatsApp Error:", error);
        return { success: false, error };
    }
};
export const sendWeeklySummary = async (to, summary) => {
    try {
        await resend.emails.send({
            from: 'ZenFinance <paz@zenfinance.ai>',
            to: [to],
            subject: 'Tu Resumen Semanal de Paz Mental 🧘',
            html: `
        <h1>Hola, aquí está tu balance Zen</h1>
        <p>${summary.message}</p>
        <ul>
          ${summary.suggestions.map((s) => `<li>${s}</li>`).join('')}
        </ul>
      `
        });
        return { success: true };
    }
    catch (error) {
        console.error("Email Error:", error);
        return { success: false, error };
    }
};
//# sourceMappingURL=notificationService.js.map