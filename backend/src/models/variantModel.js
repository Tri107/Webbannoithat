import mongoose from "mongoose";

const VariantItemSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  specs: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    weight: Number,
    material: String,
    color: String
  },
  status: { 
    type: String, 
    default: "available", 
    enum: ["available", "reserved", "out_of_stock", "hidden"] 
  }
});

const ProductVariantSchema = new mongoose.Schema({
  model3d: { type: String, default: null }, 
  images: [String], 
  
  variants: [VariantItemSchema] 
}, { timestamps: true });

export default mongoose.model("ProductVariant", ProductVariantSchema);

