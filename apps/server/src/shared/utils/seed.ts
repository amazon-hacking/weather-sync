import { placesSchema } from "@/places/domain/places.schema";
import { db } from "../database/db";

export async function seedDatabase() {
  // Implement for test database

  await db.transaction(async (tx) => {
    // 1. Create a user

    // const password = "admin123";
    // const hashedPassword = await hashPassword(password);

    // const [user] = await tx
    //   .insert(usersSchema)
    //   .values({
    //     name: "John Doe",
    //     email: "user@admin.com",
    //     password: hashedPassword,
    //     phoneNumber: "1234567890",
    //     notifications: "yes",
    //   })
    //   .returning();

    const [place] = await tx
      .insert(placesSchema)
      .values({
        name: "Guamá",
        latitude: "1.23456",
        longitude: "-48.12345",
      })
      .returning();

    console.log("Seeded place:", place);
  });
}

seedDatabase();
