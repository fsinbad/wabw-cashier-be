// src/db/seed.js
import "dotenv/config";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./client.js";

dotenv.config();

const adminUser = {
  id: crypto.randomUUID(),
  username: "cashier",
  email: "cashier@test.com",
  plainPassword: "cashier666",
  role: "CASHIER",
};

const productsDummy = [
  // jp
  { name: 'Tonkotsu Ramen', price: 75000, category: 'FOOD', stock: 40 },
  { name: 'Salmon Sushi Set (8 pcs)', price: 95000, category: 'FOOD', stock: 25 },
  { name: 'Chicken Katsu Curry', price: 68000, category: 'FOOD', stock: 35 },
  { name: 'Edamame', price: 25000, category: 'SNACK', stock: 50 },
  { name: 'Iced Ocha', price: 15000, category: 'BEVERAGE', stock: 100 },

  // italian
  { name: 'Margherita Pizza', price: 85000, category: 'FOOD', stock: 20 },
  { name: 'Spaghetti Carbonara', price: 78000, category: 'FOOD', stock: 30 },
  { name: 'Tiramisu', price: 45000, category: 'DESSERT', stock: 25 },
  { name: 'Espresso', price: 22000, category: 'BEVERAGE', stock: 100 },

  // us
  { name: 'Classic Beef Burger', price: 65000, category: 'FOOD', stock: 45 },
  { name: 'BBQ Back Ribs', price: 155000, category: 'FOOD', stock: 15 },
  { name: 'French Fries', price: 28000, category: 'SNACK', stock: 80 },
  { name: 'Chocolate Milkshake', price: 35000, category: 'BEVERAGE', stock: 40 },

  // fr
  { name: 'French Onion Soup', price: 55000, category: 'SNACK', stock: 20 },
  { name: 'Crème Brûlée', price: 42000, category: 'DESSERT', stock: 30 },
  { name: 'Café au Lait', price: 28000, category: 'BEVERAGE', stock: 60 },
];

async function seedAdminUser(client) {
  console.log("Seeding admin user...");
  const hashedPassword = await bcrypt.hash(adminUser.plainPassword, 10);
  const existingUser = await client.query(
    "SELECT * FROM users WHERE email = $1",
    [adminUser.email]
  );

  if (existingUser.rows.length > 0) {
    await client.query(
      "UPDATE users SET password = $1, role = $2, username = $3 WHERE email = $4",
      [hashedPassword, adminUser.role, adminUser.username, adminUser.email]
    );
    console.log(`User "${adminUser.username}" updated.`);
  } else {
    await client.query(
      "INSERT INTO users (id, username, email, password, role) VALUES ($1, $2, $3, $4, $5)",
      [
        adminUser.id,
        adminUser.username,
        adminUser.email,
        hashedPassword,
        adminUser.role,
      ]
    );
    console.log(`User "${adminUser.username}" created.`);
  }
  console.log("Admin user seeding finished.");
}

async function seedProducts(client) {
  console.log("Seeding products...");
  for (const product of productsDummy) {
    const existingProduct = await client.query(
      "SELECT * FROM products WHERE name = $1",
      [product.name]
    );

    if (existingProduct.rows.length === 0) {
      await client.query(
        "INSERT INTO products (name, price, category, stock) VALUES ($1, $2, $3, $4)",
        [product.name, product.price, product.category, product.stock]
      );
      console.log(`Created product: "${product.name}"`);
    } else {
      console.log(`Product "${product.name}" already exists, skipping.`);
    }
  }
  console.log("Product seeding finished.");
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("Starting database seeding process...");
    await client.query("BEGIN");
    await seedAdminUser(client);
    await seedProducts(client);
    await client.query("COMMIT");
    console.log("Seeding completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seeding failed. Rolling back changes:", error);
  } finally {
    client.release();
    await pool.end();
    console.log("db connection closed.");
  }
}

main();
