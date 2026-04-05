// src/services/email.service.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Cấu hình transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng (App Password)
  }
});

export const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Furniture Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Xác thực đăng ký tài khoản',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Xin chào!</h2>
          <p>Bạn đang đăng ký tài khoản tại Furniture Shop.</p>
          <p>Mã xác thực (OTP) của bạn là:</p>
          <h1 style="color: #e63946; letter-spacing: 5px;">${otp}</h1>
          <p>Mã này sẽ hết hạn trong <b>5 phút</b>.</p>
          <p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Lỗi gửi mail:', error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (email, orderData) => {
  try {
    const extra = orderData.extra_info || {};
    const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    
    const formattedPrice = formatVND(orderData.total_price);
    
    // Xử lý danh sách sản phẩm
    let itemsHtml = '';
    if (orderData.items && orderData.items.length > 0) {
      itemsHtml = orderData.items.map(item => {
        let snap = {};
        if (item.variant_snapshot) {
            snap = typeof item.variant_snapshot === 'string' 
              ? JSON.parse(item.variant_snapshot) 
              : item.variant_snapshot;
        }
        
        const price = formatVND(snap.price || 0);
        const total = formatVND((snap.price || 0) * item.quantity);
        
        // Đảm bảo URL ảnh đầy đủ
        let imageUrl = item.image || 'https://via.placeholder.com/60?text=No+Image';
        if (imageUrl && !imageUrl.startsWith('http')) {
          const baseUrl = process.env.SERVER_URL || 'http://localhost:9999';
          imageUrl = `${baseUrl}/${imageUrl.replace(/\\/g, '/')}`;
        }
        
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
              <img src="${imageUrl}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;" />
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              <strong style="color: #333; font-size: 14px;">${item.product_name}</strong><br>
              <span style="color: #666; font-size: 12px;">SKU: ${snap.sku || 'N/A'}</span><br>
              <span style="color: #666; font-size: 12px;">Đơn giá: ${price}</span>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; color: #333;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333; font-weight: bold; font-size: 15px;">${total}</td>
          </tr>
        `;
      }).join('');
    }

    let orderClientName = orderData.username || orderData.email;
    let orderPhone = orderData.phone_number || "Chưa cập nhật";
    let orderNoteContent = orderData.note || "Không";

    if (orderData.note && orderData.note.startsWith("Người nhận:")) {
        const noteMatch = orderData.note.match(/Người nhận:\s*(.*?)\s*-\s*SĐT:\s*(.*?)\.\s*Ghi chú:\s*(.*)/);
        if (noteMatch) {
            orderClientName = noteMatch[1];
            orderPhone = noteMatch[2];
            orderNoteContent = noteMatch[3] || "Không";
        }
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px 15px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border-top: 5px solid #1a73e8;">
          <h2 style="color: #1a73e8; text-align: center; margin-bottom: 10px; font-size: 24px;">Xác nhận đơn hàng!</h2>
          <p style="text-align: center; color: #555; margin-top: 0; font-size: 15px;">Cảm ơn bạn đã tin tưởng và đặt hàng tại Furniture Shop.</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 15px;">Thông tin giao hàng</h3>
            <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Khách hàng:</strong> ${orderClientName}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Điện thoại:</strong> ${orderPhone}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Địa chỉ:</strong> ${orderData.address || orderData.user_address || "Chưa cập nhật"}</p>
            <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Ghi chú:</strong> ${orderNoteContent}</p>
          </div>

          <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 15px;">Chi tiết đơn hàng</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: center; color: #475569; font-size: 13px;">Hình ảnh</th>
                <th style="padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: left; color: #475569; font-size: 13px;">Sản phẩm</th>
                <th style="padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: center; color: #475569; font-size: 13px;">SL</th>
                <th style="padding: 12px 10px; border-bottom: 2px solid #cbd5e1; text-align: right; color: #475569; font-size: 13px;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot style="color: #475569; font-size: 14px;">
              ${extra.subtotal ? `
              <tr>
                <td colspan="3" style="padding: 8px 10px; text-align: right; border-top: 2px solid #e2e8f0;">Tạm tính:</td>
                <td style="padding: 8px 10px; text-align: right; border-top: 2px solid #e2e8f0;">${formatVND(extra.subtotal)}</td>
              </tr>` : ''}
             
              ${extra.vat && extra.vat > 0 ? `
              <tr>
                <td colspan="3" style="padding: 4px 10px; text-align: right;">Thuế VAT (10%):</td>
                <td style="padding: 4px 10px; text-align: right;">${formatVND(extra.vat)}</td>
              </tr>` : ''}
              ${extra.assemblyFee && extra.assemblyFee > 0 ? `
              <tr>
                <td colspan="3" style="padding: 4px 10px; text-align: right;">Phí lắp đặt:</td>
                <td style="padding: 4px 10px; text-align: right;">${formatVND(extra.assemblyFee)}</td>
              </tr>` : ''}
               ${extra.discount && extra.discount > 0 ? `
              <tr>
                <td colspan="3" style="padding: 4px 10px; text-align: right;">Giảm giá ${extra.discountPercentage ? `(${extra.discountPercentage}%)` : ''}:</td>
                <td style="padding: 4px 10px; text-align: right;">-${formatVND(extra.discount)}</td>
              </tr>` : ''}
              <tr>
                <td colspan="3" style="padding: 4px 10px; text-align: right;">Phí giao hàng:</td>
                <td style="padding: 4px 10px; text-align: right;">${extra.shippingFee && extra.shippingFee > 0 ? formatVND(extra.shippingFee) : '<span style="color: #475569; font-weight: bold;">Miễn phí</span>'}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; color: #e63946; font-size: 16px;">Tổng Thanh Toán:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #e63946; font-size: 18px;">${formattedPrice}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 30px;">
             <a href="http://localhost:5173" style="background-color: #1a73e8; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Quản Lý Đơn Hàng Của Bạn</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0 20px;">
          <p style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 5px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 0;">&copy; 2026 Furniture Shop. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Furniture Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Xác nhận đơn hàng thành công`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Lỗi gửi mail xác nhận đơn hàng:', error);
    return false;
  }
};