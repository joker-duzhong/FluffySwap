# Changelog

## 2026-05-08

- 重构 AuraKey 微信小程序前端为“模板 / 我的”双 Tab 结构，移除旧发现、作品、创作抽屉等冗余框架代码。
- 首页模板分类改为读取 `/api/v1/aurakey/gallery/categories`，模板列表与详情使用 gallery 相关接口。
- 按设计稿重做模板首页、模板详情、我的页、登录页、会员页、积分明细页、邀请海报页、作品管理页和生成页。
- 新增 `aurakeyApi` 语义化接口层，统一保留后端返回结构并做页面数据适配。
- 新增前端二维码渲染能力，邀请海报使用 `uqrcodejs` 生成二维码矩阵。
- 将 Figma 导出的静态素材重命名为语义化文件名，并集中到 `src/config/assets.ts` 引用。
- 删除旧 `AuraIcon`、旧 SVG 图标配置和旧 API 二次封装，保留更干净的 common/page components 结构。
- 删除未使用的 `src/lib` OpenAPI 生成 SDK，并移除 `@hey-api/openapi-ts` 依赖。
