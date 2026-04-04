import db from '../config/mysql.js';

const ProfileModel = {
  createDefaultProfile: async (accountId) => {
    try {
      const query = `
        INSERT INTO user_profiles (account_id, username, phone_number, user_address) 
        VALUES (?, NULL, NULL, NULL)
      `;
      const [result] = await db.execute(query, [accountId]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  getProfileByAccountId: async (accountId) => {
    try {
      const query = `
        SELECT p.*, a.email 
        FROM user_profiles p
        JOIN accounts a ON p.account_id = a.account_id 
        WHERE p.account_id = ?
      `;
      const [rows] = await db.execute(query, [accountId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  updateProfile: async (accountId, data) => {
    try {
      
      const { username, phone_number, user_address } = data;
      
      const query = `
        UPDATE user_profiles 
        SET username = ?, phone_number = ?, user_address = ? 
        WHERE account_id = ?
      `;
      const values = [
        username ?? null, 
        phone_number ?? null, 
        user_address ?? null, 
        accountId
      ];

      const [result] = await db.execute(query, values);
      return result;
    } catch (error) {
      throw error;
    }
  }
};

export default ProfileModel;