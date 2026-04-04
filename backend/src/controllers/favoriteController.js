import favoriteModel from '../models/favoriteModel.js';

const favoriteController = {
  getFavorites: async (req, res) => {
    try {
      const rows = await favoriteModel.getAll();
      res.json({ success: true, data: rows });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  addFavorite: async (req, res, next) => {
    try {
      const { accountId, productId } = req.body;

      if (!accountId || !productId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const affectedRows = await favoriteModel.add(accountId, productId);

      if (affectedRows === 0) {
        return res.status(400).json({ message: 'Failed to add favorite' });
      }

      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  removeFavorite: async (req, res) => {
    try {
      const { accountId, productId } = req.body;

      if (!accountId || !productId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const affectedRows = await favoriteModel.remove(accountId, productId);

      if (affectedRows === 0) {
        return res.status(404).json({ message: 'Favorite not found' });
      }

      res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getFavoritesByAccountId: async (req, res) => {
    try {
      const { accountId } = req.params;
      const favorites = await favoriteModel.getFavoritesByAccountId(accountId);

      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default favoriteController;