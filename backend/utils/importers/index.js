const miniProgramImporter = require('./miniProgramImporter');

const importStrategies = {
    'miniprogram': miniProgramImporter.parseMiniProgramOrders,
    // future expandability for 'jd', 'pdd', 'douyin' etc.
};

/**
 * 导入处理入口
 * @param {String} source - 导入源 (小程序的代号等)
 * @param {Buffer} buffer - 导入文件的 Buffer
 */
async function parseOrdersBySource(source, buffer) {
    const strategy = importStrategies[source];
    if (!strategy) {
        throw new Error(`未找到对于数据源 ${source} 的解析策略`);
    }

    // 执行对应的解析功能
    return await strategy(buffer);
}

module.exports = {
    parseOrdersBySource
};
