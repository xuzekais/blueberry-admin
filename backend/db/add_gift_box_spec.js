require('dotenv').config();
const db = require('./index');
async function run() {
    try {
        const conn = await db.getConnection();
        await conn.execute("ALTER TABLE order_items ADD COLUMN gift_box_spec DECIMAL(10, 2) COMMENT '单只礼盒斤数(如果为礼盒装)'");
        console.log("Success add gift_box_spec");
        conn.release();
        process.exit(0);
    } catch(e) {
        if(e.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists");
            process.exit(0);
        }
        console.error(e);
        process.exit(1);
    }
}
run();
