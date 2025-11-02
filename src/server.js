import Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
// import Redis from "ioredis";
import config from "./config/index.js";
// modules
import { authPlugin } from "./api/auth/index.js";
import { configureJwtStrategy } from "./auth/strategy.js";
import { productsPlugin } from "./api/products/index.js";
import { usersPlugin } from "./api/users/index.js";
import { ordersPlugin } from "./api/orders/index.js";
import ClientError from "./exceptions/ClientError.js";
import { reportsPlugin } from "./api/reports/index.js";
// import CatboxRedisPkg from '@hapi/catbox-redis';
// const { Engine: CatboxRedis } = CatboxRedisPkg;

// const redisClient = new Redis(
//   config.env === "development" ? config.redis.dev_url : config.redis.prod_url + (
//     config.env === "development" ? "" : "?family=0"
//   ),
//   {
//     connectTimeout: 10000,
//     lazyConnect: true,
//   }
// );
// 
// redisClient.on("connect", () => console.log("Redis connected successfully"));
// redisClient.on("error", (err) =>
//   console.error("Redis connection error:", err.message)
// );

export const createServer = async () => {
  const server = Hapi.server({
    host: config.env === "production" ? config.server.prods_host : config.server.host,
    port: config.server.port,
    routes: {
      cors: {
        // will be change
        origin: [config.server.origin],
      },
    },

    // cache: {
    //   // name: 'redis_cache',
    //   provider: {
    //     constructor: CatboxRedis,
    //     options: {
    //       client: redisClient,
    //       partition: 'cashier-cache',
    //     },
    //   },
    // },
  });

  await configureJwtStrategy(server);
  await server.register([
    { plugin: authPlugin },
    { plugin: usersPlugin },
    { plugin: productsPlugin },
    { plugin: ordersPlugin },
    { plugin: reportsPlugin }
  ]);

  // err's handling
  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof ClientError || response.isBoom) {
      const error = response.isBoom ? response : Boom.boomify(response);
      const payload = {
        status: "fail",
        // message: error.output.payload.message,
        message: error.message,
      };
      return h.response(payload).code(error.output.statusCode);
    }

    return h.continue;
  });
  // try {
  //   await redisClient.set("status", "connected");
  //   const result = await redisClient.get("status");
  //   if (result === "connected") {
  //     console.log("Redis operational and responsive");
  //   } else {
  //     console.warn("Redis did not return expected value");
  //   }
  // } catch (err) {
  //   console.error("Redis test operation failed:", err.message);
  // }
  return server;
};

const init = async () => {
  try {
    const server = await createServer();
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

init();
