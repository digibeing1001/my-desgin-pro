# graphic-design-pro 更新日志

## [v2.5.0] - 2026-04-22

### 新增
- **`design gui` 命令**：在 OpenClaw/WorkBuddy 等 Agent 平台输入 `design gui` 即可启动 Graphic Design Pro Console 可视化前端
- **`scripts/launch_console.py`**：纯 Python 启动脚本，无需 Node.js 运行时。自动查找 `console/dist/` 目录 → 启动 HTTP server（默认端口 3005，自动避让占用端口）→ 自动打开浏览器
- **R-T6 · Console 命令触发规则**：用户输入 `design gui` / `打开console` / `启动gui` 时，不进入任何 Phase，直接启动 Console

### 为什么做这些变更
- **触发原文**："在 OpenClaw 等任何安装了这个 skill 的地方，输入 design gui 即可启动 console"
- **根因**：Console 构建完成后（`npm run build`），用户需要一个简单的方式在本地启动它。之前没有标准化的启动方式，用户需要手动 `npx serve` 或配置复杂的开发服务器
- **修正**：提供一个零依赖的 Python 脚本，Agent 平台可直接调用；脚本自动处理端口占用、目录查找、浏览器打开

### 影响
- Console 可通过 `design gui` 一键启动，降低使用门槛
- 不需要全局安装 `npx serve` 或任何 Node.js 工具
- 构建产物 `console/dist/` 即开即用

---

## [v2.3.0] - 2026-04-22

### 新增
- **Console 数据互通协议**（`references/console-integration.md`）：定义 `.gdpro/` 数据格式规范，包含 `designer-profile.json`、`knowledge-base.json`、`projects/{id}.json` 三层数据结构
- **R-CINT-1~6 · Console 集成规则**：Skill 启动时自动扫描 `.gdpro/` 目录，注入设计师档案/知识库/项目资产到 system prompt；资产状态以 Console 为准；阶段推进保持一致
- **R3-C · Console 设计师档案优先**：如果 `.gdpro/designer-profile.json` 存在，其审美偏好覆盖默认风格建议
- **Console Context Assembler**（`console/src/lib/contextAssembler.js`）：每次 Agent 对话自动组装 system prompt — 设计师档案（7维度审美）+ 知识库解析内容 + 已采纳资产 + 项目阶段
- **Console 导出功能**：Header 新增导出按钮，可下载 `.gdpro.json` 项目数据包，供 Skill 导入以保持上下文连续性
- **Console 阶段名修复**：`contextAssembler.js` 阶段名从 5 个补全为 6 个，与 `projects.js` 对齐

### 为什么做这些变更
- **触发原文**："这个设计师 agent 在运作的时候，是否会从设计师档案、资产库及知识库中引用内容来完成工作，尤其是将设计师档案作为设计师 agent 的主要执行参照？"
- **根因**：1) Console 的 Agent 是 mock 回复，完全不读取设计师档案/知识库/资产库；2) Skill 与 Console 的数据格式完全不互通（Skill 用 markdown 文件，Console 用 localStorage JSON）；3) 用户在 Console 上传的竞品/规范资料，Skill 完全看不到；4) 两边 Agent 的"大脑"输入不一致，导致风格漂移

### 影响
- Console Agent 每次回复都会展示已加载的 context 摘要（设计师档案 / 知识库 / 资产 / 阶段）
- Skill 与 Console 之间可通过 `.gdpro.json` 文件桥接数据，确保对话界面和 Web UI 的风格一致性
- 为后续真实 LLM API 接入做好了 system prompt 组装层准备
- **Console ↔ Skill 设计师档案统一**：`contextAssembler.js` 新增 AP 编号映射体系，Console 7 维度表单自动翻译为 Skill `brand-profile.md` 审美档案格式（| AP编号 | 维度 | 偏好 | 参数 | 来源 |）
- **全局档案 vs 项目档案关系明确**：`.gdpro/designer-profile.json` 为全局级审美 DNA，跨项目生效；`brand-profile.md` 审美档案为项目级叠加；冲突时全局禁止项 > 项目偏好，项目锁定色值 > 全局色彩倾向
- **Skill R-A3-C 新增**：对话采集的审美偏好必须同时写入全局 `.gdpro/designer-profile.json`，确保 Console 表单数据与 Skill 对话数据永不分裂
- **Gateway 文件系统桥接**：Console `api.js` 新增 `/fs/read` `/fs/write` `/fs/list` `/fs/exists` `/fs/sync-gdpro` 5 个 API；`storage.js` 新增 `queueSync()` / `flushSyncQueue()` / `pullFromGateway()` / `saveToLocalAndSync()`；App 连接 Gateway 后自动双向同步 `.gdpro/` 数据
- **离线兜底机制**：Gateway 未连接时降级到 localStorage，显示「离线模式」提示，保留手动导出功能

---

## [v2.4.0] - 2026-04-22

### 架构重构：Console 作为 Skill 远程可视化终端

> **这是根本性的架构调整。** 之前 Console 是一个「独立的前端应用」，有 mock 回复、本地工作流、离线功能。现在 Console 是「Skill 的远程 GUI」，所有业务逻辑由 Skill 执行。

### 变更
- **移除 Console 所有 mock/fallback 逻辑**：`DesignerAgent.handleSend` 不再自己生成回复，失败时显示「无法连接到 Skill」错误提示
- **移除 Console 模拟生图**：`handleGenerate` 失败时不再显示占位图，显示错误消息
- **增加连接状态阻塞提示**：App 顶部显示红色横幅「Console 是 Skill 可视化前端，当前未连接 Skill」
- **新增 R-CONSOLE-1~7**：Console 前端协议铁律（不产生回复/不独立执行工作流/阶段推进权归 Skill/结构化输出渲染/Context 完整性/双向同步/离线即阻塞）
- **console-integration.md v2.0**：架构重构，明确职责划分、数据流规范、Phase 推进控制、禁止行为清单
- **增加 `_skillData` 字段**：Skill 返回的 `structuredOutput` 通过此字段传递给 Console 渲染组件
- **新增 CapabilityNotice 组件**：各视图显示能力边界提示（Console 可完成 vs 需 Skill 完成）
- **新增 PhaseWorklist 组件**：当前 Phase 的工作清单，明确区分 Console 任务和 Skill 任务

### 为什么做这些变更
- **触发原文**："要明白两边的能力必须是一致的，工作流也是要一致的。Web UI 是一个前端的 GUI 界面，但依赖于 Skill 来完成运作。不应该两边在工作流上和能力上是割裂的"
- **根因**：Console 之前作为独立应用运行，有自己的 mock 逻辑、本地决策、离线 fallback。这导致用户以为 Console 能独立完成设计工作，实际上大量核心能力（合规/设计哲学/评审/渐进式披露）完全缺失
- **修正**：将 Console 明确定位为 Skill 的可视化终端，所有业务逻辑委托给 Skill，Console 只做 UI 渲染

### 影响
- Console 未连接 Skill 时，所有设计功能不可用（之前会显示 mock 回复误导用户）
- Skill 必须能够接收结构化输入并返回结构化输出
- Gateway 后端必须实现 `/chat` 接口，将请求转发给 Skill
- 未来 Console 新增功能（合规面板、Moodboard 画布、评审评分卡）都对应 Skill 的 `structuredOutput` 渲染

---

## [v2.2.0] - 2026-04-22

### 新增
- **R15 · 用户提供素材强制使用原则**：用户上传的任何素材必须立即入库（`assets/user-uploads/`）并登记到 `brand-spec.md`；后续所有产出强制引用，禁止忽略或擅自用 AI 重绘替代。用户提供 Logo → 立即跳过 Logo 生成步骤
- **R16 · 产出路径分叉规则**：明确区分「精确排版稿」（HTML/Canvas/SVG，像素级精确，可直接交付）和「AI 概念图」（生图模型基于 prompt 重新创作）。禁止将精确排版稿作为 prompt 让 AI "重新生成"
- **Phase 1 资产预检流程**：Layer 1 新增用户资产追问，明确列出 Logo/产品图/UI/色值/字体清单，上传即入库
- **Phase 3 已有素材模式**：当用户提供 Logo/素材时，进入「资产确认→入库→预渲染→基于素材扩展」分支，不再走标准 Logo 生成流程
- **Phase 3 图生图强制规则**：使用用户提供素材进行生图时，必须使用 `reference_image` 参数，prompt 必须明确说明素材角色
- **Phase 4 Mockup 工作流**：明确「精确设计稿」「场景 Mockup」「风格探索」三种需求的正确路径，提供路径决策流程图和禁止行为清单
- **R17 · 场景化设计真实锚定原则**：涉及前台/门头/展墙等真实空间设计时，必须基于用户提供的场景照片进行。区分「通用样机 Mockup（路径 C-Mockup）」和「真实场景融合（路径 C-Real）」
- **路径 C-Real 真实场景融合工作流**：基于用户场景照片进行尺寸估算→用户确认→按真实比例设计→导出 PNG→使用图生图/多参考图将设计稿融入真实场景，保持原场景光照透视
- **R18 · AI 生图边界原则**：明确 AI 生图是创意生成工具，不是精确设计工具/3D 渲染引擎。涉及精确排版、跨图一致性、3D 结构折叠的场景，禁止使用 AI 生图作为最终交付路径
- **`references/ai-image-limitations.md`**：新增 AI 生图能力边界文档，涵盖技术原理、漂移根因、3D 结构限制、Prompt 真相、场景路径推荐、自检清单
- **包装效果图路径修正**：明确包装效果图必须使用 3D 软件/专业包装工具/PSD 样机模板，严禁用 AI 生图直接生成（会导致空间扭曲、面连接错误、不可能几何）
- **漂移一致性说明**：在 `references/image-models.md` 新增「一致性与 Seed 控制」章节，说明扩散模型随机性本质，提供缓解方案和根治方案（确定性工具替代）

### 为什么做这些变更
- **触发原文**："已经提供了 logo 的 JPG 图片给你，但是你在实际设计的过程中仍然没有使用这张图片" + "先给我做出了一个作品的 HTML 页面，但生成效果图时与该页面不相同" + "按照前台位置来设计，能否根据前台的位置判断尺寸和比例，并且最终的效果图基于我提供的真实场景照片生成？" + "每次 HTML 网页和生成的效果图差距很大" + "前后效果图形的漂移一致性非常差" + "生成的包装盒效果图和刀图并不一致，出现空间扭曲，连盒子形状都不是"
- **根因**：1) skill 缺少"用户提供素材必须使用"的硬规则；2) 没有"已有素材模式"分支；3) 混淆了"精确排版稿"和"AI 概念图"两条独立技术路径；4) 缺少基于真实场景照片的设计工作流；5) ** skill 过度依赖 AI 生图，没有明确其能力边界，导致用户期望用 AI 解决"精确排版/3D 结构/跨图一致性"等物理不可能问题**；6) **包装物料的 R10 双产出规则误导执行者用 AI 生图生成包装 3D 效果图**

### 影响
- 用户提供素材的场景下，Logo/素材 100% 被使用
- HTML/Canvas 精确稿与 AI 效果图的产出路径彻底分离
- 场景 Mockup 有标准化工作流（路径 C-Mockup / C-Real）
- **AI 生图能力边界明确：精确排版/3D 结构/跨图一致性场景切换到确定性工具，避免空间扭曲和一致性崩溃**
- **包装物料效果图路径修正：从"AI 生图"切换到"3D 软件/专业工具/PSD 样机"**

---

## [v2.1.4] - 2026-04-21

### 修复与优化
- **上下文溢出修复**：SKILL.md 从 58.5KB/811行 压缩至 49.2KB/820行（-16%），单回合加载风险显著降低
- **进化日志拆分**：E-001~E-011 完整历史移至 `references/evolution-log.md`，SKILL.md 只保留最新3条摘要
- **重复定义集中化**：位置四问/5-10-2-8 仅在 SKILL.md 保留权威定义，phase-1/2/3/4.md 改为引用
- **核心资产协议精简**：SKILL.md 保留摘要+速记版，Step 1-4 详细流程移至 `references/brand-spec.md`
- **Gate 命名去重**：6个 Phase 中的 Gate G1~G4 重命名为 P1-G1~P6-G4，消除混淆风险
- **R-I7 孤儿引用修复**：`skill-self-evolution.md` 中不存在的 R-I1~R-I7 改为引用实际存在的渐进式披露协议+Gate系统
- **11维评审引用修正**：`phase-3.md` 中错误的 "见 SKILL.md" 改为正确引用 `./dependencies/design-critique/SKILL.md`

### 为什么做这些变更
- **触发原文**："现在进行最后一次评估：这个 skill 的执行是否步骤精准？是否会产生上下文溢出？是否会发生漂移？"
- **根因**：质量审计发现 4 个关键问题：1) SKILL.md 过大导致上下文溢出风险；2) 位置四问/5-10-2-8 在 5 个文件中重复定义；3) Gate 命名在每个 Phase 中重名；4) 进化日志 11 条历史记录稀释当前指令

### 影响
- 单回合最大上下文加载从 ~126KB 降至 ~105KB
- AI 注意力稀释风险降低，规则漏执行概率下降
- 维护成本降低（修改一处定义即可全局生效）
- 引用关系澄清，减少执行漂移

---

## [v2.1.3] - 2026-04-21

### 新增
- **前端设计审美方法论**：`references/frontend-design-aesthetics.md`（设计思维4问 + 前端审美5维 + 反generic AI清单 + 数字物料检查清单）
- **算法艺术指南**：`references/algorithmic-art-guide.md`（算法哲学框架 + 5大技术工具箱 + 种子随机性 + 参数设计）
- **外部资源索引**：`references/external-resources.md`（分类整理50+在线设计资源）
- **7个依赖全部打包**：brand-cog / canvas-design / color-palette / design-critique / pptx / svg-draw / ui-design-review，确保复制 skill 文件夹时依赖不断裂
- **外部路径修复**：4处 `~/.workbuddy/skills/xxx` 绝对路径改为 `./dependencies/xxx/` 相对路径
- **Phase 2 设计哲学增强**：融入 canvas-design 完整方法论（风格库起点 + craftsmanship强调 + 90%视觉10%文字原则）

### 为什么做这些变更
- **触发原文**："将 frontend-design / canvas-design / algorithmic-art 三个 Skill 融入流程；awesome-design.md 作为素材参考；检查依赖是否已打包"
- **根因**：缺少前端级审美方法论、算法艺术方法论、外部资源索引；依赖引用使用外部绝对路径导致复制时断裂

### 影响
- 审美方法论从平面设计扩展至前端级（动效/空间构图/背景细节）
- 辅助图形/纹理生成有系统方法可参考
- Skill 可移植性提升（复制文件夹即可使用，不依赖外部路径）

---

## [v2.1.2] - 2026-04-21

### 新增
- **反AI Slop清单**：`references/anti-ai-slop.md`（视觉/字体/色彩/Layout/内容/平面设计专属陷阱 + 决策速查）
- **品位锚点**：`references/taste-anchors.md`（120%/80%原则 + 字体配对策略 + 色彩策略 + 信息密度分型 + 细节签名 + Scale规范 + 质感营造）
- **设计哲学风格库**：`references/design-philosophies.md`（13种风格 + 生图提示词DNA + MoodNotLayout原则）
- **Phase 3 增强**：MoodNotLayout原则注入（描述情绪而非布局）
- **Phase 5 增强**：场景侧重 + Top10反AI Slop问题扫描
- **design-aesthetics.md 增强**：评分标准 + 快速测试

### 为什么做这些变更
- **触发原文**："huashu-design skill中是否有可以增强 Graphic Design Pro 设计审美的内容？"
- **根因**：审美体系偏重基础规则，缺少具体的品位判断力——无法识别AI slop视觉套路、没有字体配对策略、没有设计哲学风格库可参考

### 影响
- 全流程审美下限提升（每次设计前可识别并避免slop）
- 有具体风格方向可参考，不再从零开始
- 有品位判断框架，减少主观决策偏差

---

## [v2.1.1] - 2026-04-21

### 新增
- **位置四问（R-H1）**：每个物料开工前确认叙事角色/观众距离/视觉温度/容量估算
- **5-10-2-8素材门槛（R-H2）**：搜索5轮→10候选→精选2个→每个8分以上
- **核心资产协议（R-H3）**：Logo>产品图>UI截图>色值>字体的识别度优先级，写入 `brand-spec.md`
- **诚实Placeholder（R-H4）**：暂缺素材时标注占位，不伪造
- **验证管道（R-H5）**：交付前强制验证清单
- **五维专家评审框架**：哲学一致性/视觉层级/细节执行/功能性/创新性 0-10分评分
- **brand-spec.md 模板**：品牌资产规范单一真实来源
- **Phase 1~6 注入**：各 Phase 增加对应 huashu-design 机制（语境预检/语境定位/素材质量门/五维评审/验证管道）

### 为什么做这些变更
- **触发原文**："整合huashu-design的互补能力：品牌资产协议、位置四问、5-10-2-8素材门槛、五维评审、诚实Placeholder、验证管道"
- **根因**：品牌一致性（CSS剪影替代真实资产）、素材质量（随意用图）、评审维度（主观审美缺乏结构化评分）、交付质量（无验证管道）方面存在系统性缺口

### 影响
- 品牌一致性从"靠自觉"变为"靠结构"
- 素材质量有明确门槛，不再滥竽充数
- 评审从主观"好不好看"变为结构化评分
- 交付可靠性提升（交付前强制验证）

---

## [v2.1.0] - 2026-04-21

### 新增
- **渐进式披露协议（Progressive Disclosure Protocol）**：三层披露模型（Surface/Detail/Advanced）+ 四层强制检查点（G1-G4），解决信息过载导致的注意力稀释和规则漏执行问题
- **Phase 内分层执行**：每个 Phase 拆分为 Layer 1/2/3，按「方向确认→细节补全→高级定制」递进，禁止一次性暴露全部指令
- **brand-profile.md 渐进式字段解锁**：字段按 Phase/Layer 逐步解锁，未解锁字段显示为 `🔒 待 Phase X Layer Y 解锁`，禁止提前填写
- **Gate 强制检查点机制**：G1方向确认门、G2细节确认门、G3产出验收门、G4一致性闸门，每个 Gate 有标准确认句式，未过 Gate 禁止推进
- **PD-1~PD-7 分层执行规则**：明确 Layer 间递进条件、禁止预告未解锁内容、禁止跨 Phase 自动带入高级内容
- **Phase 1 重构为分层结构**：Layer 1 只问4个核心维度+创建 brand-profile.md（只填Layer1字段），Layer 2 动态追问剩余维度，Layer 3 处理边缘需求
- **Phase 2 重构为分层结构**：Layer 1 只给竞品速览+3个差异化方向选项，Layer 2 展开品牌战略+设计哲学+Moodboard，Layer 3 深度阐述+品牌案例对标
- **Phase 3 重构为分层结构**：Layer 1 只生成1张首稿确认方向，Layer 2 生成2-3变体+评审+Logo主版本+1种辅助图形，Layer 3 Logo全变体+完整辅助图形+Canvas精细排版
- **Phase 4 重构为分层结构**：Layer 1 只确认物料清单+生成色彩系统（不设计物料），Layer 2 逐物料生成+逐个确认，Layer 3 响应式Logo+完整规范手册+特殊工艺
- **Phase 5 重构为分层结构**：Layer 1 高危5项速查+风险分级，Layer 2 完整20项合规审查+审美自检，Layer 3 深度风险评估+整改方案+长期合规策略
- **Phase 6 重构为分层结构**：Layer 1 交付物清单+印刷/数字检查清单，Layer 2 VI规范手册PPT+维护指南，Layer 3 特殊工艺+供应商建议+长期维护策略
- **渐进式披露 vs 渐进式加载对比表**：明确两个机制的区别（文件级加载 vs 指令级披露）

### 为什么做这些变更
- **触发原文**："改善这个 skill 的执行过程，使用渐进式披露来保证它的执行精度和出品质量"
- **根因**：虽然 Skill 已有 Phase 分文件和 R8 逐步确认规则，但每个 Phase 内部仍一次性暴露全部指令，导致 AI 注意力稀释、关键规则漏执行、用户被信息淹没。需要更细粒度的「指令级」渐进披露，确保每一步只做当下最必要的事，确认后再解锁下一步。

### 影响
- 每个 Phase 的执行精度显著提升（Layer 间 Gate 强制确认，减少方向偏差）
- 用户决策压力降低（一次只面对 Layer 1 的信息量）
- 返工率降低（方向在 Layer 1 就确认，细节在 Layer 2 补全）
- brand-profile.md 字段按进度解锁，避免过早承诺无法兑现的锁定项
- 轻量级项目可快速跳过 Layer 2/3，不增加额外负担

---

## [v2.0.0] - 2026-04-20

### 新增
- **思维框架选配**：7大框架（第一性原理/奥卡姆剃刀/逆向思维/反脆弱/二八法则/复利/贝叶斯），按需选配2-4项，融入自my-skill方法论
- **模式路由**：4级项目复杂度分级（轻量级/中等/深度/重构），不同规模走不同深度，融入自PM-Clarity
- **Top 5翻车场景预判**：每Phase开始前快速扫描，融入自PM-Clarity防翻车机制
- **Phase 1 Clarify追问法**：6步骤（重述→识别模糊词→区分目标与手段→暴露假设→精确度评分→重写需求），融入自PM-Clarity
- **设计领域模糊词追问对照表**：大气/高端/年轻/专业/简约等常见模糊词的追问方式
- **区分目标与手段3种伪装**：手段伪装成目标/恐惧伪装成目标/跟风伪装成需求
- **需求精确度评分**：0-3分，<2分不计入有效追问轮数
- **设计假设管理**：硬约束vs软约束区分 + 假设暴露清单，融入自PM-Clarity
- **输出前5问**：每次交付前自检，融入自PM-Clarity自检5问
- **追问停止规则**：3条规则（用户喊停/精确度达标/最多轮到达）+ 需求简报模板，融入自my-skill
- **Reflect 7步法**：Identify→Read→Impact scan→Determinism→Propose→Confirm→Apply，融入自my-skill，替代原有简单的三步进化
- **渐进式加载原则**：4层加载架构说明（元数据/主控/Phase指令/参考资源），融入自my-skill
- **版本号+CHANGELOG机制**：语义化版本号 + CHANGELOG.md详细记录，融入自my-skill
- **关键原则新增4条**：#17解释为什么不堆砌MUST、#18假设必须暴露、#19模式路由、#20复利积累
- **R-E4增强**：进化日志+CHANGELOG.md双写
- **执行铁律第4条**：每个Phase产出必须以可执行决策/行动收尾

### 为什么做这些变更
- **触发原文**："我在本地有一个my-skill、有一个pm skill，请将相关原则融入到这个skill中，以帮助这个设计skill更好出品"
- **根因**：graphic-design-pro虽然规则体系完善，但缺少产品级的需求追问方法论（导致Phase 1追问不够深）和Skill工程方法论（导致迭代缺乏结构化反思和版本管理）

### 影响
- Phase 1追问质量显著提升（Clarify追问法+精确度评分+停止规则）
- 全流程增加思维框架支撑（不再只靠硬规则驱动）
- 自进化机制从3步升级为7步Reflect（更结构化、更可追溯）
- 新增版本号机制，未来迭代变更有据可查
- 模式路由避免简单项目过度流程化

---

## [v1.0.0] - 2026-04-20

### 初始版本
- 6阶段工作流（需求追问→竞品分析+设计哲学→Moodboard+样稿→VI物料→合规审查→落地指导）
- 品牌一致性铁律 R1-R10
- Skill自进化机制 R-E1~R-E7
- 审美学习与风格固化 R-A1~R-A10
- 多模型生图体系（10家16+模型）R-IM1~R-IM8
- 知识库自动扫描 R-KB
- 内容增长控制 R-CG1~R-CG6
- 自动触发规则 R-T1~R-T5
- 6个Phase分文件架构（references/phase-1~6.md）
- 14行业合规规范
- 9品牌案例知识库
- 39个设计参考网站
