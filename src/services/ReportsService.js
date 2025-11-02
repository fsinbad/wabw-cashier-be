import pool from '../db/client.js';

class ReportsService {
    constructor() {
        this._pool = pool;
    }

    async getDashboardStatistics() {
        try {
            const kpiQuery = this._pool.query(
                `SELECT COALESCE(SUM(total_amount), 0) AS "totalRevenueToday", COALESCE(COUNT(id), 0) AS "totalOrdersToday" FROM orders WHERE created_at >= CURRENT_DATE`
            );

            const topProductsQuery = this._pool.query(
                `SELECT p.name, SUM(oi.quantity) AS "totalQuantitySold" FROM order_items oiJOIN products p ON oi.product_id = p.id GROUP BY p.name ORDER BY "totalQuantitySold" DESC LIMIT 5`
            );
            
            const categoryQuery = this._pool.query(
                `SELECT p.category, SUM(oi.quantity * oi.price) AS "totalRevenue" FROM order_items oi JOIN products p ON oi.product_id = p.id GROUP BY p.category ORDER BY "totalRevenue" DESC`
            );

            const [kpiResult, topProductsResult, categoryResult] = await Promise.all([
                kpiQuery,
                topProductsQuery,
                categoryQuery,
            ]);

            return {
                kpi: kpiResult.rows[0],
                topProducts: topProductsResult.rows,
                revenueByCategory: categoryResult.rows,
            };
        } catch (error) {
            console.error('Database Error in getDashboardStatistics:', error);
            throw error;
        }
    }
}

export default ReportsService;