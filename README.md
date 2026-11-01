# CC Wiki

面向多仓库的 Wiki 浏览器前端。内容不打包进站点，而是在运行时从「仓库」读取——可以是本地文件夹，也可以是任意静态服务器上的目录。

## 简介

CC Wiki 把「仓库」抽象成统一的数据源：本地目录通过 File System Access API 读取，远程仓库通过 HTTP 读取 `config.json` 和
`docs/` 目录。仓库列表会持久化到 IndexedDB，启动时自动加载。

页面切换使用 View Transition：只有当两侧标题文字相同时，标题才会作为共享元素做过渡动画。

## 功能

- 多仓库、多级目录浏览，仓库可本地添加或通过地址添加
- 本地 / HTTP 仓库适配，路径解析规则统一
- Markdown 渲染：`markdown-it` 解析为 token，再转换为 Vue VNode，HTML 经 DOMPurify 清洗
- 图片处理：骨架屏、加载失败回落、引用计数缓存、PhotoSwipe 灯箱
- 支持相对路径、仓库根路径、跨本地仓库 `local://` 引用以及 `http(s)` / `data:` / `blob:` 地址
- 路由切换动画与标题溢出跑马灯
- 主题（自动 / 浅色 / 深色）与多语言（`zh_cn` / `zh_ms` / `en_us`），设置保存在 `localStorage`
- 移动端布局适配

## 技术栈

Vue 3 + TypeScript + Vite（rolldown-vite）、Pinia、Vue Router（hash
模式）、PrimeVue、markdown-it、PhotoSwipe、zod、axios、vue-i18n、better-auth。

代码检查使用 oxlint + ESLint，格式化使用 Prettier，单元测试使用 Vitest。

## 快速开始

环境要求：

- Node.js `^20.19.0` 或 `>=22.12.0`
- pnpm `11.x`

```bash
pnpm install
pnpm dev        # 开发服务器，默认 http://localhost:5173
pnpm build      # 类型检查 + 生产构建，输出到 dist/
pnpm preview    # 预览构建结果
pnpm test:unit  # 运行 Vitest
pnpm lint       # oxlint + eslint（带 --fix）
pnpm format     # Prettier 格式化 src/
```

## 目录结构

```
src/
├─ adapters/       # 仓库与图片路径适配（local / http）
├─ components/     # docs、settings、user、notice 等组件
├─ composables/    # 路由过渡、窗口尺寸、文本溢出
├─ router/         # 路由表
├─ stores/         # 数据源、图片缓存、设置、通知
├─ utils/          # tokenToVNode、viewTransition、auth-client 等
├─ views/          # 首页、文档、关于、登录、聊天等页面
└─ assets/json/    # 默认设置与多语言文案
```

## Wiki 仓库格式

仓库根目录需要包含 `config.json`，内容放在 `docs/{语言}/` 下。语言目录名与设置中的语言一致（`zh_cn`、`zh_ms`、`en_us`）：

```
<仓库根>
├─ config.json
└─ docs/
   └─ zh_cn/
      ├─ _meta.json          # 目录页配置
      ├─ config.json         # 内容页配置
      └─ index.md            # 内容页正文
```

### `config.json`（仓库）

```json
{
  "id": "ccwiki",
  "version": "1.0.0",
  "name": {
    "zh_cn": "示例仓库",
    "en_us": "Example Repo"
  },
  "icon": "icon.svg"
}
```

- `id`：仓库唯一标识，会出现在路由与 `local://` 引用中。不能为空，且不能包含 `/ \ # ? % :` 以及控制字符
- `version`：必填
- `name`：可选，按语言提供显示名称
- `icon`：可选，相对仓库根的路径或完整 URL

### `_meta.json`（目录页）

```json
{
  "title": "分类名称",
  "introduction": "可选的简介",
  "children": {
    "guide": {
      "title": "指南",
      "icon": "guide/icon.svg",
      "introduction": "子项简介",
      "childrenIcon": {
        "other": "other/icon.svg"
      }
    }
  }
}
```

`children` 的 key 就是子目录名。`icon` 可省略，`childrenIcon` 用于在卡片上展示子项的小图标。

### `config.json`（内容页）

```json
{
  "name": "页面标题",
  "icon": "icon.svg"
}
```

正文来自同目录的 `index.md`。

> 同一目录下 `_meta.json` 与 `config.json` 同时存在时，优先显示目录页。

### 图片路径

| 写法                           | 含义                 |
|--------------------------------|----------------------|
| `a.png`、`./a.png`             | 当前目录             |
| `../a.png`                     | 上一级目录           |
| `/a.png`                       | 仓库根目录           |
| `local://otherRepo:path/a.png` | 其他本地仓库中的图片 |
| `https://…`、`data:`、`blob:`  | 直接加载             |

以 `/` 开头的路径在本地仓库和 HTTP 仓库中都表示 **仓库根**，而不是站点根。

## 部署

推送到 `main` 分支后，GitHub Actions 会依次执行类型检查、构建，并把 `dist/` 发布到 `actions-pages` 分支（见
`.github/workflows/build.yml`）。

如果部署在子路径下（例如 `/ccwiki/`），需要在 `vite.config.ts` 中把 `base` 改成对应的子路径。

路由使用 hash 模式，静态托管不需要额外的 rewrite 规则。

## 当前状态与限制

- 本地仓库依赖 File System Access API，需要使用 Chromium 系浏览器
- 仓库列表与配置保存在 IndexedDB，更换浏览器或域名后需要重新添加
- 图片通过 `blob:` URL 缓存（本地仓库），刷新后重新生成
- 对话页（`/chat/`）目前是静态演示，尚未接入后端
- 账号功能依赖远程 better-auth 服务

## 许可证

本项目使用 [GNU Affero General Public License v3.0](LICENSE)。