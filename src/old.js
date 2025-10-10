// import Hapi from "@hapi/hapi";
// import Boom from '@hapi/boom';
// import Redis from "ioredis";
// import "dotenv/config";
// import "@dotenvx/dotenvx/config";
// // import * as config from "./config/index.js";
// import config from './config/index.js';
// // modules import
// import { authPlugin } from "./api/auth/index.js";
// import { configureJwtStrategy } from "./auth/strategy.js";
// import { productsPlugin } from "./api/products/index.js";
// import { usersPlugin } from "./api/users/index.js";
// import { ordersPlugin } from "./api/orders/index.js";
// import CatboxRedisPkg from '@hapi/catbox-redis';
// import ClientError from "./exceptions/ClientError.js";
// const { Engine: CatboxRedis } = CatboxRedisPkg;

// const redisURL = "redis://default:vXzPaqnvvntJWLnyMnBorkyFsoxiFvsZ@yamanote.proxy.rlwy.net:36562";
// const redis = new Redis(redisURL + "?family=0");
// // Tes koneksi
// redis.on("connect", () => {
//     console.log("✅ Redis connected successfully");
// });

// redis.on("error", (err) => {
//     console.error("❌ Redis connection error:", err.message);
// });

// export const createServer = async () => {
//     const server = Hapi.server({
//         host: config.env === 'production' ? '0.0.0.0' : 'localhost',
//         port: config.server.port,
//         routes: {
//             cors: {
//                 origin: ["http://localhost:5173"],
//             },
//             // security: {
//             //   hsts: {
//             //     maxAge: 31536000,
//             //     includeSubDomains: true,
//             //     preload: true,
//             //   },
//             //   xframe: "deny",
//             //   // xss: "enabled",
//             // },
//         },
//         cache: [
//           {
//             provider: {
//               constructor: CatboxRedis,
//               options: {
//                 // url: process.env.REDIS_URL,
//                 host: process.env.REDISHOST,
//                 port: process.env.REDISPORT,
//                 password: process.env.REDIS_PASSWORD,
//                 tls: { rejectUnauthorized: false },
//                 // lazyConnect: true,
//                 // connectTimeout: 20000,
//                 // retryStrategy: (times) => Math.min(times * 500, 5000),
//                 // maxRetriesPerRequest: null,
//                 // reconnectOnError: (err) => {
//                 //   if (err.message.includes("READONLY")) return true;
//                 //   return false;
//                 // },
//               }
//             },
//           },
//         ]
//     });

//     await configureJwtStrategy(server);

//     await server.register([
//         { plugin: authPlugin },
//         { plugin: usersPlugin },
//         { plugin: productsPlugin },
//         { plugin: ordersPlugin },
//     ]);

//     // await server.start();
//     // console.log(`server running on ${server.info.uri}`);
//     // console.log(config.db.url);
//     server.ext('onPreResponse', (request, h) => {
//         const { response } = request;

//         if (response instanceof ClientError || response.isBoom) {
//             const error = response.isBoom ? response : Boom.boomify(response);
//             const newResponsePayload = {
//                 status: 'fail',
//                 message: error.output.payload.message,
//             };
//             const newResponse = h.response(newResponsePayload);
//             newResponse.code(error.output.statusCode);
//             return newResponse;
//         }
//         return h.continue;
//     });

//     const cache = server.cache({ segment: "check", expiresIn: 1000 });
//     try {
//         await cache.set("status", "connected", 1000);
//         console.log("✅ Redis cache connected successfully");
//     } catch (err) {
//         console.error("❌ Redis cache connection failed:", err.message);
//     }

//     return server;
// };

// const init = async () => {
//     const server = await createServer();
//     await server.start();
//     console.log(`Server running on ${server.info.uri}`);
// };

// // if (process.env.NODE_ENV !== 'test') {
// //   process.on('unhandledRejection', (err) => {
// //     console.error('Unhandled Rejection:', err);
// //     process.exit(1);
// //   });
// // }

// init();