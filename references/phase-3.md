# Phase 3: 样稿生成（含辅助图形）

> 本文件为 Phase 3 的完整指令。由 SKILL.md 路由按需加载，不默认注入上下文。

**⚠️ 进入 Phase 3 前，必须先读取 `brand-profile.md` 确认所有锁定项（品牌名、色彩、字体、设计哲学），确认一致后再开始生成。**

> **⚠️ 逐步确认铁律（R8）**：样稿生成后必须暂停，等待用户确认（满意/修改/推翻），确认后才可进入后续步骤（辅助图形、Logo变体、Phase 4）。禁止一口气做完所有物料再展示。

> **⚠️ 生图工具优先级**：豆包即梦API（doubao-seedream-5-0-260128）为**默认主力生图工具**。内置 image_gen 工具仅作为**备用**（当豆包API不可用时）。所有生图任务应直接调用豆包API，不要先尝试内置工具。

## 豆包即梦 API 调用

```bash
# 官方端点（火山引擎方舟）
POST https://ark.cn-beijing.volces.com/api/v3/images/generations

# 认证
Authorization: Bearer {ARK_API_KEY}

# 模型
doubao-seedream-5-0-260128   # Seedream 5.0（推荐，最新）
doubao-seedream-4-5-251128   # Seedream 4.5
doubao-seedream-4.0          # Seedream 4.0
```

### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | string | ✅ | 模型名称 |
| `prompt` | string | ✅ | 图像描述，≤300汉字/600英文单词 |
| `size` | string | ❌ | "2K"/"4K" 或 像素值如 "2048x2048" |
| `sequential_image_generation` | string | ❌ | "disabled"(单图) / "auto"(组图) |
| `response_format` | string | ❌ | "url"(24h有效) / "b64_json" |
| `watermark` | boolean | ❌ | 是否添加AI水印 |
| `stream` | boolean | ❌ | 是否流式返回 |

### 设计尺寸映射

| 设计类型 | 尺寸 | 宽高比 |
|---------|------|--------|
| 名片 | 1920x1920 | 1:1 |
| A4海报 | 1920x1920 | 1:1 |
| 横版海报 | 2560x1440 | 16:9 |
| 竖版海报 | 1440x2560 | 9:16 |
| 招牌 | 3024x1296 | 21:9 |
| 正方形/Logo | 2048x2048 | 1:1 |
| 易拉宝 | 1440x2560 | 9:16 |
| 折页 | 2496x1664 | 3:2 |

### 踩坑经验

- Seedream 5.0 最小像素数 3,686,400 (≈1920x1920)，不支持 1024x1024 等小尺寸
- size 支持 "2K"/"4K" 简写和 "1920x1920" 像素值
- `sequential_image_generation: "disabled"` 关闭组图模式

## Prompt 构造原则

构造生图 prompt 时，**以设计哲学为纲领**：

```
[设计哲学关键词], [设计类型], [主视觉元素], [色彩方案/调色板],
[文字布局提示], [微妙参考暗示],
professional graphic design, high resolution, clean layout, print-ready,
meticulously crafted, master-level execution
```

**关键：**
- 中文 prompt 不超过300字
- 始终追加 `professional graphic design, print-ready, meticulously crafted` 等质量词
- 文字内容在 prompt 中标注位置，如"顶部标题区域：品牌名"
- 样稿生成3张变体供选择
- **设计哲学驱动**：prompt 中的视觉元素必须对齐 Phase 2 创建的美学运动

## 画布设计增强

对于需要精细排版的设计（海报、画册、名片等），在生图基础上叠加 canvas-design 画布方法：
1. 读取 `~/.workbuddy/skills/canvas-design/SKILL.md` 获取完整画布创作指南
2. 使用 `~/.workbuddy/skills/canvas-design/canvas-fonts/` 中的字体文件
3. 在 HTML Canvas 上实现精确排版、字体渲染和几何图形
4. 输出为 PDF/PNG 高质量文件
5. **精炼打磨**：回到代码进一步精炼，使构图、间距、色彩选择达到博物馆级品质

**canvas-design 画布规则**：
- 所有文字、图形和视觉元素必须包含在画布边界内，留有适当边距
- 没有任何东西从页面溢出，没有任何东西重叠
- 文字始终极简且视觉优先，大多数时候字体应纤细
- 优先考虑已有内容的精炼，而非添加新元素

## 样稿确认

- 展示生成结果，询问用户选择方向
- 记录用户反馈（色调/构图/文字位置的偏好）
- 基于反馈微调后可再生成一轮
- **用户确认 = 设计哲学与视觉方向的共同确认**

## 设计评审（design-critique 集成）

样稿生成后、用户确认前，自动执行一轮专业设计评审：

1. 读取 `~/.workbuddy/skills/design-critique/SKILL.md` 获取评审框架
2. 对生成的样稿进行 **11维度评审**：
   - 格式塔原理（元素分组与关系）
   - 视觉层级（焦点与阅读路径）
   - 色彩科学（Itten色彩理论 + WCAG对比度）
   - 排版（字阶、配对、可读性）
   - 网格结构（Müller-Brockmann对齐与节奏）
   - 构图（Freeman视角与景深）
   - 信息设计（Tufte数据墨水比）
   - 极简与诚实（Rams/Bauhaus去冗余）
   - 视觉平衡与重量
   - 可用性（Nielsen/Norman启发式）
   - 平台惯例（印刷/数字/社交）
3. 输出优先级排序的改进建议：**关键 → 重要 → 打磨**
4. 将评审结果呈现给用户，辅助方向选择

## 辅助图形设计

样稿方向确认后，设计辅助图形系统。读取 `references/vi-design-toolkit.md` §1 获取完整指南。

**辅助图形设计流程**：
1. **提取核心元素**：从Logo中提取1-2个核心形状/线条
2. **选择设计方法**：

| 方法 | 适用品牌类型 |
|------|------------|
| 元素提取法 | 大多数品牌（从Logo提取形状做旋转/重复/缩放） |
| 网格衍生法 | 科技/金融品牌（基于Logo网格生成几何图案） |
| 意象延伸法 | 文化/餐饮/自然品牌（从品牌意象提取视觉元素） |
| 动态变体法 | 科技/互联网品牌（参数化图形，不同物料不同参数） |

3. **分类设计**：线条类（边框/分割线）+ 底纹类（背景/包装）+ 图形类（重复几何）
4. **使用原则**：辅助图形≤画面面积20-30%，不抢Logo风头

**辅助图形使用svg-draw生成**：与Logo一样，辅助图形应优先用SVG代码绘制，确保缩放不失真。

## Logo 矢量绘制流程（svg-draw 集成）

Logo是品牌最核心的资产，应优先使用矢量方式绘制：

1. 读取 `~/.workbuddy/skills/svg-draw/SKILL.md` 获取SVG绘制指南
2. **直接编写SVG代码**生成Logo，而非先出位图再矢量化
3. Logo变体生成策略：

| 变体 | 说明 | SVG方式 |
|------|------|---------|
| 主Logo(彩色) | 标准使用 | 完整SVG，含品牌色 |
| 主Logo(反白) | 深色背景 | 将填充色反转为白色 |
| 纯图标版 | Favicon/应用图标 | 仅保留图形部分，去掉文字 |
| 纯字标版 | 空间有限 | 仅保留文字部分 |
| 横版组合 | 横幅/信纸 | 图标左、文字右 |
| 竖版组合 | 头像/社交媒体 | 图标上、文字下 |

4. SVG → PNG 转换：使用 `svg-draw/scripts/svg_to_png.sh` 或 `rsvg-convert`
5. 如已有位图Logo需矢量化：先用 `color-palette` 提取色彩，再用 svg-draw 重新绘制

## Phase 3 完成标志

- [ ] 样稿1-3张已生成
- [ ] 设计评审已执行
- [ ] 用户已确认方向（R8铁律）
- [ ] Logo SVG矢量版已绘制
- [ ] Logo 6种变体已生成
- [ ] 辅助图形系统已设计
- [ ] **暂停，等待用户确认所有产出**（R8铁律）
