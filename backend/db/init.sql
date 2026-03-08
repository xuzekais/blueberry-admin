-- db/init.sql
CREATE DATABASE IF NOT EXISTS blueberry_admin;
USE blueberry_admin;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  customer_name VARCHAR(100) NOT NULL COMMENT '客户姓名',
  phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  address VARCHAR(255) NOT NULL COMMENT '收货地址',
  quantity INT NOT NULL COMMENT '数量',
  total_price DECIMAL(10, 2) NOT NULL COMMENT '总价',
  status ENUM('pending', 'shipped', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '订单状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建枚举表
CREATE TABLE IF NOT EXISTS enums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL COMMENT '枚举分类, 例如: fruit_size(果径大小), pack_spec(包装规格)',
    label VARCHAR(50) NOT NULL COMMENT '展示文本',
    value VARCHAR(50) NOT NULL COMMENT '枚举值',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用: 1-是, 0-否',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_category_value (category, value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='枚举管理表';

-- 预设: 果径大小
INSERT INTO enums (category, label, value, sort_order) VALUES
('fruit_size', '次果', '次果', 1),
('fruit_size', '红果', '红果', 2),
('fruit_size', '12+', '12+', 3),
('fruit_size', '15+', '15+', 4),
('fruit_size', '18+', '18+', 5),
('fruit_size', '20+', '20+', 6),
('fruit_size', '22+', '22+', 7)
ON DUPLICATE KEY UPDATE label=VALUES(label), sort_order=VALUES(sort_order);

-- 预设: 包装规格
INSERT INTO enums (category, label, value, sort_order) VALUES
('pack_spec', '125g', '125g', 1),
('pack_spec', '250g', '250g', 2),
('pack_spec', '500g', '500g', 3)
ON DUPLICATE KEY UPDATE label=VALUES(label), sort_order=VALUES(sort_order);
