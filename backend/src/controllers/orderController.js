import OrderModel from '../models/orderModel.js';
import ProductModel from '../models/productModel.js';
import { sendOrderConfirmationEmail } from '../utils/sendEmail.js'; 

const OrderController = {
  getAllOrders: async (req, res) => {
    try {
      const orders = await OrderModel.getAll();
      return res.status(200).json({ message: "Success", data: orders });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  },
  
  getOrderById: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await OrderModel.getById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      return res.status(200).json({ message: "Success", data: order });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  },

  getOrdersByAccountId: async (req, res) => {
    try {
      const { id } = req.params; 
      const orders = await OrderModel.getByAccountId(id);
      if (!orders) return res.status(404).json({ message: "Orders not found" });
      return res.status(200).json({ message: "Success", data: orders });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  },



  createOrder: async (req, res, next) => {
    try {
      const { account_id, total_price, items, address, note, discount_id, extra_info } = req.body;
      if (!account_id || total_price === undefined || !items || !items.length) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const orderId = await OrderModel.create({ account_id, total_price, items, address, note, discount_id });
      
      try {
        const fullOrder = await OrderModel.getById(orderId);
        if (fullOrder && fullOrder.email) {
          fullOrder.extra_info = extra_info;
          sendOrderConfirmationEmail(fullOrder.email, fullOrder);
        }
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
      }

      return res.status(201).json({ message: "Order created successfully", orderId });
    } catch (error) {
      next(error);
    }
  },

  updateOrderStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const validStatuses = ['PENDING', 'DELIVERING', 'DELIVERED', 'CANCELLED'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await OrderModel.updateStatus(id, status);
      if (!updated) return res.status(404).json({ message: "Order not found or not updated" });
      
      return res.status(200).json({ message: "Order status updated successfully" });
    } catch (error) {
      next(error);
    }
  }
};



export default OrderController;
