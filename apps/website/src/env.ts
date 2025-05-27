import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const _env = envSchema.parse(process.env);

if (!_env) {
  throw new Error("Invalid environment variables");
}

export const env = _env;
