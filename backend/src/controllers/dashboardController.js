import DashboardModel from '../models/dashboardModel.js';

const DashboardController = {
    getWeeklyStats: async (req, res) => {
        try {
            const stats = await DashboardModel.getWeeklyStats();
            return res.status(200).json({ message: "Success", data: stats });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server Error" });
        }
    },

    getChartData: async (req, res) => {
        try {
            const { from, to } = req.body;
            if (!from || !to) {
                return res.status(400).json({ message: "Invalid date range" });
            }
            const data = await DashboardModel.getChartData(from, to);
            return res.status(200).json({ message: "Success", data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server Error" });
        }
    },

    getDashboardSummary: async (req, res) => {
        try {
            const data = await DashboardModel.getDashboardSummary();
            return res.status(200).json({ message: "Success", data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server Error" });
        }
    },
}

export default DashboardController;