import OrdersHandler from './handler.js';
import { createOrdersRoutes } from './routes.js';
import OrdersService from '../../services/OrdersService.js';
import ProductsService from '../../services/ProductsService.js';

export const ordersPlugin = {
  name: 'api-orders',
  version: '1.0.0',
  register: async (server) => {
    const productsService = new ProductsService();
    const ordersService = new OrdersService(productsService);
    const ordersHandler = new OrdersHandler(ordersService);
    const ordersRoutes = createOrdersRoutes(ordersHandler);
    
    server.route(ordersRoutes);
  },
};