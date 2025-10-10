// import Redis from "ioredis";

// const redis = new Redis(process.env.REDIS_URL + "?family=0", {
//     connectTimeout: 10000,
//     lazyConnect: true,
// });

// redis.on("connect", () => console.log("Redis cache connected"));
// redis.on("error", (err) => console.error("Redis cache error:", err.message));

// export const cache = {
//     async get(key) {
//         const data = await redis.get(key);
//         return data ? JSON.parse(data) : null;
//     },

//     async set(key, value, ttl = 60) {
//         await redis.set(key, JSON.stringify(value), "EX", ttl);
//     },

//     async del(key) {
//         await redis.del(key);
//     },
// };
