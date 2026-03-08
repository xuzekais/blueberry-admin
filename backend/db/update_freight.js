const db = require('./index');

async function run() {
  try {
    const alterQuery = `
      ALTER TABLE freight_templates
      ADD COLUMN region_type VARCHAR(50) DEFAULT 'all' COMMENT '区域类别(all-全国, province-省内, outside-省外, remote-偏远)' AFTER name,
      ADD COLUMN target_sizes VARCHAR(255) DEFAULT '' COMMENT '适用果径(逗号分隔,空为不限制)' AFTER region_type,
      ADD COLUMN free_shipping_weight DECIMAL(10,2) DEFAULT 0.00 COMMENT '满X斤包邮(0为不包邮)' AFTER target_sizes;
    `;
    await db.query(alterQuery);
    console.log('✅ Field region_type, target_sizes, free_shipping_weight added to freight_templates.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Fields already exist, skipping alter.');
    } else {
      console.error('❌ Error altering table:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

run();