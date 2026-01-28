// const { type, name } = $arguments

// ==================== 备用节点 ====================
const COMPATIBLE = { tag: 'COMPATIBLE', type: 'http' }
const DIRECT = { tag: '直接连接', type: 'direct' }
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

// 分组规则
const rules = {
  香港策略: /港|🇭🇰|HK|Hong|HKG/i,
  台湾策略: /台|🇼🇸|🇹🇼|TW|tai|TPE|TSA|KHH/i,
  日本策略: /日|🇯🇵|JP|Japan|NRT|HND|KIX|CTS|FUK/i,
  狮城策略: /坡|🇸🇬|SG|Sing|SIN|XSP/i,
  韩国策略: /韩|🇰🇷|韓|首尔|南朝鲜|KR|KOR|Korea|South/i,
  美国策略: /美|🇺🇸|US|USA|JFK|SJC|LAX|ORD|ATL|DFW|SFO|MIA|SEA|IAD|Plus|Australia/i,
  欧盟策略: /奥|比|保|克罗地亚|塞|捷|丹|爱沙|芬|法|德|希|匈|爱尔|意|拉|立|卢|马其它|荷|波|葡|罗|斯洛伐|斯洛文|西|瑞|英|🇧🇪|🇨🇿|🇩🇰|🇫🇮|🇫🇷|🇩🇪|🇮🇪|🇮🇹|🇱🇹|🇱🇺|🇳🇱|🇵🇱|🇸🇪|🇬🇧|CDG|FRA|AMS|MAD|BCN|FCO|MUC|BRU/i,
  冷门自选: /^(?!.*(DIRECT|直接连接|美|港|坡|台|新|日|韩|奥|比|保|克罗地亚|塞|捷|丹|爱沙|芬|法|德|希|匈|爱尔|意|拉|立|卢|马其它|荷|波|葡|罗|斯洛伐|斯洛文|西|瑞|英|🇭🇰|🇼🇸|🇹🇼|🇸🇬|🇯🇵|🇰🇷|🇺🇸|🇬🇧|🇦🇹|🇧🇪|🇨🇿|🇩🇰|🇫🇮|🇫🇷|🇩🇪|🇮🇪|🇮🇹|🇱🇹|🇱🇺|🇳🇱|🇵🇱|🇸🇪|HK|TW|SG|JP|KR|US|GB|CDG|FRA|AMS|MAD|BCN|FCO|MUC|BRU|HKG|TPE|TSA|KHH|SIN|XSP|NRT|HND|KIX|CTS|FUK|JFK|LAX|ORD|ATL|DFW|SFO|MIA|SEA|IAD|LHR|LGW)).*/i,
  全球手动: /^(?!.*(DIRECT|直接连接|群|邀请|返利|循环|官网|客服|网站|网址|获取|订阅|流量|到期|机场|下次|版本|官址|备用|过期|已用|联系|邮箱|工单|贩卖|通知|倒卖|防止|国内|地址|频道|无法|说明|使用|提示|特别|访问|支持|教程|关注|更新|作者|加入|USE|USED|TOTAL|EXPIRE|EMAIL|Panel|Channel|Author)).*/i
}

// ==================== 工具函数 ====================
function getTags(list, regex) {
  return list
    .filter(p => new RegExp(regex.source, regex.flags).test(p.tag))
    .map(p => p.tag)
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
/**
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
**/
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
