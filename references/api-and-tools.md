# API配置与工具使用

> 本文件为 API 配置和工具使用的完整参考。由 SKILL.md 路由按需加载，不默认注入上下文。

## 环境变量配置

```bash
# === 生图模型 API 密钥（至少配置一个）===
# 🇨🇳 字节跳动 Seedream 5.0/4.5（国内直连推荐）
ARK_API_KEY=your_ark_api_key

# 🇨🇳 阿里通义 Z-Image Turbo（fal.ai平台）
FAL_KEY=your_fal_key

# 🇨🇳 腾讯混元生图3.0（需两个同时配置）
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key

# 🇺🇸 Google Nano Banana 2/Pro（Gemini Image）
GEMINI_API_KEY=AIza...

# 🇺🇸 Google Imagen 4
GOOGLE_API_KEY=AIza...
# 或 Service Account: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# 🇺🇸 OpenAI GPT Image 1.5/Mini
OPENAI_API_KEY=sk-...

# 🇩🇪 Flux 2 Pro/Max/Klein（三选一平台）
BFL_API_KEY=your_bfl_key
# FAL_KEY=your_fal_key（与Z-Image共享）
# REPLICATE_API_TOKEN=r8_...

# 🇺🇸 Ideogram 3.0
IDEOGRAM_API_KEY=ideo-...

# 🇺🇸 Stability AI Stable Image
STABILITY_API_KEY=sk-...

# === 其他工具 ===
# 矢量化API
VECTORIZER_API_KEY=your_vectorizer_key

# CellCog + brand-cog — 深度品牌战略推理（需 pip install cellcog）
# CELLCOG_API_KEY=sk_xxx
```

> ⚡ 生图模型详细参数、优劣势对比、API调用模板见 `references/image-models.md`

## 可选: CellCog 品牌增强

对于需要深度品牌战略推理的项目，可以启用 CellCog（brand-cog 的底层引擎）：

1. 安装 SDK: `pip install cellcog`
2. 获取 API Key: https://cellcog.ai/profile?tab=api-keys
3. 设置环境变量: `CELLCOG_API_KEY=sk_xxx`

**CellCog 适合的场景**：
- 需要多角度品牌定位研究
- 需要完整的品牌套件（Logo+色彩+字体+规范+社媒+商务物料）
- 需要品牌视频/演示文稿等跨模态产出

**使用方式**：
```python
from cellcog import CellCogClient
client = CellCogClient()
result = client.create_chat(
    prompt="[品牌需求描述]",
    notify_session_key="agent:main:main",
    task_label="brand-creation",
    chat_mode="agent"  # 或 "agent team" 用于深度品牌开发
)
```

## 输出处理

### 矢量图(SVG)输出

AI 生成的位图需转换为矢量图：
1. 使用 `scripts/vectorize.py` 调用 Vectorizer.AI API 或本地 potrace 转换
2. 简单图形/logo：优先用 prompt 引导生成扁平化、少渐变的风格，便于矢量化
3. 复杂图形：建议提供高分辨率位图 + 矢量描边版本

### PSD 输出

1. 使用 `scripts/create_psd.py` 将生成的图像分层组织为 PSD
2. 分层策略：背景层 → 图形层 → 文字层 → 装饰层
3. 文字层保持可编辑

### 去AI标识

- 豆包即梦 API 的 `watermark` 参数可控制是否添加AI水印
- 如需去除已有AI标识，使用 `scripts/remove_watermark.py` 处理
- 矢量化过程天然去除位图水印

## 脚本使用说明

| 脚本 | 用途 | 调用时机 |
|------|------|---------|
| `scripts/color_system.py` | 从主色生成完整色彩系统（色阶+渐变+WCAG） | Phase 4 色彩系统 |
| `scripts/brand_guidelines.py` | 生成品牌规范手册 | Phase 4 完成 |
| `scripts/compliance_check.py` | 自动合规检测 | Phase 5 合规审查 |
| `scripts/vectorize.py` | 位图转矢量 | Phase 3/4 输出处理 |
| `scripts/create_psd.py` | 生成分层PSD | Phase 4 输出处理 |
| `scripts/remove_watermark.py` | 去AI水印 | Phase 3/4 输出处理 |
| `scripts/generate_image.py` | 豆包API生图封装 | Phase 3 样稿生成 |
