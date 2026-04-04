import db from "../config/mysql.js";

const tableName = "reviews";

const ReviewModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        r.review_id,
        r.rating,
        r.review_comment,
        r.review_date,
        r.product_id,
        r.account_id,
        r.order_id,
        up.username
      FROM ${tableName} r
      LEFT JOIN user_profiles up ON r.account_id = up.account_id
      ORDER BY r.review_date DESC
    `);
    return rows;
  },

  getByProductId: async (productId) => {
    const [rows] = await db.query(
      `
      SELECT 
        r.review_id,
        r.rating,
        r.review_comment,
        r.review_date,
        r.product_id,
        r.account_id,
        r.order_id,
        up.username
      FROM ${tableName} r
      LEFT JOIN user_profiles up ON r.account_id = up.account_id
      WHERE r.product_id = ?
      ORDER BY r.review_date DESC
      `,
      [productId]
    );
    return rows;
  },

  create: async (review) => {
    const { rating, reviewComment, productId, accountId, orderId } = review;

    const [result] = await db.query(
      `
      INSERT INTO ${tableName} (rating, review_comment, product_id, account_id, order_id)
      VALUES (?, ?, ?, ?, ?)
      `,
      [rating, reviewComment || null, productId, accountId, orderId || null]
    );

    return result.insertId;
  },

  update: async (reviewId, review) => {
    const { rating, reviewComment } = review;

    const [result] = await db.query(
      `
      UPDATE ${tableName}
      SET rating = ?, review_comment = ?
      WHERE review_id = ?
      `,
      [rating, reviewComment, reviewId]
    );

    return result.affectedRows;
  },

  delete: async (reviewId) => {
    const [result] = await db.query(
      `
      DELETE FROM ${tableName}
      WHERE review_id = ?
      `,
      [reviewId]
    );

    return result.affectedRows;
  },

  findExistingReviewByOrder: async (orderId, productId) => {
    const [rows] = await db.query(
      `
      SELECT review_id, rating, review_comment, review_date, product_id, account_id, order_id
      FROM ${tableName}
      WHERE order_id = ? AND product_id = ?
      LIMIT 1
      `,
      [orderId, productId]
    );

    return rows[0] || null;
  },

  getReviewableOrdersByProduct: async (productId, accountId) => {
    const [rows] = await db.query(
      `
      SELECT DISTINCT 
        o.order_id,
        o.order_date,
        o.order_status
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.account_id = ?
        AND oi.product_id = ?
        AND o.order_status IN ('SHIPPED', 'DELIVERED')
      ORDER BY o.order_date DESC, o.order_id DESC
      `,
      [accountId, productId]
    );

    return rows;
  },

  canReviewProduct: async (productId, accountId) => {
    const reviewableOrders = await ReviewModel.getReviewableOrdersByProduct(
      productId,
      accountId
    );

    if (!reviewableOrders.length) {
      return {
        canReview: false,
        purchased: false,
        alreadyReviewed: false,
        reviewableOrders: [],
      };
    }

    const availableOrders = [];

    for (const order of reviewableOrders) {
      const existingReview = await ReviewModel.findExistingReviewByOrder(
        order.order_id,
        productId
      );

      if (!existingReview) {
        availableOrders.push(order);
      }
    }

    return {
      canReview: availableOrders.length > 0,
      purchased: true,
      alreadyReviewed: availableOrders.length === 0,
      reviewableOrders: availableOrders,
    };
  },
};

export default ReviewModel;