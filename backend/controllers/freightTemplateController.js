const db = require('../db');

exports.getAllFreightTemplates = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM freight_templates ORDER BY is_default DESC, updated_at DESC');
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('Failed to get freight templates:', error);
        res.status(500).json({ code: 500, message: '获取运费模版失败' });
    }
};

exports.getFreightTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM freight_templates WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ code: 404, message: '未找到该模版' });
        }
        res.json({ code: 200, data: rows[0] });
    } catch (error) {
        res.status(500).json({ code: 500, message: '获取运费模版详情失败' });
    }
};

exports.createFreightTemplate = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, is_default, remarks, freight_rules, effective_time } = req.body;
        if (is_default === 1) {
            await connection.query('UPDATE freight_templates SET is_default = 0');
        }

        const freightRulesJSON = freight_rules ? JSON.stringify(freight_rules) : '[]';

        const [result] = await connection.query(
            `INSERT INTO freight_templates (name, is_default, remarks, freight_rules, effective_time)
             VALUES (?, ?, ?, ?, IFNULL(?, CURRENT_TIMESTAMP))`,
            [name, is_default || 0, remarks, freightRulesJSON, effective_time]
        );

        await connection.commit();
        res.json({ code: 200, message: '运费模版创建成功', data: { id: result.insertId } });
    } catch (error) {
        await connection.rollback();
        console.error('Failed to create freight template:', error);
        res.status(500).json({ code: 500, message: '创建失败' });
    } finally {
        connection.release();
    }
};

exports.updateFreightTemplate = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { name, is_default, remarks, freight_rules, effective_time } = req.body;
        if (is_default === 1) {
            await connection.query('UPDATE freight_templates SET is_default = 0 WHERE id != ?', [id]);
        }

        const freightRulesJSON = freight_rules ? JSON.stringify(freight_rules) : '[]';

        await connection.query(
            `UPDATE freight_templates SET name=?, is_default=?, remarks=?, freight_rules=?, effective_time=IFNULL(?, effective_time)
             WHERE id = ?`,
            [name, is_default, remarks, freightRulesJSON, effective_time, id]
        );

        await connection.commit();
        res.json({ code: 200, message: '运费模版更新成功' });
    } catch (error) {
        await connection.rollback();
        console.error('Failed to update freight template:', error);
        res.status(500).json({ code: 500, message: '更新失败' });
    } finally {
        connection.release();
    }
};

exports.deleteFreightTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM freight_templates WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ code: 404, message: '未找到要删除的记录' });
        }
        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ code: 500, message: '删除失败' });
    }
};
