-- Thêm cột price
-- ALTER TABLE cart_items ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- -- Thêm cột material
-- ALTER TABLE cart_items ADD COLUMN material VARCHAR(255);

-- -- Thêm cột color
-- ALTER TABLE cart_items ADD COLUMN color VARCHAR(255);

-- Thêm cột sku và đổi UNIQUE KEY
ALTER TABLE cart_items ADD COLUMN sku VARCHAR(100) NOT NULL AFTER product_id;
ALTER TABLE cart_items DROP INDEX unique_cart_item;
ALTER TABLE cart_items ADD UNIQUE KEY unique_cart_item (account_id, product_id, sku);