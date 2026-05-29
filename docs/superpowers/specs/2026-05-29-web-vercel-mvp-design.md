# 中国足球未来之星 Web/Vercel MVP 改造设计

## 背景

当前项目已经完成“小将抖音小程序版本”的 MVP 骨架，包括 Taro 小程序前台、Express API、React 管理后台、Prisma/SQLite 数据模型和共享隐私字段规则。当前版本已保存为文件快照：

`版本存档/小将抖音小程序版本.zip`

下一阶段目标是把项目调整为可部署到 Web 平台的版本，优先适配 Vercel，并使用 Neon Postgres 作为线上数据库。

## 第一版 Web 目标

Web 版目标是一个可部署、可运营的完整 MVP：

- 公开网站可以浏览首页、未来之星列表、赛程列表。
- 用户可以提交球员或赛事线索。
- 管理员可以通过密码登录后台。
- 后台可以查看球员、赛事、提交记录并审核提交。
- 数据保存到线上 Postgres 数据库。
- 公开接口不返回未成年人敏感字段。
- 项目可以作为一个 Vercel 项目部署。

## 不做范围

Web 第一版不做：

- 全球青训营资料板块。
- 热门赛事回放或视频聚合。
- 评论、社区、打分、排行榜。
- 球员认领和普通用户登录。
- 多管理员角色权限。
- 完整内容 CMS 编辑器。

## 技术路线

采用一个 Next.js Web 应用承载前台、后台和 API：

- `apps/web`：Next.js 应用，部署到 Vercel。
- `packages/shared`：继续保存共享类型和隐私字段规则。
- Prisma：继续作为 ORM。
- 数据库：从 SQLite 改为 Postgres，线上使用 Neon。

当前 `apps/api`、`apps/admin`、`apps/miniapp` 保留作为历史小程序版本参考，不作为 Web 版部署入口。Web 版实现集中到 `apps/web`，避免多个 Vercel 项目和跨项目 API 配置。

## 路由结构

公开页面：

- `/`：首页，展示主视觉、本周未来之星、近期亮点、即将开赛、资料提交入口。
- `/players`：未来之星列表，支持搜索和筛选。
- `/players/[id]`：球员详情，展示公开资料和重要参赛记录。
- `/events`：赛程列表，支持按日期、地区、年龄组等筛选。
- `/events/[id]`：赛事详情，展示赛事信息和赛程。
- `/submit`：资料提交页面。

后台页面：

- `/admin/login`：管理员登录。
- `/admin`：后台首页，展示球员、赛事、提交审核的运营概览。
- `/admin/players`：球员管理。
- `/admin/events`：赛事和赛程管理。
- `/admin/submissions`：提交审核。

API 路由：

- `/api/public/home`
- `/api/public/players`
- `/api/public/players/[id]`
- `/api/public/events`
- `/api/public/events/[id]`
- `/api/public/submissions`
- `/api/admin/login`
- `/api/admin/logout`
- `/api/admin/me`
- `/api/admin/players`
- `/api/admin/events`
- `/api/admin/submissions`

## 数据模型

沿用当前 Prisma 模型，并把 datasource 从 SQLite 改为 Postgres。

核心模型：

- `Player`
- `Event`
- `Match`
- `Submission`
- `AdminUser`

字段语义保持不变：

- `Player` 保存公开字段和后台私有字段。
- `Event` 保存赛事信息和上架状态。
- `Match` 归属于赛事。
- `Submission` 保存用户提交线索，默认 `PENDING`。
- `AdminUser` 保存后台管理员账号和密码哈希。

## 隐私边界

公开页面和公开 API 只能读取公开字段。

公开可返回：

- `id`
- `name`
- `ageGroup`
- `position`
- `teamName`
- `region`
- `traits`
- `bio`
- `coverUrl`
- `publicVideoUrl`
- `isFeatured`
- `featureOrder`

公开不可返回：

- `birthday`
- `heightCm`
- `weightKg`
- `dominantFoot`
- `schoolOrOrg`
- `contactName`
- `contactPhone`
- `source`
- `adminNotes`
- `publicLevel`
- `isPublished`

后台页面和后台 API 必须要求管理员会话。

## 后台登录与会话

Web 版后台不再使用前端保存的固定管理 token。

第一版采用：

- 管理员用户名和密码登录。
- 密码使用 bcrypt 哈希保存。
- 登录成功后写入 HTTP-only Cookie。
- Cookie 使用 `SESSION_SECRET` 签名或加密。
- 后台 API 通过 Cookie 判断是否登录。
- 生产环境必须设置 `SESSION_SECRET`。

环境变量：

- `DATABASE_URL`：Neon Postgres 连接串。
- `ADMIN_USERNAME`：初始化管理员账号。
- `ADMIN_PASSWORD_HASH`：初始化管理员密码哈希。
- `SESSION_SECRET`：会话密钥。

本地开发可以使用 `.env.local`。

## 前台体验

Web 前台继承原小程序的信息架构，但改成浏览器体验：

- 首页保留热血青训媒体感。
- 首页推荐流只是入口，用户可以点击进入更多内容。
- 球员列表页更适合桌面和移动端浏览，提供搜索和筛选。
- 赛程页突出“近期有什么比赛”。
- 提交页保持轻量，先做基本字段校验，提交后进入审核。

Web 版第一屏应清楚表达“中国足球未来之星”，不能变成泛泛的后台工具页面。

## 后台体验

后台以运营效率为主：

- 左侧或顶部导航进入球员、赛事、提交审核。
- 球员管理支持查看、创建、编辑、上下架、设置首页推荐。
- 赛事管理支持查看、创建、编辑、上下架，并管理赛程。
- 提交审核支持查看提交内容、标记 `PENDING`、`ADOPTED`、`REJECTED`。

第一版可以使用表单和列表完成运营，不需要复杂拖拽和高级 CMS。

## 部署设计

Vercel 部署：

- Root directory 指向仓库根目录。
- Build command 使用 Web 应用构建命令。
- Output 由 Next.js/Vercel 自动处理。
- Vercel 环境变量配置 `DATABASE_URL`、`ADMIN_USERNAME`、`ADMIN_PASSWORD_HASH`、`SESSION_SECRET`。

Neon：

- 创建 Postgres 数据库。
- 将连接串配置到 Vercel `DATABASE_URL`。
- 使用 Prisma migrate 初始化线上表结构。

## 从当前项目迁移

保留：

- `packages/shared` 中的类型和隐私规则。
- Prisma 模型字段语义。
- 示例 seed 数据的思路。
- 当前公开 API 和后台 API 的业务行为。

新增：

- `apps/web` Next.js 应用。
- Web 页面和 API 路由。
- Cookie 登录会话。
- Postgres Prisma schema。
- Vercel 部署文档。

暂不删除：

- `apps/miniapp`
- `apps/admin`
- `apps/api`

它们作为“小将抖音小程序版本”的代码参考保留，后续确认 Web 版稳定后再决定是否清理。

## 测试与验收

必须验证：

- 公开 API 不返回敏感字段。
- 未上架球员和赛事不出现在公开页面。
- 用户提交资料后状态为 `PENDING`。
- 未登录不能访问后台页面和后台 API。
- 登录后可以查看后台数据。
- 后台审核提交状态正确。
- Web 构建通过。
- Vercel 部署能读取 Neon 数据库。

## 未决但不阻塞

- 正式域名。
- 图片上传和对象存储。
- 线上管理员密码哈希生成流程。
- 是否将旧的 `apps/api`、`apps/admin`、`apps/miniapp` 在 Web 版稳定后归档或删除。
