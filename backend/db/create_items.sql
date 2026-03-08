CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL COMMENT '关联主订单表的 id',
  weight DECIMAL(10, 2) COMMENT '斤数',
  size_type VARCHAR(50) COMMENT '果径类型 (次果,红果,12+,15+,18+,22+)',
  package_type VARCHAR(50) COMMENT '包装类型 (125g,250g,500g)',
  is_gift_box BOOLEAN DEFAULT FALSE COMMENT '是否为礼盒装',
  raw_desc VARCHAR(255) COMMENT '原始托寄物文本',
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
