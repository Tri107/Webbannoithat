import collectionModel from '../models/collectionModel.js';

const collectionController = {
    getCollections: async (req, res) => {
        try {
            const rows = await collectionModel.getAll();
            res.json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    createCollection: async (req, res, next) => {
        try {
            const { collectionName } = req.body;
            if (!collectionName) {
                return res.status(400).json({ message: 'Collection name is required' });
            }
            const collectionId = await collectionModel.create(collectionName);
            res.status(201).json({ success: true, collectionId });
        } catch (error) {
            next(error);
        }
    },

    updateCollection: async (req, res, next) => {
        try {
            const { collectionId } = req.params;
            const { collectionName, isDisabled } = req.body;
            if (!collectionName || isDisabled === undefined) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            const affectedRows = await collectionModel.update(collectionId, collectionName, isDisabled);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Collection not found' });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    deleteCollection: async (req, res) => {
        try {
            const { collectionId } = req.params;
            const affectedRows = await collectionModel.delete(collectionId);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Collection not found' });
            }
            res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};

export default collectionController;
