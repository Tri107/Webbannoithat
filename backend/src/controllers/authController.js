
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import AccountModel from '../models/accountModel.js'; 
import ProfileModel from '../models/profileModel.js';
import { sendOTP } from '../utils/sendEmail.js';
import { OAuth2Client } from 'google-auth-library';

// Kho lưu trữ tạm thời
const tempRegisterStore = new Map();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateTokens = (user) => {
  const payload = {
    id: user.account_id,
    email: user.email,
    role: user.is_admin ? 'admin' : 'user'
  };

  const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};
const AuthController = {

  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập đủ email và mật khẩu' });
      }

      const existingUser = await AccountModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email này đã được sử dụng' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu vào bộ nhớ tạm 
      tempRegisterStore.set(email, {
        passwordHash: passwordHash,
        otp: otp,
        expireAt: Date.now() + 5 * 60 * 1000 
      });

      // Gửi mail
      const isSent = await sendOTP(email, otp);

      if (!isSent) {
        tempRegisterStore.delete(email); 
        return res.status(500).json({ message: 'Lỗi khi gửi email OTP. Vui lòng thử lại.' });
      }

      return res.status(200).json({ 
        message: 'Mã OTP đã được gửi đến email. Vui lòng kiểm tra để xác nhận.',
        email: email
      });

    } catch (error) {
      next(error);
    }
  },

  verifyRegister: async (req, res, next) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: 'Thiếu thông tin xác thực' });
      }

      const tempData = tempRegisterStore.get(email);

      if (!tempData) {
        return res.status(400).json({ message: 'Yêu cầu đăng ký không tồn tại hoặc đã hết hạn' });
      }
      if (tempData.otp !== otp) {
        return res.status(400).json({ message: 'Mã OTP không chính xác' });
      }

      if (Date.now() > tempData.expireAt) {
        tempRegisterStore.delete(email);
        return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
      }

      const newAccountId = await AccountModel.createAccount(email, tempData.passwordHash, false);
      await ProfileModel.createDefaultProfile(newAccountId);

      tempRegisterStore.delete(email);
      return res.status(201).json({ 
        message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.',
        account_id: newAccountId
      });

    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
      }

      const user = await AccountModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác' });
      }

      // Tạo 2 loại Token
      const { accessToken, refreshToken } = generateTokens(user);

      // Lưu Refresh Token vào db
      await AccountModel.updateRefreshToken(user.account_id, refreshToken);

      //  Set Cookie chứa Refresh Token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
      });

      // Chỉ trả về Access Token trong body
      return res.status(200).json({
        message: 'Đăng nhập thành công',
        accessToken, 
        user: {
          id: user.account_id,
          email: user.email,
          role: user.is_admin ? 'admin' : 'user'
        }
      });

    } catch (error) {
      next(error);
    }
  },

  googleLogin: async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: 'Thiếu Google Token' });

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { email, email_verified } = payload;

      if (!email_verified) return res.status(400).json({ message: 'Email Google chưa được xác thực' });

      let user = await AccountModel.findByEmail(email);

      if (!user) {
        const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomPassword, salt);

        const newAccountId = await AccountModel.createAccount(email, passwordHash, false);
        await ProfileModel.createDefaultProfile(newAccountId);

        user = {
          account_id: newAccountId,
          email: email,
          is_admin: 0
        };
      }

      // Áp dụng chung logic Token kép cho Google Login
      const { accessToken, refreshToken } = generateTokens(user);
      await AccountModel.updateRefreshToken(user.account_id, refreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        message: 'Đăng nhập Google thành công',
        accessToken,
        user: {
          id: user.account_id,
          email: user.email,
          role: user.is_admin ? 'admin' : 'user'
        }
      });

    } catch (error) {
      next(error);
    }
  },
  refreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });

      // Xác thực token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Kiểm tra xem token có trong DB không
      const user = await AccountModel.findByRefreshToken(refreshToken);
      if (!user || user.account_id !== decoded.id) {
        return res.status(403).json({ message: 'Refresh Token không hợp lệ' });
      }
      // Ở đây tạm thời chỉ cấp Access Token mới cho đơn giản
      const payload = {
        id: user.account_id,
        email: user.email,
        role: user.is_admin ? 'admin' : 'user'
      };
      const newAccessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

      return res.status(200).json({ accessToken: newAccessToken });

    } catch (error) {
      console.error('Refresh Token Error:', error);
      return res.status(403).json({ message: 'Refresh Token đã hết hạn, vui lòng đăng nhập lại' });
    }
  },
  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        // Xóa token trong DB
        const user = await AccountModel.findByRefreshToken(refreshToken);
        if (user) {
          await AccountModel.updateRefreshToken(user.account_id, null);
        }
      }
      // Xóa Cookie
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Đăng xuất thành công' });
    } catch (error) {
      return res.status(500).json({ message: 'Lỗi server khi đăng xuất' });
    }
  }
};

export default AuthController;