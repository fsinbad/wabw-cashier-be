import Lab from '@hapi/lab';
import { expect } from '@hapi/code';
import Sinon from 'sinon';
import pool from '../../src/db/client.js';
import ReportsService from '../../src/services/ReportsService.js';

export const lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;

describe('ReportsService', () => {
    let reportsService;
    let sandbox;
    let poolQueryStub;

    beforeEach(() => {
        reportsService = new ReportsService();
        sandbox = Sinon.createSandbox();
        poolQueryStub = sandbox.stub(pool, 'query');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getDashboardStatistics', () => {
        it('should correctly aggregate and return all statistics', async () => {
            const mockKpiResult = {
                rows: [{ totalRevenueToday: '150000', totalOrdersToday: '10' }],
            };
            const mockTopProductsResult = {
                rows: [{ name: 'Nasi Goreng', totalQuantitySold: '50' }],
            };
            const mockCategoryResult = {
                rows: [{ category: 'FOOD', totalRevenue: '1000000' }],
            };

            poolQueryStub.onCall(0).resolves(mockKpiResult);
            poolQueryStub.onCall(1).resolves(mockTopProductsResult);
            poolQueryStub.onCall(2).resolves(mockCategoryResult);

            const result = await reportsService.getDashboardStatistics();

            expect(poolQueryStub.callCount).to.equal(3);

            expect(result).to.equal({
                kpi: mockKpiResult.rows[0],
                topProducts: mockTopProductsResult.rows,
                revenueByCategory: mockCategoryResult.rows,
            });
        });

        it('should throw an error if one of the database queries fails', async () => {
            const dbError = new Error('Database connection failed');
            poolQueryStub.onCall(0).rejects(dbError);
            poolQueryStub.onCall(1).resolves({ rows: [] });
            poolQueryStub.onCall(2).resolves({ rows: [] });

            await expect(reportsService.getDashboardStatistics()).to.reject(Error, 'Database connection failed');
        });
    });
});