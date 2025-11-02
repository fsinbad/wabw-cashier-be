import Lab from '@hapi/lab';
import { expect } from '@hapi/code';
import Sinon from 'sinon';
import pool from '../../src/db/client.js';
import OrdersService from '../../src/services/OrdersService.js';
import InvariantError from '../../src/exceptions/InvariantError.js';

export const lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;

describe('OrdersService', () => {
    let service;
    let sandbox;
    let mockClient;

    beforeEach(() => {
        sandbox = Sinon.createSandbox();
        mockClient = {
            query: sandbox.stub(),
            release: sandbox.stub(),
        };
        sandbox.stub(pool, 'connect').resolves(mockClient);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('createOrder', () => {
        let payload;
        let mockProduct;
        let fakeIdGenerator;

        beforeEach(() => {
            payload = {
                items: [{ productId: 'prod-123', quantity: 2 }],
                customerName: 'Test Customer',
                paymentMethod: 'CASH',
                userId: 'user-abc',
            };
            mockProduct = { name: 'Nasi Goreng', price: '20000.00', stock: 10 };
            fakeIdGenerator = sandbox.stub();
            service = new OrdersService(fakeIdGenerator);
        });

        it('should create an order successfully (transaction commit)', async () => {
            const fakeOrderUuid = 'order-uuid-123';
            const fakeItemUuid = 'item-uuid-456';

            fakeIdGenerator.onFirstCall().returns(fakeOrderUuid);
            fakeIdGenerator.onSecondCall().returns(fakeItemUuid);

            mockClient.query.withArgs(Sinon.match('SELECT name, price, stock')).resolves({ rows: [mockProduct], rowCount: 1 });
            mockClient.query.withArgs(Sinon.match('INSERT INTO orders')).resolves();
            mockClient.query.withArgs(Sinon.match('INSERT INTO order_items')).resolves();
            mockClient.query.withArgs(Sinon.match('UPDATE products')).resolves();

            const orderId = await service.createOrder(payload);

            expect(orderId).to.equal(`ord-${fakeOrderUuid}`);
            expect(mockClient.query.calledWith('COMMIT')).to.be.true();
            expect(mockClient.query.calledWith('ROLLBACK')).to.be.false();
            expect(mockClient.release.calledOnce).to.be.true();
        });

        it('should throw InvariantError and rollback if product not found', async () => {
            mockClient.query.withArgs(Sinon.match('SELECT name, price, stock')).resolves({ rows: [], rowCount: 0 });
            await expect(service.createOrder(payload)).to.reject(InvariantError, 'Produk dengan ID prod-123 tidak ditemukan.');
            expect(mockClient.query.calledWith('ROLLBACK')).to.be.true();
        });

        it('should throw InvariantError and rollback if stock is insufficient', async () => {
            payload.items[0].quantity = 20;
            mockClient.query.withArgs(Sinon.match('SELECT name, price, stock')).resolves({ rows: [mockProduct], rowCount: 1 });

            await expect(service.createOrder(payload)).to.reject(InvariantError, 'Stok produk "Nasi Goreng" tidak mencukupi.');
            expect(mockClient.query.calledWith('ROLLBACK')).to.be.true();
        });
    });
});