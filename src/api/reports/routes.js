export const createReportsRoutes = (handler) => [
    {
        method: 'GET',
        path: '/reports/summary',
        handler: handler.getDashboardStatisticsHandler,
        options: {
            auth: {
                strategy: 'jwt_strategy',
                scope: ['ADMIN', 'SUPER_ADMIN'],
            },
            description: 'Get dashboard statistics summary',
            tags: ['api', 'reports'],

            cache: {
                expiresIn: 1000 * 60 * 15, 
                privacy: 'private',
            },
        },
    },
];