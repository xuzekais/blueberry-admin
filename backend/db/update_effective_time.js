const db = require('./index');

async function run() {
  try {
    await db.query(`
      ALTER TABLE cost_templates
      ADD COLUMN effective_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '生效时间';
    `);
    console.log('✅ Added effective_time to cost_templates.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ effective_time column already exists in cost_templates.');
    } else {
      console.error('❌ Error adding effective_time to cost_templates:', err.message);
    }
  }

  try {
    await db.query(`
      ALTER TABLE freight_templates
      ADD COLUMN effective_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '生效时间';
    `);
    console.log('✅ Added effective_time to freight_templates.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ effective_time column already exists in freight_templates.');
    } else {
      console.error('❌ Error adding effective_time to freight_templates:', err.message);
    }
  }

  process.exit(0);
}

run();