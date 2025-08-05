import { type RedisClientType } from "redis";


export enum CacheStrategy {
  // Dados estáticos - cache longo
  STATIC = 60 * 60 * 24,        // 24 horas
  // Dados semi-estáticos - cache médio
  STATIC_TWELVE_HOURS = 60 * 60 * 12, // 12 horas
  SEMI_STATIC = 60 * 60,    // 1 hora

  // Dados dinâmicos - cache médio
  DYNAMIC = 60 * 15,         // 15 minutos
  USER_DATA = 60 * 5,       // 5 minutos

  // Dados em tempo real - cache curto
  REAL_TIME = 60,        // 1 minuto
  VOLATILE = 30,         // 30 segundos

  // Cache personalizado
  CUSTOM = -1
}

export abstract class CacheRepository {
  constructor(private readonly redisClient: RedisClientType) { }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);

    if (!value) return null;

    return JSON.parse(value);
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async invalidate(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.redisClient.keys(`${prefix}:*`);
    await this.redisClient.del(keys);
  }
}