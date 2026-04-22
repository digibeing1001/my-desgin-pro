# Console 数据互通协议（v2.0）

> **架构定位：Console 是 Graphic Design Pro Skill 的远程可视化终端（Remote GUI）。**
>
> **核心原则：所有业务逻辑、工作流推进、质量检查、输出生成，均由 Skill 执行。Console 只负责渲染 Skill 的输出，收集用户的输入。**
>
> **违反此原则 = 能力割裂 = 工作流断裂。**

---

## 一、架构关系

```
┌─────────────────────────────────────────────────────────────┐
│                      用户（设计师）                          │
│                         ↓                                   │
│         ┌───────────────┴───────────────┐                   │
│         ↓                               ↓                   │
│   ┌─────────────┐               ┌─────────────┐             │
│   │   Console   │               │   对话界面   │             │
│   │  (Web GUI)  │               │ (OpenClaw)  │             │
│   └──────┬──────┘               └──────┬──────┘             │
│          │                              │                   │
│          └──────────────┬───────────────┘                   │
│                         ↓                                   │
│                  ┌─────────────┐                            │
│                  │   Gateway   │  ← HTTP API 桥接            │
│                  └──────┬──────┘                            │
│                         ↓                                   │
│                  ┌─────────────┐                            │
│                  │    Skill    │  ← 全部业务逻辑             │
│                  │  (业务引擎)  │                             │
│                  └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

**铁律**：
- Console **不产生**设计回复、不模拟工作流、不生成 mock 数据
- Console **不独立执行**合规审查、设计哲学创建、Moodboard 制作等 Skill 能力
- Console **只转发**用户输入和上下文给 Skill，**只渲染** Skill 返回的结构化输出

---

## 二、职责划分

### 2.1 Skill（业务引擎）负责

| 职责 | 说明 |
|------|------|
| **6 Phase 工作流执行** | Phase 1→6 的完整推进，包括追问、分析、生成、扩展、审查、交付 |
| **设计哲学创建** | canvas-design + brand-cog 方法论驱动 |
| **竞品分析** | 品牌视觉分析、差异化策略 |
| **Moodboard 制作** | 色彩/字体/构图/质感参考板 |
| **设计评审** | 5维度评分 + design-critique 11维度评审 |
| **合规审查** | compliance_check.py，14 行业法规扫描 |
| **AI 生图** | 调用 10+ 生图模型，精确参数控制 |
| **矢量化/PSD 输出** | vectorize.py、create_psd.py |
| **VI 规范手册** | pptx skill 生成 PPT |
| **品牌一致性检查** | R1-R18 铁律自检 |
| **渐进式披露** | Layer 1/2/3 + Gate G1-G4 |
| **自进化** | R-E1~E7，用户纠正后自动迭代规则 |
| **审美学习** | R-A1~A10，对话中捕获→翻译→固化偏好 |
| **阶段推进决策** | 决定何时进入下一阶段，Console 只负责展示确认按钮 |

### 2.2 Console（可视化终端）负责

| 职责 | 说明 |
|------|------|
| **渲染对话** | 显示 Skill 返回的 markdown 文本、资产卡片、操作按钮 |
| **收集输入** | 用户消息、文件上传、表单填写、按钮点击 |
| **资产管理** | 浏览、分类、预览、采纳/拒绝状态管理 |
| **档案编辑** | 7维度审美偏好表单（数据同步回 Skill） |
| **知识库上传** | PDF/OCR 解析，分类管理 |
| **@mention 引用** | 在消息中引用项目资产 |
| **模型配置** | LLM + 生图模型选择、自定义模型 |
| **项目切换** | 多项目浏览、创建、阶段查看 |
| **数据同步** | 通过 Gateway 双向同步 `.gdpro/` |
| **展示结构化输出** | 合规报告表格、设计哲学卡片、评审评分、Moodboard 网格 |

### 2.3 禁止行为

| 禁止 | 原因 |
|------|------|
| Console 自己生成设计回复 | 会导致风格漂移、能力缺失、用户预期错位 |
| Console 跳过 Skill 直接调用生图 API | 失去 Skill 的质量门禁和上下文注入 |
| Console 模拟 Phase 推进 | 阶段决策必须由 Skill 根据工作流规则做出 |
| Console 内置 mock 数据 | 用户无法区分真实输出和假数据，导致信任崩塌 |

---

## 三、数据流规范

### 3.1 Console → Skill（请求）

```json
{
  "source": "console",
  "projectId": "proj_xxx",
  "currentPhase": 3,
  "message": "用户输入文本",
  "action": "chat | generate_image | adopt_asset | reject_asset | proceed_phase | compliance_check | ...",
  "context": {
    "designerProfile": { "preferences": [...], "prohibitions": [...] },
    "knowledgeBase": { "references": [...] },
    "projectAssets": { "adopted": [...], "pending": [...] },
    "systemPrompt": "完整 system prompt"
  },
  "config": {
    "llm": "gpt-4o",
    "imageModel": "seedream"
  }
}
```

### 3.2 Skill → Console（响应）

```json
{
  "text": "markdown 格式的回复文本",
  "phase": 3,
  "phaseAction": null,
  "assets": [
    { "id": "...", "name": "...", "type": "image", "url": "...", "status": "pending" }
  ],
  "buttons": [
    { "type": "confirm", "label": "确认，继续推进", "payload": { "action": "confirm_phase" } }
  ],
  "structuredOutput": {
    "type": "compliance_report | design_philosophy | moodboard | critique | ...",
    "data": { ... }
  },
  "syncFiles": {
    ".gdpro/designer-profile.json": "{...}",
    ".gdpro/projects/proj_xxx.json": "{...}"
  }
}
```

**phaseAction**：当 Skill 决定推进/回退阶段时，返回 `proceed_to_phase_4` 或 `back_to_phase_2`，Console 显示确认对话框。

**structuredOutput**：Skill 返回的结构化数据，Console 根据 `type` 渲染对应的组件：
- `compliance_report` → ComplianceReport 组件
- `design_philosophy` → DesignPhilosophyCard 组件
- `moodboard` → MoodboardGrid 组件
- `critique` → CritiqueScoreCard 组件
- `color_system` → ColorPalette 组件

---

## 四、Phase 推进控制

**铁律：阶段推进的决策权只属于 Skill。**

### 4.1 正确流程

```
Console 用户点击「推进」按钮
        ↓
Console 发送 action: "request_proceed_phase" 给 Skill
        ↓
Skill 检查当前 Phase 完成度（R8 逐步确认规则）
        ↓
Skill 返回 phaseAction: "confirm_proceed_to_phase_4"
        ↓
Console 显示确认对话框：「Skill 确认当前阶段已完成，是否进入 Phase 4？」
        ↓
用户点击「确认」
        ↓
Console 发送 action: "confirm_proceed_phase" 给 Skill
        ↓
Skill 执行阶段切换，更新 brand-profile.md，返回新阶段上下文
```

### 4.2 禁止行为

- Console **不得**自行推进阶段
- Console **不得**允许用户跳过阶段
- Console **不得**在 Skill 未确认的情况下解锁下一阶段的功能

---

## 五、版本控制

| 协议版本 | 日期 | 变更 |
|---------|------|------|
| v1.0 | 2026-04-22 | 初始版本，定义 JSON 格式 + 基础规则 |
| v1.1 | 2026-04-22 | 新增维度映射表，统一设计师档案 ↔ 审美档案 |
| v1.2 | 2026-04-22 | 新增 Gateway 文件系统 API 规范 |
| **v2.0** | **2026-04-22** | **架构重构：明确 Console 是 Skill 远程可视化终端；定义职责划分铁律；禁止 Console 独立执行业务逻辑；定义结构化输出渲染规范** |
