import categoryModel from '../models/categoryModel.js';

const categoryController = {
    getCagories : async (req, res) => {
        try {
            const rows = await categoryModel.getAll();
            res.json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    createCategory: async (req, res, next) => {
        try {
            const { categoryName } = req.body;
            if (!categoryName) {
                return res.status(400).json({ message: 'Category name is required' });
            }
            const categoryId = await categoryModel.create(categoryName);
            res.status(201).json({ success: true, categoryId });
        } catch (error) {
            next(error);
        }
    },

    updateCategory: async (req, res, next) => {
        try {
            const { categoryId } = req.params;
            const { categoryName, isDisabled } = req.body;
            if (!categoryName || isDisabled === undefined) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            const affectedRows = await categoryModel.update(categoryId, categoryName, isDisabled);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { categoryId } = req.params;
            const affectedRows = await categoryModel.delete(categoryId);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};

export default categoryController;