// const { type, name } = $arguments

// --- 定义备用节点 ---
// 用于空策略组
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}
// 用于单节点策略组，保证其在 UI 中可见
const direct_outbound = {
  tag: 'DIRECT',
  type: 'direct'
}

let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name: '组合订阅',
  type: 'collection',
  platform: 'sing-box',
  produceType: 'internal',
})

// 将所有获取的代理节点添加到配置的 outbounds 中
config.outbounds.push(...proxies)

// 定义地区分组规则
const rules = {
  'hongkong': /香港|hk|hongkong|🇭🇰/i,
  'taiwan': /台湾|tw|taiwan|🇼🇸/i,
  'japan': /日本|jp|japan|🇯🇵/i,
  'singapore': /^(?!.*(?:us)).*(新加坡|sg|singapore|🇸🇬)/i,
  'korea': /韩国|kr|korea|🇰🇷/i,
  'america': /美国|us|america|🇺🇸/i,
  'cn': /徐州|武汉|镇江|济南|🇨🇳/i,
  'other': /^(?:(?!香港|hk|hongkong|台湾|tw|taiwan|日本|jp|japan|新加坡|sg|singapore|韩国|kr|korea|美国|us|america|徐州|武汉|镇江|济南|🇭🇰|🇯🇵|🇸🇬|🇼🇸|🇰🇷|🇺🇲|🇨🇳).)*$/i,
  'all': /.*/i // 匹配所有节点
};

// 遍历策略组并根据规则添加节点
config.outbounds.forEach(group => {
  if (rules[group.tag]) {
    const regex = rules[group.tag];
    // 确保 group.outbounds 是一个数组
    if (!Array.isArray(group.outbounds)) {
      group.outbounds = [];
    }
    group.outbounds.push(...getTags(proxies, regex));
  }
});

// --- 优化部分：处理特殊策略组 ---
let compatibleAdded = false;
let directAdded = false;

config.outbounds.forEach(outbound => {
  // 只处理包含 outbounds 数组的策略组
  if (!Array.isArray(outbound.outbounds)) {
    return;
  }
  
  // 新增逻辑：如果组里只有一个节点，则添加 'DIRECT'
  if (outbound.outbounds.length === 1) {
    if (!directAdded) {
      // 检查配置中是否已存在 'DIRECT' 节点，避免重复添加
      if (!config.outbounds.some(o => o.tag === direct_outbound.tag)) {
        config.outbounds.push(direct_outbound);
      }
      directAdded = true;
    }
    outbound.outbounds.push(direct_outbound.tag);
  }
  // 原有逻辑：如果组里没有节点，则添加 'COMPATIBLE'
  else if (outbound.outbounds.length === 0) {
    if (!compatibleAdded) {
      config.outbounds.push(compatible_outbound);
      compatibleAdded = true;
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

/**
 * 根据正则表达式从代理列表中筛选并返回节点标签
 * @param {Array} proxies - 代理节点对象列表
 * @param {RegExp} [regex] - 用于测试节点标签的正则表达式
 * @returns {Array<string>} - 匹配成功的节点标签数组
 */
function getTags(proxies, regex) {
  if (!regex) {
    return proxies.map(p => p.tag);
  }
  return proxies.filter(p => regex.test(p.tag)).map(p => p.tag);
}