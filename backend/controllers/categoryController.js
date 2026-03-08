const db = require('../db');

// 获取分类列表
const getCategories = async (req, res) => {
    try {
        const { is_active } = req.query;
        let query = 'SELECT * FROM categories WHERE 1=1';
        const params = [];

        if (is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(parseInt(is_active));
        }

        query += ' ORDER BY sort_order ASC, id DESC';

        const [rows] = await db.query(query, params);
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('获取分类列表报错:', error);
        res.status(500).json({ code: 500, message: '获取分类列表失败', error: error.message });
    }
};

// 获取单条分类
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '该分类不存在' });
        }
        
        res.json({ code: 200, data: rows[0] });
    } catch (error) {
        console.error('获取单条分类报错:', error);
        res.status(500).json({ code: 500, message: '获取分类失败', error: error.message });
    }
};

// 新增分类
const createCategory = async (req, res) => {
    try {
        const { name, code, description, sort_order = 0, is_active = 1 } = req.body;
        
        if (!name || !code) {
            return res.status(400).json({ code: 400, message: '必要参数缺失 (name, code)' });
        }

        const [existing] = await db.query('SELECT id FROM categories WHERE code = ?', [code]);
        if (existing.length > 0) {
            return res.status(400).json({ code: 400, message: '该分类编码已被使用' });
        }

        const [result] = await db.query(
            'INSERT INTO categories (name, code, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
            [name, code, description, sort_order, is_active]
        );

        res.status(201).json({ code: 200, data: { id: result.insertId, name, code, description, sort_order, is_active }, message: '新增成功' });
    } catch (error) {
        console.error('新增分类报错:', error);
        res.status(500).json({ code: 500, message: '新增分类失败', error: error.message });
    }
};

// 更新分类
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description, sort_order, is_active } = req.body;

        const [current] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (current.length === 0) {
            return res.status(404).json({ code: 404, message: '未找到该条记录' });
        }

        if (code !== undefined && code !== current[0].code) {
             const [existing] = await db.query('SELECT id FROM categories WHERE code = ? AND id != ?', [code, id]);
             if (existing.length > 0) {
                 return res.status(400).json({ code: 400, message: '该分类编码已被其他记录使用' });
             }
        }

        const updates = [];
        const params = [];
        
        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (code !== undefined) { updates.push('code = ?'); params.push(code); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }
        if (sort_order !== undefined) { updates.push('sort_order = ?'); params.push(sort_order); }
        if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }

        if (updates.length === 0) {
            return res.json({ code: 200, message: '没有更新字段' });
        }

        params.push(id);
        const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;

        await db.query(query, params);
        res.json({ code: 200, message: '更新成功' });
    } catch (error) {
        console.error('更新分类报错:', error);
        res.status(500).json({ code: 500, message: '更新失败', error: error.message });
    }
};

// 删除分类
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, message: '要删除的分类没找到' });
        }

        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        console.error('删除分类报错:', error);
        res.status(500).json({ code: 500, message: '删除失败', error: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};