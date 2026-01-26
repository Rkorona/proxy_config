// const { type, name } = $arguments

// ==================== 备用节点 ====================
const COMPATIBLE = { tag: 'COMPATIBLE', type: 'http' }
const DIRECT = { tag: 'DIRECT', type: 'direct' }
const REJECT = {
  tag: 'REJECT',
  type: 'http'
}
// ==================== 读取配置 ====================
let config = JSON.parse($files[0])

// ==================== 获取代理节点 ====================
let proxies = await produceArtifact({
  name: 'Netcup_Hostdzire',
  type: 'collection',
  platform: 'sing-box',
  produceType: 'internal',
})

// 加入节点
config.outbounds.push(...proxies)

// ==================== 分组规则 ====================
// ⚠️ 注意：all 不参与 matched 统计
const rules = {
  hongkong: /香港|hk|hongkong|🇭🇰/i,
  taiwan: /台湾|tw|taiwan|🇼🇸/i,
  japan: /日本|jp|japan|🇯🇵/i,
  singapore: /新加坡|sg|singapore|🇸🇬/i,
  korea: /韩国|kr|korea|🇰🇷/i,
  america: /美国|us|america|🇺🇸/i,
  cn: /徐州|武汉|镇江|济南|🇨🇳/i,
  hostdzire: /hostdzire|hd/i,
  all: /.*/i,
}

// ==================== 工具函数 ====================
function getTags(list, regex) {
  return list.filter(p => regex.test(p.tag)).map(p => p.tag)
}

function ensureOutbound(outbound) {
  if (!config.outbounds.some(o => o.tag === outbound.tag)) {
    config.outbounds.push(outbound)
  }
}

// ==================== 只处理策略组 ====================
const policyGroups = config.outbounds.filter(
  o => Array.isArray(o.outbounds)
)

// ==================== 规则匹配（不含 all） ====================
const matchedTags = new Set()

policyGroups.forEach(group => {
  const regex = rules[group.tag]
  if (!regex || group.tag === 'all') return

  const tags = getTags(proxies, regex)

  const set = new Set(group.outbounds)
  tags.forEach(t => {
    set.add(t)
    matchedTags.add(t)
  })

  group.outbounds = [...set]
})

// ==================== all 组（全部节点） ====================
const allGroup = policyGroups.find(g => g.tag === 'all')
if (allGroup) {
  const set = new Set(allGroup.outbounds)
  proxies.forEach(p => set.add(p.tag))
  allGroup.outbounds = [...set]
}

// ==================== other 组（未命中地区规则的节点） ====================
const otherGroup = policyGroups.find(g => g.tag === 'other')
if (otherGroup) {
  const otherTags = proxies
    .map(p => p.tag)
    .filter(t => !matchedTags.has(t))

  const set = new Set(otherGroup.outbounds)
  otherTags.forEach(t => set.add(t))
  otherGroup.outbounds = [...set]
}

// ==================== UI 友好兜底 ====================

policyGroups.forEach(group => {
  const set = new Set(group.outbounds)

  if (set.size === 0) {
    ensureOutbound(COMPATIBLE)
    set.add(COMPATIBLE.tag)
  } else if (set.size === 1) {
    ensureOutbound(REJECT)
    set.add(REJECT.tag)
  }

  group.outbounds = [...set]
})

// ==================== 输出 ====================
$content = JSON.stringify(config, null, 2)
