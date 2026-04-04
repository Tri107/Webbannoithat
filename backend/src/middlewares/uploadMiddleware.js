import multer from "multer";

// Store files in memory buffer (needed for R2 upload)
const storage = multer.memoryStorage();

// File filter: only allow 
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowed3dModelTypes = ["model/gltf-binary", "application/octet-stream"];

  if (allowedImageTypes.includes(file.mimetype) || allowed3dModelTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh hoặc file 3D (.glb)"), false);
  }
};

export const baseUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB
});

// 1. Nhánh upload nhiều ảnh (Product Images) - Tối đa 10 ảnh, field name là 'images'
export const uploadMultiple = baseUpload.array("images", 10);

// 2. Nhánh upload 1 file model 3D (GLB) - field name là 'model3d'
export const upload3dModel = baseUpload.single("model3d");
