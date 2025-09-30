const { type, name } = $arguments
const compatible_outbound = {
  tag: 'COMPATIBLE',
  type: 'direct',
}

let compatible
let config = JSON.parse($files[0])
let proxies = await produceArtifact({
  name: '组合订阅',
  type: 'collection', // /^1$|col/i.test(type) ? 'collection' : 'subscription',
  platform: 'sing-box',
  produceType: 'internal',
})

config.outbounds.push(...proxies)

config.outbounds.map(i => {
  if (['hongkong'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /香港|hk|hongkong|🇭🇰/i))
  }
  if (['taiwan'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /台湾|tw|taiwan|🇼🇸/i))
  }
  if (['japan'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /日本|jp|japan|🇯🇵/i))
  }
  if (['singapore'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新加坡|sg|singapore|🇸🇬)/i))
  }
  if (['korea'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /韩国|kr|korea|🇰🇷/i))
  }
  if (['america'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /美国|us|america|🇺🇸/i))
  }
  if (['cn'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /徐州|武汉|镇江|济南|🇨🇳/i))
  }
  if (['other'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?:(?!香港|hk|hongkong|台湾|tw|taiwan|日本|jp|japan|新加坡|sg|singapore|韩国|kr|korea|美国|us|america|徐州|武汉|镇江|济南|🇭🇰|🇯🇵|🇸🇬|🇼🇸|🇰🇷|🇺🇲|🇨🇳).)*$/i))
  }
  if (['all'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
})

config.outbounds.forEach(outbound => {
  if (Array.isArray(outbound.outbounds) && outbound.outbounds.length === 0) {
    if (!compatible) {
      config.outbounds.push(compatible_outbound)
      compatible = true
    }
    outbound.outbounds.push(compatible_outbound.tag);
  }
});

$content = JSON.stringify(config, null, 2)

function getTags(proxies, regex) {
  return (regex ? proxies.filter(p => regex.test(p.tag)) : proxies).map(p => p.tag)
}