const db = require('./index');

async function run() {
  try {
    // Add new combinations rules field
    await db.query(`
      ALTER TABLE freight_templates
      ADD COLUMN freight_rules JSON COMMENT '运费计费组合规则组';
    `);
    console.log('✅ Added freight_rules JSON column.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ freight_rules column already exists.');
    } else {
      console.error('❌ Error adding freight_rules column:', err.message);
    }
  }

  try {
    // Drop previous separated rules fields
    await db.query(`
      ALTER TABLE freight_templates
      DROP COLUMN region_rules,
      DROP COLUMN size_rules;
    `);
    console.log('✅ Dropped region_rules and size_rules columns.');
  } catch (err) {
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('⚠️ Old rules columns already dropped.');
    } else {
      console.error('❌ Error dropping old rules columns:', err.message);
    }
  }
  process.exit(0);
}

run();