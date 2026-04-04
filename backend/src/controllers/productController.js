import ProductModel from "../models/productModel.js";
import { uploadToR2, uploadMultipleToR2, deleteFromR2, deleteMultipleFromR2 } from "../utils/r2Upload.js";
import { R2_PUBLIC_URL } from "../config/r2storage.js";

const ProductController = {
  getAll: async (req, res) => {
    try {
      const products = await ProductModel.getAll();
      return res.status(200).json({
        message: "Lấy danh sách sản phẩm thành công",
        data: products,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await ProductModel.getById(id);

      if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      }
      return res.status(200).json({
        message: "Lấy thông tin sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi lấy thông tin sản phẩm" });
    }
  },

  create: async (req, res, next) => {
    try {
      const {
        product_name,
        product_description,
        category_id,
        brand_id,
        collection_id,
        variant_ref,
      } = req.body;

      if (!product_name || !category_id || !brand_id || !collection_id || !variant_ref) {
        return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
      }

      const productId = await ProductModel.create({
        product_name,
        product_description,
        category_id,
        brand_id,
        collection_id,
        variant_ref,
      });

      return res.status(201).json({
        message: "Tạo sản phẩm thành công",
        data: { product_id: productId },
      });
    } catch (error) {
      next(error);
    }
  },

  createVariant: async (req, res, next) => {
    try {
      // Body can be the full variantData object (with nested variants array)
      // or a simpler object for manual entry. 
      // The ProductModel will simply pass it to Mongoose.
      const variantId = await ProductModel.createVariant(req.body);

      return res.status(201).json({
        message: "Tạo variant thành công",
        data: { variant_id: variantId },
      });
    } catch (error) {
      next(error);
    }
  },

  uploadImages: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Không có file nào được gửi" });
      }

      const results = await uploadMultipleToR2(req.files, "images");
      const urls = results.map((r) => r.url);

      return res.status(200).json({
        message: "Upload ảnh thành công",
        data: { urls },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi upload ảnh" });
    }
  },

  upload3dModel: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file nào được gửi" });
      }

      const result = await uploadToR2(req.file, "3d-models");
      const url = result.url;

      return res.status(200).json({
        message: "Upload 3d model thành công",
        data: { url },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi upload 3d model" });
    }
  },

  getFeaturedProducts: async (req, res) => {
    try {
      const { limit = 8, sort = "newest" } = req.query;

      const products = await ProductModel.getFeaturedProducts(limit, sort);

      return res.status(200).json({
        message: "Lấy sản phẩm nổi bật thành công",
        data: products,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Lỗi server khi lấy sản phẩm nổi bật",
      });
    }
  },

  getHomeCollections: async (req, res) => {
    try {
      const { limit = 4 } = req.query;
      const collections = await ProductModel.getHomeCollections(limit);

      return res.status(200).json({
        message: "Lấy collection homepage thành công",
        data: collections,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Lỗi server khi lấy collection homepage",
      });
    }
  },

  // === UPDATE HANDLERS ===

  // Cập nhật thông tin cơ bản sản phẩm (MySQL)
  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        product_name,
        product_description,
        product_status,
        is_disabled,
        category_id,
        brand_id,
        collection_id,
        variant_ref,
      } = req.body;

      await ProductModel.update(id, {
        product_name,
        product_description,
        product_status,
        is_disabled,
        category_id,
        brand_id,
        collection_id,
        variant_ref,
      });

      return res.status(200).json({
        message: "Cập nhật sản phẩm thành công",
      });
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật variant data (MongoDB)
  updateVariant: async (req, res, next) => {
    try {
      const { variantRef } = req.params;
      const { variants } = req.body;

      if (!variants || !Array.isArray(variants)) {
        return res.status(400).json({ message: "Dữ liệu variants không hợp lệ" });
      }

      const updated = await ProductModel.updateVariant(variantRef, { variants });

      return res.status(200).json({
        message: "Cập nhật variant thành công",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật images (R2 + MongoDB): xoá ảnh cũ trên R2, upload mới, update MongoDB
  updateImages: async (req, res) => {
    try {
      const { variantRef } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Không có file ảnh nào được gửi" });
      }

      // Lấy ảnh cũ từ MongoDB
      const currentVariant = await ProductModel.getVariantByRef(variantRef);
      if (!currentVariant) {
        return res.status(404).json({ message: "Không tìm thấy variant" });
      }

      // Xoá ảnh cũ trên R2 (trích xuất key từ URL)
      if (currentVariant.images && currentVariant.images.length > 0) {
        const oldKeys = currentVariant.images
          .map((url) => extractR2Key(url))
          .filter(Boolean);
        if (oldKeys.length > 0) {
          await deleteMultipleFromR2(oldKeys);
        }
      }

      // Upload ảnh mới
      const results = await uploadMultipleToR2(req.files, "images");
      const newUrls = results.map((r) => r.url);

      // Cập nhật URLs mới vào MongoDB
      const updated = await ProductModel.updateVariantImages(variantRef, newUrls);

      return res.status(200).json({
        message: "Cập nhật ảnh thành công",
        data: { urls: newUrls },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi cập nhật ảnh" });
    }
  },

  // Cập nhật model 3D (R2 + MongoDB): xoá model cũ, upload mới, update MongoDB
  updateModel: async (req, res) => {
    try {
      const { variantRef } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "Không có file model nào được gửi" });
      }

      // Lấy model cũ từ MongoDB
      const currentVariant = await ProductModel.getVariantByRef(variantRef);
      if (!currentVariant) {
        return res.status(404).json({ message: "Không tìm thấy variant" });
      }

      // Xoá model cũ trên R2
      if (currentVariant.model3d) {
        const oldKey = extractR2Key(currentVariant.model3d);
        if (oldKey) {
          await deleteFromR2(oldKey);
        }
      }

      // Upload model mới
      const result = await uploadToR2(req.file, "models");
      const newUrl = result.url;

      // Cập nhật URL mới vào MongoDB
      await ProductModel.updateVariantModel(variantRef, newUrl);

      return res.status(200).json({
        message: "Cập nhật model 3D thành công",
        data: { url: newUrl },
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server khi cập nhật model 3D" });
    }
  },
};

// Helper: trích xuất R2 key từ full URL
// VD: https://pub-xxx.r2.dev/images/1234-file.jpg → images/1234-file.jpg
const extractR2Key = (url) => {
  if (!url || !R2_PUBLIC_URL) return null;
  try {
    const prefix = R2_PUBLIC_URL.endsWith("/") ? R2_PUBLIC_URL : R2_PUBLIC_URL + "/";
    if (url.startsWith(prefix)) {
      return url.slice(prefix.length);
    }
    // Fallback: lấy phần sau domain
    const urlObj = new URL(url);
    return urlObj.pathname.startsWith("/") ? urlObj.pathname.slice(1) : urlObj.pathname;
  } catch {
    return null;
  }
};

export default ProductController;