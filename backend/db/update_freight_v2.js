const db = require('./index');

async function run() {
  try {
    // Add new JSON fields
    await db.query(`
      ALTER TABLE freight_templates
      ADD COLUMN region_rules JSON COMMENT '地区规则组',
      ADD COLUMN size_rules JSON COMMENT '果径规则组';
    `);
    console.log('✅ Added JSON rule columns.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️ JSON rule columns already exist.');
    } else {
      console.error('❌ Error adding columns:', err.message);
    }
  }

  try {
    // Drop old scalar fields
    await db.query(`
      ALTER TABLE freight_templates
      DROP COLUMN region_type,
      DROP COLUMN target_sizes,
      DROP COLUMN free_shipping_weight,
      DROP COLUMN base_weight,
      DROP COLUMN base_price,
      DROP COLUMN extra_weight,
      DROP COLUMN extra_price;
    `);
    console.log('✅ Dropped deprecated scalar columns.');
  } catch (err) {
    if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
      console.log('⚠️ Old columns already dropped.');
    } else {
      console.error('❌ Error dropping columns:', err.message);
    }
  }
  process.exit(0);
}

run();