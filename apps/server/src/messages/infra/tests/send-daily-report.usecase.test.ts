import { dataSourceSchema } from "@/data-source/domain/data-source.schema";
import { favoritePlacesSchema } from "@/favorite-places/domain/favorite-places.schema";
import { placesSchema } from "@/places/domain/places.schema";
import { db } from "@/shared/database/db";
import { usersSchema } from "@/users/domain/users.schema";
import { weatherSchema } from "@/weather/domain/weather.schema";
import { faker } from "@faker-js/faker";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { eq, or } from "drizzle-orm";
import Elysia from "elysia";
import { MessageController } from "../message.controller";

describe("Send Daily Report Use Case", () => {
  let app: Elysia;

  let user: any;
  let userId: string;

  let secondUser: any;
  let secondUserId: string;

  let weather: any;
  // @ts-expect-error
  let weatherId: number;

  // @ts-expect-error
  let place: any;
  let placeId: number;

  let secondPlace: any;
  let secondPlaceId: number;

  let favoritePlace: any;
  // @ts-expect-error
  let favoritePlaceId: number;

  let secondFavoritePlace: any;
  let secondFavoritePlaceId: number;

  let dataSource: any;
  let dataSourceId: number;
  beforeAll(async () => {
    app = new Elysia().use(MessageController);

    await db.transaction(async (tx) => {
      // 1. Create a user
      [user] = await tx
        .insert(usersSchema)
        .values({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          phoneNumber: faker.string.numeric(11),
          notifications: "yes",
        })
        .returning();

      userId = user.id;

      [secondUser] = await tx
        .insert(usersSchema)
        .values({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          phoneNumber: faker.string.numeric(11),
          notifications: "yes",
        })
        .returning();

      secondUserId = secondUser.id;

      placeId = 5459;
      [place] = await tx
        .insert(placesSchema)
        .values({
          id: placeId,
          name: faker.company.name(),
          latitude: faker.location.latitude().toString(),
          longitude: faker.location.longitude().toString(),
        })
        .returning();

      secondPlaceId = 5460;

      [secondPlace] = await tx
        .insert(placesSchema)
        .values({
          id: secondPlaceId,
          name: faker.company.name(),
          latitude: faker.location.latitude().toString(),
          longitude: faker.location.longitude().toString(),
        })
        .returning();

      secondPlaceId = secondPlace.id;

      // 2. Create a source
      [dataSource] = await tx
        .insert(dataSourceSchema)
        .values({
          name: faker.company.name(),
        })
        .returning();
      dataSourceId = dataSource.id;

      // 3. Create a favorite place
      [favoritePlace] = await tx
        .insert(favoritePlacesSchema)
        .values({
          userId: userId,
          placeId: placeId,
        })
        .returning();
      favoritePlaceId = favoritePlace.id;

      [secondFavoritePlace] = await tx
        .insert(favoritePlacesSchema)
        .values({
          userId: secondUserId,
          placeId: secondPlaceId,
        })
        .returning();
      secondFavoritePlaceId = secondFavoritePlace.id;

      // 2. Create a weather record

      const date = new Date();

      for (let i = 0; i <= 10; i++) {
        [weather] = await tx
          .insert(weatherSchema)
          .values({
            placeId: placeId,
            sourceId: dataSourceId,
            temperature: faker.number.int({ min: 15, max: 35 }).toString(),
            humidity: faker.number.int({ min: 30, max: 90 }),
            pressure: faker.number.int({ min: 1000, max: 1020 }),
            windSpeed: faker.number
              .float({ min: 0, max: 30, fractionDigits: 2 })
              .toString(),
            windDirection: faker.number.int({ min: 0, max: 359 }),
            createdAt: date,
          })
          .returning();

        [weather] = await tx
          .insert(weatherSchema)
          .values({
            placeId: secondPlaceId,
            sourceId: dataSourceId,
            temperature: faker.number.int({ min: 15, max: 35 }).toString(),
            humidity: faker.number.int({ min: 30, max: 90 }),
            pressure: faker.number.int({ min: 1000, max: 1020 }),
            windSpeed: faker.number
              .float({ min: 0, max: 30, fractionDigits: 2 })
              .toString(),
            windDirection: faker.number.int({ min: 0, max: 359 }),
            createdAt: date,
          })
          .returning();
      }

      weatherId = weather.id;
    });
  });

  afterAll(async () => {
    await db.delete(weatherSchema);
    console.log("Weather deleted");
    // Clean up the database

    await db.delete(favoritePlacesSchema);

    await db
      .delete(usersSchema)
      .where(or(eq(usersSchema.id, userId), eq(usersSchema.id, secondUserId)));
    console.log("Users deleted");

    await db
      .delete(placesSchema)
      .where(
        or(eq(placesSchema.id, placeId), eq(placesSchema.id, secondPlaceId))
      );
    console.log("Places deleted");

    await db
      .delete(dataSourceSchema)
      .where(eq(dataSourceSchema.id, dataSourceId));
    console.log("Data source deleted");
  });

  it("should send daily report emails to users", async () => {
    const response = await app.handle(
      new Request("http://localhost:8080/messages/send-daily-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    expect(response.status).toBe(201);
  }, 20000);
});
