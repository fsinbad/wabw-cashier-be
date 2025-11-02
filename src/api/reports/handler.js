import Boom from '@hapi/boom';
import ReportsService from '../../services/ReportsService.js';
import ClientError from '../../exceptions/ClientError.js';

class ReportsHandler {
    constructor() {
        this._service = new ReportsService();
        this.getDashboardStatisticsHandler = this.getDashboardStatisticsHandler.bind(this);
    }

    async getDashboardStatisticsHandler(request, h) {
        try {
            const statistics = await this._service.getDashboardStatistics();
            return {
                status: 'success',
                data: statistics,
            };
        } catch (error) {
            if (error instanceof ClientError) {
                return Boom.boomify(error);
            }
            console.error('Reports Handler Error:', error);
            return Boom.internal('Terjadi kegagalan pada server');
        }
    }
}

export default ReportsHandler;