# Graphic Design Pro Console v3 — 产品重设计文档

> 定位转变：从「规则与工作流的 GUI 展示器」→「设计项目的可视化工作台 + 设计师 Agent 协作界面」

---

## 一、启动方式：Agent 环境感知 + 模式选择

### 1.1 环境检测

Skill 被启动时，自动检测当前运行环境：

| 环境标识 | 检测方式 | 说明 |
|---------|---------|------|
| OpenClaw | `process.env.OPENCLAW_VERSION` / Gateway 特征 | OpenClaw Gateway 后端驱动 |
| WorkBuddy | `process.env.WORKBUDDY_SESSION_ID` | WorkBuddy Agent 环境 |
| QClaw | `process.env.QCLAW_CONTEXT` | QClaw 工具链 |
| Claude Code | `process.env.CLAUDE_CODE` | Claude Code CLI |
| Kimi CLI | `process.env.KIMI_CLI` | Kimi Code CLI |
| 其他 | 回退检测 | 通过调用特征判断 |

### 1.2 启动询问

Skill 首次加载时，向用户展示：

```
🎨 Graphic Design Pro 已加载

检测到当前运行环境：OpenClaw Gateway (localhost:18789)

请选择交互方式：
┌─────────────────────────────────────┐
│ 💬 对话模式（默认）                    │
│   在当前 Agent 中继续对话，由 AI 驱动设计流程  │
├─────────────────────────────────────┤
│ 🖥️  打开图形化工作台                  │
│   在浏览器中打开 Console，可视化管理项目与资产  │
└─────────────────────────────────────┘

> 用户选择后，Console 标题栏显示："Graphic Design Pro · 由 OpenClaw 驱动"
```

### 1.3 通信绑定

Console 与 Agent 建立双向通道：

```
┌─────────────┐      WebSocket/HTTP       ┌─────────────┐
│   Console   │  ←── 状态/产出/文件推送 ───→ │    Agent    │
│  (浏览器)   │  ───→ 用户指令/确认/上传 ───→ │ (后端 Skill) │
└─────────────┘                           └─────────────┘
```

- **Agent → Console**：AI 回复、生成文件、Phase 状态变更、审查报告
- **Console → Agent**：用户输入、文件上传、"采用/拒绝"指令、Phase 跳转请求

---

## 二、主界面重新设计

### 2.1 左侧导航（精简为 5 项）

| 图标 | 名称 | 功能 |
|------|------|------|
| 🏠 | **项目** | 所有设计项目列表，新建/切换/归档 |
| 💬 | **设计师 Agent** | AI 对话界面，当前项目的协作主入口 |
| 🖼️ | **资产库** | 按项目归类的所有设计资产与产出物 |
| 📚 | **参考库** | 用户上传的参考资料、Moodboard、竞品 |
| ⚙️ | **设置** | Agent 连接、环境配置、偏好 |

**移除的（后台静默运行）**：
- ❌ 规则手册 → Agent 后台执行 R1-R18
- ❌ 工作流 → Agent 自动推进 6 Phase
- ❌ 审查工具 → Agent 自动输出审查报告

### 2.2 三栏布局（选中项目后）

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Graphic Design Pro · 项目：星云咖啡 · 当前 Phase：3 · 由 OpenClaw 驱动 │
├──────────────┬──────────────────────────────────────────┬───────────────────┤
│              │                                          │                   │
│  项目文件树   │           设计师 Agent 对话               │    资产预览区     │
│              │                                          │                   │
│  📁 星云咖啡   │  ┌──────────────────────────────┐       │  ┌─────────────┐  │
│  ├── 📋 需求简报 │  │ 用户：我要一个咖啡店品牌      │       │ │ [Logo初稿A] │  │
│  ├── 🎯 设计哲学 │  │ Agent：好的，进入 Phase 1...  │       │ │   预览图    │  │
│  ├── 🖼️ 素材区   │  │ ...                          │       │ │ [采用] [否] │  │
│  │   ├── Logo   │  │ Agent：这是 3 个 Logo 方案    │       │ └─────────────┘  │
│  │   ├── 产品图  │  │ ┌────┐ ┌────┐ ┌────┐        │       │                   │
│  │   └── 场景照  │  │ │ A  │ │ B  │ │ C  │        │       │ ┌─────────────┐  │
│  ├── ✏️ 设计稿   │  │ └────┘ └────┘ └────┘        │       │ │ [名片样稿]  │  │
│  │   ├── 名片   │  │ 你倾向于哪个方向？            │       │ │   预览图    │  │
│  │   ├── 海报   │  └──────────────────────────────┘       │ │ [采用] [否] │  │
│  │   └── 包装   │                                          │ └─────────────┘  │
│  ├── 📦 交付物   │                                          │                   │
│  └── 📋 审查报告 │                                          │                   │
│              │                                          │                   │
└──────────────┴──────────────────────────────────────────┴───────────────────┘
```

---

## 三、项目系统（Project System）

### 3.1 项目数据结构

```typescript
interface Project {
  id: string;           // 唯一标识
  name: string;         // 项目名（如"星云咖啡"）
  brandName: string;    // 品牌名
  status: 'active' | 'archived' | 'completed';
  currentPhase: 1 | 2 | 3 | 4 | 5 | 6;
  createdAt: number;
  updatedAt: number;
  
  // 文档区
  brief: DesignBrief;           // 需求简报（来自表单或对话提取）
  philosophy: DesignPhilosophy; // 设计哲学
  brandProfile: BrandProfile;   // 品牌档案
  
  // 资产区
  assets: {
    logo: Asset[];
    product: Asset[];
    scene: Asset[];
    reference: Asset[];
    draft: Asset[];
    deliverable: Asset[];
  };
  
  // 审查区
  reviewReports: ReviewReport[];
}
```

### 3.2 项目创建

用户可以在 Console 中新建项目：
- 填写项目名/品牌名
- 或直接由 Agent 在对话中自动创建（"帮我设计一个咖啡品牌"→自动创建项目）

### 3.3 项目切换

左侧项目列表点击切换，所有上下文（对话历史、资产、参考）跟随项目切换。

---

## 四、设计师 Agent（对话界面）

### 4.1 不只是聊天

对话界面应该提供：

1. **当前上下文显示**：
   - 顶部栏：项目名 + 当前 Phase + 环境标识
   - Agent 每条回复标注所属 Phase

2. **产出物预览卡片**：
   Agent 生成设计稿时，在对话中直接渲染预览卡片：
   ```
   ┌────────────────────────────┐
   │ 🎨 Phase 3 · Logo 方案 A   │
   │                            │
   │      [ 预览图 ]            │
   │                            │
   │ 设计说明：...               │
   │                            │
   │ [ ✅ 采用 ]  [ ❌ 不采用 ]  │
   │ [ 💬 提修改意见 ]           │
   └────────────────────────────┘
   ```

3. **"采用"机制**：
   - 用户点击「采用」→ 文件自动归档到当前项目的资产库对应分类
   - 用户点击「不采用」→ 文件标记为废弃，不进入资产库
   - **关键原则：未经用户明确采用，任何产出不进入资产库**

4. **文件上传**：
   - 拖拽文件到对话区域上传
   - 上传的参考图自动进入「参考库」
   - 上传的 Logo/产品图自动进入「素材区」

5. **Phase 控制**：
   - Agent 自动推进 Phase
   - 用户可手动指令："回到 Phase 2 修改设计哲学"
   - 每个 Phase 切换时，Agent 输出阶段总结

### 4.2 与资产库的联动

```
Agent 生成设计稿
    ↓
对话中展示预览卡片
    ↓
用户点击「采用」
    ↓
Console 发送 "adopt_asset" 指令到 Agent
    ↓
Agent 确认并保存到项目目录
    ↓
Console 资产库实时更新，显示新归档的文件
```

---

## 五、资产库（核心功能）

### 5.1 按项目 + 分类双维度组织

资产库不是全局的，而是**项目隔离**的：

```
资产库
├── 📁 星云咖啡（当前项目）
│   ├── 🔷 Logo / 品牌标识
│   │   ├── logo-primary-v1.svg  [已采用 · Phase 3]
│   │   ├── logo-mono-v1.png     [已采用 · Phase 3]
│   │   └── logo-draft-A.png     [已废弃]
│   ├── 📸 产品图
│   │   └── product-hero.jpg     [用户上传]
│   ├── 🏢 场景照片
│   │   └── storefront.jpg       [用户上传 · Phase 4]
│   ├── ✏️ 设计稿
│   │   ├── business-card-v1.png [已采用 · Phase 4]
│   │   ├── poster-v1.png        [已采用 · Phase 4]
│   │   └── poster-v2.png        [待确认]
│   ├── 📦 交付物
│   │   ├── vi-manual.pdf
│   │   └── source-files.zip
│   └── 📋 审查报告
│       ├── compliance-report.md
│       └── aesthetic-review.md
│
└── 📁 科技公司官网（其他项目）
    └── ...
```

### 5.2 资产来源

| 来源 | 说明 | 自动归档？ |
|------|------|-----------|
| Agent 生成 | AI 产出的设计稿 | ❌ 需用户「采用」 |
| 用户上传 | 用户拖拽/选择上传 | ✅ 直接进入素材区 |
| Agent 导出 | 审查报告、规范文档 | ✅ 自动归档到交付物 |
| 用户确认 | 需求简报、设计哲学 | ✅ 对话确认后自动归档 |

### 5.3 资产元数据

每个资产记录：
```typescript
interface Asset {
  id: string;
  name: string;
  type: 'image' | 'svg' | 'pdf' | 'md' | 'zip';
  category: 'logo' | 'product' | 'scene' | 'reference' | 'draft' | 'deliverable';
  source: 'agent-generated' | 'user-uploaded' | 'agent-exported';
  status: 'adopted' | 'pending' | 'rejected' | 'draft';
  phase: 1 | 2 | 3 | 4 | 5 | 6 | null;
  version: number;
  projectId: string;
  createdAt: number;
  adoptedAt: number | null;
  previewUrl: string;     // 预览图 URL
  fileUrl: string;        // 实际文件 URL
}
```

---

## 六、参考库（用户主导）

### 6.1 功能定位

参考库是用户自己维护的「灵感素材库」，与 Agent 共享：
- 用户上传竞品截图 → Agent 在 Phase 2 分析时引用
- 用户上传风格参考 → Agent 在 Phase 3 设计时参考
- 用户上传品牌手册 → Agent 提取色值/字体/规范

### 6.2 分类

- 🎯 **竞品参考** — 竞品品牌视觉分析素材
- 🎨 **风格参考** — Moodboard、 Pinterest 采集图
- 📐 **规范参考** — 品牌手册、VI 规范、设计系统
- 🖼️ **通用素材** — 图标、纹理、背景、插画

### 6.3 与 Agent 的共享

参考库中的文件对当前项目的 Agent 可见，Agent 可以在设计时主动引用：
- "基于你上传的竞品参考，我发现他们都使用了圆角元素..."
- "参考了你提供的风格图，我倾向于这种暖色调方向..."

---

## 七、后台静默运行的功能

以下功能**不在 GUI 中展示页面**，但仍在后台执行，结果通过对话或资产库呈现：

| 功能 | 执行者 | 用户感知方式 |
|------|--------|-------------|
| R1-R18 规则检查 | Agent 每步自检 | 违规时 Agent 自动修正并说明 |
| 6 Phase 工作流 | Agent 自动推进 | 对话中标注当前 Phase |
| 合规审查 | Agent Phase 5 自动执行 | 产出「合规审查报告」到资产库 |
| 审美自检 | Agent Phase 5 自动执行 | 产出「审美评审报告」到资产库 |
| 一致性扫描 | Agent 跨物料自动检查 | 发现问题时对话中提示 |
| 位置四问 | Agent 每个物料前自问 | 设计说明中体现答案 |

---

## 八、技术架构调整

### 8.1 通信协议

Console 与 Agent 之间的消息协议：

```typescript
// Console → Agent
type ConsoleMessage =
  | { type: 'chat'; content: string; attachments?: File[] }
  | { type: 'adopt_asset'; assetId: string; projectId: string }
  | { type: 'reject_asset'; assetId: string; reason?: string }
  | { type: 'switch_phase'; phase: number }
  | { type: 'create_project'; name: string; brandName: string }
  | { type: 'upload_reference'; file: File; category: string }
  | { type: 'request_status' }

// Agent → Console
type AgentMessage =
  | { type: 'chat'; content: string; phase?: number }
  | { type: 'asset_generated'; asset: Asset; previewUrl: string }
  | { type: 'phase_changed'; phase: number; summary: string }
  | { type: 'project_created'; project: Project }
  | { type: 'review_report'; report: ReviewReport }
  | { type: 'status'; currentPhase: number; project: Project }
```

### 8.2 存储层

```
localStorage（浏览器）
├── projects: Project[]           // 项目列表
├── currentProjectId: string      // 当前项目
├── references: Reference[]       // 参考库
└── chat_history: Message[]       // 对话历史（按项目分）

Agent 后端（文件系统）
├── projects/{projectId}/         // 项目文件目录
│   ├── brand-profile.md
│   ├── design-philosophy.md
│   ├── assets/                   // 实际文件存储
│   └── deliverables/
```

### 8.3 需要新增的组件

| 组件 | 说明 |
|------|------|
| `ProjectPanel.jsx` | 项目列表 + 新建项目 |
| `ProjectSidebar.jsx` | 项目文件树导航 |
| `AssetViewer.jsx` | 资产预览（图片/文档） |
| `DesignerAgent.jsx` | 重设计的对话界面（含预览卡片） |
| `ReferenceLibrary.jsx` | 参考库管理 |
| `AdoptCard.jsx` | 产出物「采用/拒绝」卡片 |
| `PhaseBadge.jsx` | Phase 状态标识 |

### 8.4 需要移除的组件

| 组件 | 原因 |
|------|------|
| `RulesPanel.jsx` | 规则后台运行 |
| `WorkflowPanel.jsx` | 工作流后台运行 |
| `AuditPanel.jsx` | 审查后台运行，结果进资产库 |
| `BriefPanel.jsx` | 需求简报由 Agent 在对话中生成并保存 |

---

## 九、交互流程示例

### 场景：设计一个咖啡品牌

**Step 1 — 启动**
```
用户：帮我设计一个咖啡品牌
Agent：好的，已创建项目「未命名咖啡品牌」。请选择交互方式：
       [💬 继续对话]  [🖥️ 打开工作台]
用户：打开工作台
→ Console 在浏览器打开，显示新建的项目
```

**Step 2 — Phase 1（需求追问）**
```
Agent（对话）：我们先明确需求。你的咖啡店叫什么名字？
用户：星云咖啡，Nebula Coffee
Agent：目标客群是？
用户：25-35 岁白领
...
Agent：需求已确认，进入 Phase 2。需求简报已保存到项目文档。
→ Console 左侧文件树出现「📋 需求简报」，点击可查看
```

**Step 3 — Phase 2（设计哲学）**
```
Agent（对话）：基于竞品分析，我建议设计哲学为「克制中的温暖」...
用户：同意这个方向
Agent：设计哲学已保存。进入 Phase 3。
→ Console 左侧出现「🎯 设计哲学」
```

**Step 4 — Phase 3（样稿生成）**
```
Agent（对话）：这是 3 个 Logo 方案：
       [预览卡片 A] [预览卡片 B] [预览卡片 C]
用户：点击「采用」卡片 A
Agent：Logo 方案 A 已确认，预渲染素材已保存。
→ Console 资产库「🔷 Logo」出现 logo-primary-v1.svg
```

**Step 5 — Phase 4（物料扩展）**
```
Agent（对话）：基于确认的 Logo，我设计了名片和海报：
       [名片预览] [海报预览]
用户：名片不错，采用。海报需要修改...
Agent：名片已归档。海报修改中...
→ Console 资产库「✏️ 设计稿」出现名片，海报标记为「待修改」
```

**Step 6 — Phase 5-6（审查与交付）**
```
Agent（对话）：所有物料已完成，正在进行合规审查...
Agent：审查通过！交付物已生成。
→ Console 资产库「📦 交付物」出现 VI 手册、源文件包
→ 左侧出现「📋 审查报告」
```

---

## 十、实施优先级

| 优先级 | 功能 | 说明 |
|--------|------|------|
| P0 | 项目系统 + 资产库 | 核心骨架，其他功能依附于此 |
| P0 | 设计师 Agent 对话 + 采用卡片 | 核心交互闭环 |
| P1 | 参考库 | 用户上传 + Agent 共享 |
| P1 | 环境检测 + 启动选择 | 多 Agent 工具适配 |
| P2 | 项目文件树导航 | 左侧文档浏览 |
| P2 | 资产预览 + 版本管理 | 体验优化 |
| P3 | 通信协议完善 | WebSocket / 双向推送 |
| P3 | 设置面板 | 连接配置、偏好 |

---

*文档版本：v3.0*
*日期：2026-04-23*
