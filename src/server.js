import Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import Redis from "ioredis";
import "dotenv/config";
import "@dotenvx/dotenvx/config";
import config from "./config/index.js";

// Modules Import
import { authPlugin } from "./api/auth/index.js";
import { configureJwtStrategy } from "./auth/strategy.js";
import { productsPlugin } from "./api/products/index.js";
import { usersPlugin } from "./api/users/index.js";
import { ordersPlugin } from "./api/orders/index.js";
import ClientError from "./exceptions/ClientError.js";

/* -------------------- REDIS INITIALIZATION -------------------- */
// Gunakan URL Redis Railway kamu
const redisURL = "rediss://default:vXzPaqnvvntJWLnyMnBorkyFsoxiFvsZ@yamanote.proxy.rlwy.net:36562";

const redis = new Redis(redisURL + "?family=0", {
  tls: { rejectUnauthorized: false },
});

// Tes koneksi Redis
redis.on("connect", () => console.log("✅ Redis connected successfully"));
redis.on("error", (err) =>
  console.error("❌ Redis connection error:", err.message)
);

/* -------------------- SERVER INITIALIZATION -------------------- */
export const createServer = async () => {
  const server = Hapi.server({
    host: config.env === "production" ? "0.0.0.0" : "localhost",
    port: config.server.port || 3000,
    routes: {
      cors: {
        origin: ["*"], // ubah ke domain spesifik jika sudah production
      },
    },
  });

  // JWT strategy
  await configureJwtStrategy(server);

  // Register API routes
  await server.register([
    { plugin: authPlugin },
    { plugin: usersPlugin },
    { plugin: productsPlugin },
    { plugin: ordersPlugin },
  ]);

  /* -------------------- ERROR HANDLING -------------------- */
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof ClientError || response.isBoom) {
      const error = response.isBoom ? response : Boom.boomify(response);
      const payload = {
        status: "fail",
        message: error.output.payload.message,
      };
      return h.response(payload).code(error.output.statusCode);
    }

    return h.continue;
  });

  /* -------------------- TEST REDIS FUNCTIONALITY -------------------- */
  try {
    await redis.set("status", "connected");
    const result = await redis.get("status");
    if (result === "connected") {
      console.log("✅ Redis operational and responsive");
    } else {
      console.warn("⚠️ Redis did not return expected value");
    }
  } catch (err) {
    console.error("❌ Redis test operation failed:", err.message);
  }

  return server;
};

/* -------------------- SERVER STARTUP -------------------- */
const init = async () => {
  try {
    const server = await createServer();
    await server.start();
    console.log(`🚀 Server running on ${server.info.uri}`);
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

init();
