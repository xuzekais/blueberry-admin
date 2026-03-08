const fs = require('fs');
const path = require('path');
const db = require('./index');

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'create_categories.sql');
    const sqlStr = fs.readFileSync(sqlPath, 'utf8');
    const statements = sqlStr.split(';').map(s => s.trim()).filter(Boolean);
    
    for (const statement of statements) {
      await db.query(statement);
      console.log('Executed:', statement.substring(0, 50) + '...');
    }
    
    console.log('✅ Table categories created and data seeded successfully.');
  } catch (err) {
    console.error('❌ Error executing SQL:', err);
  } finally {
    process.exit(0);
  }
}

run();