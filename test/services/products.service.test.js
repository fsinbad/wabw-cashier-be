import Lab from '@hapi/lab';
import { expect } from '@hapi/code';
import Sinon from 'sinon';
import pool from '../../src/db/client.js';
import redisClient from '../../src/lib/redis.js';
import ProductsService from '../../src/services/ProductsService.js';
import InvariantError from '../../src/exceptions/InvariantError.js';
import NotFoundError from '../../src/exceptions/NotFoundError.js';
import { PG_ERRORS } from '../../src/utils/postgresErrorCodes.js';

export const lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;

describe('ProductsService', () => {
    let service;
    let sandbox;
    let poolQueryStub;
    let fakeIdGenerator;
    let cacheDelStub, cacheGetStub, cacheSetStub;

    beforeEach(() => {
        sandbox = Sinon.createSandbox();

        poolQueryStub = sandbox.stub(pool, 'query');
        cacheDelStub = sandbox.stub(redisClient, 'del');
        cacheGetStub = sandbox.stub(redisClient, 'get');
        cacheSetStub = sandbox.stub(redisClient, 'set');

        fakeIdGenerator = sandbox.stub();
        service = new ProductsService(fakeIdGenerator);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('addProduct', () => {
        it('should add a product successfully', async () => {
            const payload = {
                name: 'New Product',
                price: 100,
                category: 'FOOD',
                stock: 10,
                description: 'Desc',
                imageFile: null
            };
            const fakeUuid = 'test-uuid-prod-123';
            const expectedId = `prod-${fakeUuid}`;

            fakeIdGenerator.returns(fakeUuid);
            poolQueryStub.resolves({ rows: [{ id: expectedId }] });
            cacheDelStub.resolves();

            const result = await service.addProduct(payload);

            expect(result).to.equal(expectedId);
            expect(poolQueryStub.calledOnce).to.be.true();
        });

        it('should throw InvariantError on unique violation', async () => {
            const payload = { name: 'Duplicate Product' };
            const dbError = new Error('Duplicate key');
            dbError.code = PG_ERRORS.UNIQUE_VIOLATION;
            dbError.constraint = 'products_name_key';

            poolQueryStub.rejects(dbError);

            await expect(service.addProduct(payload)).to.reject(
                InvariantError,
                'fail to add product, product name already exist'
            );
            expect(cacheDelStub.called).to.be.false();
        });
    });

    describe('getProducts', () => {
        it('should return products from database (cache miss)', async () => {
            const mockProducts = [{ id: 'prod-456', name: 'DB Product' }];
            cacheGetStub.resolves(null);
            poolQueryStub.resolves({ rows: mockProducts });
            cacheSetStub.resolves();

            const result = await service.getProducts();

            expect(result).to.equal(mockProducts);
            expect(poolQueryStub.calledOnce).to.be.true();
        });
    });

    describe('getProductCategories', () => {
        it('should return a flat array of categories', async () => {
            const mockCategories = [{ category: 'FOOD' }, { category: 'BEVERAGE' }];
            poolQueryStub.resolves({ rows: mockCategories });

            const result = await service.getProductCategories();
            expect(result).to.equal(['FOOD', 'BEVERAGE']);
            expect(poolQueryStub.calledOnce).to.be.true();
        });
    });

    describe('getProductById', () => {
        it('should return a product if found', async () => {
            const mockProduct = { id: 'prod-xyz', name: 'Single Product' };
            poolQueryStub.resolves({ rows: [mockProduct], rowCount: 1 });

            const result = await service.getProductById('prod-xyz');
            expect(result).to.equal(mockProduct);
        });

        it('should throw NotFoundError if product is not found', async () => {
            poolQueryStub.resolves({ rows: [], rowCount: 0 });

            await expect(service.getProductById('prod-999')).to.reject(
                NotFoundError,
                'fail, product with id prod-999 not found'
            );
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            const payload = { name: 'Updated', price: 1, category: 'FOOD', stock: 1, description: 'Updated' };
            poolQueryStub.resolves({ rows: [{ id: 'prod-123' }], rowCount: 1 });
            cacheDelStub.resolves();

            await service.updateProduct('prod-123', payload);
            expect(poolQueryStub.calledOnce).to.be.true();
        });

        it('should throw NotFoundError if product to update is not found', async () => {
            poolQueryStub.resolves({ rowCount: 0 });

            await expect(service.updateProduct('prod-999', {})).to.reject(
                NotFoundError,
                'update failed, id not found'
            );
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product successfully', async () => {
            poolQueryStub.resolves({ rowCount: 1 });
            cacheDelStub.resolves();

            await service.deleteProduct('prod-123');
            expect(poolQueryStub.calledOnce).to.be.true();
        });
    });
});