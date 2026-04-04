import db from "../config/mysql.js";
import mongoose from "mongoose";
import Variant from "../models/variantModel.js";

const isValidObjectId = (str) => /^[a-fA-F0-9]{24}$/.test(str);

const ProductModel = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        p.*,
        c.category_name,
        b.brand_name,
        cl.collection_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN collections cl ON p.collection_id = cl.collection_id
      WHERE p.is_disabled = 0
      ORDER BY p.created_at DESC
    `);

    const variantIds = rows
      .filter((r) => r.variant_ref && isValidObjectId(r.variant_ref))
      .map((r) => new mongoose.Types.ObjectId(r.variant_ref));

    const variants = await Variant.find({
      _id: { $in: variantIds },
    }).lean();

    const variantMap = {};

    variants.forEach((v) => {
      variantMap[v._id.toString()] = v;
    });

    rows.forEach((row) => {
      row.variants = variantMap[row.variant_ref] || null;
    });

    return rows;
  },

  getById: async (productId) => {
    const [rows] = await db.query(
      `
      SELECT 
        p.*,
        c.category_name,
        b.brand_name,
        cl.collection_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN collections cl ON p.collection_id = cl.collection_id
      WHERE p.product_id = ? AND p.is_disabled = 0
      `,
      [productId]
    );

    const product = rows[0];

    if (!product) {
      return null;
    }

    if (product.variant_ref && isValidObjectId(product.variant_ref)) {
      const objectId = new mongoose.Types.ObjectId(product.variant_ref);
      const variant = await Variant.findById(objectId).lean();

      product.variants = variant || null;
    } else {
      product.variants = null;
    }

    return product;
  },

  create: async (productData) => {
    const {
      product_name,
      product_description,
      category_id,
      brand_id,
      collection_id,
      variant_ref,
    } = productData;

    await db.query(`CALL add_new_product(?, ?, ?, ?, ?, ?)`, [
      product_name,
      product_description || null,
      category_id,
      brand_id,
      collection_id,
      variant_ref,
    ]);

    // Lấy ID sản phẩm vừa thêm
    const [[{ id }]] = await db.query(`SELECT LAST_INSERT_ID() AS id`);
    return id;
  },

  createVariant: async (variantData) => {
    // variantData should now match ProductVariantSchema (with nested variants array)
    const variant = new Variant(variantData);
    const saved = await variant.save();
    return saved._id.toString();
  },

  // === UPDATE METHODS ===

  update: async (productId, productData) => {
    const {
      product_name,
      product_description,
      product_status,
      is_disabled,
      category_id,
      brand_id,
      collection_id,
      variant_ref,
    } = productData;

    await db.query(`CALL update_product(?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      productId,
      product_name || null,
      product_description || null,
      product_status || null,
      is_disabled != null ? is_disabled : null,
      category_id || null,
      brand_id || null,
      collection_id || null,
      variant_ref || null,
    ]);
  },

  updateVariant: async (variantRef, variantData) => {
    if (!isValidObjectId(variantRef)) {
      throw new Error("Invalid variant_ref");
    }

    const objectId = new mongoose.Types.ObjectId(variantRef);
    const updated = await Variant.findByIdAndUpdate(
      objectId,
      { $set: { variants: variantData.variants } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error("Variant document not found");
    }

    return updated;
  },

  updateVariantImages: async (variantRef, imageUrls) => {
    if (!isValidObjectId(variantRef)) {
      throw new Error("Invalid variant_ref");
    }

    const objectId = new mongoose.Types.ObjectId(variantRef);
    const updated = await Variant.findByIdAndUpdate(
      objectId,
      { $set: { images: imageUrls } },
      { new: true }
    );

    if (!updated) {
      throw new Error("Variant document not found");
    }

    return updated;
  },

  updateVariantModel: async (variantRef, modelUrl) => {
    if (!isValidObjectId(variantRef)) {
      throw new Error("Invalid variant_ref");
    }

    const objectId = new mongoose.Types.ObjectId(variantRef);
    const updated = await Variant.findByIdAndUpdate(
      objectId,
      { $set: { model3d: modelUrl } },
      { new: true }
    );

    if (!updated) {
      throw new Error("Variant document not found");
    }

    return updated;
  },

  getVariantByRef: async (variantRef) => {
    if (!isValidObjectId(variantRef)) {
      throw new Error("Invalid variant_ref");
    }

    const objectId = new mongoose.Types.ObjectId(variantRef);
    const variant = await Variant.findById(objectId).lean();
    return variant;
  },

  decrementStock: async (items) => {
    try {
      const promises = items.map(async (item) => {
        const productId = item.product_id || item.id;
        const sku = item.sku;
        const qty = Number(item.quantity || item.qty);

        if (!productId || !sku || isNaN(qty)) return;

        const [rows] = await db.query(
          "SELECT variant_ref, product_name FROM products WHERE product_id = ?",
          [productId]
        );

        if (rows.length === 0 || !rows[0].variant_ref) return;

        const variantRef = rows[0].variant_ref;

        const updatedDoc = await Variant.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(variantRef),
            "variants.sku": sku
          },
          { $inc: { "variants.$.stock": -qty } },
          { new: true }
        ).lean();

        if (updatedDoc) {
          updatedDoc.variants.find(v => v.sku === sku);
        } else {
          const realDoc = await Variant.findById(variantRef).lean();
          if (realDoc) {
            realDoc.variants.map(v => v.sku);
          }
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("[Stock Critical Error]:", error);
    }
  },

};

export default ProductModel;