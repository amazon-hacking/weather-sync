import { z } from "zod";

const envSchema = z.object({
  /**
   * VARIÁVEIS DA APLICAÇÃO
   */
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_PORT: z.coerce.number().default(8080),
  JWT_SECRET: z.string().min(1),
  BASE_URL: z.string().optional().default("http://localhost:8080"),

  /**
   * TWILIO ENVIROMENTS
   */
  TWILIO_ACCOUNT: z.string().min(1),
  TWILIO_ACCOUNT_SID: z.string().min(1),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().min(1),
  TWILIO_TEMPLATE: z.string().min(1),
  TWILIO_MESSAGING_SERVICE_SID: z.string().min(1),

  /**
   * MAIL ENVIROMENTS
   */
  MAIL_FROM: z.string().email().min(1),

  /**
   * AWS ENVIROMENTS
   */
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  ALLOWED_ORIGINS: z.string().optional().default("http://localhost:3000"),
});

const _env = envSchema.parse(process.env);

if (!_env) {
  throw new Error("Invalid environment variables");
}

export const env = _env;
