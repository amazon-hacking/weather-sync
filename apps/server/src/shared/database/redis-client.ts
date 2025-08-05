import { createClient, type RedisClientType } from "redis";
import { env } from "../env/env";

export const redisClient: RedisClientType = createClient({
  url: env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
  }
});

let isConnected = false;

redisClient.on("error", (err: Error) => {
  console.error("Redis error:", err.message);
  isConnected = false;
});

redisClient.on("connect", () => {
  console.log("Redis connected");
  isConnected = true;
});

redisClient.on("end", () => {
  console.log("Redis disconnected");
  isConnected = false;
});

// Função para conectar (chame uma vez no início da app)
export async function connectRedis(): Promise<void> {
  try {
    if (!isConnected && !redisClient.isOpen) {
      await redisClient.connect();
      console.log("Redis conectado com sucesso");
    }
  } catch (error) {
    console.warn("Redis não disponível:", error);
  }
}