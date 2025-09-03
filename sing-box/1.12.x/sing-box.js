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
  /**
  if (['all', 'all-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies))
  }
  **/
  if (['hk', 'hk-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /港|hk|hongkong|kong kong|🇭🇰/i))
  }
  if (['tw', 'tw-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /台|tw|taiwan|🇼🇸/i))
  }
  if (['jp', 'jp-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /日本|jp|japan|🇯🇵/i))
  }
  if (['sg', 'sg-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?!.*(?:us)).*(新|sg|singapore|🇸🇬)/i))
  }
  if (['korea', 'korea-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /韩|kr|korea|🇰🇷/i))
  }
  if (['us', 'us-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /美|us|unitedstates|america|🇺🇸/i))
  }
  if (['cn', 'cn-auto'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /徐州|武汉|镇江|济南|🇨🇳/i))
  }
  if (['other'].includes(i.tag)) {
    i.outbounds.push(...getTags(proxies, /^(?:(?!港|hk|hongkong|kong kong|台|tw|taiwan|日本|jp|japan|新|sg|singapore|韩|kr|korea|美|us|unitedstates|united states|徐州|武汉|镇江|济南|🇭🇰|🇯🇵|🇸🇬|🇼🇸|🇰🇷|🇺🇲|🇨🇳).)*$/i))
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