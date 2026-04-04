import db from "../config/mysql.js";

const AccountModel = {
  findAll: async () => {
    const query = "SELECT * FROM accounts ORDER BY created_at DESC";
    const [rows] = await db.execute(query);
    return rows;
  },

  findByEmail: async (email) => {
    const query =
      "SELECT * FROM accounts WHERE email = ? AND is_disabled = 0";
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  },

  findById: async (id) => {
    const query = `
      SELECT account_id, email, is_admin, is_disabled, created_at
      FROM accounts
      WHERE account_id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  },

  updateRefreshToken: async (id, refreshToken) => {
    const query = "UPDATE accounts SET refresh_token = ? WHERE account_id = ?";
    const [result] = await db.execute(query, [refreshToken, id]);
    return result;
  },

  findByRefreshToken: async (token) => {
    const query =
      "SELECT * FROM accounts WHERE refresh_token = ? AND is_disabled = 0";
    const [rows] = await db.execute(query, [token]);
    return rows[0];
  },

  createAccount: async (email, passwordHash, isAdmin = false) => {
    const query = `
      INSERT INTO accounts (email, password_hash, created_at, is_admin, is_disabled)
      VALUES (?, ?, NOW(), ?, 0)
    `;
    const [result] = await db.execute(query, [email, passwordHash, isAdmin]);
    return result.insertId;
  },

  update: async (id, data) => {
    const { is_admin, is_disabled } = data;
    const query =
      "UPDATE accounts SET is_admin = ?, is_disabled = ? WHERE account_id = ?";
    return await db.execute(query, [is_admin, is_disabled, id]);
  },

  updatePassword: async (id, newPasswordHash) => {
    const query = "UPDATE accounts SET password_hash = ? WHERE account_id = ?";
    return await db.execute(query, [newPasswordHash, id]);
  },
};

export default AccountModel;