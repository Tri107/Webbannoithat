ALTER TABLE order_items 
DROP FOREIGN KEY order_items_ibfk_2;

ALTER TABLE order_items 
DROP COLUMN discount_id;

ALTER TABLE orders
ADD COLUMN discount_id INT,
ADD CONSTRAINT fk_orders_discount
FOREIGN KEY (discount_id) REFERENCES discounts(discount_id);