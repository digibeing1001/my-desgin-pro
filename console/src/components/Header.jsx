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
    <header className="h-[38px] bg-gdpro-bg border-b border-gdpro-border flex items-center justify-between px-3 shrink-0 z-20">
      {/* Left: Hamburger + Logo + Project context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1 rounded-md hover:bg-gdpro-bg-hover transition-colors text-gdpro-text-muted"
          title="菜单"
        >
          <Menu className="w-4 h-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-gdpro-accent" strokeWidth={2.5} />
          <h1 className="text-[13px] font-semibold text-gdpro-text tracking-tight hidden sm:block">Graphic Design Pro</h1>
          <span className="text-[10px] text-gdpro-text-muted">v3.0</span>
        </div>

        {/* Project context */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-[3px] rounded-md bg-gdpro-bg-surface border border-gdpro-border">
            <span className="text-[12px] font-medium text-gdpro-text-secondary">{currentProject.name}</span>
            <span className="text-[10px] px-1 py-[1px] rounded bg-gdpro-accent/10 text-gdpro-accent font-semibold">
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
          className="p-1 rounded-md hover:bg-gdpro-bg-hover transition-colors disabled:opacity-30"
          title="导出 .gdpro 项目数据"
        >
          <Download className="w-3.5 h-3.5 text-gdpro-text-muted" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
