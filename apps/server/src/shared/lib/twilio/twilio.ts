import { env } from "@/shared/env/env";
import { messageFloodWarning } from "@/shared/utils/styles.messages";
import twilio from "twilio";

export interface floorWarningMessage {
  place: string;
  floor: string;
}

export class TwillioWhatsappService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }

  async sendWhatsAppMessage(to: string, info: floorWarningMessage) {
    try {
      const message = messageFloodWarning(info.place, info.floor);
      const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

      const template = await client.content.v1
        .contents(env.TWILIO_TEMPLATE)
        .fetch();

      console.log("📋 TEMPLATE DETAILS:");
      console.log("- SID:", template.sid);
      console.log("- Nome:", template.friendlyName);
      console.log("- Idioma:", template.language);
      console.log("- Criado:", template.dateCreated?.toLocaleString());
      console.log("- Atualizado:", template.dateUpdated?.toLocaleString());

      const data = new Date().toISOString();

      const result = await this.client.messages
        .create({
          from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:${to}`,
          body: message,
          //messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,

          //Necessário para produção, mas não está funcionando no momento
          // contentSid: env.TWILIO_TEMPLATE,
          // contentVariables: JSON.stringify({
          //   1: info.place,
          //   2: info.floor,
          //   3: data,
          // }),
        })
        .then((message) => {
          console.log("📱 Mensagem enviada com sucesso:", message.sid);
          return message;
        });

      if (!result) {
        throw new Error("Error sending message");
      }

      console.log("Message sent successfully", result.sid);
      return result;
    } catch (error) {
      console.error("Error sending message", error);
      throw new Error("Error sending message");
    }
  }
}
