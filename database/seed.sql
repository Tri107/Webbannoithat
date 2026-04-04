
USE furniture;

-- Clear old data (Optional / Caution)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE cart_items;
-- TRUNCATE TABLE favorites;
-- TRUNCATE TABLE reviews;
-- TRUNCATE TABLE payments;
-- TRUNCATE TABLE order_items;
-- TRUNCATE TABLE orders;
-- TRUNCATE TABLE discounts;
-- TRUNCATE TABLE user_profiles;
-- TRUNCATE TABLE accounts;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE collections;
-- TRUNCATE TABLE brands;
-- TRUNCATE TABLE categories;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Categories (5)
INSERT INTO
    categories (category_name)
VALUES ('Bàn'),
    ('Ghế'),
    ('Tủ'),
    ('Giường'),
    ('Kệ');

-- 2. Brands (7)
INSERT INTO
    brands (brand_name)
VALUES ('Nội Thất Hòa Phát'),
    ('Nội Thất An Cường'),
    ('Nội Thất Minh Long'),
    ('Rossano'),
    ('JYSK'),
    ('Index Living'),
    ('IKEA');

-- 3. Collections (4)
INSERT INTO
    collections (collection_name)
VALUES ('Modern'),
    ('Classic'),
    ('Minimal'),
    ('Luxury');

-- 4. Discounts (4)
INSERT INTO
    discounts (
        discount_code,
        discount_percentage,
        valid_from,
        valid_to,
        discount_description
    )
VALUES (
        'SALE10',
        10,
        '2025-01-01',
        '2025-12-31',
        'Giảm 10% cho tất cả sản phẩm'
    ),
    (
        'SALE20',
        20,
        '2025-06-01',
        '2025-12-31',
        'Khuyến mãi hè sôi động'
    ),
    (
        'WELCOME',
        15,
        '2025-01-01',
        '2025-12-31',
        'Quà tặng thành viên mới'
    ),
    (
        'SUMMER',
        25,
        '2025-04-01',
        '2025-08-31',
        'Ưu đãi đặc biệt mùa hè'
    );

-- 5. Accounts (1 Admin + 3 Users)
-- Note: password_hash uses placeholders as requested. Admin matches furniture.sql.
INSERT INTO
    accounts (
        email,
        password_hash,
        is_admin
    )
VALUES (
        'admin@shop.com',
        '$2a$12$qi5iD6VCHPnIOcdzvCzV9O9CGIDjQOquBzp.HqCuctzQW7tCE6etm',
        TRUE
    ),
    (
        'user1@gmail.com',
        '$2a$10$userhash',
        FALSE
    ),
    (
        'user2@gmail.com',
        '$2a$10$userhash',
        FALSE
    ),
    (
        'user3@gmail.com',
        '$2a$10$userhash',
        FALSE
    ),
    ('user4@gmail.com', '$2a$10$userhash', FALSE),
    ('user5@gmail.com', '$2a$10$userhash', FALSE),
    ('user6@gmail.com', '$2a$10$userhash', FALSE),
    ('user7@gmail.com', '$2a$10$userhash', FALSE),
    ('user8@gmail.com', '$2a$10$userhash', FALSE),
    ('user9@gmail.com', '$2a$10$userhash', FALSE),
    ('user10@gmail.com', '$2a$10$userhash', FALSE),
    ('user11@gmail.com', '$2a$10$userhash', FALSE),
    ('user12@gmail.com', '$2a$10$userhash', FALSE),
    ('user13@gmail.com', '$2a$10$userhash', FALSE),
    ('user14@gmail.com', '$2a$10$userhash', FALSE),
    ('user15@gmail.com', '$2a$10$userhash', FALSE),
    ('user16@gmail.com', '$2a$10$userhash', FALSE),
    ('user17@gmail.com', '$2a$10$userhash', FALSE),
    ('user18@gmail.com', '$2a$10$userhash', FALSE),
    ('user19@gmail.com', '$2a$10$userhash', FALSE),
    ('user20@gmail.com', '$2a$10$userhash', FALSE),
    ('user21@gmail.com', '$2a$10$userhash', FALSE),
    ('user22@gmail.com', '$2a$10$userhash', FALSE),
    ('user23@gmail.com', '$2a$10$userhash', FALSE);

-- 6. User Profiles (Only for 3 User accounts - account_id 2, 3, 4)
INSERT INTO
    user_profiles (
        username,
        phone_number,
        user_address,
        account_id
    )
VALUES (
        'nguyenvan_a',
        '0912345678',
        '123 Cách Mạng Tháng 8, Quận 10, TP.HCM',
        2
    ),
    (
        'lethi_b',
        '0987654321',
        '456 Lê Lợi, TP. Đà Nẵng',
        3
    ),
    (
        'tranvan_c',
        '0905556667',
        '789 Nguyễn Huệ, Quận 1, TP.HCM',
        4
    ),
    ('user_test_4', '0995822412', '115 Street 1, District 5, City HCM', 5),
    ('user_test_5', '0939958838', '143 Street 4, District 9, City HCM', 6),
    ('user_test_6', '0989254563', '433 Street 2, District 1, City HCM', 7),
    ('user_test_7', '0939345092', '239 Street 17, District 10, City HCM', 8),
    ('user_test_8', '0985329037', '204 Street 18, District 7, City HCM', 9),
    ('user_test_9', '0970291817', '604 Street 9, District 1, City HCM', 10),
    ('user_test_10', '0966722344', '349 Street 9, District 3, City HCM', 11),
    ('user_test_11', '0955176955', '105 Street 3, District 7, City HCM', 12),
    ('user_test_12', '0958181396', '868 Street 12, District 10, City HN', 13),
    ('user_test_13', '0915831819', '748 Street 15, District 9, City HCM', 14),
    ('user_test_14', '0960806024', '81 Street 18, District 5, City DN', 15),
    ('user_test_15', '0993016315', '907 Street 12, District 10, City HCM', 16),
    ('user_test_16', '0919335534', '47 Street 8, District 5, City HCM', 17),
    ('user_test_17', '0941244663', '888 Street 4, District 7, City HN', 18),
    ('user_test_18', '0970855700', '651 Street 12, District 3, City HN', 19),
    ('user_test_19', '0957683626', '215 Street 9, District 2, City DN', 20),
    ('user_test_20', '0995225343', '176 Street 18, District 4, City HCM', 21),
    ('user_test_21', '0972043515', '389 Street 9, District 9, City HCM', 22),
    ('user_test_22', '0953524491', '864 Street 2, District 4, City HCM', 23),
    ('user_test_23', '0952339391', '411 Street 9, District 2, City HCM', 24);


-- 7. Products (20)
-- Distributed across cat(1-5), brand(1-7), col(1-4)
INSERT INTO
    products (
        product_name,
        product_description,
        category_id,
        brand_id,
        collection_id,
        variant_ref
    )
VALUES (
        'Bàn làm việc Modern Sồi',
        'Bàn phong cách hiện đại tích hợp ngăn kéo',
        1,
        1,
        1,
        'abc'
    ),
    (
        'Ghế Sofa Rossano Luxury',
        'Sofa da thật cao cấp, êm ái, bền bỉ',
        2,
        4,
        4,
        'abc1'
    ),
    (
        'Tủ quần áo JYSK Minimal',
        'Tủ 3 cánh gỗ MDF chống trầy, thiết kế tối giản',
        3,
        5,
        3,
        'abc2'
    ),
    (
        'Giường IKEA Hemnes',
        'Giường đôi khung gỗ chắc chắn, trắng cổ điển',
        4,
        7,
        2,
        'abc3'
    ),
    (
        'Kệ sách Minh Long Modern',
        'Kệ đa năng nhiều tầng, màu gỗ tự nhiên',
        5,
        3,
        1,
        'abc4'
    ),
    (
        'Bàn ăn Index Luxury',
        'Bàn tròn mặt đá marble, phong cách sang trọng',
        1,
        6,
        4,
        'abc5'
    ),
    (
        'Ghế gỗ óc chó Hòa Phát Classic',
        'Ghế gỗ óc chó tựa lưng cao, chân gỗ sồi, phù hợp phòng ăn',
        2,
        1,
        2,
        'abc6'
    ),
    (
        'Tủ giày An Cường Minimal',
        'Tủ thông minh tiết kiệm diện tích',
        3,
        2,
        3,
        'abc7'
    ),
    (
        'Giường ngủ Rossano Classic',
        'Giường tân cổ điển, bọc vải nhung cao cấp',
        4,
        4,
        2,
        'abc8'
    ),
    (
        'Kệ TV IKEA Lack',
        'Kệ nhẹ bền, màu vân gỗ, thiết kế đơn giản',
        5,
        7,
        3,
        'abc9'
    ),
    (
        'Bàn trà JYSK Scandinavian',
        'Bàn tròn chân gỗ tối giản, phong cách Bắc Âu',
        1,
        5,
        3,
        'abc10'
    ),
    (
        'Ghế ăn Minh Long Modern',
        'Bộ ghế gỗ ASH, tựa lưng thoải mái',
        2,
        3,
        1,
        'abc11'
    ),
    (
        'Tủ bếp Hòa Phát Luxury',
        'Hệ tủ bếp gỗ sồi sẫm màu, hiện đại',
        3,
        1,
        4,
        'abc12'
    ),
    (
        'Giường đơn An Cường Modern',
        'Giường compact tích hợp ngăn chứa đồ',
        4,
        2,
        1,
        'abc13'
    ),
    (
        'Kệ trang trí Rossano Luxury',
        'Kệ gỗ hiện đại, tối giản',
        5,
        4,
        4,
        'abc14'
    ),
    (
        'Bàn họp Index Modern',
        'Bàn họp lớn, tích hợp hệ thống đi dây điện',
        1,
        6,
        1,
        'abc15'
    ),
    (
        'Ghế bành IKEA Strandmon',
        'Ghế thư giãn mang tính biểu tượng, màu xanh navy',
        2,
        7,
        2,
        'abc16'
    ),
    (
        'Tủ hồ sơ Hòa Phát Classic',
        'Tủ gỗ đơn giản cho văn phòng',
        3,
        1,
        2,
        'abc17'
    ),
    (
        'Giường tầng JYSK Minimal',
        'Giường an toàn, chắc chắn',
        4,
        5,
        3,
        'abc18'
    ),
    (
        'Kệ treo tường An Cường Modern',
        'Hệ kệ treo linh hoạt, dễ lắp đặt',
        5,
        2,
        1,
        'abc19'
    );

-- 10. Orders (80)
INSERT INTO
    orders (
        order_date,
        order_status,
        total_price,
        address,
        note,
        account_id,
        discount_id
    )
VALUES
    ('2026-01-22 12:27:36', 'PENDING', 26700000, '58 Seed Street 14, City HCM', 'Note 1', 14, NULL),
    ('2026-03-16 20:32:48', 'DELIVERED', 12000000, '216 Seed Street 17, City HN', 'Note 2', 9, NULL),
    ('2026-03-15 09:11:04', 'PENDING', 17250000, '605 Seed Street 19, City HCM', 'Note 3', 19, NULL),
    ('2026-01-08 04:47:01', 'DELIVERING', 25000000, '534 Seed Street 15, City DN', 'Note 4', 5, NULL),
    ('2026-02-28 10:20:49', 'CANCELLED', 7600000, '721 Seed Street 10, City DN', 'Note 5', 14, NULL),
    ('2026-02-27 21:07:38', 'PENDING', 69600000, '159 Seed Street 8, City DN', 'Note 6', 21, NULL),
    ('2026-02-23 02:06:38', 'PENDING', 35000000, '390 Seed Street 15, City DN', 'Note 7', 5, NULL),
    ('2026-01-05 11:19:25', 'CANCELLED', 11000000, '85 Seed Street 4, City HCM', 'Note 8', 21, NULL),
    ('2026-03-24 21:01:04', 'DELIVERING', 12000000, '369 Seed Street 6, City DN', 'Note 9', 13, NULL),
    ('2026-02-16 03:58:40', 'PENDING', 73000000, '214 Seed Street 18, City HCM', 'Note 10', 18, NULL),
    ('2026-02-14 22:42:06', 'PENDING', 4500000, '99 Seed Street 1, City HCM', 'Note 11', 3, NULL),
    ('2026-03-28 00:53:46', 'CANCELLED', 7000000, '611 Seed Street 3, City HN', 'Note 12', 8, NULL),
    ('2026-02-06 09:54:43', 'DELIVERING', 3800000, '416 Seed Street 16, City HN', 'Note 13', 14, NULL),
    ('2026-01-08 08:04:33', 'CANCELLED', 5500000, '482 Seed Street 17, City HN', 'Note 14', 3, NULL),
    ('2026-03-22 01:55:20', 'PENDING', 27300000, '84 Seed Street 1, City HCM', 'Note 15', 9, NULL),
    ('2026-03-10 21:43:45', 'CANCELLED', 24900000, '684 Seed Street 9, City DN', 'Note 16', 23, NULL),
    ('2026-03-26 02:36:00', 'DELIVERED', 13600000, '863 Seed Street 20, City HN', 'Note 17', 19, NULL),
    ('2026-03-22 05:14:27', 'DELIVERED', 19500000, '884 Seed Street 16, City DN', 'Note 18', 9, NULL),
    ('2026-01-28 19:24:32', 'DELIVERED', 30000000, '499 Seed Street 20, City DN', 'Note 19', 6, NULL),
    ('2026-03-14 01:43:07', 'DELIVERING', 42500000, '308 Seed Street 7, City HN', 'Note 20', 4, NULL),
    ('2026-03-11 22:32:21', 'DELIVERING', 50000000, '821 Seed Street 11, City HN', 'Note 21', 22, NULL),
    ('2026-02-09 23:20:02', 'CANCELLED', 24000000, '603 Seed Street 12, City DN', 'Note 22', 11, NULL),
    ('2026-01-05 22:42:04', 'PENDING', 24000000, '511 Seed Street 12, City HN', 'Note 23', 5, NULL),
    ('2026-03-04 12:58:52', 'CANCELLED', 25000000, '833 Seed Street 14, City HN', 'Note 24', 19, NULL),
    ('2026-03-19 10:16:48', 'DELIVERING', 45900000, '261 Seed Street 7, City HCM', 'Note 25', 9, NULL),
    ('2026-02-05 09:01:47', 'CANCELLED', 18600000, '780 Seed Street 9, City HN', 'Note 26', 3, NULL),
    ('2026-03-10 03:44:45', 'PENDING', 950000, '341 Seed Street 12, City HN', 'Note 27', 11, NULL),
    ('2026-01-20 14:08:09', 'CANCELLED', 38500000, '875 Seed Street 12, City HN', 'Note 28', 19, NULL),
    ('2026-03-11 02:58:52', 'DELIVERED', 35800000, '428 Seed Street 1, City DN', 'Note 29', 13, NULL),
    ('2026-02-12 05:09:40', 'CANCELLED', 9300000, '576 Seed Street 5, City HN', 'Note 30', 10, NULL),
    ('2026-03-20 18:24:54', 'DELIVERING', 32800000, '887 Seed Street 17, City HN', 'Note 31', 3, NULL),
    ('2026-02-04 07:59:53', 'PENDING', 24450000, '342 Seed Street 13, City DN', 'Note 32', 10, NULL),
    ('2026-02-20 02:17:34', 'PENDING', 27500000, '275 Seed Street 20, City HCM', 'Note 33', 20, NULL),
    ('2026-01-23 06:23:57', 'CANCELLED', 12000000, '891 Seed Street 13, City HN', 'Note 34', 4, NULL),
    ('2026-02-14 13:57:36', 'DELIVERED', 39300000, '530 Seed Street 18, City HCM', 'Note 35', 15, NULL),
    ('2026-03-11 03:10:48', 'PENDING', 29450000, '723 Seed Street 9, City DN', 'Note 36', 6, NULL),
    ('2026-03-15 05:26:19', 'DELIVERED', 32700000, '331 Seed Street 7, City HN', 'Note 37', 19, NULL),
    ('2026-03-14 05:05:34', 'DELIVERING', 86000000, '51 Seed Street 12, City DN', 'Note 38', 7, NULL),
    ('2026-03-08 11:17:43', 'DELIVERING', 33000000, '568 Seed Street 17, City HCM', 'Note 39', 19, NULL),
    ('2026-02-06 13:19:52', 'DELIVERED', 7500000, '580 Seed Street 12, City HN', 'Note 40', 13, NULL),
    ('2026-02-25 07:44:25', 'PENDING', 30000000, '590 Seed Street 7, City HCM', 'Note 41', 22, NULL),
    ('2026-03-19 00:07:35', 'DELIVERED', 15000000, '91 Seed Street 8, City DN', 'Note 42', 13, NULL),
    ('2026-03-25 01:27:08', 'DELIVERING', 6450000, '761 Seed Street 4, City HCM', 'Note 43', 7, NULL),
    ('2026-02-28 03:34:48', 'DELIVERING', 44200000, '244 Seed Street 15, City HN', 'Note 44', 22, NULL),
    ('2026-03-13 03:30:02', 'PENDING', 9000000, '22 Seed Street 2, City DN', 'Note 45', 4, NULL),
    ('2026-01-18 12:12:44', 'PENDING', 14300000, '165 Seed Street 11, City DN', 'Note 46', 4, NULL),
    ('2026-01-06 17:15:41', 'DELIVERING', 22200000, '269 Seed Street 15, City DN', 'Note 47', 4, NULL),
    ('2026-03-12 16:52:30', 'DELIVERING', 51800000, '580 Seed Street 15, City HCM', 'Note 48', 20, NULL),
    ('2026-02-17 03:06:53', 'CANCELLED', 24000000, '759 Seed Street 6, City DN', 'Note 49', 21, NULL),
    ('2026-03-12 22:51:35', 'DELIVERED', 13600000, '377 Seed Street 12, City HCM', 'Note 50', 19, NULL),
    ('2026-03-16 10:10:15', 'CANCELLED', 57000000, '605 Seed Street 9, City HN', 'Note 51', 8, NULL),
    ('2026-02-12 20:23:43', 'DELIVERED', 41900000, '489 Seed Street 2, City HN', 'Note 52', 11, NULL),
    ('2026-02-24 20:25:08', 'PENDING', 35900000, '509 Seed Street 1, City HN', 'Note 53', 18, NULL),
    ('2026-02-04 14:40:09', 'DELIVERED', 11500000, '522 Seed Street 9, City HCM', 'Note 54', 3, NULL),
    ('2026-02-24 02:36:08', 'PENDING', 7000000, '176 Seed Street 10, City DN', 'Note 55', 14, NULL),
    ('2026-03-22 01:50:22', 'DELIVERING', 7000000, '608 Seed Street 8, City HN', 'Note 56', 11, NULL),
    ('2026-02-27 22:31:04', 'CANCELLED', 77000000, '700 Seed Street 5, City HN', 'Note 57', 21, NULL),
    ('2026-01-05 17:35:40', 'DELIVERING', 26000000, '446 Seed Street 12, City HCM', 'Note 58', 15, NULL),
    ('2026-03-02 22:17:49', 'DELIVERING', 13100000, '44 Seed Street 6, City DN', 'Note 59', 10, NULL),
    ('2026-03-02 01:59:46', 'PENDING', 33500000, '452 Seed Street 12, City HN', 'Note 60', 3, NULL),
    ('2026-03-25 00:17:18', 'CANCELLED', 950000, '234 Seed Street 8, City HCM', 'Note 61', 15, NULL),
    ('2026-02-22 18:17:53', 'DELIVERING', 7900000, '826 Seed Street 4, City DN', 'Note 62', 12, NULL),
    ('2026-01-27 19:09:53', 'DELIVERED', 21600000, '883 Seed Street 8, City DN', 'Note 63', 8, NULL),
    ('2026-03-23 15:39:17', 'PENDING', 28500000, '136 Seed Street 20, City HN', 'Note 64', 2, NULL),
    ('2026-02-08 10:33:28', 'DELIVERING', 53000000, '682 Seed Street 12, City HCM', 'Note 65', 2, NULL),
    ('2026-02-09 08:57:09', 'PENDING', 21300000, '657 Seed Street 20, City HCM', 'Note 66', 10, NULL),
    ('2026-03-27 08:19:53', 'PENDING', 31000000, '500 Seed Street 17, City HN', 'Note 67', 15, NULL),
    ('2026-02-23 10:09:01', 'PENDING', 27000000, '747 Seed Street 11, City DN', 'Note 68', 20, NULL),
    ('2026-02-24 02:25:37', 'CANCELLED', 52000000, '260 Seed Street 17, City DN', 'Note 69', 2, NULL),
    ('2026-01-10 14:49:08', 'PENDING', 17900000, '391 Seed Street 16, City HN', 'Note 70', 19, NULL),
    ('2026-03-23 02:37:27', 'PENDING', 37000000, '947 Seed Street 10, City DN', 'Note 71', 11, NULL),
    ('2026-02-12 09:45:04', 'DELIVERED', 10100000, '440 Seed Street 2, City HN', 'Note 72', 18, NULL),
    ('2026-03-10 23:12:27', 'CANCELLED', 56800000, '569 Seed Street 10, City HCM', 'Note 73', 14, NULL),
    ('2026-02-07 00:15:23', 'DELIVERED', 7700000, '390 Seed Street 8, City DN', 'Note 74', 3, NULL),
    ('2026-02-27 04:07:04', 'DELIVERED', 16600000, '646 Seed Street 2, City HCM', 'Note 75', 18, NULL),
    ('2026-02-28 14:17:11', 'DELIVERING', 7600000, '565 Seed Street 15, City HCM', 'Note 76', 21, NULL),
    ('2026-02-25 02:25:51', 'PENDING', 28800000, '858 Seed Street 11, City HN', 'Note 77', 20, NULL),
    ('2026-02-21 06:21:44', 'DELIVERING', 33000000, '910 Seed Street 3, City DN', 'Note 78', 13, NULL),
    ('2026-02-25 17:58:54', 'CANCELLED', 20000000, '71 Seed Street 5, City HCM', 'Note 79', 11, NULL),
    ('2026-03-18 08:12:12', 'CANCELLED', 2500000, '714 Seed Street 19, City HN', 'Note 80', 7, NULL);

-- 11. Order Items
INSERT INTO
    order_items (
        quantity,
        product_id,
        variant_snapshot,
        order_id
    )
VALUES
    (1, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 1),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 1),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 1),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 1),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 2),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 3),
    (1, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 3),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 3),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 3),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 4),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 4),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 4),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 4),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 5),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 6),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 6),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 6),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 7),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 7),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 8),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 9),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 10),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 10),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 10),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 10),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 11),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 12),
    (1, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 13),
    (1, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 14),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 15),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 15),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 15),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 15),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 16),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 16),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 16),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 17),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 17),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 17),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 18),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 18),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 19),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 19),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 20),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 20),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 20),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 21),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 22),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 22),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 22),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 22),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 23),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 24),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 25),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 25),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 25),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 25),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 26),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 26),
    (1, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 27),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 28),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 28),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 28),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 28),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 29),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 29),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 29),
    (1, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 30),
    (1, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 30),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 31),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 31),
    (1, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 31),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 32),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 32),
    (1, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 32),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 32),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 33),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 33),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 33),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 33),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 34),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 35),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 35),
    (1, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 35),
    (1, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 36),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 36),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 36),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 37),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 37),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 37),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 37),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 38),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 38),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 38),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 38),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 39),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 39),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 40),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 41),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 41),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 42),
    (1, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 43),
    (1, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 43),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 44),
    (1, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 44),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 44),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 44),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 45),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 46),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 46),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 46),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 47),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 47),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 47),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 47),
    (1, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 48),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 48),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 48),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 48),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 49),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 50),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 51),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 51),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 52),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 52),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 52),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 52),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 53),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 53),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 53),
    (2, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 54),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 54),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 55),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 56),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 57),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 57),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 57),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 57),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 58),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 58),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 59),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 59),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 59),
    (1, 1, '{"sku": "BAN-MODERN-BR", "price": 4500000, "color": "Nâu Đậm", "material": "Gỗ MDF"}', 59),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 60),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 60),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 60),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 60),
    (1, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 61),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 62),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 62),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 62),
    (1, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 63),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 63),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 63),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 64),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 64),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 65),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 65),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 65),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 65),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 66),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 66),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 66),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 66),
    (2, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 67),
    (2, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 67),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 68),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 68),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 68),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 68),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 69),
    (2, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 69),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 69),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 69),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 70),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 70),
    (2, 10, '{"sku": "KE-TV-IKEA", "price": 950000, "color": "Gỗ sáng", "material": "Ván dăm"}', 70),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 71),
    (1, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 71),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 72),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 72),
    (2, 13, '{"sku": "TU-BEP-HP-LUX", "price": 25000000, "color": "Trắng Bóng", "material": "Acrylic/MDF"}', 73),
    (1, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 73),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 74),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 74),
    (1, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 75),
    (1, 17, '{"sku": "GHE-BANH-IKEA-NV", "price": 3500000, "color": "Xanh Navy", "material": "Vải sợi"}', 75),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 75),
    (2, 3, '{"sku": "TU-MIN-3D-OAK", "price": 3800000, "color": "Vân sồi", "material": "Gỗ MDF"}', 76),
    (2, 19, '{"sku": "BED-TANG-JYSK", "price": 6800000, "color": "Gỗ Sáng", "material": "Gỗ Thông Tự Nhiên"}', 77),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 77),
    (1, 14, '{"sku": "BED-SINGLE-AC", "price": 4200000, "color": "Vân Gỗ", "material": "MDF An Cường"}', 77),
    (2, 15, '{"sku": "KE-MO-BR", "price": 5500000, "color": "Nâu Đậm", "material": "Gỗ Óc Chó"}', 78),
    (1, 16, '{"sku": "BAN-HOP-ID-MOD", "price": 12000000, "color": "Nâu Đậm", "material": "Gỗ MFC cao cấp"}', 78),
    (1, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 78),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 78),
    (2, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 79),
    (2, 4, '{"sku": "BED-IKEA-WH", "price": 7500000, "color": "Trắng", "material": "Gỗ thông"}', 79),
    (1, 7, '{"sku": "GHE-HP-CL-BK", "price": 2500000, "color": "Đen", "material": "Da PU"}', 80);