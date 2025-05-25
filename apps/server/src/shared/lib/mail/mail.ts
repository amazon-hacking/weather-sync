import { env } from "@/shared/env/env";
import { SESClient } from "@aws-sdk/client-ses";
import nodemailer from "nodemailer";

class MailService {
  private static instance: MailService;
  private transporter: nodemailer.Transporter | null = null;

  private constructor() {}

  // Singleton pattern to ensure only one instance of MailService
  static getInstance(): MailService {
    if (!MailService.instance) {
      MailService.instance = new MailService();
    }
    return MailService.instance;
  }

  async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = await this.createTransporter();
    }
    return this.transporter;
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    if (this.isProduction()) {
      return this.createProductionTransporter();
    }
    return await this.createDevelopmentTransporter();
  }

  private isProduction(): boolean {
    return env.NODE_ENV === "production";
  }

  private createProductionTransporter(): nodemailer.Transporter {
    const sesClient = this.createSESClient();

    return nodemailer.createTransport({
      SES: {
        sesClient,
        aws: { region: env.AWS_REGION },
      },
    });
  }

  private createSESClient(): SESClient {
    return new SESClient({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private async createDevelopmentTransporter(): Promise<nodemailer.Transporter> {
    const testAccount = await this.createTestAccount();

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      debug: true,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  private async createTestAccount() {
    return await nodemailer.createTestAccount();
  }
}

export const createEmailTransporter =
  async (): Promise<nodemailer.Transporter> => {
    const mailServiceInstance = MailService.getInstance();
    return await mailServiceInstance.getTransporter();
  };

export const getFromEmail = (): string => {
  return env.NODE_ENV === "production"
    ? env.AWS_SES_EMAIL
    : "naoresponda@weather-sync.com.br";
};

export const mail = await createEmailTransporter();
