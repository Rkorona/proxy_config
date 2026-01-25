const yaml = ProxyUtils.yaml.safeLoad($content ?? $files[0])
/**
let clashMetaProxies = await produceArtifact({
  type: 'collection',
  name: 'FlClash',
  platform: 'ClashMeta',
  produceType: 'internal'
})
**/

// 使用方括号 [] 来访问带中划线的属性名
yaml['proxy-providers'].free.url = ""

//yaml.proxies.unshift(...clashMetaProxies)
$content = ProxyUtils.yaml.dump(yaml)
