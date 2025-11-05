import Boom from '@hapi/boom';
import ClientError from '../../exceptions/ClientError.js';

export default class OrdersHandler {
  constructor(service) {
    this._service = service;

    this.postOrderHandler = this.postOrderHandler.bind(this);
    this.getOrdersHandler = this.getOrdersHandler.bind(this);
    this.getOrderByIdHandler = this.getOrderByIdHandler.bind(this);
    // 
    this.deleteOrderHandler = this.deleteOrderHandler.bind(this);
  }

  async postOrderHandler(request, h) {
    try {
      const { sub: userId } = request.auth.credentials.user;
      const payload = { ...request.payload, userId };
      const orderId = await this._service.createOrder(payload);

      return h.response({
        status: 'success',
        message: 'Order berhasil dibuat',
        data: { orderId },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return Boom.boomify(error);
      }
      console.error('PostOrder Handler Error:', error);
      return Boom.internal('Maaf, terjadi kegagalan pada server kami.');
    }
  }

  async getOrdersHandler(request, h) {
    try {
      const orders = await this._service.getOrders();
      return {
        status: 'success',
        data: { orders },
      };
    } catch (error) {
      console.error('GetOrders Handler Error:', error);
      return Boom.internal('Maaf, terjadi kegagalan pada server kami.');
    }
  }

  async getOrderByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const order = await this._service.getOrderById(id);
      return {
        status: 'success',
        data: { order },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return Boom.boomify(error);
      }
      console.error('GetOrderById Handler Error:', error);
      return Boom.internal('Maaf, terjadi kegagalan pada server kami.');
    }
  }

  async deleteOrderHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteOrder(id);

      return {
        status: 'success',
        message: 'order deleted',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return Boom.boomify(error);
      }
      console.error(`DeleteOrder Handler Error for id ${request.params.id}:`, error);
      return Boom.internal('Maaf, terjadi kegagalan pada server kami.');
    }
  }
}