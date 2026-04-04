import db from '../config/mysql.js';
const table_name = 'brands';

const BrandModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM ${table_name}
        `);
        return rows;
    },

    create: async (brandName) => {
        const [result] = await db.query(
            `INSERT INTO ${table_name} (brand_name) VALUES (?)`,
            [brandName]
        );
        return result.insertId;
    },

    update: async (brandId, brandName, isDisabled) => {
        const [result] = await db.query(
            `UPDATE ${table_name} SET brand_name = ?, is_disabled = ? WHERE brand_id = ?`,
            [brandName, isDisabled, brandId]
        );
        return result.affectedRows;
    },

    delete: async (brandId) => {
        const [result] = await db.query(
            `DELETE FROM ${table_name} WHERE brand_id = ?`,
            [brandId]
        );
        return result.affectedRows;
    },
};

export default BrandModel;