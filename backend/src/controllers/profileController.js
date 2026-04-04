import ProfileModel from '../models/profileModel.js';

const ProfileController = {
  getMyProfile: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập hoặc token không hợp lệ' });
      }

      const accountId = req.user.id; 
      const profile = await ProfileModel.getProfileByAccountId(accountId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Không tìm thấy thông tin cá nhân' });
      }

      return res.status(200).json({
        message: 'Lấy thông tin thành công',
        data: profile
      });
    } catch (error) {
      console.error("Lỗi tại ProfileController:", error);
      return res.status(500).json({ message: 'Lỗi hệ thống nội bộ' });
    }
  },

  updateMyProfile: async (req, res, next) => {
    try {
      const accountId = req.user.id; 
      const { username, phone_number, user_address } = req.body;
      if (!username && !phone_number && !user_address) {
        return res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
      }
      await ProfileModel.updateProfile(accountId, { 
        username, 
        phone_number, 
        user_address 
      });
      const updatedProfile = await ProfileModel.getProfileByAccountId(accountId);
      
      return res.status(200).json({
        message: 'Cập nhật profile thành công',
        data: updatedProfile
      });
    } catch (error) {
      next(error);
    }
  }
};

export default ProfileController;