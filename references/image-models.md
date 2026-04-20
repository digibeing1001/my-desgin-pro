# AI 生图模型全览与接入指南

> 🕐 上次全量扫描：2026-04-20 | ⏰ 下次扫描：2026-05-20
> 📋 扫描规则(R-KB)：距离上次扫描>30天→启动时自动触发全站扫描，扫描39个设计网站+各模型官网
> ⚡ 规则(R-IM)：每次生图前必须询问用户选择哪家模型，不可默认使用

---

## 一、模型总览（10家16+模型）

> ⚠️ DALL-E 2/3 将于 2026-05-12 停服，已移除。GPT Image 2 尚未正式发布（灰度测试中），待正式上线后加入。
> ⚠️ Seedream 4.0 已被 4.5 取代，已移除。混元极速版太弱，已移除。

| # | 提供商 | 模型 | 单张成本(USD) | 单张成本(CNY) | 最大分辨率 | Elo评分 | 质量等级 | 状态 |
|---|--------|------|:----------:|:----------:|:---------:|:------:|:------:|:----:|
| 1 | 🇨🇳 字节跳动 | **Seedream 5.0 Lite** | $0.032 | ¥0.23 | 3K(4096×2304) | 1,225 | 生产级 | 🟢 在线 |
| 2 | 🇨🇳 字节跳动 | **Seedream 4.5 Pro** | ~$0.035 | ¥0.25 | 4K(6198×2656) | — | 旗舰级 | 🟢 在线 |
| 3 | 🇨🇳 阿里通义 | **Z-Image Turbo** | $0.010 | ¥0.07 | 4MP(~2048×2048) | — | 草稿级 | 🟢 在线 |
| 4 | 🇨🇳 腾讯 | **混元生图3.0** | $0.028 | ¥0.20 | 2048×2048 | 1,238 | 生产级 | 🟢 在线 |
| 5 | 🇺🇸 Google | **Nano Banana 2** | $0.013 | ¥0.09 | 4K(4096×4096) | — | 生产级 | 🟢 在线 |
| 6 | 🇺🇸 Google | **Nano Banana Pro** | $0.140 | ¥1.01 | 4K(3840×2160) | — | 旗舰级 | 🟢 在线 |
| 7 | 🇺🇸 Google | **Imagen 4 Ultra** | $0.054 | ¥0.39 | 2048×2048 | 1,240 | 旗舰级 | 🟢 在线 |
| 8 | 🇺🇸 OpenAI | **GPT Image 1.5** | $0.034(M) | ¥0.25 | 1536×1024 | 1,264 | 旗舰级 | 🟢 在线 |
| 9 | 🇺🇸 OpenAI | **GPT Image 1 Mini** | $0.011(M) | ¥0.08 | 1536×1024 | 1,200 | 草稿级 | 🟢 在线 |
| 10 | 🇩🇪 BFL | **Flux 2 Pro** | $0.03/MP | ¥0.22/MP | 4MP | 1,265 | 旗舰级 | 🟢 在线 |
| 11 | 🇩🇪 BFL | **Flux 2 Max** | $0.07/MP | ¥0.51/MP | 4MP | — | 超旗舰 | 🟢 在线 |
| 12 | 🇩🇪 BFL | **Flux 2 Klein 4B** | $0.014/MP | ¥0.10/MP | 4MP | — | 草稿级 | 🟢 在线 |
| 13 | 🇺🇸 Ideogram | **Ideogram 3.0** | $0.038~$0.113 | ¥0.27~0.81 | 2048×2048 | 1,218 | 生产级 | 🟢 在线 |
| 14 | 🇺🇸 Stability | **Stable Image Ultra** | ~$0.030 | ¥0.22 | 1024×1024 | — | 生产级 | 🟡 老化 |

---

## 二、各模型详细参数与优劣势

### 2.1 🇨🇳 字节跳动 — Seedream 系列

#### Seedream 5.0 Lite（💰 性价比首选）

| 项目 | 详情 |
|------|------|
| **模型名** | `Doubao-Seedream-5.0-lite` |
| **API端点** | 火山方舟：`https://ark.cn-beijing.volces.com/api/v3/images/generations` |
| **兼容格式** | OpenAI 标准格式 |
| **认证方式** | Bearer Token（ARK_API_KEY） |
| **单张成本** | ¥0.20/张（后付费） |
| **size参数** | `2K`/`3K` 关键词，或 `2048x2048` 像素值 |
| **最大分辨率** | 3K (4096×2304) |
| **特色功能** | 联网搜索(`tools: web_search`)、组图生成、PNG/JPEG输出 |

**✅ 优势：**
- 中文提示词理解最佳（中文原生模型）
- 支持联网搜索融合实时信息
- 组图生成能力（故事板/连续场景）
- 支持PNG透明背景
- 火山方舟平台国内直连，无需翻墙

**❌ 劣势：**
- 极致真实感不及Imagen 4 Ultra
- 必须关闭组图模式（`sequential_image_generation: "disabled"`）才能单图
- 最小像素数3,686,400（不支持1K小图）
- AI水印默认开启

**推荐size值：**
```
2K-1:1 → "2048x2048"    2K-16:9 → "2848x1600"
2K-4:3 → "2304x1728"    2K-9:16 → "1600x2848"
3K-1:1 → "3072x3072"    3K-16:9 → "4096x2304"
```

#### Seedream 4.5 Pro（🏆 高端选择）

| 项目 | 详情 |
|------|------|
| **模型名** | `doubao-seedream-4.5` 或通过endpoint ID |
| **API端点** | 同火山方舟平台，OpenAI兼容格式 |
| **单张成本** | ¥0.25/张 |
| **size参数** | `1024x1024` 等（参考火山方舟文档） |
| **最大分辨率** | 4K |
| **特色** | 主体一致性+指令遵循精准+空间逻辑+美学提升 |

**✅ 优势：** 多图融合效果最强、编辑一致性最好、小字/人脸更自然
**❌ 劣势：** 比5.0 Lite贵25%、不支持联网搜索

---

### 2.2 🇨🇳 阿里通义 — Z-Image Turbo（⚡ 速度+价格之王）

| 项目 | 详情 |
|------|------|
| **模型名** | `fal-ai/z-image/turbo`（fal.ai） |
| **API端点** | `https://fal.run/fal-ai/z-image/turbo` |
| **认证方式** | Key Authorization（FAL_KEY） |
| **单张成本** | $0.005/MP → 1024²≈$0.005/张，2048²≈$0.01/张 |
| **image_size** | `square_hd` / `square` / `portrait_4_3` / `portrait_16_9` / `landscape_4_3`（默认） / `landscape_16_9` |
| **推理步数** | 1~8步（默认8步，可降到1步极速） |
| **特色** | 6B参数、3秒出图、中英双语文字渲染、开源可自部署 |

**✅ 优势：**
- **全球最便宜**的生图API（$0.01/张）
- 生成速度最快（~1秒@1步，~3秒@8步）
- 支持中英双语文字渲染
- 开源模型，可自部署（阿里通义实验室）
- 支持批量1~4张/请求

**❌ 劣势：**
- 画质为草稿级，不及旗舰模型
- fal.ai为海外平台，需代理
- 开源自部署需要GPU（推荐A100/4090）
- 无内置编辑/融合能力

---

### 2.3 🇨🇳 腾讯 — 混元生图3.0

| 项目 | 详情 |
|------|------|
| **模型标识** | `hy-image-v3.0` |
| **API端点** | `https://aiart.tencentcloudapi.com`（腾讯云API 3.0） |
| **Action** | `SubmitTextToImageJob`（异步） |
| **认证方式** | 腾讯云 SecretId + SecretKey（TC3-HMAC-SHA256签名） |
| **单张成本** | ¥0.20/张（后付费） |
| **默认并发** | 1个（需等上一个任务完成才能处理下一个） |
| **Resolution** | 格式 `"宽:高"`，宽高∈[512,2048]，乘积≤1024×1024 |
| **特色** | 80B参数全球最大开源生图模型、支持Revise(改写Prompt) |

**✅ 优势：**
- 开源可自部署（80B参数，效果最好开源模型）
- 腾讯云生态完善，企业级SLA
- 支持文生图/图生图/百变头像/AI写真/模特换装/商品背景

**❌ 劣势：**
- 默认仅1个并发，需额外购买
- 腾讯云API签名复杂（非Bearer Token）
- 异步调用需轮询JobId
- 极致画质不及Flux 2 Pro / Imagen 4 Ultra

---

### 2.4 🇺🇸 Google — Nano Banana 系列（🆕 2026新锐）

#### Nano Banana 2（💰 超高性价比）

| 项目 | 详情 |
|------|------|
| **模型名** | `gemini-3.1-flash-image-preview` |
| **API端点** | `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent` |
| **认证方式** | `x-goog-api-key: $GEMINI_API_KEY` |
| **单张成本** | ~$0.013/张（1K分辨率） |
| **分辨率** | 512 / 1K / 2K / 4K（注意：大写K，512不带K） |
| **宽高比** | `1:1` `1:4` `1:8` `2:3` `3:2` `3:4` `4:1` `4:3` `4:5` `5:4` `8:1` `9:16` `16:9` `21:9` |
| **特色** | 多轮编辑、搜索接地、最多14张参考图、SynthID水印 |

**✅ 优势：**
- $0.013/张 + 4K分辨率 = 性价比极高
- 14种宽高比（含1:4/4:1/1:8/8:1超长条形，3.1新增）
- 多轮对话式编辑（chat模式逐步修改）
- 搜索接地（google_search工具，联网生图）
- Thinking模式（thinkingLevel: minimal/high）
- 多参考图（最多14张）

**❌ 劣势：**
- 国内需代理访问Google API
- Flash版本光影真实感不及Pro/Ultra
- API为preview状态，可能变更
- 需Google账号

#### Nano Banana Pro（🏆 质量旗舰）

| 项目 | 详情 |
|------|------|
| **模型名** | `gemini-3-pro-image` / `google/gemini-3-pro-image` |
| **认证方式** | 同Nano Banana 2（GEMINI_API_KEY） |
| **单张成本** | $0.14/张(2K) / $0.24/张(4K) |
| **特色** | 最多8张参考图、5人一致性、Thinking Mode |

**✅ 优势：** 顶级画质 + 人物一致性(5人) + Thinking推理模式
**❌ 劣势：** 价格最贵之一（$0.14~$0.24/张）、延迟10~25秒

---

### 2.5 🇺🇸 Google — Imagen 4

#### Imagen 4 Ultra

| 项目 | 详情 |
|------|------|
| **模型ID** | `imagen-4.0-ultra-generate-001` |
| **API端点** | Vertex AI 或 Google AI Studio |
| **认证方式** | Google Cloud Service Account / API Key |
| **单张成本** | $0.054/张 |
| **最大分辨率** | 2048×2048（高分辨率模式） |
| **比例** | 1:1 / 3:4 / 4:3 / 9:16 / 16:9 |
| **特色** | 最佳光影真实感、SynthID水印 |

**✅ 优势：** 极致光影真实感（旗舰级）、高分辨率2048px、Google Cloud企业级SLA
**❌ 劣势：** 不支持Inpainting/Outpainting/Upscale、需Google Cloud账号、国内需代理

#### Imagen 4 Fast（速度优化）

| 项目 | 详情 |
|------|------|
| **模型ID** | `imagen-4.0-fast-generate-001` |
| **单张成本** | $0.020/张 |
| **限制** | 仅标准分辨率(1024px)，不支持高分辨率 |

---

### 2.6 🇺🇸 OpenAI — GPT Image 系列

> ⚠️ DALL-E 2/3 将于 **2026-05-12 停服**，不再列入。GPT Image 2 尚在灰度测试，待正式发布后加入。

#### GPT Image 1.5（质量Top 2）

| 项目 | 详情 |
|------|------|
| **API端点** | `https://api.openai.com/v1/images/generations` |
| **模型名** | `gpt-image-1.5` |
| **认证方式** | Bearer Token（OPENAI_API_KEY） |
| **单张成本** | Low=$0.009 / Medium=$0.034 / High=$0.133 |
| **quality参数** | `low` / `medium` / `high` |
| **size参数** | `1024x1024` / `1792x1024` / `1024x1792` |
| **特色** | LM Arena Elo 1264（质量Top 2） |

**✅ 优势：** 质量全球Top 2、语义理解极强、支持透明背景、文档清晰
**❌ 劣势：** 国内需代理、High模式$0.133/张较贵

#### GPT Image 1 Mini（性价比之王）

| 项目 | 详情 |
|------|------|
| **模型名** | `gpt-image-1-mini` |
| **单张成本** | Low=$0.005 / Medium=$0.011 / High=$0.036 |
| **适用** | 批量缩略图、概念探索、内部文档 |

---

### 2.7 🇩🇪 Black Forest Labs — FLUX 2 系列

> ⚡ FLUX 2采用**兆像素(MP)定价**，费用随分辨率缩放

#### Flux 2 Pro（并列质量冠军）

| 项目 | 详情 |
|------|------|
| **API端点** | 官方：`https://api.bfl.ml/v1/image` / fal.ai / Replicate |
| **认证方式** | Bearer Token（BFL_API_KEY / FAL_KEY / REPLICATE_API_TOKEN） |
| **单张成本** | $0.03/MP（文生图） / $0.045/MP（编辑） |
| **1024²参考** | ~$0.031/张 | **2048²参考** | ~$0.125/张 |
| **质量排名** | Elo 1265（#1） |
| **特色** | 最佳文字渲染、极致艺术表现力 |

**✅ 优势：** LM Arena质量#1、文字渲染最强、艺术表现力最强、多参考图
**❌ 劣势：** 2K以上较贵、注册BFL需海外手机号

**接入方式（三选一）：**
1. **官方API**: `https://api.bfl.ml/v1/image` — BFL_API_KEY
2. **fal.ai**: `https://fal.run/black-forest-labs/flux-1.1-pro` — FAL_KEY
3. **Replicate**: `https://api.replicate.com/v1/predictions` — REPLICATE_API_TOKEN

#### Flux 2 Max（🆕 超旗舰）

| 项目 | 详情 |
|------|------|
| **单张成本** | $0.07/MP（文生图+编辑同价） |
| **1024²参考** | ~$0.073/张 | **2048²参考** | ~$0.292/张 |
| **特色** | 最高质量 + grounding搜索、3月更新后速度翻倍 |

**✅ 优势：** 质量天花板 + 搜索grounding
**❌ 劣势：** 最贵（$0.07/MP）

#### Flux 2 Klein 4B（🆕 轻量快速）

| 项目 | 详情 |
|------|------|
| **单张成本** | $0.014/MP → 1024²≈$0.015/张 |
| **特色** | 4B参数轻量模型、实时生成、高吞吐量 |

**✅ 优势：** 速度极快 + 成本极低（仅比Z-Image Turbo贵50%）
**❌ 劣势：** 质量明显低于Pro/Max

---

### 2.8 🇺🇸 Ideogram — 文字渲染专家

#### Ideogram 3.0

| 项目 | 详情 |
|------|------|
| **API端点** | `https://api.ideogram.ai/api/ideogram/v3/generate` |
| **认证方式** | Bearer Token（IDEOGRAM_API_KEY） |
| **单张成本** | Turbo=$0.038 / Default=$0.075 / Quality=$0.113 |
| **特色** | 文字渲染最准确、透明背景生成 |

**✅ 优势：** 文字渲染能力最强、支持透明背景、API注册门槛低
**❌ 劣势：** 整体艺术质量不如Flux 2 Pro、图片链接会过期、国内需代理

**API Key获取**：登录 ideogram.ai → 汉堡菜单 → API Beta → Create API Key

---

### 2.9 🇺🇸 Stability AI — Stable Image

#### Stable Image Ultra

| 项目 | 详情 |
|------|------|
| **API端点** | `https://api.stability.ai/v2beta/stable-image/generate/ultra` |
| **认证方式** | Bearer Token（STABILITY_API_KEY） |
| **单张成本** | ~$0.030/张（10 credits） |
| **特色** | 丰富的编辑/控制/3D工具链 |

**✅ 优势：** 完整工具链（ControlNet/Sketch/Inpaint/Upscale/3D）、开源模型可自部署
**❌ 劣势：** 质量不及Flux 2 Pro/GPT Image 1.5、SD 1.6已停服、模型逐渐老化

---

## 三、API密钥状态检测方法

每次生图前，检测环境变量判断可用性：

| 环境变量 | 对应模型 | 检测方式 |
|---------|---------|---------|
| `ARK_API_KEY` | Seedream 5.0/4.5 | 非空 |
| `FAL_KEY` | Z-Image Turbo / Flux 2 | 非空 |
| `TENCENT_SECRET_ID` + `TENCENT_SECRET_KEY` | 混元生图3.0 | 两个都非空 |
| `GEMINI_API_KEY` | Nano Banana 2/Pro | 非空 |
| `GOOGLE_API_KEY` 或 `GOOGLE_APPLICATION_CREDENTIALS` | Imagen 4 | 任一非空 |
| `OPENAI_API_KEY` | GPT Image 1.5/Mini | 非空 |
| `BFL_API_KEY` | Flux 2 Pro/Max/Klein | 非空 |
| `REPLICATE_API_TOKEN` | Flux 2 (Replicate) | 非空 |
| `IDEOGRAM_API_KEY` | Ideogram 3.0 | 非空 |
| `STABILITY_API_KEY` | Stable Image Ultra | 非空 |

**PowerShell检测脚本**：
```powershell
$models = @{}
if ($env:ARK_API_KEY) { $models["Seedream"] = "✅" } else { $models["Seedream"] = "❌" }
if ($env:FAL_KEY) { $models["Z-Image/Fal"] = "✅" } else { $models["Z-Image/Fal"] = "❌" }
if ($env:TENCENT_SECRET_ID -and $env:TENCENT_SECRET_KEY) { $models["混元生图"] = "✅" } else { $models["混元生图"] = "❌" }
if ($env:GEMINI_API_KEY) { $models["Nano Banana"] = "✅" } else { $models["Nano Banana"] = "❌" }
if ($env:GOOGLE_API_KEY -or $env:GOOGLE_APPLICATION_CREDENTIALS) { $models["Imagen 4"] = "✅" } else { $models["Imagen 4"] = "❌" }
if ($env:OPENAI_API_KEY) { $models["GPT Image"] = "✅" } else { $models["GPT Image"] = "❌" }
if ($env:BFL_API_KEY -or $env:FAL_KEY -or $env:REPLICATE_API_TOKEN) { $models["Flux 2"] = "✅" } else { $models["Flux 2"] = "❌" }
if ($env:IDEOGRAM_API_KEY) { $models["Ideogram"] = "✅" } else { $models["Ideogram"] = "❌" }
if ($env:STABILITY_API_KEY) { $models["Stable Image"] = "✅" } else { $models["Stable Image"] = "❌" }
$models.GetEnumerator() | ForEach-Object { "$($_.Key): $($_.Value)" }
```

---

## 四、API Key获取指引

### 4.1 Seedream（火山方舟）

1. 访问 https://console.volcengine.com/ark
2. 注册/登录火山引擎账号
3. 开通「方舟大模型服务平台」
4. 创建推理接入点，选择 `Doubao-Seedream-5.0-lite` 或 `doubao-seedream-4.5`
5. 在「API Key管理」中创建密钥
6. 设置环境变量：`$env:ARK_API_KEY="your-key"`

### 4.2 Z-Image Turbo（fal.ai）

1. 访问 https://fal.ai/ → GitHub/Google登录
2. Dashboard → API Keys → Create
3. `$env:FAL_KEY="your-key"`

### 4.3 混元生图（腾讯云）

1. 访问 https://console.cloud.tencent.com/aiart
2. 注册/登录腾讯云账号，开通「腾讯混元生图」服务
3. 在「访问管理→API密钥」获取 SecretId 和 SecretKey
4. 设置环境变量：
   ```
   $env:TENCENT_SECRET_ID="your-id"
   $env:TENCENT_SECRET_KEY="your-key"
   ```

### 4.4 Nano Banana 2/Pro（Google AI Studio）

1. 访问 https://aistudio.google.com/apikey
2. 创建API Key
3. `$env:GEMINI_API_KEY="AIza..."`

### 4.5 Imagen 4（Google Cloud）

1. 访问 https://console.cloud.google.com/（Vertex AI）
2. 创建Service Account或API Key
3. 启用Vertex AI API
4. `$env:GOOGLE_API_KEY="AIza..."` 或设置 `GOOGLE_APPLICATION_CREDENTIALS`

### 4.6 GPT Image（OpenAI）

1. 访问 https://platform.openai.com/api-keys
2. 注册OpenAI账号（需海外手机号或Google登录）
3. 创建API Key，充值（最低$5，新用户$5免费）
4. `$env:OPENAI_API_KEY="sk-..."`

### 4.7 Flux 2（Black Forest Labs / fal.ai / Replicate）

**方式A — 官方API**：https://bfl.ai/ → 注册 → BFL_API_KEY
**方式B — fal.ai（推荐）**：https://fal.ai/ → GitHub/Google登录 → FAL_KEY
**方式C — Replicate**：https://replicate.com/ → GitHub登录 → REPLICATE_API_TOKEN

### 4.8 Ideogram

1. 访问 https://ideogram.ai/ → 注册
2. 汉堡菜单 → API Beta → 同意协议 → 添加支付信息 → Create API Key
3. `$env:IDEOGRAM_API_KEY="ideo-..."`

### 4.9 Stable Image（Stability AI）

1. 访问 https://platform.stability.ai/ → 注册
2. 获取API Key
3. `$env:STABILITY_API_KEY="sk-..."`

---

## 五、按场景推荐路由

| 设计场景 | 推荐模型 | 理由 |
|---------|---------|------|
| 🎨 VI设计样稿/概念图 | Seedream 5.0 Lite | 中文提示词最佳，性价比高 |
| 🖼️ Logo/海报文字渲染 | Ideogram 3.0 / Flux 2 Pro | 文字渲染最清晰 |
| 📸 高端品牌主视觉 | Imagen 4 Ultra / Flux 2 Max | 最高画质 |
| 🛒 电商产品图批量 | Seedream 5.0 Lite | ¥0.20/张，产量高 |
| 📝 缩略图/预览图/脑暴 | Z-Image Turbo / GPT Image Mini | 成本最低 |
| 🔍 联网搜索生图 | Nano Banana 2 / Seedream 5.0 | 支持搜索接地 |
| ✏️ 多轮编辑/对话式修改 | Nano Banana 2 | chat模式逐步修改 |
| 🧑‍🤝‍🧑 人物一致性 | Nano Banana Pro | 5人一致性+Thinking |
| 🇨🇳 纯国内环境 | Seedream / 混元生图 | 无需翻墙 |
| 🌍 海外品牌项目 | GPT Image 1.5 / Flux 2 Pro | 语义理解最佳 |
| 💰 极致省钱 | Z-Image Turbo | $0.01/张全球最低 |

---

## 六、通用调用代码模板

### Seedream 5.0 Lite（OpenAI兼容格式）

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["ARK_API_KEY"],
    base_url="https://ark.cn-beijing.volces.com/api/v3"
)

response = client.images.generate(
    model="Doubao-Seedream-5.0-lite",
    prompt="你的提示词",
    size="2048x2048",
    response_format="url",
    extra_body={
        "sequential_image_generation": "disabled",
        "watermark": False,
        "output_format": "png"
    }
)
```

### Z-Image Turbo（fal.ai）

```python
import fal_client

result = fal_client.subscribe(
    "fal-ai/z-image/turbo",
    arguments={
        "prompt": "你的提示词",
        "image_size": "landscape_4_3",
        "num_inference_steps": 8,
        "num_images": 1,
        "output_format": "png"
    }
)
```

### Nano Banana 2（Google Gemini SDK）

```python
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_content(
    model="gemini-3.1-flash-image-preview",
    contents=["你的提示词"],
    config=types.GenerateContentConfig(
        response_modalities=['TEXT', 'IMAGE'],
        image_config=types.ImageConfig(
            aspect_ratio="16:9",
            image_size="2K"
        )
    )
)

for part in response.parts:
    if part.inline_data is not None:
        part.as_image().save("output.png")
```

### GPT Image 1.5（OpenAI原生）

```python
from openai import OpenAI

client = OpenAI()  # 自动读取 OPENAI_API_KEY

response = client.images.generate(
    model="gpt-image-1.5",
    prompt="你的提示词",
    quality="medium",
    size="1024x1024"
)
```

### Imagen 4（Google AI Studio）

```python
from google import genai

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
result = client.models.generate_images(
    model="imagen-4.0-generate-001",
    prompt="你的提示词",
    config={"number_of_images": 1}
)
```

### Flux 2 Pro（fal.ai）

```python
import fal_client

result = fal_client.subscribe(
    "black-forest-labs/flux-1.1-pro",
    arguments={"prompt": "你的提示词", "image_size": "landscape_16_9"}
)
```

### Ideogram 3.0

```python
import requests

response = requests.post(
    "https://api.ideogram.ai/api/ideogram/v3/generate",
    headers={"Api-Key": os.environ["IDEOGRAM_API_KEY"]},
    json={"prompt": "你的提示词", "aspect_ratio": "ASPECT_1_1"}
)
```

### 混元生图3.0（腾讯云SDK）

```python
from tencentcloud.common import credential
from tencentcloud.aiart.v20221229 import aiart_client, models

cred = credential.Credential(
    os.environ["TENCENT_SECRET_ID"],
    os.environ["TENCENT_SECRET_KEY"]
)
client = aiart_client.AiartClient(cred, "ap-beijing")
req = models.SubmitTextToImageJobRequest()
req.Prompt = "你的提示词"
req.Resolution = "1024:1024"
req.Revise = 1  # 推荐开启Prompt改写
resp = client.SubmitTextToImageJob(req)
# 异步：需用JobId轮询查询结果
```

---

## 七、月度模型更新扫描机制

> 📋 规则(R-KB扩展)：每次技能启动时检查文件头部日期，距上次扫描>30天→自动触发

### 扫描范围

| 来源 | URL | 关注内容 |
|------|-----|---------|
| Atlas Cloud价格对比 | https://www.atlascloud.ai/zh/blog/guides/cheapest-ai-image-generation-api-2026 | 全模型价格变动 |
| Google AI Blog | https://blog.google/innovation-and-ai/technology/ | Nano Banana/Imagen新版本 |
| OpenAI Changelog | https://platform.openai.com/docs/changelog | GPT Image新版本/停服通知 |
| BFL Blog | https://bfl.ai/ | Flux新版本/定价更新 |
| 字节跳动Seed | https://seed.bytedance.com/ | Seedream新版本 |
| 阿里通义 | https://qwenimages.com/ | Z-Image新版本 |
| 腾讯混元 | https://hunyuan.tencent.com/ | 混元生图新版本 |
| Stability AI | https://stability.ai/blog | Stable Image新版本 |
| Ideogram | https://ideogram.ai/ | Ideogram新版本 |
| Artificial Analysis | https://artificialanalysis.ai/ | Elo评分/速度更新 |

### 扫描流程

1. **读取文件头部日期** → 距今>30天 → 触发扫描
2. **逐一访问上表网站** → 检查是否有新模型发布/停服/价格变动
3. **新增模型** → 添加到§一总览表 + §二详细参数 → 更新环境变量和检测脚本
4. **停服模型** → 从总览表移除，在§一头部注释说明停服日期
5. **价格变动** → 更新§一和§二中的价格数据
6. **更新头部日期** → 写入本次扫描日期

### 模型收录标准

| 条件 | 要求 |
|------|------|
| 必须有API | 仅收录提供API调用的模型，纯网页版不收录（如Midjourney无公开API，不收录） |
| **不可太老** | 仅保留最新1~2个版本，老版本移除（如Seedream 4.0→4.5取代后移除4.0） |
| **必须可商用** | 仅收录允许商业使用的模型 |
| **必须有定价** | 必须有明确的单张计费方式 |
| **必须真实可用** | 参数必须来自官方文档或实测，禁止猜测 |

### 近期待关注

| 模型 | 状态 | 预计时间 |
|------|------|---------|
| GPT Image 2 | 灰度测试中 | 2026 Q2-Q3 |
| DALL-E 2/3 | 🚨 2026-05-12停服 | 即将 |
| Seedream 5.0 Pro | 传闻中 | 2026 Q2 |
| Imagen 5 | 传闻中 | 2026 Q3-Q4 |

---

## 八、未收录模型说明

| 模型 | 状态 | 未收录原因 |
|------|------|-----------|
| **Midjourney** | V6.1在线 | ❌ **无公开API**。仅支持Discord Bot和网页端操作，无程序化调用接口。官方曾多次表示暂无开放API计划。 |
| Adobe Firefly | 在线 | ❌ 仅Adobe Creative Cloud生态内使用，无独立API |
| Leonardo.ai | 在线 | ⚠️ API功能有限，质量不及已收录模型，暂不收录 |
| Amazon Titan Image | 在线 | ⚠️ 仅AWS Bedrock生态内，接入复杂度极高，暂不收录 |

> **Midjourney 说明**：Midjourney 是目前公认的艺术表现力最强的AI生图工具之一，但因其完全依赖Discord/网页交互、不提供API调用，无法纳入本Skill的自动化工作流。如果你需要Midjourney级别的艺术效果，推荐替代方案：
> - **Flux 2 Pro/Max** — 艺术表现力最接近MJ，且有API
> - **GPT Image 1.5** — 语义理解+创意强
> - **Imagen 4 Ultra** — 光影真实感最佳
