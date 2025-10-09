import { ProductPayloadSchema } from "./validator.js";
import Joi from "joi";

export const productsRoutes = (handler) => [
  {
    method: "POST",
    path: "/products",
    handler: handler.postProductHandler,
    options: {
      auth: "jwt_strategy",
      validate: { payload: ProductPayloadSchema },
      description: "add a new product",
      tags: ["api", "products"],
    },
  },
  {
    method: "GET",
    path: "/products/categories",
    handler: handler.getProductCategoriesHandler,
    options: {
      auth: "jwt_strategy",
      cache: {
        expiresIn: 60 * 5000,
        privacy: 'private',
      },
      description: "get products categories",
      tags: ["api", "products"]
    }
  },
  {
    method: "GET",
    path: "/products",
    handler: handler.getProductsHandler,
    options: {
      auth: "jwt_strategy",
      cache: {
        expiresIn: 60 * 5000,
        privacy: 'private',
      },
      description: "Get all products",
      tags: ["api", "products"],
    },
  },
  {
    method: "GET",
    path: "/products/{id}",
    handler: handler.getProductByIdHandler,
    options: {
      auth: "jwt_strategy",
      validate: {
        params: Joi.object({ id: Joi.number().integer().required() }),
      },
      description: "get a product by its ID",
      tags: ["api", "products"],
    },
  },
  {
    method: "PUT",
    path: "/products/{id}",
    handler: handler.putProductByIdHandler,
    options: {
      auth: "jwt_strategy",
      validate: {
        params: Joi.object({ id: Joi.number().integer().required() }),
        payload: ProductPayloadSchema,
      },
      description: "update a product by its ID",
      tags: ["api", "products"],
    },
  },
  {
    method: "DELETE",
    path: "/products/{id}",
    handler: handler.deleteProductByIdHandler,
    options: {
      auth: "jwt_strategy",
      validate: {
        params: Joi.object({ id: Joi.number().integer().required() }),
      },
      description: "delete a product by its ID",
      tags: ["api", "products"],
    },
  },
];
