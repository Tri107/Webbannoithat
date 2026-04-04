import db from '../config/mysql.js';
const table_name = 'discounts';

const DiscountModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM ${table_name}
        `);
        return rows;
    },

    create: async (discount) => {
        const { discountCode, discountPercentage, validFrom, validTo, discountDescription } = discount;
        const [result] = await db.query(
            `INSERT INTO ${table_name} (discount_code, discount_percentage, valid_from, valid_to, discount_description) VALUES (?, ?, ?, ?, ?)`,
            [discountCode, discountPercentage, validFrom, validTo, discountDescription]
        );
        return result.insertId;
    },

    update: async (discountId, discount) => {
        const { discountCode, discountPercentage, validFrom, validTo, discountDescription, isDisabled } = discount;
        const [result] = await db.query(
            `UPDATE ${table_name} SET discount_code = ?, discount_percentage = ?, valid_from = ?, valid_to = ?, discount_description = ?, is_disabled = ? WHERE discount_id = ?`,
            [discountCode, discountPercentage, validFrom, validTo, discountDescription, isDisabled, discountId]
        );
        return result.affectedRows;
    },

    delete: async (discountId) => {
        const [result] = await db.query(
            `DELETE FROM ${table_name} WHERE discount_id = ?`,
            [discountId]
        );
        return result.affectedRows;
    },
};

export default DiscountModel;
