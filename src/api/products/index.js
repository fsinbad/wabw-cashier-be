import ProductsService from "../../services/ProductsService.js";
import ProductsHandler from "./handler.js";
import { productsRoutes } from "./routes.js";

const productsCacheConfig = {
  expiresIn: 1000 * 60,
  generateTimeout: 500,
};

export const productsPlugin = {
  name: "api-products",
  version: "1.0.0",
  register: async (server) => {
    const productsService = new ProductsService();
    const productsHandler = new ProductsHandler(productsService);

    server.method('getProducts', productsService.getProducts, {
      bind: productsService,
      cache: productsCacheConfig,
    });

    // server.method('getProductCategories', productsService.getProductCategories, {
    //   bind: productsService,
    //   cache: productsCacheConfig,
    // })

    server.route(productsRoutes(productsHandler));
  },
};
