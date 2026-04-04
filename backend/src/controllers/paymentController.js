import paymentModel from '../models/paymentModel.js';

const paymentController = {
    getPayments: async (req, res) => {
        try {
            const rows = await paymentModel.getAll();
            res.json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    createPayment: async (req, res, next) => {
        try {
            const { paymentMethod, orderId } = req.body;
            if (!paymentMethod || !orderId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const paymentId = await paymentModel.create({ paymentMethod, orderId });
            res.status(201).json({ success: true, paymentId });
        } catch (error) {
            next(error);
        }
    },

    updatePayment: async (req, res, next) => {
        try {
            const { paymentId } = req.params;
            const { paymentMethod, orderId } = req.body;
            if (!paymentMethod || !orderId) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            const affectedRows = await paymentModel.update(paymentId, { paymentMethod, orderId });
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    deletePayment: async (req, res) => {
        try {
            const { paymentId } = req.params;
            const affectedRows = await paymentModel.delete(paymentId);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};

export default paymentController;
