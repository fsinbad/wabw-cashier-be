import "dotenv/config";
import "@dotenvx/dotenvx/config";

const config = {
  env: process.env.NODE_ENV || 'dev',
  server: {
    host: process.env.HOST || 'localhost',
    port: process.env.NODE_ENV === 'test' ? 0 : process.env.PORT || 3000,
  },

  db: {
    url: process.env.DATABASE_URL,
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};

export default Object.freeze(config);

// export const HOST = process.env.HOST || "localhost";
// export const PORT = process.env.PORT || 5000;

// export const dbConfig = {
//   host: process.env.PGHOST,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   database: process.env.PGDATABASE,
//   port: process.env.PGPORT,
// };

// export const jwtConfig = {
//   secret: process.env.JWT_SECRET,
//   expiresIn: process.env.JWT_EXPIRES_IN,
// };
