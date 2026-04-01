USE blueberry_admin;

-- 1. 扩展 orders 表字段
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS item_desc TEXT COMMENT '托寄物描述（拆分后的）',
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50) COMMENT '物流产品',
ADD COLUMN IF NOT EXISTS order_time DATETIME COMMENT '下单时间',
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 2) COMMENT '预计成本',
ADD COLUMN IF NOT EXISTS estimated_freight DECIMAL(10, 2) COMMENT '预计运费',
ADD COLUMN IF NOT EXISTS estimated_profit DECIMAL(10, 2) COMMENT '预计盈利',
ADD COLUMN IF NOT EXISTS channel VARCHAR(50) COMMENT '订单渠道';

-- 2. 创建 order_items 表（如果不存在）
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  weight DECIMAL(10, 2) COMMENT '斤数',
  size_type VARCHAR(50) COMMENT '果径类型',
  package_type VARCHAR(50) COMMENT '包装规格',
  is_gift_box TINYINT(1) DEFAULT 0 COMMENT '是否礼盒',
  gift_box_spec DECIMAL(10, 2) COMMENT '礼盒规格斤数',
  raw_desc VARCHAR(255) COMMENT '原始描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品明细表';
