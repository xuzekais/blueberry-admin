ALTER TABLE orders
ADD COLUMN order_time DATETIME COMMENT '下单时间',
ADD COLUMN estimated_cost DECIMAL(10, 2) DEFAULT 0.00 COMMENT '预计成本',
ADD COLUMN estimated_freight DECIMAL(10, 2) DEFAULT 0.00 COMMENT '预计运费',
ADD COLUMN estimated_profit DECIMAL(10, 2) DEFAULT 0.00 COMMENT '预计盈利',
ADD COLUMN channel VARCHAR(50) DEFAULT 'miniprogram' COMMENT '渠道';

-- 向 cost_template_items 和 enums 添加礼盒包装的支持如果还没有的话
INSERT INTO enums (category, label, value, sort_order) VALUES
('cost_item_type', '礼盒', '礼盒', 8)
ON DUPLICATE KEY UPDATE label=VALUES(label);
