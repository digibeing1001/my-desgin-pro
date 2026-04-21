# 前端设计审美指南（融入 frontend-design）

> 来源：Anthropic frontend-design skill 的审美方法论，适配 Graphic Design Pro 的平面设计场景。
> **当设计涉及数字物料（网页配图、社交媒体图、落地页视觉、电商 Banner）时，以本文档作为前端级审美参照。**

---

## 核心设计思维

在动手之前，先回答四个问题：

| 问题 | 说明 |
|------|------|
| **Purpose** | 这个设计解决什么问题？谁使用它？ |
| **Tone** | 选择一个极端方向：极简/极繁/复古未来/有机自然/奢华精致/活泼/编辑杂志风/粗野/装饰艺术/柔和 pastel/工业实用 |
| **Constraints** | 技术限制（平台、尺寸、性能） |
| **Differentiation** | 什么让这设计**难忘**？那一件人们会记住的事？ |

> **关键**：选择一个清晰的概念方向并精确执行。大胆极繁和精致极简都可以——关键是**意图性**，不是强度。

---

## 一、字体排印（Typography）

### 原则

选择**美丽、独特、有趣**的字体。避免通用字体（Arial、Inter）；选择能提升整体审美的 distinctive 字体。

**Unexpected, characterful font choices**。

### 字体配对策略

- **Display + Body 配对**：一个 distinctive 的 display 字体 + 一个 refined 的 body 字体
- **西文示例**：
  - Playfair Display（衬线，editorial）+ Lato（无衬线，干净）
  - JetBrains Mono（等宽，technical）+ Open Sans（无衬线，亲和）
  - Oswald（粗重，impact）+ Source Sans Pro（轻量，阅读）
- **中文示例**：
  - 思源宋体（书卷气）+ 思源黑体（现代干净）
  - 站酷高端黑（力量感）+ 方正兰亭黑（阅读舒适）

### 避免

- ❌ Inter / Roboto / Arial / system fonts 作为 display
- ❌ 全场只用一种字体
- ❌ 字体大小没有明显层级（标题 vs 正文 < 2.5 倍）

---

## 二、色彩与主题（Color & Theme）

### 原则

**Commit to a cohesive aesthetic**（坚持一个统一的美学）。

- 主导色 + 锐利 accent 色 → 优于胆怯的均匀分布色板
- 使用 CSS 变量保持一致性（数字物料）
- 大胆选择：要么深底+亮色，要么浅底+暗色——不要中间地带

### 策略

| 策略 | 说明 |
|------|------|
| 主导 + accent | 70% 底色 + 20% 辅色 + 10% accent（锐利、有冲击力） |
| 避免 timid | 不要平均分配颜色——让某种颜色统治画面 |
| CSS 变量 | `:root { --brand-primary: #...; --brand-accent: #...; }` |

### 避免

- ❌ 紫色渐变在白底上（AI 默认审美）
- ❌ 平均分布的调色板（没有主次）
- ❌ 凭空发明颜色（没有参考或品牌依据）

---

## 三、动效（Motion）

> 适用于数字物料（网页 Banner、社交媒体动图、H5 页面）。

### 原则

**One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.**

一个精心编排的页面加载动画（使用 animation-delay 的交错显现）比散落的微交互更能带来愉悦感。

### 策略

- **CSS-only 优先**：用 CSS transition/animation 实现效果
- **高冲击时刻**：聚焦在最重要的转换点（页面加载、滚动触发、hover 状态）
- **交错显现**：staggered reveals（依次出现）创造节奏感
- **滚动触发**：Scroll-triggered animations 增加沉浸感
- **Hover 惊喜**：hover 状态有 unexpected 的反馈

### 避免

- ❌ 每个元素都有独立的微交互（杂乱）
- ❌ 动画没有目的（纯装饰）
- ❌ 过度使用 easing（所有动画都用同一个曲线）

---

## 四、空间构图（Spatial Composition）

### 原则

**Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements.**

### 策略

| 手法 | 说明 | 适用 |
|------|------|------|
| **不对称** | 主体偏左/偏右，留白在另一侧平衡 | 海报、封面、社交媒体图 |
| **重叠** | 文字压在图片上、图片压在色块上 | 杂志风、编辑排版 |
| **对角线流动** | 元素沿对角线排列，创造动感 | 运动品牌、活动海报 |
| **破格元素** | 一个元素故意超出网格/边框 | 创意海报、艺术画册 |
| **大面积负空间** | 70%+ 留白，让主体呼吸 | 高端品牌、极简设计 |
| **控制密度** | 信息密集但不混乱（如 Bloomberg Businessweek） | 信息图、数据海报 |

### 避免

- ❌ 永远居中对称（AI 默认倾向）
- ❌ 所有元素等距排列（没有节奏）
- ❌ 安全区内的保守排版（没有胆量）

---

## 五、背景与视觉细节（Backgrounds & Visual Details）

### 原则

Create **atmosphere and depth** rather than defaulting to solid colors.

### 可用手法

| 手法 | 效果 | 使用场景 |
|------|------|---------|
| **Gradient meshes** | 有机、流动的色彩过渡 | 科技品牌、数字艺术 |
| **Noise textures** | 胶片颗粒、纸张质感 | 复古风、手工感品牌 |
| **Geometric patterns** | 重复几何、低 opacity | 背景装饰、品牌水印 |
| **Layered transparencies** | 多层半透明叠加 | 玻璃拟态、深度感 |
| **Dramatic shadows** | 大、柔和的投影 | 卡片、悬浮元素 |
| **Decorative borders** | 装饰性边框、分割线 | 奢华品牌、邀请函 |
| **Custom cursors** | 自定义光标（网页） | 互动体验 |
| **Grain overlays** | 颗粒叠加，增加质感 | 印刷感、复古感 |

### 使用原则

- **服务于整体美学**，不是独立装饰
- **克制使用**：1-2 种效果比 5 种效果更好
- **opacity 控制**：背景纹理 opacity ≤ 0.08，不要抢戏

---

## 六、反 Generic AI Aesthetics 清单

| 陷阱 | 为什么不好 | 替代方案 |
|------|-----------|---------|
| **Inter / Roboto / Arial** | 通用、无个性 | 有特点的 display + body 配对 |
| **紫色渐变在白底上** | AI 默认审美 | 品牌色主导 + 锐利 accent |
| **可预测的 layout** | 模板感、无记忆点 | 不对称、破格、对角线 |
| **Cookie-cutter design** | 缺乏上下文特定的个性 | 从品牌故事中长出来的设计 |
| **过度圆角卡片** | AI Dashboard 默认 | 直角、微圆角、或无边框 |
| **均匀分布的色板** | 没有视觉焦点 | 主导色统治 + accent 点缀 |

---

## 七、执行复杂度匹配

| 美学方向 | 需要的执行复杂度 |
|---------|----------------|
| **极繁/ maximalist** | 需要复杂代码：大量动画、多层效果、丰富视觉 |
| **精致极简** | 需要克制、精确、对间距/排版/细节的极度关注 |
| **编辑杂志风** | 需要大胆的排版、不对称构图、高冲击图片 |
| **有机自然** | 需要纹理、手绘元素、不规则形状 |

> **Elegance comes from executing the vision well.**
> 优雅来自于**把愿景执行好**——不是模板套用。

---

## 八、数字物料专项检查清单

针对网页配图、社交媒体图、电商 Banner 等数字物料：

- [ ] **字体**：display 字体是否有特点？body 字体是否易读？
- [ ] **色彩**：是否有清晰的主导色 + 锐利 accent？是否用了 CSS 变量？
- [ ] **动效**：是否有至少一个高冲击的动画时刻？
- [ ] **构图**：是否突破了对称/居中？是否有意外元素？
- [ ] **背景**：是否创造了氛围和深度，而非纯色？
- [ ] **细节**：是否有一个 120% 的细节签名？
- [ ] **避免**：没有 Inter/Roboto、没有紫色渐变、没有模板 layout

---

*本文档为数字物料设计提供前端级审美参照。*
*融入自 Anthropic frontend-design skill，适配 Graphic Design Pro 场景。*
