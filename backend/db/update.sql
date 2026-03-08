ALTER TABLE blueberry_admin.orders
ADD COLUMN item_desc VARCHAR(255) COMMENT '托寄物',
ADD COLUMN shipping_method VARCHAR(100) COMMENT '物流产品',
MODIFY quantity INT NULL,
MODIFY total_price DECIMAL(10, 2) NULL;
