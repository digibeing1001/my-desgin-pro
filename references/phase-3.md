# Phase 3: 样稿生成（含辅助图形）

> 本文件为 Phase 3 的完整指令。由 SKILL.md 路由按需加载，不默认注入上下文。
> **执行原则：按 Layer 递进，过 Gate 解锁。禁止一次性生成全部变体。**

---

## P3-G4 · 进入门（强制执行）

**进入 Phase 3 前，必须：**
1. 读取 `brand-profile.md` 确认所有已解锁锁定项（品牌名、色彩、字体、设计哲学）
2. 确认 Phase 2 已通过 P3-G3（或轻量级跳过 Phase 2）
3. 确认一致性：当前设计与 brand-profile.md 是否一致？不一致 → 回退修正
4. **检查用户资产（R15）**：读取 `brand-profile.md` 和 `brand-spec.md`，确认用户是否提供了 Logo/素材。如已提供 → 直接进入「已有素材模式」，跳过 Logo 生成。

**未过 P3-G4 禁止开始 Phase 3。**

---

## 模式分叉 · 已有素材模式（R15）

> 如果用户在 Phase 1 已提供 Logo 或其他品牌素材，Phase 3 不生成新 Logo，而是进入「资产确认 + 扩展」流程。

### 已有素材模式的执行流程

```
用户提供 Logo/素材
    ↓
Step 1: 资产质量检查
    • 分辨率是否足够？（印刷≥300dpi / 数字≥72dpi）
    • 是否有透明背景？（PNG/SVG 优先，JPG 需评估去背难度）
    • 色彩模式是否正确？
    ↓
Step 2: 资产入库
    • 保存到 `assets/user-uploads/`
    • 登记到 brand-spec.md
    • 如为位图（JPG/PNG），使用 svg-draw 或 vectorize.py 生成矢量备份
    ↓
Step 3: 预渲染（R11）
    • 生成反白版 / 单色版 / 各尺寸 PNG
    • 保存到 `assets/logo/`
    ↓
Step 4: 基于已有资产生成样稿
    • 所有生图 prompt 必须包含 reference_image（用户提供素材）
    • 或在 HTML/Canvas 中直接以 `<img>` 引用真实文件路径
    ↓
Step 5: 用户确认
    • 确认 Logo 使用正确
    • 确认样稿方向
```

### 图生图强制规则

当使用用户提供素材进行生图时：
- **必须使用 `reference_image` 参数**（generate_image.py `--reference` 或各模型 API 的 image 字段）
- **Prompt 必须明确说明素材角色**：`"based on the provided logo, create a ..."`
- **禁止的行为**：不提素材、让 AI "重新画一个类似的 Logo"、在 prompt 中描述 Logo 让 AI 自由发挥

**未提供素材 → 走标准模式（下方 Layer 1-3）。**

---

## Layer 1 · 表面层（首稿生成 + 方向确认）

> **目标：用最小成本生成 1 张样稿，确认视觉方向是否正确。**
> **禁止在 Layer 1 生成多张变体、不绘制 Logo 矢量、不设计辅助图形。**

### 此刻只做 3 件事：

1. **构造 Layer 1 Prompt**（基于设计哲学 + brand-profile.md 已锁定项）
2. **生成 1 张样稿**（不是 3 张）
3. **展示并询问方向是否正确**

### Layer 1 Prompt 构造原则

```
[设计哲学名称], [设计类型], [主视觉元素], [色彩方案],
[文字布局提示],
professional graphic design, high resolution, clean layout, print-ready,
meticulously crafted, master-level execution
```

**关键约束：**
- 中文 prompt ≤ 200字（比 Layer 2 更短）
- 只使用 brand-profile.md 中**已确认**的色彩和字体
- 不标注尺寸（Layer 2 再定）
- 不标注输出格式（Layer 2 再定）

### Prompt 构造进阶：Mood, Not Layout（融入huashu-design）

> **描述情绪而非布局** —— 短提示词 > 长提示词。描述 3 句情绪和内容，比 30 行布局细节效果更好。

| 杀死多样性的写法 | 激发创造力的写法 |
|----------------|----------------|
| "标题居中，图片右侧，下方三列" | "warm like Sunday morning, with the calm confidence of a heritage brand" |
| "颜色比例 60% 蓝 / 30% 白 / 10% 金" | "deep ocean blue with occasional gold leaf accents, like traditional lacquerware" |
| "使用 Helvetica，16pt 正文" | "Swiss precision meets Eastern meditation" |

**原则**：
1. 用具体设计师/机构风格引用（"Pentagram editorial feel" / "Kenya Hara's emptiness"）而非抽象词（"minimal" / "modern"）
2. 包含颜色 HEX、比例、空间分配、输出规格
3. 避开审美禁区（见 `references/anti-ai-slop.md`）
4. 先读 `references/design-philosophies.md` 选取风格 DNA，再构造 prompt

### 生图工具选择

按 SKILL.md R-IM 规则：
1. 读取 `references/image-models.md` 头部，检测可用 API
2. 列出可用模型，**让用户选择**（R-IM1）
3. 用户未选择时，按场景推荐（R-IM5）

### P3-G1 · 方向确认门

```
📍 Phase 3 · Layer 1 完成
━━━━━━━━━━━━━━━━━━━
首稿已生成。请只看「大方向」：

• 整体色调感觉对吗？
• 构图方向是否符合预期？
• 风格气质是否正确？

请确认：
1. 方向正确 → 我生成 2-3 张变体供精细选择
2. 方向不对 → 告诉我哪里不对，我重新调整后再出首稿
```

**用户未确认方向 → 禁止进入 Layer 2。**

---

## Layer 2 · 细节层（变体生成 + 评审 + Logo 矢量 + 辅助图形）

> **目标：基于确认的方向，产出完整的视觉系统。**
> **仅在用户通过 P3-G1 后解锁。**

### 2.1 变体生成（2-3 张）

基于 Layer 1 确认的方向，生成 2-3 张变体：
- 变体 A：标准版（严格按设计哲学）
- 变体 B：微调版（色调/构图微调）
- 变体 C：突破版（在品牌框架内 slight 突破）

**每个变体生成前，过「位置四问」**（融入huashu-design）：见 SKILL.md §位置四问。

**参考图/素材执行「5-10-2-8」门槛**：见 SKILL.md §5-10-2-8。

### 2.2 设计评审（design-critique）

对 3 张变体执行 11 维度评审（见 ./dependencies/design-critique/SKILL.md），但**只输出「关键 → 重要 → 打磨」三级建议**，不输出全部维度详细分析。

### 2.3 Logo 矢量绘制（svg-draw）

如果项目包含 Logo：
1. 读取 `./dependencies/svg-draw/SKILL.md`
2. **只绘制主 Logo（彩色版）1 个变体**
3. 其他变体（反白/图标/字标/横版/竖版）留到 Layer 3

### 2.4 辅助图形（极简版）

如果项目包含 VI 系统：
1. 从 Logo 中提取 1 个核心形状
2. 设计 1 种辅助图形（线条类或底纹类）
3. 完整辅助图形系统留到 Layer 3

### Layer 2 执行规则

- **先展示变体**，用户选择后再做评审
- Logo 矢量只出主版本，确认后再出变体
- 辅助图形只出 1 种，确认后再扩展
- 每个物料生成时，**即时预扫描合规**（Phase 5 的快速版，只扫描最关键的 3-5 项）

### brand-profile.md 更新（Layer 2 字段解锁）

- 主色 HEX（如未锁定）
- Logo 变体清单
- 辅助图形策略

### P3-G2 · 细节确认门

```
📍 Phase 3 · Layer 2 完成
━━━━━━━━━━━━━━━━━━━
已产出：
• 样稿变体：3张（用户已选：{变体X}）
• Logo 矢量：主版本（{SVG路径}）
• 辅助图形：{类型}（{SVG路径}）

设计评审关键建议：
• 关键：{建议}
• 重要：{建议}

请确认：
1. 选中的样稿是否满意？（满意 / 需修改）
2. Logo 主版本是否正确？（是 / 需调整）
3. 是否进入高级定制（Logo全变体+完整辅助图形+Canvas精细排版）？（是 / 否，直接扩展物料）
```

**用户回答"否，直接扩展物料"→ 用 Layer 2 产出直接进入 Phase 4。**

---

## Layer 3 · 高级层（Logo 全变体 + 完整辅助图形 + Canvas 精细排版）

> **目标：为需要极致精度的项目提供完整资产。**
> **仅在用户通过 P3-G2 且主动要求/场景需要时解锁。**

### Logo 全变体生成

| 变体 | 说明 | SVG方式 |
|------|------|---------|
| 主Logo(彩色) | 标准使用 | 完整SVG，含品牌色 |
| 主Logo(反白) | 深色背景 | 将填充色反转为白色 |
| 纯图标版 | Favicon/应用图标 | 仅保留图形部分 |
| 纯字标版 | 空间有限 | 仅保留文字部分 |
| 横版组合 | 横幅/信纸 | 图标左、文字右 |
| 竖版组合 | 头像/社交媒体 | 图标上、文字下 |

### 完整辅助图形系统

- 线条类（边框/分割线）
- 底纹类（背景/包装）
- 图形类（重复几何）
- 动态变体（如适用）

### Canvas 精细排版

对于需要精细排版的物料（海报/画册/名片）：
1. 读取 `./dependencies/canvas-design/SKILL.md`
2. 使用 canvas-fonts 精确排版
3. 输出 PDF/PNG

### P3-G3 · Phase 验收门

```
📍 Phase 3 完成 · 最终确认
━━━━━━━━━━━━━━━━━━━
全部视觉资产已产出：
• 样稿：✅（用户已确认方向）
• Logo 矢量：{N}个变体 ✅
• 辅助图形：{N}种 ✅

请确认：
1. 全部 Phase 3 产出是否满意？（满意 / 需修改）
2. 是否进入 Phase 4（VI物料扩展）？（是 / 否）
```

---

## 关键提示

- **R8 铁律**：样稿生成后必须暂停，等待用户确认。禁止一口气做完所有物料再展示。
- **R11 预渲染规则**：Logo/品牌文字/辅助图形确认后，立即预渲染为高清 PNG 保存到 `assets/` 目录，后续物料直接引用。
- 生图模型选择：每次生图前检测环境变量，标注可用/不可用（R-IM2）。
- Seedream 5.0 最小像素数 3,686,400 (≈1920x1920)，不支持 1024x1024。
