import Lab from '@hapi/lab';
import { expect } from '@hapi/code';
import Sinon from 'sinon';
import * as crypto from 'node:crypto';
import pool from '../../src/db/client.js';
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

    beforeEach(() => {
        sandbox = Sinon.createSandbox();
        poolQueryStub = sandbox.stub(pool, 'query');
        fakeIdGenerator = sandbox.stub();
        service = new ProductsService(fakeIdGenerator);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('addProduct', () => {
        it('should add a product successfully', async () => {
            const fakeUuid = 'test-uuid-prod';
            fakeIdGenerator.returns(fakeUuid);
            const payload = { name: 'New Product', price: 100, category: 'FOOD', stock: 10 };

            poolQueryStub.onCall(0).resolves({ rowCount: 0 });
            poolQueryStub.onCall(1).resolves({ rows: [{ id: `prod-${fakeUuid}` }] });

            const result = await service.addProduct(payload);
            expect(result).to.equal(`prod-${fakeUuid}`);
            expect(poolQueryStub.calledTwice).to.be.true();
        });

        it('should throw InvariantError on unique violation', async () => {
            const dbError = new Error('Duplicate key');
            dbError.code = PG_ERRORS.UNIQUE_VIOLATION;

            poolQueryStub.onCall(0).resolves({ rowCount: 0 });
            poolQueryStub.onCall(1).rejects(dbError);

            await expect(service.addProduct({})).to.reject(
                InvariantError,
                'fail to add product, product name already exist'
            );
        });
    });

    describe('getProducts', () => {
        it('should return products from database', async () => {
            const mockProducts = [{ id: 'prod-123', name: 'DB Product' }];
            poolQueryStub.resolves({ rows: mockProducts });

            const result = await service.getProducts();

            expect(result).to.equal(mockProducts);
            expect(poolQueryStub.calledOnce).to.be.true();
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product successfully', async () => {
            poolQueryStub.resolves({ rowCount: 1 });
            await service.deleteProduct('prod-123');
            expect(poolQueryStub.calledOnce).to.be.true();
        });

        it('should throw NotFoundError if product id does not exist', async () => {
            poolQueryStub.resolves({ rowCount: 0 });
            await expect(service.deleteProduct('prod-999')).to.reject(
                NotFoundError,
                'fail to deleting product, id not found'
            );
        });
    });
});