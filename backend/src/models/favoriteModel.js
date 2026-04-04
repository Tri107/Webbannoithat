import db from '../config/mysql.js';
import mongoose from 'mongoose';
import Variant from '../models/variantModel.js';

const table_name = 'favorites';

const isValidObjectId = (str) => /^[a-fA-F0-9]{24}$/.test(str);

const FavoriteModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT *
      FROM ${table_name}
    `);
    return rows;
  },

  add: async (accountId, productId) => {
    const [result] = await db.query(
      `INSERT INTO ${table_name} (account_id, product_id) VALUES (?, ?)`,
      [accountId, productId]
    );
    return result.affectedRows;
  },

  remove: async (accountId, productId) => {
    const [result] = await db.query(
      `DELETE FROM ${table_name} WHERE account_id = ? AND product_id = ?`,
      [accountId, productId]
    );
    return result.affectedRows;
  },

  getFavoritesByAccountId: async (accountId) => {
    const query = `
      SELECT
        p.*,
        c.category_name,
        b.brand_name,
        cl.collection_name,
        f.added_at
      FROM favorites f
      JOIN products p ON f.product_id = p.product_id
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN collections cl ON p.collection_id = cl.collection_id
      WHERE f.account_id = ?
        AND p.is_disabled = 0
      ORDER BY f.added_at DESC
    `;

    try {
      const [rows] = await db.execute(query, [accountId]);

      const variantIds = rows
        .filter((r) => r.variant_ref && isValidObjectId(r.variant_ref))
        .map((r) => new mongoose.Types.ObjectId(r.variant_ref));

      const variants = await Variant.find({
        _id: { $in: variantIds },
      }).lean();

      const variantMap = {};
      variants.forEach((v) => {
        variantMap[v._id.toString()] = v;
      });

      rows.forEach((row) => {
        row.variants = row.variant_ref
          ? variantMap[row.variant_ref] || null
          : null;
      });

      return rows;
    } catch (error) {
      console.error('Database query failed:', error);
      throw new Error('Database query failed');
    }
  }
};

export default FavoriteModel;