#!/system/bin/sh
# /data/adb/box/scripts/update_sub.sh
URL="https://substore.rkorona.de/rkorona/api/file/mihomo-box4magisk"
DIR=/data/adb/box/mihomo
BIN=/data/adb/box/bin/mihomo

curl -fsSL --connect-timeout 20 --retry 2 "$URL" -o $DIR/config.new || exit 1
# 内容太小基本是下载到了错误页
[ "$(wc -c < $DIR/config.new)" -gt 2000 ] || exit 1

$BIN -t -d $DIR -f $DIR/config.new >/dev/null 2>&1 || exit 1

cp $DIR/config.yaml $DIR/config.yaml.bak
mv $DIR/config.new $DIR/config.yaml

# 热重载（secret 为空，所以不用带认证头）
curl -s -X PUT "127.0.0.1:9090/configs?force=true" \
  -d "{\"path\":\"$DIR/config.yaml\"}"