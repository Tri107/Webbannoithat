import db from '../config/mysql.js';
const table_name = 'payments';

const PaymentModel = {
    getAll: async () => {
        const [rows] = await db.query(`
            SELECT *
            FROM ${table_name}
        `);
        return rows;
    },

    create: async (payment) => {
        const { paymentMethod, orderId } = payment;
        const [result] = await db.query(
            `INSERT INTO ${table_name} (payment_method, order_id) VALUES (?, ?)`,
            [paymentMethod, orderId]
        );
        return result.insertId;
    },

    update: async (paymentId, payment) => {
        const { paymentMethod, orderId } = payment;
        const [result] = await db.query(
            `UPDATE ${table_name} SET payment_method = ?, order_id = ? WHERE payment_id = ?`,
            [paymentMethod, orderId, paymentId]
        );
        return result.affectedRows;
    },

    delete: async (paymentId) => {
        const [result] = await db.query(
            `DELETE FROM ${table_name} WHERE payment_id = ?`,
            [paymentId]
        );
        return result.affectedRows;
    },
};

export default PaymentModel;
