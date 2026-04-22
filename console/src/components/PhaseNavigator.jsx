import React from 'react';

const PHASES = [
  { id: 1, name: '需求追问', nameEn: 'Clarify', desc: '理解真实设计需求' },
  { id: 2, name: '竞品分析', nameEn: 'Strategy', desc: '设计哲学与差异化' },
  { id: 3, name: '样稿生成', nameEn: 'Concept', desc: 'Moodboard + 首稿' },
  { id: 4, name: '物料扩展', nameEn: 'Extend', desc: '全套VI物料设计' },
  { id: 5, name: '合规审查', nameEn: 'Review', desc: '法规与审美自检' },
  { id: 6, name: '落地交付', nameEn: 'Deliver', desc: '源文件与手册' },
];

export default function PhaseNavigator({ currentPhase, completedPhases = [], onSelectPhase }) {
  return (
    <div className="w-64 bg-gdpro-bg-elevated border-r border-gdpro-border flex flex-col shrink-0">
      <div className="p-4 border-b border-gdpro-border">
        <h2 className="text-xs font-medium text-gdpro-text-secondary uppercase tracking-widest">
          工作流
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {PHASES.map((phase) => {
          const isActive = currentPhase === phase.id;
          const isCompleted = completedPhases.includes(phase.id);
          const isPending = !isActive && !isCompleted;

          return (
            <button
              key={phase.id}
              onClick={() => onSelectPhase(phase.id)}
              className={`w-full text-left rounded-lg p-3 transition-all duration-200 group
                ${isActive ? 'gdpro-phase-active' : ''}
                ${isCompleted ? 'gdpro-phase-completed opacity-70' : ''}
                ${isPending ? 'gdpro-phase-pending hover:bg-gdpro-bg-surface' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-2xs font-mono font-medium shrink-0
                  ${isActive ? 'bg-gdpro-accent text-gdpro-bg' : ''}
                  ${isCompleted ? 'bg-gdpro-success/20 text-gdpro-success' : ''}
                  ${isPending ? 'bg-gdpro-bg-surface text-gdpro-text-muted group-hover:text-gdpro-text-secondary' : ''}
                `}>
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    phase.id
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isActive ? 'text-gdpro-accent' : isCompleted ? 'text-gdpro-text' : 'text-gdpro-text-secondary'}`}>
                      {phase.name}
                    </span>
                    <span className="text-2xs font-mono text-gdpro-text-muted uppercase">
                      {phase.nameEn}
                    </span>
                  </div>
                  <p className={`text-2xs mt-0.5 ${isActive ? 'text-gdpro-text-secondary' : 'text-gdpro-text-muted'}`}>
                    {phase.desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-gdpro-border">
        <div className="gdpro-card p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xs text-gdpro-text-muted">当前模式</span>
            <span className="gdpro-badge">深度模式</span>
          </div>
          <div className="w-full bg-gdpro-bg-surface rounded-full h-1.5">
            <div
              className="bg-gdpro-accent h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedPhases.length / 6) * 100}%` }}
            />
          </div>
          <p className="text-2xs text-gdpro-text-muted mt-2">
            {completedPhases.length} / 6 阶段已完成
          </p>
        </div>
      </div>
    </div>
  );
}
