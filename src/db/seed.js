// import "dotenv/config";
// import dotenv from "dotenv";
import pool from "./client.js";
import { seedAdminUser } from "./seeders/cashiersSeed.js";
import { seedProducts } from "./seeders/productsSeed.js";
// dotenv.config();

async function main() {
  const client = await pool.connect();
  try {
    console.log("start seeding...");
    // exec
    await client.query("BEGIN");
    await seedAdminUser(client);
    await seedProducts(client);
    await client.query("COMMIT");

    console.log("seeding completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("seeding failed. Rolling back changes:", error);
  } finally {
    client.release();
    await pool.end();
    console.log("db connection closed.");
  }
}

main();
