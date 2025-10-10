import { randomUUID } from "node:crypto";
import pool from "../db/client.js";
import InvariantError from "../exceptions/InvariantError.js";
import { PG_ERRORS } from "../utils/postgresErrorCodes.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import ClientError from "../exceptions/ClientError.js";
import redisClient from "../lib/redis.js";

export default class ProductsService {
  constructor() {
    this._pool = pool;
    // this._cache = redisClient;
  }

  async verifyNewProductName(name) {
    const query = {
      text: "SELECT name FROM products WHERE name = $1",
      values: [name],
    };
    const result = await this._pool.query(query);
    if (result.rows > 0) {
      throw new ClientError("product name already exist.");
    }
  }

  async addProduct({ name, count, price }) {
    try {
      await this.verifyNewProductName(name);
      const id = `product-${randomUUID()}`;
      const query = {
        text: "INSERT INTO products ($1, $2, $3, $4) RETURNING id",
        values: [id, name, count, price],
      };
      const result = await this._pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
        throw new InvariantError(
          "fail to add product, product name already exist"
        );
      }
      console.error("Database Error in addProduct:", error);
      throw error;
    }
  }

  async getProducts() {
    try {
      // const cacheKey = 'products:all';
      // const cachedProducts = await redisClient.get(cacheKey);
      // if (cachedProducts) {
      //   console.log('Serving products from Redis cache...');
      //   return JSON.parse(cachedProducts); 
      // }
      // console.log('Cache miss. Fetching products from database...');
      const result = await this._pool.query(
        "SELECT id, name, price, category, stock FROM products ORDER BY name ASC"
      );

      return result.rows;
      // const products = result.rows;
      // await redisClient.set(cacheKey, JSON.stringify(products), {
      //   EX: 300,
      // });
      // return products;

    } catch (error) {
      console.error("Database/Redis Error in getProducts:", error);
      throw error;
    }
  }

  async getProductCategories() {
    try {
      const result = await this._pool.query("SELECT unnest(enum_range(NULL::product_category)) AS category");
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error("Database error in getProductCategories:", error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const query = {
        text: "SELECT * FROM products WHERE id = $1",
        values: [id],
      };
      const result = await this._pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError(`Produk with id ${id} not found`);
      }
      return result.rows[0];
    } catch (error) {
      console.error(`Database Error in getProductById for id ${id}:`, error);
      throw error;
    }
  }

  // by id
  async updateProduct(id, { name, price, category, stock }) {
    try {
      const query = {
        text: "UPDATE products SET name = $1, price = $2, category = $3, stock = $4 WHERE id = $5 RETURNING id",
        values: [name, price, category, stock, id],
      };
      const result = await this._pool.query(query);
      return result.rows[0];
    } catch (error) {
      if (error.code === PG_ERRORS.UNIQUE_VIOLATION) {
        throw new InvariantError("fail to update product");
      }
      console.error(`Database Error in updateProduct for id ${id}:`, error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const query = {
        text: "DELETE FROM products WHERE id = $1",
        values: [id],
      };
      const result = await this._pool.query(query);

      if (result.rowCount === 0) {
        throw new NotFoundError("fail to deleting product, id not found");
      }
    } catch (error) {
      console.error(`Database Error in deleteProduct for id ${id}:`, error);
      throw error;
    }
  }
}
