import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "../config/r2storage.js";

const UPLOAD_FOLDER = {
  MODEL: "models",
  IMAGE: "images",
}

/**
 * Upload a file to R2 bucket
 * @param {Object} file - Multer file object (req.file or item from req.files)
 * @param {string} folder - Folder name inside the bucket (e.g. "products", "avatars")
 * @returns {Object} { key, url }
 */
export const uploadToR2 = async (file, folder = UPLOAD_FOLDER.MODEL) => {
  if (!file) throw new Error("File is required");
  if (!folder) throw new Error("Folder is required");

  const timestamp = Date.now();
  const safeName = file.originalname.replace(/\s+/g, "-");
  const key = `${folder}/${timestamp}-${safeName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2.send(command);

  const url = `${R2_PUBLIC_URL}/${key}`;

  return { key, url };
};

/**
 * Upload multiple files to R2 bucket
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - Folder name inside the bucket
 * @returns {Array} Array of { key, url }
 */
export const uploadMultipleToR2 = async (files, folder = UPLOAD_FOLDER.IMAGE) => {
  if (!files || !files.length) return [];

  const results = await Promise.all(
    files.map((file) => uploadToR2(file, folder))
  );
  return results;
};

/**
 * Delete a file from R2 bucket by key
 * @param {string} key - The object key to delete
 */
export const deleteFromR2 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2.send(command);
};

/**
 * Delete multiple files from R2 bucket
 * @param {Array<string>} keys - Array of object keys to delete
 */
export const deleteMultipleFromR2 = async (keys) => {
  await Promise.all(keys.map((key) => deleteFromR2(key)));
};
