import { randomUUID } from "node:crypto";
import pool from "../db/client.js";
import InvariantError from "../exceptions/InvariantError.js";
import { PG_ERRORS } from "../utils/postgresErrorCodes.js";
import NotFoundError from "../exceptions/NotFoundError.js";
import StorageService from "./StorageService.js";
// import ClientError from "../exceptions/ClientError.js";
// import redisClient from "../lib/redis.js";
// const CACHE_KEYS = {
//   PRODUCTS: 'products:all',
//   CATEGORIES: 'products:categories',
// };

export default class ProductsService {
  constructor(idGenerator = randomUUID) {
    this._pool = pool;
    this._idGenerator = idGenerator;
    // this._cache = redisClient;
    this._storageService = new StorageService('product-image');
  }

  // async verifyNewProductName(name) {
  //   const query = {
  //     text: "SELECT name FROM products WHERE name = $1",
  //     values: [name],
  //   };
  //   const result = await this._pool.query(query);
  //   if (result.rows > 0) {
  //     throw new ClientError("product name already exist.");
  //   }
  // }

  async addProduct(payload) {
    const { name, price, category, stock, description, imageFile } = payload;
    let imageUrl = null;

    if (imageFile) {
      imageUrl = await this._storageService.writeFile(imageFile, imageFile.hapi);
      // console.warn("imageFile received but no StorageService is implemented yet.");
    }

    try {
      const id = `prod-${this._idGenerator()}`;
      const query = {
        text: `INSERT INTO products(id, name, price, category, stock, description, image_url) 
               VALUES($1, $2, $3, $4, $5, $6, $7) 
               RETURNING id`,
        values: [id, name, price, category, stock, description, imageUrl],
      };
      const result = await this._pool.query(query);
      // Invalidate cache
      // await this._cache.del(CACHE_KEYS.PRODUCTS);
      // await this._cache.del(CACHE_KEYS.CATEGORIES);
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
      // const cachedProducts = await redisClient.get(CACHE_KEYS);
      // if (cachedProducts) {
      //   console.log('Serving products from Redis cache..');
      //   return JSON.parse(cachedProducts); 
      // }
      // console.log('Cache miss. Fetching products from database..');
      const result = await this._pool.query(
        "SELECT id, name, price, category, stock FROM products ORDER BY name ASC"
      );

      return result.rows;
      // const products = result.rows;
      // await redisClient.set(CACHE_KEYS, JSON.stringify(products), {
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
        text: "SELECT id, name, price, category, stock, description, image_url FROM products WHERE id = $1",
        values: [id],
      };
      const result = await this._pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError(`fail, product with id ${id} not found`);
      }
      return result.rows[0];
    } catch (error) {
      console.error(`Database Error in getProductById for id ${id}:`, error);
      throw error;
    }
  }

  // by id
  async updateProduct(id, payload) {
    const { name, price, category, stock, description } = payload;

    try {
      const query = {
        text: `UPDATE products SET name = $1, price = $2, category = $3, stock = $4, description = $5, updated_at = NOW() 
               WHERE id = $6 RETURNING id`,
        values: [name, price, category, stock, description, id],
      };
      const result = await this._pool.query(query);
      if (result.rowCount === 0) {
        throw new NotFoundError('update failed, id not found');
      }

      // Invalidate cache
      // await this._cache.del(CACHE_KEYS.PRODUCTS);
      // await this._cache.del(CACHE_KEYS.CATEGORIES);
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
        text: "DELETE FROM products WHERE id = $1 RETURNING id",
        values: [id],
      };
      const result = await this._pool.query(query);

      if (result.rowCount === 0) {
        throw new NotFoundError("fail to deleting product, id not found");
      }
      // Invalidate cache
      // await this._cache.del(CACHE_KEYS.PRODUCTS);
      // await this._cache.del(CACHE_KEYS.CATEGORIES);
    } catch (error) {
      console.error(`Database Error in deleteProduct for id ${id}:`, error);
      throw error;
    }
  }
}
