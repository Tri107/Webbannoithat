import brandModel from '../models/brandModel.js';

const brandController = {
    getBrands: async (req, res) => {
        try {
            const rows = await brandModel.getAll();
            res.json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    createBrand: async (req, res, next) => {
        try {
            const { brandName } = req.body;
            if (!brandName) {
                return res.status(400).json({ message: 'Brand name is required' });
            }
            const brandId = await brandModel.create(brandName);
            res.status(201).json({ success: true, brandId });
        } catch (error) {
            next(error);
        }
    },

    updateBrand: async (req, res, next) => {
        try {
            const { brandId } = req.params;
            const { brandName, isDisabled } = req.body;
            if (!brandName || isDisabled === undefined) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            const affectedRows = await brandModel.update(brandId, brandName, isDisabled);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Brand not found' });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    deleteBrand: async (req, res) => {
        try {
            const { brandId } = req.params;
            const affectedRows = await brandModel.delete(brandId);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Brand not found' });
            }
            res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};

export default brandController;