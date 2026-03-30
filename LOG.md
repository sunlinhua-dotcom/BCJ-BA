# 佰草集 BCJ_BAGC · 项目开发完整日志

> **记录规范**：时间正序排列，每个 commit/任务独立区块，状态标注 ✅已完成 / 🔄进行中 / 📋待开发  
> **最后更新**：2026-03-30 16:04  
> **维护原则**：每次开发前先写需求到本文件，开发后补记结果，防止上下文丢失

---

## 📁 项目完整目录结构

```
herborist-app/
├── 📄 Dockerfile                      # 自定义 Docker 构建（跳过 npm update -g）
├── 📄 LOG.md                          # 本文件，项目完整开发日志
├── 📄 README.md                       # 项目说明
├── 📄 next.config.ts                  # Next.js 配置（output: standalone）
├── 📄 package.json                    # 依赖配置（Next 16.1.4 / React 19）
├── 📄 tsconfig.json                   # TypeScript 配置
├── 📄 eslint.config.mjs               # ESLint 配置
├── 📄 compress-images.js              # 图片压缩脚本（根目录工具）
│
├── app/                               # Next.js App Router
│   ├── 📄 layout.tsx                  # 全局布局（Noto Serif SC字体 / SEO meta）
│   ├── 📄 page.tsx                    # 主页（步骤式表单：角色→产品→场景→生成）
│   ├── 📄 globals.css                 # 全局样式（设计系统 + 组件样式）
│   ├── api/
│   │   ├── generate/
│   │   │   └── 📄 route.ts            # POST /api/generate（并行图文生成主接口）
│   │   └── records/
│   │       └── 📄 route.ts            # GET /api/records（历史记录查询接口）
│   ├── data/
│   │   ├── 📄 copy_library.json       # 本地兜底文案库（当前为空，待填充）
│   │   └── 📄 fortunes.json           # 40条古风签文（Loading页随机显示）
│   ├── records/
│   │   └── 📄 page.tsx                # /records 历史记录页（表格展示）
│   └── result/
│       └── 📄 page.tsx                # /result 结果页（图片+文案+复制/分享）
│
├── components/                        # 可复用 React 组件
│   ├── 📄 Header.tsx                  # 顶部导航栏（Logo + 品牌名）
│   ├── 📄 FortuneLoading.tsx          # 生成等待页（古风签文 + 品牌加载语 + 进度条）
│   ├── 📄 RoleSelector.tsx            # BA/KOC 角色选择卡片
│   ├── 📄 KOCLabels.tsx               # KOC 精准标签选择（肤质/年龄/场景）
│   ├── 📄 StepIndicator.tsx           # 步骤指示器（1→2→3）
│   ├── 📄 ProductSelector.tsx         # 产品选择卡（4款产品）
│   └── 📄 EnvironmentUploader.tsx     # 场景图上传组件（拖拽/点击/预览）
│
├── lib/                               # 核心业务逻辑
│   ├── 📄 gemini.ts                   # Gemini AI 集成（图像生成 + 文案生成）
│   ├── 📄 constants.ts                # 全局常量（产品/角色/标签/文案标签）
│   ├── 📄 records.ts                  # 生成记录读写（JSON文件持久化）
│   └── 📄 client-compression.ts       # 客户端图片压缩工具
│
├── public/                            # 静态资源
│   ├── 📄 logo.png                    # 品牌 Logo（原图，176KB，用于 AI 参考）
│   ├── 📄 logo-opt.png                # 优化版 Logo（1.4KB，用于页面展示）
│   ├── 📄 logo-small.png              # 小版 Logo
│   ├── 📄 og-image.jpg                # Open Graph 分享图（12KB）
│   ├── products/                      # 产品展示图（4款，jpg+webp双格式）
│   │   ├── cream.webp / cream.jpg     # 仙草霜（45KB webp / 32MB jpg原图）
│   │   ├── water.webp / water.jpg     # 仙草露
│   │   ├── oil.webp  / oil.jpg        # 仙草油
│   │   └── lotion.webp / lotion.jpg   # 仙草乳
│   └── products-ai/                   # 产品 AI 参考图（高质量，用于图像生成）
│       └── *.png                      # 各产品透明底图
│
├── scripts/                           # 开发辅助脚本
│   ├── 📄 compress_all.js             # 批量压缩图片
│   ├── 📄 generate_copy_library.js    # 批量生成兜底文案库
│   ├── 📄 generate_designs.ts         # 设计稿生成（已废弃）
│   ├── 📄 generate_og.js              # 生成 OG 图
│   ├── 📄 optimize_assets.js          # 资源优化
│   ├── 📄 test_api.js                 # API 接口测试
│   └── 📄 test_models.js              # Gemini 模型联通性测试
│
└── data/                              # 运行时数据目录（.gitignore）
    └── records.json                   # 生成历史记录（自动创建）
```

---

## ⚙️ 技术栈 & 核心配置

| 项目 | 配置 |
|------|------|
| 框架 | Next.js 16.1.4（App Router + Turbopack）|
| 运行时 | Node.js 20-alpine（Docker）|
| 字体 | Noto Serif SC（Google Fonts，300-700）|
| 动画 | Framer Motion 12.x |
| 图片处理 | Sharp 0.34.x（服务端）|
| 图标 | Lucide React |
| 样式 | Tailwind CSS v4 + 自定义 CSS 变量 |
| 部署平台 | Zeabur（Docker部署）|
| 生产端口 | **8080**（Zeabur 要求）|
| 域名 | bcjbagc.digirepub.com |
| GitHub | https://github.com/sunlinhua-dotcom/BCJ-BA.git |

---

## 🔑 环境变量清单

| 变量名 | 值/用途 | 备注 |
|--------|---------|------|
| `GEMINI_API_KEY` | `sk-hUMN...` | 图像生成接口鉴权 |
| `TEXT_API_KEY` | `sk-ceYY...` | 文案生成接口鉴权（APIYI代理）|
| `GEMINI_IMAGE_MODEL` | `gemini-3.1-flash-image-preview` | 图像生成模型 |
| `GEMINI_TEXT_MODEL` | `gemini-3.1-pro-preview` | 文案生成模型 |
| `GEMINI_BASE_URL` | `https://api.apiyi.com/v1beta` | API 代理地址 |
| `PORT` | `8080` | Zeabur 固定端口 |

> ⚠️ **APIYI 代理已知问题**：返回文本中会随机注入 `(82)(83)` 等括号数字水印，已在 `gemini.ts` 用正则过滤

---

## 🗂️ 产品线数据

| ID | 中文名 | 卖点 | 规格 | AI识别尺寸 |
|----|--------|------|------|-----------|
| `cream` | 仙草霜 | 年轻嘭弹 | 50ml | 4.5-5cm，宽扁型 |
| `water` | 仙草露 | 细腻柔光 | 120ml | 13-15cm，细长圆柱 |
| `oil` | 仙草油 | 紧透生光 | 30ml | 8-10cm，小巧精致瓶 |
| `lotion` | 仙草乳 | 紧透弹嫩 | 100ml | 13-15cm，中型泵瓶 |

---

## 👥 角色体系

### BA（美容顾问 · Beauty Advisor）
- 场景：专柜销售、客情维护、专业背书
- 三种文案风格：
  - **styleA 朋友圈种草**：150-200字，专业有温度，疑问/数字钩子开头
  - **styleB 客情维护**：100-130字，微信私信风格，热情亲切有称谓
  - **styleC 专业测评**：180-220字，成分+功效+亲测，专业权威

### KOC（种草达人 · Key Opinion Consumer）
- 场景：小红书/朋友圈种草，精准人群
- 精准标签（影响 AI prompt）：
  - **肤质**：干皮/油皮/混合皮/敏感肌
  - **年龄段**：20-25岁/26-30岁/31-35岁/35岁以上
  - **场景**：日常护肤/换季修护/出行旅行/睡前护理
- 三种文案风格：
  - **styleA 小红书爆文**：200-250字，爆款标题+痛点种草
  - **styleB 闺蜜分享**：150-200字，口语化，可有小缺点
  - **styleC 精准种草**：200-250字，精准痛点+解决方案

---

## 📋 完整 Git 提交历史 & 开发任务记录

---

### ✅ TASK-001 · 项目初始化
- **时间：** 2026年3月初（初始提交）
- **Commit：** `355c101 Initial commit from Create Next App`
- **内容：** 使用 `create-next-app` 初始化项目骨架

---

### ✅ TASK-002 · v1.0 核心功能开发
- **时间：** 2026年3月初
- **Commit：** `97c732b feat: 佰草集修源五行 AI 图片生成应用 - 包含LOGO融合、三种文案风格`
- **内容：**
  - 接入 Gemini API 生成产品场景合成图
  - 实现 Logo 融合（Logo 作为 AI 参考图）
  - 三种文案风格（结果页切换 styleA/B/C）
  - 上传产品图 + 可选场景图

---

### ✅ TASK-003 · 环境变量配置化
- **Commit：** `2a14e01 chore: 使用环境变量配置 API`
- **内容：** 将 API Key/URL/Model 从硬编码改为 `.env` 环境变量读取

---

### ✅ TASK-004 · 性能优化
- **Commit：** `bda96cc perf: 优化速度 - 缩小图片尺寸/质量，精简提示词`
- **内容：**
  - 请求前用 Sharp 压缩图片（降低上传体积）
  - Prompt 去冗余，减少 API 耗时

---

### ✅ TASK-005 · 产品名更新
- **Commit：** `eaacbfe feat: 分离AI参考图与页面展示图，更新产品名仙草水→仙草露`
- **内容：**
  - 产品名「仙草水」改为「仙草露」（正式产品名）
  - `public/products/`（展示图）与 `public/products-ai/`（AI参考图）分离

---

### ✅ TASK-006 · AI Prompt 升级（五大仙草 + 进度条）
- **Commit：** `7f24396 feat: AI加入五大仙草元素，优化加载页面进度条动画`
- **内容：**
  - 在图像生成 Prompt 中加入五大仙草：长白山人参/灵芝/牡丹花瓣/紫苏叶/北五味子
  - 仙草自然摆放在产品周围，增加东方美感
  - 进度条模拟心理学曲线（前快后慢）

---

### ✅ TASK-007 · 透明气泡风格→自然摆放
- **Commit：** `7552a5c fix: 移除透明气泡，仙草元素自然摆放在场景中`
- **内容：** 之前仙草元素用气泡包裹显得假，改为直接摆放在场景表面

---

### ✅ TASK-008 · 真实进度条 + 接地气文案
- **Commit：** `ade1326 feat: 三大优化 - 光影真实度/接地气文案/真实进度条`
- **内容：**
  - Prompt 加入光照方向统一要求（所有元素同一光源）
  - 文案从"高冷"调整为"接地气"
  - 进度条不再假 100%，而是触底逼近

---

### ✅ TASK-009 · 结果页「继续生成」按钮
- **Commit：** `3492b71 feat: 结果页添加继续生成按钮`
- **内容：** 结果页底部加「再生成一份」按钮，返回首页重新开始

---

### ✅ TASK-010 · 摄影师级 Prompt 重写
- **Commit：** `7481127 feat: 重写AI提示词 - 摄影师级智能构图和场景分析`
- **内容：**
  - Prompt 结构化分步：ANALYZE → COMPOSITION → PLACEMENT → HERBS → LIGHTING → OUTPUT
  - 产品尺寸数据注入（防止AI放大/缩小产品比例）

---

### ✅ TASK-011 · 产品真实尺寸数据
- **Commit：** `2c8903e feat: 添加产品真实尺寸数据，确保比例准确`
- **内容：** 在 `gemini.ts` 中建立 `productSizes` 字典，每款产品的实际毫升/厘米尺寸注入 Prompt

---

### ✅ TASK-012 · 高知感文案 + 微信 OG 图
- **Commit：** `d3cc03c feat: 高知感文案+微信OG图优化`
- **内容：** 文案风格提升（清醒大女主/现代隐士），OG 图适配微信分享尺寸

---

### ✅ TASK-013 · 文案风格升级（顶级种草）
- **Commit：** `5660d4b refine: 升级文案风格为顶级种草级（清醒大女主+现代隐士）`

---

### ✅ TASK-014 · 无场景图时自动生成背景
- **Commit：** `799469a feat: 支持无环境图自动生成 INS 风背景，增强产品还原度`
- **内容：**
  - 用户未上传场景图时，AI 自动生成「唯美INS风背景」
  - Prompt 分两个分支：有环境图（STEP 1-6）/ 无环境图（自动背景）

---

### ✅ TASK-015 · Logo 更新为新版
- **Commit：** `ec30636 chore: 更新全站 Logo 为新版(02)，重制 OG Image，清理旧资源`
- **内容：** `logo-new-small.png` → `logo-opt.png`，OG 图重制

---

### ✅ TASK-016 · Loading 页 UI 重构（黑金呼吸光效）
- **Commit：** `31dabf0 feat(ui): 重构本草灵签UI 改用极简黑金呼吸光效 (Dark Gold Breathing)`
- **内容：**
  - 深夜暗绿径向渐变背景
  - Logo 浮动 + 古风签文显影动画（Blur + FadeIn）
  - 金色进度条（底部，极简）
  - 40条古风签文随机抽取（`fortunes.json`）

---

### ✅ TASK-017 · 产品颜色还原修复
- **Commit：** `34c43a8 fix(ai): 修正Prompt逻辑，移除白瓷/暖白滤镜，强制还原产品原色`
- **内容：**
  - 之前 Prompt 注入了「白瓷质感」描述导致产品颜色偏白
  - 改为严格要求「采样 IMAGE 1 的原始颜色，禁止修改瓶身颜色」

---

### ✅ TASK-018 · 预生成文案库（50组）
- **Commit：** `6577e26 feat(copy): 预生成50组高质量文案库，替代本地模板引擎`
- **内容：** 运行 `scripts/generate_copy_library.js` 批量预生成，存入 `copy_library.json`

---

### ✅ TASK-019 · 文案 Hybrid 模式（API优先+本地兜底）
- **Commit：** `03ef2a9 feat(ai): 升级文案引擎为 Hybrid 模式 (API优先+本地随机引擎兜底)`
- **内容：** API 调用失败时，从本地 `copy_library.json` 随机抽取，保证文案不空白

---

### ✅ TASK-020 · 手写文案库（120条）
- **Commit：** `17e6e1d feat(copy): 添加120条高质量手写文案库`
- **内容：** 人工编写120条高质量文案，覆盖4款产品×3风格

---

### ✅ TASK-021 · 文案加载问题修复
- **Commits：**
  - `a0a4301 fix(copy): 禁用API调用，直接使用本地文案库确保稳定性`
  - `1beb482 fix(copy): 添加debug日志定位文案加载问题`
  - `1437568 fix(copy): 使用fs.readFileSync替代import加载文案库`
- **内容：** `import()` 在 Next.js 服务端路由中动态加载 JSON 有路径问题，改为 `fs.readFileSync`

---

### ✅ TASK-022 · 进度条修复（99% 卡住）
- **Commit：** `dc9d503 fix(ux): restore AI copy generation and fix 99% progress bar hang`
- **内容：** 定时器冲突导致进度条停在 99%，重构为单一 `setInterval` + cleanup

---

### ✅ TASK-023 · API Token 更换
- **Commits：**
  - `b04b7c6 chore: 更新文案生成API令牌和模型`
  - `88be321 chore: 更新图像和文案生成 API 令牌`
- **内容：** APIYI 代理 Token 过期，更换新 Token

---

### ✅ TASK-024 · v2.0 BA/KOC 双角色系统
- **时间：** 2026-03-27
- **Commit：** `8863d5f feat: v2.0 - BA/KOC dual-role content production system`
- **需求来源：** 用户需要区分"美容顾问"和"种草达人"两种使用场景
- **新增内容：**
  - `components/RoleSelector.tsx`：角色选择卡片（选中绿框+浮起+印章角标）
  - `components/KOCLabels.tsx`：KOC精准标签（3组标签，Framer Motion动画展开）
  - `components/StepIndicator.tsx`：步骤指示器（1选角色→2选产品→3上传场景）
  - `lib/constants.ts`：新增 UserRole / ROLES / KOC_SKIN_TYPES / KOC_AGE_GROUPS / KOC_SCENES / COPY_STYLE_LABELS
  - `lib/gemini.ts`：重写 `generateUGCCopy`，支持 BA/KOC 双角色、labels 注入
  - `app/page.tsx`：步骤式展开表单，底部摘要栏
  - `app/result/page.tsx`：动态文案标签（BA/KOC 显示不同tab名）
  - `app/api/generate/route.ts`：接收 role/skinType/ageGroup/scene 参数

---

### ✅ TASK-025 · Zeabur 部署：Dockerfile 配置
- **时间：** 2026-03-27
- **Commit：** `76bd7de fix: add Dockerfile and Next.js standalone output for Zeabur deployment`
- **问题：** Zeabur 自动生成的 Dockerfile 包含 `npm update -g npm`，该步骤因 Docker 镜像内 `promise-retry` 缺失而崩溃
- **解决：**
  - 自定义 `Dockerfile`（node:20-alpine + `npm ci` + 跳过npm升级）
  - `next.config.ts` 加 `output: 'standalone'`（容器最小化）

---

### ✅ TASK-026 · Zeabur 构建修复：Suspense 预渲染
- **时间：** 2026-03-27
- **Commits：**
  - `e2b8923`（无效尝试：force-dynamic）
  - `e817e59 fix: wrap result page with Suspense to fix useSearchParams prerender error`
- **问题：** `/result` 页使用 `useSearchParams()`，Next.js build 时尝试静态预渲染，报错
- **解决：** 将 `ResultContent` 组件用 `<Suspense>` 包裹，外层 `ResultPage` 可静态化

---

### ✅ TASK-027 · 水印过滤 + 文案字数升级
- **时间：** 2026-03-27
- **Commit：** `511528e fix: strip APIYI watermark chars, increase copy length to 100-220 chars`
- **问题（用户反馈）：** 复制文案出现 `(82)(83)这(84)周(85)末` 乱码；文案字数太少
- **解决：**
  - 正则过滤 `/\(\d+\)/g` 清除 APIYI 水印字符
  - 所有 6 个 Prompt 字数要求升级（BA: 150-220字 / KOC: 150-250字）
  - `maxOutputTokens` 从 1024 升至 2048

---

### ✅ TASK-028 · 文案截断修复
- **时间：** 2026-03-28
- **Commit：** `5675eeb fix: increase maxOutputTokens to 4096, add truncation detection for incomplete copy`
- **问题（用户截图）：** 文案在中途被截断，出现残句（如"第一次用说"、结尾缺失）
- **根因：** `maxOutputTokens: 2048` 不足，中文字符平均1.5-2 token，200字文案约需400 token，加 Prompt 后超限
- **解决：**
  - `maxOutputTokens` 改为 `4096`
  - 加截断检测：末尾若不以 `。！？～\n` 结尾，从最后完整句子截取

---

### ✅ TASK-029 · 全面 Bug 审查（第二轮）
- **时间：** 2026-03-28
- **Commit：** `dbf09f6 fix: KOC labels pass Chinese text to AI, fix typo 자然→自然, img→next/Image`
- **修复内容：**
  1. 🔴 **KOC标签传值错误**：前端传英文 id（`dry`/`combo`）→ 改为传中文 label（`干皮`/`混合皮`）
  2. 🔴 **韩文字符**：`promptB` 中 `자然` → `自然`（输入法错误）
  3. 🟡 **产品卡 img**：`<img>` → `<Image>` from `next/image`（性能优化）
  4. 🟢 **未用参数**：`EnvironmentUploader` 的 `file` prop 解构无用，去除
  5. 🟢 **eslint 误报**：预览图 blob URL 无法用 next/image，加 disable 注释

---

### ✅ TASK-030 · 加载页品牌文案升级
- **时间：** 2026-03-28
- **Commit：** `5dab731 feat: rotate 8 brand loading messages every 3s during generation`
- **需求：** 用户提供8条品牌加载语，替换原有古风副文案
- **实现：**
  - `BRAND_MESSAGES` 常量数组（8条）
  - `msgIndex` state + setInterval 每3秒轮换
  - 古风大字（40条签文随机抽取）保留，副文案位置改为品牌语轮播

---

## 📋 待开发任务（BACKLOG）

### 📋 TASK-031 · 兜底文案库填充
- **状态：** 待开发
- **描述：** `app/data/copy_library.json` 当前所有文案数组为空，AI 失败时会显示极简兜底句
- **计划：** 运行 `scripts/generate_copy_library.js` 批量生成，或人工填入各产品×各角色×各风格文案

### 📋 TASK-032 · 历史记录页 UI 升级
- **状态：** 待开发
- **描述：** `/records` 页面目前是朴素 HTML table，与整体黑金东方风格不符
- **计划：** 按整体设计系统重写，支持按角色/产品筛选，显示文案预览卡片

### 📋 TASK-033 · 用户分享体验优化
- **状态：** 待开发
- **描述：** 结果页「分享」功能依赖 Web Share API，部分 Android 浏览器不支持
- **计划：** 加降级方案（复制链接 / 长按图片保存提示）

### 📋 TASK-034 · 生产环境监控
- **状态：** 待开发
- **描述：** 目前 Zeabur 仅靠 console.log，无报警机制
- **计划：** 接入 Sentry 或 Zeabur 内置日志告警

---

## 🐛 已知问题 & 注意事项

| # | 问题 | 状态 | 说明 |
|---|------|------|------|
| 1 | APIYI 水印 | ✅已过滤 | 正则 `/\(\d+\)/g` 过滤，但若水印格式变更需更新 |
| 2 | 文案截断 | ✅已修复 | maxOutputTokens 4096 + 截断检测 |
| 3 | KOC 标签传中文 | ✅已修复 | 前端做 id→label 映射 |
| 4 | `/records` 页不显示 role | 🟡待优化 | RecordItem 接口缺 role 字段 |
| 5 | copy_library.json 为空 | 📋待填充 | AI 失败时兜底文案太简陋 |
| 6 | 产品图 jpg 源文件巨大 | 🟡可清理 | 4个 .jpg 各约30MB，仅用于本地，git忽略即可 |

---

*日志由 Antigravity AI 辅助维护 · 最后更新 2026-03-30 16:04*
