import db from "../config/mysql.js";
import Variant from "./variantModel.js";

const OrderModel = {
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT o.*, a.email 
       FROM orders o 
       JOIN accounts a ON o.account_id = a.account_id 
       ORDER BY o.order_date DESC`
    );
    return rows;
  },

  getById: async (orderId) => {
    const [orderRows] = await db.query(
      `SELECT o.*, a.email, a.is_admin, up.username, up.phone_number, up.user_address 
       FROM orders o 
       JOIN accounts a ON o.account_id = a.account_id 
       JOIN user_profiles up ON o.account_id = up.account_id
       WHERE o.order_id = ?`,
      [orderId]
    );
    if (!orderRows.length) return null;

    const [itemRows] = await db.query(
      `SELECT oi.quantity, oi.product_id, p.product_name, p.variant_ref, oi.variant_snapshot, oi.order_id
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.product_id 
       WHERE oi.order_id = ?`,
      [orderId]
    );

    const items = await Promise.all(itemRows.map(async (item) => {
      if (item.variant_ref) {
        const variantDoc = await Variant.findById(item.variant_ref).lean();
        if (variantDoc && variantDoc.images && variantDoc.images.length > 0) {
          item.image = variantDoc.images[0];
        }
      }
      return item;
    }));

    return { ...orderRows[0], items };
  },

  getByAccountId: async (accountId) => {
    const [rows] = await db.query(
      `SELECT o.order_id, o.total_price, o.order_status, o.order_date, a.email 
       FROM orders o 
       JOIN accounts a ON o.account_id = a.account_id 
       WHERE o.account_id = ?
       ORDER BY o.order_date DESC`,
      [accountId]
    );
    return rows;
  },

  create: async (orderData) => {
    const { account_id, total_price, items, address, note, discount_id } = orderData;
    const connection = await db.getConnection();
  
    try {
      await connection.beginTransaction();
    
      const [orderResult] = await connection.query(
        `INSERT INTO orders (total_price, account_id, address, note, discount_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          total_price,
          account_id,
          address || null,
          note || null,
          discount_id || null
        ]
      );
    
      const orderId = orderResult.insertId;
    
      for (let item of items) {

        /*
        const variantDoc = await Variant.findOne({ "variants.sku": item.sku }).lean();
        if (!variantDoc) throw new Error(`Variant not found: ${item.sku}`);
      
        const specificVariant = variantDoc.variants.find(v => v.sku === item.sku);
        if (!specificVariant) throw new Error(`SKU not found: ${item.sku}`);
        */

        // Bước 1: Lấy variant_ref từ MySQL theo product_id để xác định đúng document MongoDB
        const [pRows] = await connection.query(
          "SELECT variant_ref FROM products WHERE product_id = ?",
          [item.product_id]
        );
        
        if (pRows.length === 0 || !pRows[0].variant_ref) {
          throw new Error(`Không tìm thấy variant_ref cho sản phẩm ID: ${item.product_id}`);
        }
        
        const variantRef = pRows[0].variant_ref;

        // Bước 2: Tìm variant trong MongoDB cực kỳ chính xác bằng variant_ref + sku
        const variantDoc = await Variant.findById(variantRef).lean();
        if (!variantDoc) throw new Error(`Document Variant không tồn tại: ${variantRef}`);

        const specificVariant = variantDoc.variants.find(v => v.sku === item.sku);
        if (!specificVariant) {
          throw new Error(`Không tìm thấy SKU ${item.sku} trong sản phẩm ${item.product_id}`);
        }

        // Kiểm tra tồn kho trước khi thực hiện mua hàng
        if (specificVariant.stock < item.quantity) {
          throw new Error(`Sản phẩm (SKU: ${item.sku}) không đủ tồn kho. Hiện có: ${specificVariant.stock}, yêu cầu: ${item.quantity}`);
        }

        // Cập nhật tồn kho trong MongoDB một cách nguyên tử (Atomic Update)
        const updateResult = await Variant.updateOne(
          { 
            _id: variantRef, 
            "variants.sku": item.sku,
            "variants.stock": { $gte: item.quantity } // Đảm bảo stock vẫn đủ tại thời điểm update
          },
          { $inc: { "variants.$.stock": -item.quantity } }
        );

        if (updateResult.modifiedCount === 0) {
          throw new Error(`Cập nhật tồn kho thất bại cho SKU: ${item.sku}. Có thể do thay đổi tồn kho đột xuất.`);
        }

        const { _id, ...variantData } = specificVariant;
        const variant_snapshot = JSON.stringify(variantData);
      
        await connection.query(
          `INSERT INTO order_items (quantity, product_id, variant_snapshot, order_id) 
           VALUES (?, ?, ?, ?)`,
          [
            item.quantity,
            item.product_id,
            variant_snapshot,
            orderId
          ]
        );
      }
    
      await connection.commit();
      return orderId;
    
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  updateStatus: async (orderId, newStatus) => {
    const [result] = await db.query(
      `UPDATE orders SET order_status = ? WHERE order_id = ?`,
      [newStatus, orderId]
    );
    return result.affectedRows > 0;
  }
};

export default OrderModel;