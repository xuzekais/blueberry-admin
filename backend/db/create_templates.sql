-- 成本模版
CREATE TABLE IF NOT EXISTS cost_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '模版名称(如: 2024春季成本)',
    is_active TINYINT(1) DEFAULT 0 COMMENT '是否当前生效 1:生效 0:不生效',
    remarks VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本模版表';

-- 成本模版明细 (对应不同果径)
CREATE TABLE IF NOT EXISTS cost_template_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL COMMENT '关联的模版ID',
    size_type VARCHAR(50) NOT NULL COMMENT '果径大小(对应enum: 次果, 12+, 15+等)',
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '单价成本(元)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_template_size (template_id, size_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本模版明细表';

-- 预设一个基础成本模版
INSERT INTO cost_templates (name, is_active, remarks) VALUES ('默认初始成本模版', 1, '系统初始化默认模版')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 运费模版
CREATE TABLE IF NOT EXISTS freight_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '运费模版名称(如: 顺丰冷链江浙沪)',
    base_weight DECIMAL(10, 2) DEFAULT 1.00 COMMENT '首重(斤)',
    base_price DECIMAL(10, 2) DEFAULT 0.00 COMMENT '首重价格(元)',
    extra_weight DECIMAL(10, 2) DEFAULT 1.00 COMMENT '续重单位(斤)',
    extra_price DECIMAL(10, 2) DEFAULT 0.00 COMMENT '续重价格(元)',
    is_default TINYINT(1) DEFAULT 0 COMMENT '是否默认模版',
    remarks VARCHAR(255) COMMENT '备注(如适用省份)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='运费模版表';

-- 预设一个基础运费模版
INSERT INTO freight_templates (name, base_weight, base_price, extra_weight, extra_price, is_default, remarks) 
VALUES ('默认全国顺丰', 1.00, 18.00, 1.00, 5.00, 1, '全国基础运费模板')
ON DUPLICATE KEY UPDATE name=VALUES(name);
