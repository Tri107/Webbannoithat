import cartItemModel from '../models/cartItemModel.js';

const cartItemController = {
    getCartItems: async (req, res) => {
        try {
            const { accountId } = req.params;
            const rows = await cartItemModel.getAll(accountId);
            res.json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    addCartItem: async (req, res, next) => {
        try {
            const { accountId, productId, quantity, sku, price, color } = req.body;
            if (!accountId || !productId || !quantity || !sku) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const snapshot = { price, color };
            const affectedRows = await cartItemModel.add(accountId, productId, sku, quantity, snapshot);
            if (affectedRows === 0) {
                return res.status(400).json({ message: 'Failed to add item to cart' });
            }
            res.status(201).json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    updateCartItem: async (req, res, next) => {
        try {
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            if (!quantity) {
                return res.status(400).json({ message: 'Invalid input' });
            }
            const affectedRows = await cartItemModel.update(cartItemId, quantity);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    updateCartItemColor: async (req, res, next) => {
        try {
            const { cartItemId } = req.params;
            const { color } = req.body;

            if (!color) {
                return res.status(400).json({ message: 'Color is required' });
            }

            const affectedRows = await cartItemModel.updateColor(cartItemId, color.trim());

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    removeCartItem: async (req, res) => {
        try {
            const { cartItemId } = req.params;
            const affectedRows = await cartItemModel.remove(cartItemId);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
            res.json({ success: true });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    clearCart: async (req, res) => {
        try {
            const { accountId } = req.body;
            if (!accountId) {
                return res.status(400).json({ message: 'Account ID is required' });
            }
            const affectedRows = await cartItemModel.clearCart(accountId);
            res.json({ success: true, affectedRows });
        } catch (error) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
};

export default cartItemController;