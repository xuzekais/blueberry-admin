const { calculateFreight } = require('../utils/freightCalculator');

// Mock 数据模版 (对应的就是我们刚刚在前端页面里配置的样子)
const mockFreightRules = [
    {
        regions: ['广东省内'],
        sizes: ['大果', '中果', '小果'],
        free_weight: 1.0, // 满1kg包邮
        first_weight: 1.0,
        first_price: 8,
        extra_weight: 1.0,
        extra_price: 2
    },
    {
        regions: ['广东省内'],
        sizes: ['红果', '次果'],
        free_weight: 0, // 0表示不包邮
        first_weight: 1.0,
        first_price: 10,
        extra_weight: 1.0,
        extra_price: 5
    },
    {
        regions: ['广东省外'],
        sizes: ['全部'],
        free_weight: 0,
        first_weight: 1.0,
        first_price: 15,
        extra_weight: 1.0,
        extra_price: 6
    }
];

function runTests() {
    let successCount = 0;
    console.log('🔄 开始运行运费计算白盒测试...\n');

    // ========== 测试用例 1 ==========
    // 1斤大果 + 1斤中果 + 1斤红果 (共1.5kg)，发广东省内
    const cart1 = [
        { size: '大果', weight: 0.5 },
        { size: '中果', weight: 0.5 },
        { size: '红果', weight: 0.5 }
    ];
    const res1 = calculateFreight(mockFreightRules, cart1, '广东省内');
    const pass1 = res1.totalFreight === 0;
    console.log(`[用例1] 省内混合触发整单包邮 -> 预期: 0, 实际: ${res1.totalFreight} | ${pass1 ? '✅ PASS' : '❌ FAIL'}`);
    if(pass1) successCount++;

    // ========== 测试用例 2 ==========
    // 1斤大果 + 1斤中果 + 1斤红果 (共1.5kg)，发广东省外
    const cart2 = [
        { size: '大果', weight: 0.5 },
        { size: '中果', weight: 0.5 },
        { size: '红果', weight: 0.5 }
    ];
    const res2 = calculateFreight(mockFreightRules, cart2, '广东省外');
    const pass2 = res2.totalFreight === 21; // 首重15 + 续重6 = 21
    console.log(`[用例2] 省外不分果径按总重量统一计价 -> 预期: 21, 实际: ${res2.totalFreight} | ${pass2 ? '✅ PASS' : '❌ FAIL'}`);
    if(pass2) successCount++;

    // ========== 测试用例 3 ==========
    // 0.5斤大果 + 1斤红果 (共0.75kg)，发广东省内，未能触发全单包邮
    const cart3 = [
        { size: '大果', weight: 0.25 }, // 不够 1kg
        { size: '红果', weight: 0.5 } 
    ];
    const res3 = calculateFreight(mockFreightRules, cart3, '广东省内');
    const pass3 = res3.totalFreight === 18; // 大果单独算8元 + 红果单独算10元 = 18元
    console.log(`[用例3] 省内未达包邮线且各自独立结算叠加 -> 预期: 18, 实际: ${res3.totalFreight} | ${pass3 ? '✅ PASS' : '❌ FAIL'}`);
    if(pass3) successCount++;

    console.log(`\n🎉 测试完成: 成功 ${successCount}/3`);
}

runTests();