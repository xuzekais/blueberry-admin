const db = require('../db');

// --- 成本模版 (主表) 操作 ---

exports.getAllCostTemplates = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cost_templates ORDER BY is_active DESC, updated_at DESC');
        
        // 获取每个模版的明细
        const [items] = await db.query('SELECT * FROM cost_template_items');
        rows.forEach(template => {
            template.items = items.filter(item => item.template_id === template.id);
        });

        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('Failed to get cost templates:', error);
        res.status(500).json({ code: 500, message: '获取成本模版失败', error: error.message });
    }
};

exports.getCostTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM cost_templates WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '未找到该模版' });
        }
        
        const template = rows[0];
        const [items] = await db.query('SELECT * FROM cost_template_items WHERE template_id = ?', [id]);
        template.items = items;

        res.json({ code: 200, data: template });
    } catch (error) {
        console.error('Failed to get cost template:', error);
        res.status(500).json({ code: 500, message: '获取模版详情失败' });
    }
};

exports.createCostTemplate = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, is_active, remarks, items, effective_time } = req.body;
        
        // 如果设置为生效率先要把其他的生效状态取消
        if (is_active === 1) {
            await connection.query('UPDATE cost_templates SET is_active = 0');
        }

        const [result] = await connection.query(
            'INSERT INTO cost_templates (name, is_active, remarks, effective_time) VALUES (?, ?, ?, IFNULL(?, CURRENT_TIMESTAMP))',
            [name, is_active || 0, remarks, effective_time]
        );
        const templateId = result.insertId;

        // 插入明细
        if (items && Array.isArray(items) && items.length > 0) {
            const values = items.map(item => [templateId, item.size_type, item.cost_price]);
            await connection.query(
                'INSERT INTO cost_template_items (template_id, size_type, cost_price) VALUES ?',
                [values]
            );
        }

        await connection.commit();
        res.status(201).json({ code: 200, message: '成本模版创建成功', data: { id: templateId } });
    } catch (error) {
        await connection.rollback();
        console.error('Create cost template err:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    } finally {
        connection.release();
    }
};

exports.updateCostTemplate = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { name, is_active, remarks, items, effective_time } = req.body;

        if (is_active === 1) {
            await connection.query('UPDATE cost_templates SET is_active = 0 WHERE id != ?', [id]);
        }

        await connection.query(
            'UPDATE cost_templates SET name = ?, is_active = ?, remarks = ?, effective_time = IFNULL(?, effective_time) WHERE id = ?',
            [name, is_active, remarks, effective_time, id]
        );

        // 更新明细：简单起见，全删全增
        if (items && Array.isArray(items)) {
            await connection.query('DELETE FROM cost_template_items WHERE template_id = ?', [id]);
            if (items.length > 0) {
                const values = items.map(item => [id, item.size_type, item.cost_price]);
                await connection.query(
                    'INSERT INTO cost_template_items (template_id, size_type, cost_price) VALUES ?',
                    [values]
                );
            }
        }

        await connection.commit();
        res.json({ code: 200, message: '更新成功' });
    } catch (error) {
        await connection.rollback();
        console.error('Update cost template err:', error);
        res.status(500).json({ code: 500, message: '服务器内部错误' });
    } finally {
        connection.release();
    }
};

exports.deleteCostTemplate = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        
        await connection.query('DELETE FROM cost_template_items WHERE template_id = ?', [id]);
        const [result] = await connection.query('DELETE FROM cost_templates WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            throw new Error('未找到要删除的记录');
        }

        await connection.commit();
        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ code: 500, message: '删除失败: ' + error.message });
    } finally {
        connection.release();
    }
};
