import ReportsHandler from './handler.js';
import { createReportsRoutes } from './routes.js';

export const reportsPlugin = {
    name: 'api-reports',
    version: '1.0.0',
    register: async (server) => {
        const reportsHandler = new ReportsHandler();
        const reportsRoutes = createReportsRoutes(reportsHandler);
        server.route(reportsRoutes);
    },
};