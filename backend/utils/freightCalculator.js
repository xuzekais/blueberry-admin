/**
 * 运费结算核心计算器
 * @param {Array} freightRules 运费模版的组合规则 (JSON)
 * @param {Array} cartItems 购物车物品列表: [{ size: '大果', weight: 0.5 }, { size: '红果', weight: 0.5 }]
 * @param {String} region 收货地区, 例如: '广东省内'
 */
function calculateFreight(freightRules, cartItems, region) {
    // 1. 过滤出适应该地区的规则
    const regionRules = freightRules.filter(rule => 
        rule.regions.includes(region) || rule.regions.includes('默认')
    );

    if (regionRules.length === 0) {
        return { totalFreight: 0, isFree: false, note: '未匹配到该地区规则，默认免邮或不可配送(视业务而定)' };
    }

    // 2. 将购物车中的物品跟规则进行匹配分组
    // 优先匹配精准果径，其次匹配 "全部"
    const ruleBuckets = regionRules.map(r => ({ rule: r, items: [], totalWeight: 0 }));
    const unmappedItems = [];

    cartItems.forEach(item => {
        let matchedBucket = null;
        // 尝试匹配特定的果径
        matchedBucket = ruleBuckets.find(b => b.rule.sizes.includes(item.size));
        // 如果没找到，尝试匹配包含了 "全部" 的规则
        if (!matchedBucket) {
            matchedBucket = ruleBuckets.find(b => b.rule.sizes.includes('全部'));
        }

        if (matchedBucket) {
            matchedBucket.items.push(item);
            matchedBucket.totalWeight += item.weight;
        } else {
            unmappedItems.push(item);
        }
    });

    // 3. 检查是否有规则组合“突破了包邮门槛”并且免邮
    let hasAbsoluteFreeShipping = false;
    for (const bucket of ruleBuckets) {
        if (bucket.rule.free_weight > 0 && bucket.totalWeight >= bucket.rule.free_weight) {
            hasAbsoluteFreeShipping = true;
            break;
        }
    }

    // [核心业务逻辑] 如果有任意一组主果满足了包邮条件，整个订单包邮！
    if (hasAbsoluteFreeShipping) {
        return {
            totalFreight: 0,
            isFree: true,
            note: '订单中部分商品满足全单包邮条件，运费全免'
        };
    }

    // 4. 如果没有满足全单包邮条件，则分别独立阶梯计算各个规则篮子的运费，并求和
    let totalFreight = 0;
    
    for (const bucket of ruleBuckets) {
        if (bucket.totalWeight === 0) continue; // 并未匹配到任何商品，跳过

        const rule = bucket.rule;
        let bucketFee = rule.first_price; // 加上首重费

        // 计算超出首重部分的续重
        if (bucket.totalWeight > rule.first_weight) {
            const extraWeight = bucket.totalWeight - rule.first_weight;
            // 续重次数，向上取整 (例如超出 0.5kg，按续重 1kg/次算，就是1次)
            const extraCount = Math.ceil(extraWeight / rule.extra_weight);
            bucketFee += extraCount * rule.extra_price;
        }

        totalFreight += bucketFee;
    }

    return {
        totalFreight: totalFreight,
        isFree: totalFreight === 0,
        note: '各个规则分别计算后叠加得出的运费'
    };
}

module.exports = {
    calculateFreight
};
