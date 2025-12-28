# 报平安 Web APP 需求说明

使用 next.js 开发一个报平安 Web APP。主要功能是展示飞书文档的多维表格里的数据。整体流程如下。

1. 启动时，获取飞书表格的 tenant_access_token 作为 API 凭证。
2. 只有一个单页面的前端，用户访问时，后端通过飞书表格 API 获取字段和数据记录，然后可视化展示给用户
3. 表格的数据有 30 秒的缓存时间，减少获取数据的调用频率

# 授权过程

[DOC URL](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

1. 读取 `.env` 内的 App ID 和 App Secret
2. 请求飞书 API
   HTTP POST `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal`

## 请求体示例

```
{
"app_id": "cli_slkdjalasdkjasd",
"app_secret": "dskLLdkasdjlasdKK"
}
```

## 响应体示例

```
{
"code": 0,
"msg": "ok",
"tenant_access_token": "t-caecc734c2e3328a62489fe0648c4b98779515d3",
"expire": 7111
}
```

expire 是 tenant_access_token 的过期时间，单位为秒。
过期时间小于 15 分钟时，调用这个接口获取新的 tenant_access_token。

# 读取表格字段

[DOC URL](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-field/list)

1. 读取 `.env` 内的 app_token，table_id，view_id
2. 请求飞书 API
   HTTP GET `https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/fields`

## 请求头

Authorization Bearer tenant_access_token

## 请求示例

```
curl -i -X GET 'https://open.feishu.cn/open-apis/bitable/v1/apps/B6QdbSZqEaLfK0sT78mcdt0Gndh/tables/tblptLGIoddETPiR/fields?page_size=20&view_id=vewKBMxBjJ' \
-H 'Authorization: Bearer t-g104cij2C5LH3YIFZXEZRNEL27ASRHP7OSKTFEDH'
```

## 响应示例

```
{"code":0,"data":{"has_more":false,"items":[{"field_id":"fldfl4Uosd","field_name":"编号","is_hidden":false,"is_primary":true,"property":{"auto_serial":{"type":"auto_increment_number"}},"type":1005,"ui_type":"AutoNumber"},{"field_id":"fldzgtgYyG","field_name":"提交人","is_hidden":false,"is_primary":false,"property":null,"type":1003,"ui_type":"CreatedUser"},{"field_id":"fldtRaRSXL","field_name":"提交时间","is_hidden":false,"is_primary":false,"property":{"date_formatter":"yyyy/MM/dd"},"type":1001,"ui_type":"CreatedTime"},{"field_id":"fldjQQDbIr","field_name":"楼栋号","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"opt3HJZHS0","name":"A座"},{"color":1,"id":"optaE3hyC6","name":"B座"},{"color":2,"id":"optFIWdOgm","name":"C座"},{"color":3,"id":"optWvd2oDG","name":"D座"}]},"type":3,"ui_type":"SingleSelect"},{"field_id":"fldGRphpOe","field_name":"楼层","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"opt3HJZHS0","name":"1楼"},{"color":1,"id":"optaE3hyC6","name":"2楼"},{"color":2,"id":"optFIWdOgm","name":"3楼"},{"color":3,"id":"optub2uOtY","name":"4楼"},{"color":4,"id":"optd3pqlqq","name":"5楼"},{"color":5,"id":"optmOinTEa","name":"6楼"},{"color":6,"id":"optE0ll2Po","name":"7楼"},{"color":7,"id":"opth7CZKNG","name":"8楼"},{"color":8,"id":"optvldN6QM","name":"9楼"},{"color":9,"id":"optrxb3uZX","name":"10楼"}]},"type":3,"ui_type":"SingleSelect"},{"field_id":"fld4peWd8k","field_name":"房号","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"opt3HJZHS0","name":"1室"},{"color":1,"id":"optaE3hyC6","name":"2室"},{"color":2,"id":"optFIWdOgm","name":"3室"},{"color":3,"id":"optM0zBTyR","name":"4室"},{"color":4,"id":"optOMZYrwx","name":"5室"},{"color":5,"id":"opt2ek5wi2","name":"6室"}]},"type":3,"ui_type":"SingleSelect"},{"field_id":"fldf1xK9Q1","field_name":"安全状态","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"opt3HJZHS0","name":"生命危险，急需救援"},{"color":1,"id":"optaE3hyC6","name":"危险，无法自行撤离"},{"color":2,"id":"optFIWdOgm","name":"安全，已撤离或在安全区域"}]},"type":3,"ui_type":"SingleSelect"},{"field_id":"fldTG96Y9u","field_name":"受伤情况","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"opt3HJZHS0","name":"有人员受伤，重伤"},{"color":1,"id":"optaE3hyC6","name":"有人员受伤，轻伤"},{"color":2,"id":"optFIWdOgm","name":"无人员受伤"}]},"type":3,"ui_type":"SingleSelect"},{"field_id":"fldlasctgd","field_name":"特殊情况","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"optGZNG08q","name":"有儿童"},{"color":1,"id":"optT3RZc6W","name":"有老人"},{"color":2,"id":"optlC3UVDI","name":"有孕妇"},{"color":3,"id":"optQYrWNZY","name":"有残障人士"},{"color":4,"id":"opt2dUliRg","name":"有浓烟/明火"}]},"type":4,"ui_type":"MultiSelect"},{"field_id":"fldNUL7eqe","field_name":"补充说明","is_hidden":false,"is_primary":false,"property":null,"type":1,"ui_type":"Text"},{"field_id":"fldrAPn1bK","field_name":"审核","is_hidden":false,"is_primary":false,"property":{"options":[{"color":0,"id":"optMEbAaVZ","name":"不公开"},{"color":1,"id":"opthjxWJML","name":"公开"}]},"type":3,"ui_type":"SingleSelect"}],"page_token":"fldrAPn1bK","total":11},"msg":"success"}
```

# 读取表格记录

[DOC URL](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search)

1. 读取 `.env` 内的 app_token，table_id，view_id
2. 请求飞书 API
   HTTP POST `https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/search`

## 请求头

Authorization Bearer tenant_access_token

## 查询参数

名称 page_token
类型 string
必填 否
分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会同时返回新的 page_token，下次遍历可采用该 page_token 获取查询结果
示例值："eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0="

名称 page_size
类型 int
必填 否
分页大小。最大值为 500
示例值：10
默认值：20

## 请求体

{
"view_id": "vewKBMxBjJ",
}

## 请求示例

curl -i -X POST 'https://open.feishu.cn/open-apis/bitable/v1/apps/B6QdbSZqEaLfK0sT78mcdt0Gndh/tables/tblptLGIoddETPiR/records/search?page_size=20' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer t-g104cij2C5LH3YIFZXEZRNEL27ASRHP7OSKTFEDH' \
-d '{
"view_id": "vewKBMxBjJ"
}'

## 响应示例

```
{"code":0,"data":{"has_more":false,"items":[{"fields":{"受伤情况":"无人员受伤","安全状态":"生命危险，急需救援","审核":"公开","房号":"6室","提交人":[{"en_name":"Guest User 14028","id":"ou_95c45055718d95cfb128d1bf68bff93d","name":"访客 14028"}],"提交时间":1766057488000,"楼层":"1楼","楼栋号":"A座","特殊情况":["有老人"],"编号":"9","补充说明":[{"text":"有两位老人","type":"text"}]},"record_id":"rec2HVN6iw"},{"fields":{"受伤情况":"无人员受伤","安全状态":"生命危险，急需救援","审核":"公开","房号":"2室","提交人":[{"en_name":"Guest User 89858","id":"ou_98ee6fdb619a0001af292827b9940f9d","name":"访客 89858"}],"提交时间":1766041658000,"楼层":"2楼","楼栋号":"D座","编号":"6"},"record_id":"recTz6f272"},{"fields":{"受伤情况":"无人员受伤","安全状态":"危险，无法自行撤离","审核":"公开","房号":"6室","提交人":[{"en_name":"Guest User 76054","id":"ou_3ce0e4878bad3584eccef45a107a41c8","name":"访客 76054"}],"提交时间":1766041537000,"楼层":"7楼","楼栋号":"D座","特殊情况":["有老人"],"编号":"5"},"record_id":"recETFnx2S"},{"fields":{"安全状态":"安全，已撤离或在安全区域","审核":"公开","房号":"4室","提交人":[{"en_name":"Guest User 67784","id":"ou_e9ed00601754866ad6591beafefbcd81","name":"访客 67784"}],"提交时间":1766038803000,"楼层":"5楼","楼栋号":"C座","编号":"3"},"record_id":"reclTB0N0m"},{"fields":{"受伤情况":"无人员受伤","安全状态":"安全，已撤离或在安全区域","审核":"公开","房号":"4室","提交人":[{"en_name":"Guest User 67784","id":"ou_e9ed00601754866ad6591beafefbcd81","name":"访客 67784"}],"提交时间":1766038684000,"楼层":"6楼","楼栋号":"A座","编号":"2"},"record_id":"rec5Suq22r"},{"fields":{"受伤情况":"有人员受伤，重伤","安全状态":"生命危险，急需救援","审核":"公开","房号":"2室","提交人":[{"en_name":"Guest User 67784","id":"ou_e9ed00601754866ad6591beafefbcd81","name":"访客 67784"}],"提交时间":1766038568000,"楼层":"3楼","楼栋号":"A座","特殊情况":["有儿童"],"编号":"1"},"record_id":"recsDpHL2s"}],"total":6},"msg":"success"}
```

# 前端可视化展示

1. 楼栋号，楼层，房号，根据字段 API 的返回情况，调整前端展示。
2. 页面最上方是 tag，用于切换楼栋号。tag 名字就是楼栋名字，比如 A 座。
3. 页面的内容是一个表格。每一行代表一个楼层，每一列代表一个房号。
4. 表格单元格的内容，显示一种颜色。颜色根据表格记录里最晚一条对应这个楼栋楼层房号的记录来定。表格获取时，已经按时间从晚到早排序。
5. 如果安全状态是“安全...”，显示绿色。如果是“危险...”，显示橙色。如果是“生命危险...”，显示红色。
6. 点击单元格，右侧会展示详情列表。列表里每个元素对应这个楼栋楼层房号的记录。展示安全状态，受伤情况，特殊情况，补充说明。
7. 标题右侧加一个按钮，按钮文字是：我要提交信息。点击按钮后在新窗口打开一个地址。这个地址保存在.env 文件里
8. 标题下方显示一共数据条数，最后一条数据更新时间

`.env.local` 参考内容

```
# 飞书应用凭证
FEISHU_APP_ID=
FEISHU_APP_SECRET=

# 飞书多维表格信息
FEISHU_APP_TOKEN=
FEISHU_TABLE_ID=
FEISHU_VIEW_ID=

NEXT_PUBLIC_SUBMIT_URL=
```

需要注意：

1. 表格每一列为等宽。内容为绿色的安全，橙色的危险，红色的紧急。
2. 在获取飞书 API 时，增加 log，展示每个 api 获取的时间。
3. nextjs 后端在 fetch 时，会自动开启缓存，关闭不需要的缓存。
4. 飞书表格 API 调用较慢，可以优化为双层缓存。新鲜缓存 30 秒，旧数据缓存 5 分钟。
5. 用户访问时，如果无有效缓存，服务器先返回一个等待的状态，前端显示表格加载的骨架动画。后端异步刷新数据。前端 2 秒后重试。
6. 代码风格简洁优雅。
