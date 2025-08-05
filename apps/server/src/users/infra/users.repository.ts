import { favoritePlacesSchema } from "@/favorite-places/domain/favorite-places.schema";
import { CacheRepository, CacheStrategy } from "@/shared/database/cache-repository";
import { db } from "@/shared/database/db";
import { redisClient } from "@/shared/database/redis-client";
import { and, eq } from "drizzle-orm";
import type {
  CreateUserParams,
  IUsersRepository,
  UserRecord,
} from "../domain/users-repository.interface";
import { usersSchema } from "../domain/users.schema";

export enum CacheDataType {
  USER_PROFILE = 'user_profile',
  USER_SESSION = 'user_session',
  USER_PREFERENCES = 'user_preferences',
  PLACE_DETAILS = 'place_details',
  PLACE_REVIEWS = 'place_reviews',
  SEARCH_RESULTS = 'search_results',
  NOTIFICATIONS = 'notifications',
  SYSTEM_CONFIG = 'system_config',
  STATIC_CONTENT = 'static_content',
  USER_EMAIL_NOTIFICATIONS = 'user_email_notifications'
}

export class UsersRepository extends CacheRepository implements IUsersRepository {
  constructor() {
    super(redisClient);
  }

  async getUsersToSendEmail(): Promise<UserRecord[]> {

    const cachedData = await this.get<UserRecord[]>(CacheDataType.USER_PROFILE);

    if (cachedData) {
      console.log("Cached data found");
      return cachedData;
    }

    const users = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.notifications, "yes"));


    if (users.length > 0) {
      console.log("Setting cache for users to send email");
      await this.set(CacheDataType.USER_EMAIL_NOTIFICATIONS, users, CacheStrategy.STATIC_TWELVE_HOURS);
    }

    return users;
  }
  async registerUser(data: CreateUserParams): Promise<UserRecord> {
    const [user] = await db.insert(usersSchema).values(data).returning();

    await this.invalidate(CacheDataType.USER_PROFILE);
    return user;
  }

  async getById(id: string): Promise<UserRecord | null> {

    const cachedData = await this.get<UserRecord>(CacheDataType.USER_PROFILE.concat(`:${id}`));

    if (cachedData) {
      console.log("Cached data found");
      return cachedData;
    }

    const [user] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id));

    await this.set(CacheDataType.USER_PROFILE.concat(id), user, CacheStrategy.STATIC_TWELVE_HOURS);

    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const [user] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email));

    return user;
  }

  async createUser(params: CreateUserParams): Promise<UserRecord> {
    const { name, email, password, phoneNumber, notifications } = params;

    const [user] = await db
      .insert(usersSchema)
      .values({
        name,
        email,
        password,
        phoneNumber,
        notifications,
      })
      .returning();

    return user;
  }

  async getUsersToSendMessage(placeId: number): Promise<UserRecord[]> {
    const users = await db
      .select()
      .from(usersSchema)
      .innerJoin(
        favoritePlacesSchema,
        eq(usersSchema.id, favoritePlacesSchema.userId)
      )
      .where(
        and(
          eq(favoritePlacesSchema.placeId, placeId),
          eq(usersSchema.notifications, "yes")
        )
      );

    return users.map((user) => ({
      id: user.users.id,
      name: user.users.name,
      email: user.users.email, // Placeholder as email is required in UserRecord
      password: "", // Placeholder as password is required in UserRecord
      signatureStatus: user.users.signatureStatus,
      phoneNumber: user.users.phoneNumber,
      role: user.users.role, // Placeholder as role is required in UserRecord
      notifications: user.users.notifications, // Placeholder as notifications is required in UserRecord
      createdAt: user.users.createdAt, // Placeholder as createdAt is required in UserRecord
      updatedAt: user.users.updatedAt, // Placeholder as updatedAt is required in UserRecord
    }));
  }

  async favoritePlace(placeId: number, userId: string) {
    return await db.insert(favoritePlacesSchema).values({
      placeId,
      userId,
    });
  }
}
