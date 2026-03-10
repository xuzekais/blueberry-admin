const regex = /\*\s*(\d+)$/;
function parseItemDesc(desc) {
    let weight = null; // 总斤数
    let size_type = '';
    let package_type = '';
    let is_gift_box = false;
    let gift_box_spec = null; // 礼盒装几斤的包装
    let quantity = 1;

    const qtyMatch = desc.match(/\*\s*(\d+)$/);
    if (qtyMatch) {
        quantity = parseInt(qtyMatch[1], 10) || 1;
        desc = desc.replace(/\*\s*(\d+)$/, '').trim();
    }

    if (desc.includes('礼盒')) {
        is_gift_box = true;
    }
    
    const weightMatch = desc.match(/(\d+(?:\.\d+)?)\s*斤/);
    if (weightMatch) {
        let base_weight = parseFloat(weightMatch[1]);
        if (is_gift_box) {
            gift_box_spec = base_weight;
        }
        weight = base_weight * quantity;
    }
    
    const sizes = ['次果', '红果', '12+', '15+', '18+', '22+'];
    for (let s of sizes) {
        if (desc.includes(s)) {
            size_type = s;
            break;
        }
    }
    
    const pkgs = ['125g', '250g', '500g'];
    for (let p of pkgs) {
        if (desc.includes(p)) {
            package_type = p;
            break;
        }
    }
    
    return { weight, size_type, package_type, is_gift_box, gift_box_spec, quantity, raw_desc: desc };
}

const tests = [
    "1斤礼盒装(4*125g)(大果18+) * 2",
    "1斤18+(500g) * 4"
];

for (let itemStr of tests) {
    const parsedItem = parseItemDesc(itemStr);
    let formatted = '';
    if (parsedItem.weight) formatted += parsedItem.weight + '斤';
    if (parsedItem.size_type) formatted += parsedItem.size_type;
    if (parsedItem.package_type) formatted += '（' + parsedItem.package_type + '）';
    if (parsedItem.is_gift_box) {
        if (parsedItem.gift_box_spec) formatted += parsedItem.gift_box_spec + '斤礼盒装';
        else formatted += '礼盒装';
    }
    console.log(itemStr, '=>', formatted);
}
