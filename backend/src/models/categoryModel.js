import db from '../config/mysql.js';
const table_name = 'categories';

const CategoryModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM ${table_name}
        `);
        return rows;
    },

    create: async (categoryName) => {
        const [result] = await db.query(
            `INSERT INTO ${table_name} (category_name) VALUES (?)`,
            [categoryName]
        );
        return result.insertId;
    },

    update: async (categoryId, categoryName, isDisabled) => {
        const [result] = await db.query(
            `UPDATE ${table_name} SET category_name = ?, is_disabled = ? WHERE category_id = ?`,
            [categoryName, isDisabled, categoryId]
        );
        return result.affectedRows;
    },

    delete: async (categoryId) => {
        const [result] = await db.query(
            `DELETE FROM ${table_name} WHERE category_id = ?`,
            [categoryId]
        );
        return result.affectedRows;
    },
};

export default CategoryModel;