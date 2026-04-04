import db from '../config/mysql.js';
const table_name = 'collections';

const CollectionModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM ${table_name}
        `);
        return rows;
    },

    create: async (collectionName) => {
        const [result] = await db.query(
            `INSERT INTO ${table_name} (collection_name) VALUES (?)`,
            [collectionName]
        );
        return result.insertId;
    },

    update: async (collectionId, collectionName, isDisabled) => {
        const [result] = await db.query(
            `UPDATE ${table_name} SET collection_name = ?, is_disabled = ? WHERE collection_id = ?`,
            [collectionName, isDisabled, collectionId]
        );
        return result.affectedRows;
    },

    delete: async (collectionId) => {
        const [result] = await db.query(
            `DELETE FROM ${table_name} WHERE collection_id = ?`,
            [collectionId]
        );
        return result.affectedRows;
    },
};

export default CollectionModel;
