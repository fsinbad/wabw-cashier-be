import Lab from '@hapi/lab';
import { expect } from '@hapi/code';
import Sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { createServer } from '../../src/server.js'; // Impor createServer
import ReportsService from '../../src/services/ReportsService.js';

export const lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;

describe('Reports API (GET /reports/summary)', () => {
    let server;
    let sandbox;
    let serviceStub;
    let adminToken;
    let cashierToken;

    beforeEach(async () => {
        sandbox = Sinon.createSandbox();

        const adminPayload = { sub: 'user-admin-id', email: 'admin@test.com', role: 'ADMIN' };
        const cashierPayload = { sub: 'user-cashier-id', email: 'cashier@test.com', role: 'CASHIER' };
        adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
        cashierToken = jwt.sign(cashierPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        serviceStub = sandbox.stub(ReportsService.prototype, 'getDashboardStatistics');
        server = await createServer();
    });

    afterEach(async () => {
        sandbox.restore();
        await server.stop();
    });

    it('should respond with 200 and stats for ADMIN role', async () => {
        const mockStats = { kpi: { totalRevenueToday: 100 } };
        serviceStub.resolves(mockStats);

        const res = await server.inject({
            method: 'GET',
            url: '/reports/summary',
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });
        const payload = JSON.parse(res.payload);

        expect(res.statusCode).to.equal(200);
        expect(payload.status).to.equal('success');
        expect(payload.data).to.equal(mockStats);
    });

    it('should respond with 403 Forbidden for CASHIER role', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/reports/summary',
            headers: {
                Authorization: `Bearer ${cashierToken}`,
            },
        });

        // 3. Assert
        expect(res.statusCode).to.equal(403);
    });

    it('should respond with 401 Unauthorized if no token is provided', async () => {
        const res = await server.inject({
            method: 'GET',
            url: '/reports/summary',
        });

        // 3. Assert
        expect(res.statusCode).to.equal(401);
    });

    it('should respond with 500 if the service throws an error', async () => {
        serviceStub.rejects(new Error('Internal Service Error')); // Suruh service melempar error

        const res = await server.inject({
            method: 'GET',
            url: '/reports/summary',
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });
        const payload = JSON.parse(res.payload);

        expect(res.statusCode).to.equal(500);
        expect(payload.status).to.equal('fail');
        expect(payload.message).to.equal('Terjadi kegagalan pada server');
    });
});