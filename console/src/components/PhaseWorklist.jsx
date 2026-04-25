import React, { useState } from 'react';
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';

const PHASE_WORKLIST = {
  1: {
    title: 'Phase 1 · 需求追问',
    description: '明确设计需求、品牌信息、目标受众',
    tasks: [
      { text: '在设计师 Agent 中描述需求', done: true },
      { text: '上传参考图/Logo 等素材', done: true },
      { text: '确认品牌名称和基本方向', done: true },
      { text: 'PM-Clarity 追问法（重述表面需求 → 识别模糊词 → 区分目标与手段 → 暴露假设）', done: false },
      { text: '需求精确度评分（0-3分）', done: false },
      { text: '创建 brand-profile.md（Layer 1 解锁字段）', done: false },
      { text: '资产预检（R15）：追问 Logo/产品图/UI/色值/字体清单', done: false },
      { text: '用户资产入库（保存到 assets/user-uploads/）', done: false },
    ],
  },
  2: {
    title: 'Phase 2 · 竞品分析 + 设计哲学',
    description: '竞品视觉分析 + 品牌战略 + 设计哲学创建',
    tasks: [
      { text: '查看已上传的竞品参考资料', done: true },
      { text: '确认设计方向', done: true },
      { text: '竞品视觉分析（品牌定位/视觉策略/差异化机会）', done: false },
      { text: 'brand-cog 品牌战略定义', done: false },
      { text: 'canvas-design 设计哲学创建（哲学名 + 阐述 + 视觉 DNA）', done: false },
      { text: 'Moodboard 制作（色彩/字体/构图/质感参考）', done: false },
      { text: '位置四问（叙事角色/观众距离/视觉温度/容量估算）', done: false },
      { text: '创建 brand-profile.md（Layer 2 解锁：口号/色值/字体/设计哲学）', done: false },
      { text: '色彩系统生成（色阶+渐变+WCAG）', done: false },
    ],
  },
  3: {
    title: 'Phase 3 · 样稿生成',
    description: 'Logo + 样稿 + 辅助图形',
    tasks: [
      { text: '使用 AI 生图面板生成设计稿', done: true },
      { text: '在对话中评审样稿', done: true },
      { text: '采纳/拒绝资产', done: true },
      { text: 'Logo 设计（svg-draw 矢量绘制 + 刚性规范检查）', done: false },
      { text: '辅助图形/纹理生成（algorithmic-art）', done: false },
      { text: '品牌样稿生成（多场景应用）', done: false },
      { text: '设计评审（5维度评分 + design-critique 11维度）', done: false },
      { text: '品牌一致性自检（R1-R14）', done: false },
      { text: '核心资产预渲染（Logo/辅助图形 → PNG 素材库）', done: false },
      { text: '创建 brand-profile.md（Layer 3 解锁：Logo 变体/辅助图形策略）', done: false },
    ],
  },
  4: {
    title: 'Phase 4 · 物料扩展',
    description: '全套 VI 物料扩展',
    tasks: [
      { text: '查看已采纳资产', done: true },
      { text: '上传新物料素材', done: true },
      { text: 'VI 物料清单确认（100+ 物料选择）', done: false },
      { text: '各物料精确排版（Canvas/HTML/SVG）', done: false },
      { text: '品牌套件批量生成', done: false },
      { text: '跨物料一致性检查（R11 素材复用）', done: false },
      { text: '矢量化输出', done: false },
      { text: 'PSD 分层输出', done: false },
      { text: 'Mockup 效果图生成（3D 软件/PSD 样机）', done: false },
    ],
  },
  5: {
    title: 'Phase 5 · 合规审查',
    description: '合规审查 + 审美自检',
    tasks: [
      { text: '查看项目资产和文档', done: true },
      { text: '14 行业合规扫描（商标法/广告法/食品标签/3C 等）', done: false },
      { text: '合规自动检测', done: false },
      { text: '字体版权审查', done: false },
      { text: '审美自检（格式塔/色彩/排版/网格）', done: false },
      { text: '输出合规审查报告', done: false },
    ],
  },
  6: {
    title: 'Phase 6 · 落地交付',
    description: '印刷前检查 + 数字检查 + VI 规范手册',
    tasks: [
      { text: '导出 .gdpro 项目数据', done: true },
      { text: '下载资产文件', done: true },
      { text: '印刷前检查（出血/色彩模式/分辨率/刀图）', done: false },
      { text: '数字检查（多设备适配/加载速度/交互）', done: false },
      { text: 'VI 规范手册生成', done: false },
      { text: '品牌维护指南', done: false },
      { text: '交付物清单 + 文件路径归档', done: false },
    ],
  },
};

export default function PhaseWorklist({ currentPhase, skillTasks }) {
  const [expanded, setExpanded] = useState(true);
  const phase = currentPhase || 1;

  // Use Skill-provided tasks if available, otherwise fall back to static list
  const info = skillTasks ? {
    title: `Phase ${phase} · ${PHASE_WORKLIST[phase]?.title.split('·')[1]?.trim() || ''}`,
    description: PHASE_WORKLIST[phase]?.description || '',
    tasks: skillTasks,
  } : PHASE_WORKLIST[phase];

  if (!info) return null;

  const doneCount = info.tasks.filter((t) => t.done).length;
  const totalCount = info.tasks.length;

  return (
    <div
      className="shrink-0 mx-3 mb-2 rounded-[14px] overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <ClipboardList className="w-3.5 h-3.5 text-gdpro-accent shrink-0" strokeWidth={2} />
        <span className="text-[11px] font-semibold text-gdpro-text">
          {info.title}
        </span>
        <span className="text-[10px] text-gdpro-text-muted ml-auto">
          {doneCount}/{totalCount}
        </span>
        <span className="text-[10px] text-gdpro-text-muted ml-1 hidden sm:inline">{info.description}</span>
        {expanded ? (
          <ChevronUp className="w-3 h-3 text-gdpro-text-muted ml-1 shrink-0" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-3 h-3 text-gdpro-text-muted ml-1 shrink-0" strokeWidth={2} />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-2">
          <ul className="space-y-0.5">
            {info.tasks.map((task, i) => (
              <li key={i} className="text-[11px] text-gdpro-text-secondary flex items-start gap-1.5">
                <span className={task.done ? 'text-gdpro-success mt-[2px]' : 'text-gdpro-text-muted mt-[2px]'}>
                  {task.done ? '●' : '○'}
                </span>
                {task.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
