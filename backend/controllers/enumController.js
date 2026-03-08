const db = require('../db');

// 获取枚举列表（支持分类查询）
const getEnums = async (req, res) => {
    try {
        const { category, is_active } = req.query;
        let query = 'SELECT * FROM enums WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        
        if (is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(parseInt(is_active));
        }

        query += ' ORDER BY category, sort_order ASC, id ASC';

        const [rows] = await db.query(query, params);
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('获取枚举列表报错:', error);
        res.status(500).json({ code: 500, message: '获取枚举列表失败', error: error.message });
    }
};

// 获取单个枚举
const getEnumById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM enums WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ code: 500, message: '该枚举不存在' });
        }
        
        res.json({ code: 200, data: rows[0] });
    } catch (error) {
        console.error('获取单条枚举信息报错:', error);
        res.status(500).json({ code: 500, message: '获取枚举失败', error: error.message });
    }
};

// 新增枚举
const createEnum = async (req, res) => {
    try {
        const { category, label, value, sort_order = 0, is_active = 1 } = req.body;
        
        if (!category || !label || !value) {
            return res.status(400).json({ code: 500, message: '参数缺失 (category, label, value 是必须的)' });
        }

        // 验证去重 (category + value 必须唯一)
        const [existing] = await db.query('SELECT id FROM enums WHERE category = ? AND value = ?', [category, value]);
        if (existing.length > 0) {
            return res.status(400).json({ code: 500, message: '该名称下已存在相同的枚举值' });
        }

        const [result] = await db.query(
            'INSERT INTO enums (category, label, value, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
            [category, label, value, sort_order, is_active]
        );

        res.status(201).json({ code: 200, data: { id: result.insertId, category, label, value, sort_order, is_active } });
    } catch (error) {
        console.error('新建枚举报错:', error);
        res.status(500).json({ code: 500, message: '新建枚举失败', error: error.message });
    }
};

// 更新枚举
const updateEnum = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, label, value, sort_order, is_active } = req.body;

        // 根据 id 检查存在
        const [current] = await db.query('SELECT * FROM enums WHERE id = ?', [id]);
        if (current.length === 0) {
            return res.status(404).json({ code: 500, message: '未找到该条记录' });
        }

        const newCategory = category || current[0].category;
        const newValue = value || current[0].value;

        // 检查唯一冲突
        const [existing] = await db.query('SELECT id FROM enums WHERE category = ? AND value = ? AND id != ?', [newCategory, newValue, id]);
        if (existing.length > 0) {
            return res.status(400).json({ code: 500, message: '所修改的值和其他记录存在冲突' });
        }

        const updates = [];
        const params = [];
        
        if (category !== undefined) { updates.push('category = ?'); params.push(category); }
        if (label !== undefined) { updates.push('label = ?'); params.push(label); }
        if (value !== undefined) { updates.push('value = ?'); params.push(value); }
        if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }
        if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

        if (updates.length === 0) {
            return res.json({ code: 200, message: '没有更新字段' });
        }

        params.push(id);
        const query = `UPDATE enums SET ${updates.join(', ')} WHERE id = ?`;

        await db.query(query, params);

        res.json({ code: 200, message: '更新成功' });
    } catch (error) {
        console.error('更新枚举报错:', error);
        res.status(500).json({ code: 500, message: '更新失败', error: error.message });
    }
};

// 删除枚举
const deleteEnum = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM enums WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 500, message: '要删除的枚举没找到' });
        }

        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        console.error('删除枚举报错:', error);
        res.status(500).json({ code: 500, message: '删除失败', error: error.message });
    }
};

module.exports = {
    getEnums,
    getEnumById,
    createEnum,
    updateEnum,
    deleteEnum
};
