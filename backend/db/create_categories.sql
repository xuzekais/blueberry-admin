-- 创建分类表 (用于管理各种分类内容，如商品分类等)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    code VARCHAR(50) NOT NULL COMMENT '分类编码(唯一标识)',
    description VARCHAR(255) COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用: 1-是, 0-否',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分类管理表';

-- 预设基础分类
INSERT INTO categories (name, code, description, sort_order) VALUES
('新鲜水果', 'fresh_fruit', '新鲜采摘的水果类', 1),
('特产礼盒', 'gift_box', '用于送礼的特产包装', 2)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);
