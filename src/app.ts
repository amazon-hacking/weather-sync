import { env } from "@/shared/env/env";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { routes } from "./app.routes";

const app = new Elysia({
  serve: {
    idleTimeout: 200,
  },
})
  .use(
    swagger({
      swaggerOptions: {
        deepLinking: true,
        withCredentials: true,
      },
      documentation: {
        servers: [
          {
            url: `http://localhost:${env.APP_PORT}`,
            description: "Local server",
          },
        ],
        info: {
          title: "Weather Sync",
          version: "1.0.0",
          description: "API documentation for Weather Sync",
        },
      },
      path: "/docs",
    })
  )
  .use(routes)
  .listen(env.APP_PORT)
  .get("/health-check", () => {
    console.log("Health check");
    return { status: "ok" };
  });

export type app = typeof app;

console.log(`
  Weather Sync API
  Environment: ${env.NODE_ENV}
  Listening on: http://localhost:${env.APP_PORT}
  Documentation: http://localhost:${env.APP_PORT}/docs
  `);
