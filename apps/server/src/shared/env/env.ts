import { z } from "zod";

const envSchema = z.object({
  /**
   * VARIÁVEIS DA APLICAÇÃO
   */
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_TTL: z.coerce.number().default(60 * 60 * 24),
  REDIS_URL: z.string().url(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_PORT: z.coerce.number().default(8080),
  JWT_SECRET: z.string().min(1),
  BASE_URL: z.string().optional().default("http://localhost:8080"),

  /**
   * TWILIO ENVIROMENTS
   */
  // TWILIO_ACCOUNT: z.string().min(1),
  // TWILIO_ACCOUNT_SID: z.string().min(1),
  // TWILIO_AUTH_TOKEN: z.string().min(1),
  // TWILIO_PHONE_NUMBER: z.string().min(1),
  // TWILIO_TEMPLATE: z.string().min(1),

  /**
   * MAIL ENVIROMENTS
   */
  // NODEMAILER_HOST: z.string().min(1),
  // NODEMAILER_PORT: z.coerce.number().default(587),
  // NODEMAILER_USER: z.string().min(1),
  // NODEMAILER_PASS: z.string().min(1),
  // EMAIL: z.string().email().min(1),

  ALLOWED_ORIGINS: z.string().optional().default("http://localhost:3000"),
});

const _env = envSchema.parse(process.env);

if (!_env) {
  throw new Error("Invalid environment variables");
}

export const env = _env;
