import discountModel from '../models/discountModel.js';

const discountController = {
    getDiscounts: async (req, res) => {
        try {
            const rows = await discountModel.getAll();
            res.json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    createDiscount: async (req, res, next) => {
        try {
            const { discountCode, discountPercentage, validFrom, validTo, discountDescription } = req.body;
            if (!discountCode || !discountPercentage || !validFrom || !validTo) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const discountId = await discountModel.create({ discountCode, discountPercentage, validFrom, validTo, discountDescription });
            res.status(201).json({ success: true, discountId });
        } catch (error) {
            next(error);
        }
    },

    updateDiscount: async (req, res, next) => {
        try {
            const { discountId } = req.params;
            const { discountCode, discountPercentage, validFrom, validTo, discountDescription, isDisabled } = req.body;
            if (!discountCode || !discountPercentage || !validFrom || !validTo || isDisabled === undefined) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            const affectedRows = await discountModel.update(discountId, { discountCode, discountPercentage, validFrom, validTo, discountDescription, isDisabled });
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Discount not found' });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    deleteDiscount: async (req, res) => {
        try {
            const { discountId } = req.params;
            const affectedRows = await discountModel.delete(discountId);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Discount not found' });
            }
            res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};

export default discountController;
