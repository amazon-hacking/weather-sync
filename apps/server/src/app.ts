import { env } from "@/shared/env/env";
import { cors } from "@elysiajs/cors";
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
  .use(
    cors({
      origin:
        env.NODE_ENV === "development"
          ? true // Permite qualquer origem em desenvolvimento
          : env.ALLOWED_ORIGINS?.split(",") || ["https://localhost:3000"], // Origens específicas em produção
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Cache-Control",
      ],
      credentials: true, // Permite cookies e headers de autenticação
      exposeHeaders: ["Set-Cookie", "X-Total-Count", "X-Page-Count"],
      maxAge: 86400, // Cache do preflight por 24 horas
    })
  )

  .listen(env.APP_PORT)
  .get("/health-check", () => {
    console.log("Health check");
    return { status: "ok" };
  });

export type app = typeof app;

console.log(`
  🌤️  WEATHER SYNC API
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀  TURBO: Turbo Mono Repo

  🚀 Server started successfully!
  🌍 Environment: ${env.NODE_ENV?.toUpperCase()}
  📡 URL: http://localhost:${env.APP_PORT}
  📚 Docs: http://localhost:${env.APP_PORT}/docs
  🎨 Website: http://localhost:5173/docs
  ⚡ Runtime: Bun + Elysia
  📱 SMS: Twilio Integration
  
  👥 DEVELOPMENT TEAM
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  🧑‍💻 Gabriel Santos - Software Engineer
  🧑‍💻 João Miguel - Frontend Developer
  👨‍💼 Felipe Cruz - Scrum Leader & Data Analystics
  👩‍💻 Pablo Abdon - Data Analystics
  🧑‍💻 Davi Cavalcante - Data Engineer
  🧑‍💻 Antônio Lucas - Data Analystics
  👨‍🎤 Isadora Cassiano - Urban Development Analyst
  👨‍🔧 Lucas Oliveira - Urban Development Analyst
  👩‍💻 Ana Clara - Hardware Infrastructure Engineer
  
  🎯 Ready to sync the weather! Happy coding! ⭐
  `);
