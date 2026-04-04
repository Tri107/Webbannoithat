import db from '../config/mysql.js';

const DashboardModel = {
    getWeeklyStats: async () => {
        const [rows] = await db.query(
            `SELECT * FROM view_weekly_stats`
        );
        return rows;
    },

    getChartData: async (fromDate, toDate) => {
        const [rows] = await db.query(
            `SELECT stats_date, total_revenue, PENDING, DELIVERING, DELIVERED, CANCELLED 
             FROM view_get_chart_data
             WHERE stats_date BETWEEN ? AND ?`,
            [fromDate, toDate]
        );
        return rows;
    },

    getDashboardSummary: async () => {
        // 1. Get 5 recent orders from view
        const [recentOrders] = await db.query(
            `SELECT * FROM view_all_orders ORDER BY order_date DESC LIMIT 5`
        );

        if (recentOrders.length === 0) {
            return { recentOrders: [], topProducts: [] };
        }

        // 2. Get top 5 sold products from these 5 orders using view_order_items
        const orderIds = recentOrders.map(o => o.order_id);
        const [topProducts] = await db.query(
            `SELECT product_name, SUM(quantity) as total_sold
             FROM view_order_items
             WHERE order_id IN (?)
             GROUP BY product_name
             ORDER BY total_sold DESC
             LIMIT 5`,
            [orderIds]
        );

        return { recentOrders, topProducts };
    }
}

export default DashboardModel;