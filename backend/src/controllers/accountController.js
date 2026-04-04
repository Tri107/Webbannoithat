import bcrypt from 'bcryptjs'; 
import AccountModel from '../models/accountModel.js';
import ProfileModel from '../models/profileModel.js'; 

const AccountController = {
  getAll: async (req, res) => {
    try {
      const accounts = await AccountModel.findAll();
      
      return res.status(200).json({
        message: 'Lấy danh sách tài khoản thành công',
        data: accounts
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server khi lấy danh sách tài khoản' });
    }
  },
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const account = await AccountModel.findById(id);

      if (!account) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      }

      return res.status(200).json({
        message: 'Lấy thông tin tài khoản thành công',
        data: account
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server khi lấy thông tin tài khoản' });
    }
  },
  create: async (req, res, next) => {
    try {
      const { email, password, is_admin } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
      }
      
      const existingUser = await AccountModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      const newAccountId = await AccountModel.createAccount(email, passwordHash, is_admin);
      await ProfileModel.createDefaultProfile(newAccountId);
      
      return res.status(201).json({ 
        message: 'Tạo tài khoản thành công', 
        account_id: newAccountId 
      });

    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { is_admin, is_disabled } = req.body;
      
      if (is_admin === undefined || is_disabled === undefined) {
        return res.status(400).json({ 
          message: 'Dữ liệu không hợp lệ. Vui lòng gửi cả is_admin và is_disabled' 
        });
      }

      await AccountModel.update(id, { is_admin, is_disabled });

    
      if (is_disabled === 1 || is_disabled === true) {
        await AccountModel.updateRefreshToken(id, null);
      }

      return res.status(200).json({ message: 'Cập nhật trạng thái tài khoản thành công' });

    } catch (error) {
      next(error);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { old_password, new_password } = req.body; // Yêu cầu thêm mật khẩu cũ

      if (req.user.role !== 'admin' && parseInt(req.user.id) !== parseInt(id)) {
        return res.status(403).json({ message: 'Bạn không có quyền đổi mật khẩu của người khác' });
      }

      if (!new_password) {
        return res.status(400).json({ message: 'Vui lòng nhập mật khẩu mới' });
      }

      if (req.user.role !== 'admin') {
        if (!old_password) {
           return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ' });
        }
        const user = await AccountModel.findById(id); // Dùng hàm findById bạn đã tạo
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(new_password, salt);
      await AccountModel.updatePassword(id, newPasswordHash);
      await AccountModel.updateRefreshToken(id, null);

      return res.status(200).json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });

    } catch (error) {
      next(error);
    }
  },

  softDelete: async (req, res) => {
    try {
      const { id } = req.params;
      await AccountModel.softDelete(id);
      await AccountModel.updateRefreshToken(id, null);

      return res.status(200).json({ message: 'Đã vô hiệu hóa tài khoản (Soft Delete)' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server' });
    }
  },

  restore: async (req, res) => {
    try {
      const { id } = req.params;
      await AccountModel.restore(id);
      return res.status(200).json({ message: 'Đã khôi phục tài khoản thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

export default AccountController;