import reviewModel from "../models/reviewModel.js";

const getAccountIdFromReq = (req) => {
  return (
    req.user?.account_id ||
    req.user?.id ||
    req.account?.account_id ||
    req.account?.id
  );
};

const reviewController = {
  getReviews: async (req, res) => {
    try {
      const { productId } = req.query;

      const rows = productId
        ? await reviewModel.getByProductId(productId)
        : await reviewModel.getAll();

      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getReviewPermission: async (req, res) => {
    try {
      const accountId = getAccountIdFromReq(req);
      const { productId } = req.params;

      if (!accountId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await reviewModel.canReviewProduct(productId, accountId);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  createReview: async (req, res, next) => {
  try {
    const accountId = getAccountIdFromReq(req);
    const { rating, reviewComment, productId } = req.body;

    if (!accountId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!rating || !productId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be from 1 to 5" });
    }

    const canReviewResult = await reviewModel.canReviewProduct(productId, accountId);

    if (!canReviewResult.purchased) {
      return res.status(403).json({
        message: "Bạn chưa mua sản phẩm này",
      });
    }

    if (canReviewResult.alreadyReviewed) {
      return res.status(409).json({
        message: "Bạn đã đánh giá sản phẩm này rồi",
      });
    }

    const reviewId = await reviewModel.create({
      rating,
      reviewComment,
      productId,
      accountId,
    });

    return res.status(201).json({ success: true, reviewId });
  } catch (error) {
    next(error);
  }

  },

  updateReview: async (req, res, next) => {
    try {
      const { reviewId } = req.params;
      const { rating, reviewComment } = req.body;

      if (!rating || !reviewComment) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const affectedRows = await reviewModel.update(reviewId, {
        rating,
        reviewComment,
      });

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      return res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  deleteReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const affectedRows = await reviewModel.delete(reviewId);

      if (affectedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

export default reviewController;