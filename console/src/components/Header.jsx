import React from 'react';
import { Zap, Download, Menu } from 'lucide-react';
import ModelSelector from './ModelSelector';

export default function Header({
  onExport,
  onToggleMobileSidebar,
  currentProject,
  llm,
  imageModel,
  onChangeLLM,
  onChangeImageModel,
  agentEnv,
  modelsDetected,
}) {

  const ENV_LABELS = {
    openclaw: 'OpenClaw',
    workbuddy: 'WorkBuddy',
    qclaw: 'QClaw',
    claude: 'Claude Code',
    kimi: 'Kimi CLI',
    unknown: '本地模式',
  };

  return (
    <header
      className="h-[42px] flex items-center justify-between px-3 shrink-0 z-20 relative"
      style={{
        background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Left: Hamburger + Logo + Project context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gdpro-text-muted"
          title="菜单"
        >
          <Menu className="w-4 h-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2DD4BF, #0EA5E9)' }}
          >
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-[13px] font-semibold text-gdpro-text tracking-tight hidden sm:block">Graphic Design Pro</h1>
          <span className="text-[10px] text-gdpro-text-muted font-medium">v3.0</span>
        </div>

        {/* Project context */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-[4px] rounded-lg glass-panel">
            <span className="text-[12px] font-medium text-gdpro-text-secondary">{currentProject.name}</span>
            <span className="text-[10px] px-1.5 py-[2px] rounded-md font-semibold"
              style={{ background: 'rgba(45,212,191,0.15)', color: '#2DD4BF' }}
            >
              P{currentProject.currentPhase}
            </span>
          </div>
        )}
      </div>

      {/* Center: Agent Environment */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-[10px] text-gdpro-text-muted font-medium">{ENV_LABELS[agentEnv] || ENV_LABELS.unknown}</span>
      </div>

      {/* Right: Model Selector + Export */}
      <div className="flex items-center gap-2">
        <ModelSelector
          llm={llm}
          imageModel={imageModel}
          onChangeLLM={onChangeLLM}
          onChangeImageModel={onChangeImageModel}
          modelsDetected={modelsDetected}
        />

        <button
          onClick={onExport}
          disabled={!currentProject}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
          title="导出 .gdpro 项目数据"
        >
          <Download className="w-3.5 h-3.5 text-gdpro-text-muted" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
