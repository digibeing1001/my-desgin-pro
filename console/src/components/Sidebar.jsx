import React, { useState } from 'react';
import { MessageSquare, Image, BookOpen, User, ChevronLeft, Sparkles, FolderOpen, Plus, Check, X, Settings, Link, Link2, Unlink, Loader2 } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'agent', label: '设计师 Agent', icon: MessageSquare },
  { id: 'assets', label: '资产库', icon: Image },
  { id: 'references', label: '知识库', icon: BookOpen },
  { id: 'profile', label: '设计师档案', icon: User },
];

const STATUS_CONFIG = {
  connected: { dot: 'bg-gdpro-success', icon: Link2, label: 'Agent Skill 正常运行', sub: '已连接', theme: 'border-gdpro-success/20 bg-gdpro-success/5' },
  connecting: { dot: 'bg-gdpro-accent animate-pulse', icon: Loader2, label: '连接中', sub: '正在检测 Gateway…', theme: 'border-gdpro-accent/20 bg-gdpro-accent/5' },
  disconnected: { dot: 'bg-gdpro-danger', icon: Unlink, label: '离线', sub: 'Gateway 连接失败', theme: 'border-gdpro-danger/20 bg-gdpro-danger/5' },
  unknown: { dot: 'bg-gdpro-text-muted', icon: Unlink, label: '未检测', sub: '未连接 Skill', theme: 'border-gdpro-text-muted/20 bg-white/[0.03]' },
};

export default function Sidebar({ activeView, onChange, collapsed, onToggle, projects, currentProjectId, onProjectSwitch, onProjectCreate, mobileOpen, onCloseMobile, connectionStatus, onOpenSettings, agents, currentAgentEnv, onSwitchAgent, onDisconnect }) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreate = () => {
    const name = newProjectName.trim();
    if (!name) return;
    onProjectCreate?.(name);
    setShowNewProject(false);
    setNewProjectName('');
  };

  const status = STATUS_CONFIG[connectionStatus] || STATUS_CONFIG.unknown;
  const isConnected = connectionStatus === 'connected';
  const StatusIcon = status.icon;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}
      <div
        className={`shrink-0 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-[56px]' : 'w-[230px]'
        } ${
          mobileOpen
            ? 'fixed left-0 top-[42px] bottom-0 z-40 md:relative md:top-auto md:z-auto'
            : 'hidden md:flex'
        }`}
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
      {/* Toggle */}
      <div className="h-[42px] flex items-center justify-between px-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {!collapsed && <span className="text-[10px] font-semibold text-gdpro-text-muted uppercase tracking-wider">导航</span>}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          title={collapsed ? '展开' : '收起'}
        >
          <ChevronLeft
            className={`w-3.5 h-3.5 text-gdpro-text-muted transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Main Nav */}
      <nav className="py-2 px-2 space-y-[2px] shrink-0">
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`mac-sidebar-item ${isActive ? 'mac-sidebar-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <Icon
                className={`w-[15px] h-[15px] shrink-0 ${isActive ? 'text-gdpro-accent' : 'text-gdpro-text-muted'}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {!collapsed && (
                <span className="text-[12px] font-medium leading-tight">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          {/* Divider */}
          <div className="mx-3 my-2 h-px shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Projects Section */}
          <div className="px-3 mb-1 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-semibold text-gdpro-text-muted uppercase tracking-wider">项目</span>
            {!showNewProject && (
              <button
                onClick={() => setShowNewProject(true)}
                className="p-0.5 rounded hover:bg-white/10 transition-colors text-gdpro-text-muted hover:text-gdpro-text"
                title="新建项目"
              >
                <Plus className="w-3 h-3" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {showNewProject && (
            <div className="px-2 mb-1.5 animate-fade-in shrink-0">
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="gdpro-input text-[11px] py-[3px] px-2 flex-1"
                  placeholder="项目名称"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setShowNewProject(false); setNewProjectName(''); }
                  }}
                />
                <button onClick={handleCreate} className="p-1 rounded-lg gdpro-button text-gdpro-bg hover:brightness-110 transition-all">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </button>
                <button onClick={() => { setShowNewProject(false); setNewProjectName(''); }} className="p-1 rounded-lg hover:bg-white/10 text-gdpro-text-muted transition-colors">
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* Projects List — scrollable */}
          <div className="px-2 pb-1 space-y-[1px] overflow-y-auto min-h-0 flex-1">
            {projects.map((p) => {
              const isActive = currentProjectId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onProjectSwitch(p.id)}
                  className={`w-full flex items-center gap-2 px-2 py-[6px] rounded-xl text-left transition-all duration-150 ${
                    isActive
                      ? 'text-gdpro-accent'
                      : 'text-gdpro-text-secondary hover:text-gdpro-text hover:bg-white/[0.06]'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(45,212,191,0.15) 0%, rgba(56,189,248,0.1) 100%)',
                    border: '1px solid rgba(45,212,191,0.15)',
                  } : {}}
                  title={p.name}
                >
                  <div className={`w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    isActive ? 'bg-gdpro-accent/20 text-gdpro-accent' : 'bg-white/10 text-gdpro-text-muted'
                  }`}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[12px] font-medium truncate ${isActive ? 'text-gdpro-accent' : ''}`}>
                      {p.name}
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-[1px] rounded-md shrink-0 font-medium ${
                    isActive ? 'bg-gdpro-accent/15 text-gdpro-accent' : 'bg-white/10 text-gdpro-text-muted'
                  }`}>
                    P{p.currentPhase}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom: Connection Status + Version */}
          <div className="mt-auto shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Connection Status Panel */}
            <div className="px-3 pt-2.5 pb-2">
              <div
                className={`relative rounded-xl border overflow-hidden transition-colors duration-200`}
                style={{
                  background: isConnected ? 'rgba(52,211,153,0.06)' : 'rgba(255,255,255,0.03)',
                  borderColor: isConnected ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                {/* Status header */}
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
                  <span className="text-[11px] font-semibold text-gdpro-text leading-none">{status.label}</span>
                  {isConnected && agents && agents.length > 1 && (
                    <button
                      onClick={onSwitchAgent}
                      className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
                      title="切换 Agent"
                    >
                      <Settings className="w-3 h-3 text-gdpro-text-muted" strokeWidth={2} />
                    </button>
                  )}
                  {!isConnected && (
                    <button
                      onClick={onOpenSettings}
                      className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
                      title="配置 Gateway"
                    >
                      <Settings className="w-3 h-3 text-gdpro-text-muted" strokeWidth={2} />
                    </button>
                  )}
                </div>

                {/* Expanded info for non-connected states */}
                {!isConnected && (
                  <div className="px-2.5 pb-2.5 pt-0">
                    <div className="h-px mb-2" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <p className="text-[10px] text-gdpro-text-muted leading-relaxed">
                      Console 是 Graphic Design Pro 的可视化前端，所有设计能力由 Skill 提供。
                    </p>
                    <button
                      onClick={onOpenSettings}
                      className="mt-1.5 w-full flex items-center justify-center gap-1 px-2 py-[5px] rounded-lg transition-all duration-150 hover:brightness-110"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <StatusIcon className="w-3 h-3 text-gdpro-text-muted" strokeWidth={2} />
                      <span className="text-[10px] font-medium text-gdpro-text-secondary">配置 Gateway 连接</span>
                    </button>
                  </div>
                )}

                {isConnected && (
                  <div className="px-2.5 pb-2 pt-0">
                    <div className="text-[10px] text-gdpro-text-muted mb-1.5">{status.sub}</div>
                    <div className="flex gap-1.5">
                      {agents && agents.length > 1 && (
                        <button
                          onClick={onSwitchAgent}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-[4px] rounded-lg transition-all duration-150 hover:brightness-110"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <Link className="w-3 h-3 text-gdpro-text-muted" strokeWidth={2} />
                          <span className="text-[10px] font-medium text-gdpro-text-secondary">切换</span>
                        </button>
                      )}
                      <button
                        onClick={onDisconnect}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-[4px] rounded-lg transition-all duration-150"
                        style={{
                          background: 'rgba(248,113,113,0.08)',
                          border: '1px solid rgba(248,113,113,0.15)',
                        }}
                      >
                        <Unlink className="w-3 h-3 text-gdpro-danger" strokeWidth={2} />
                        <span className="text-[10px] font-medium text-gdpro-danger">断开</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Version */}
            <div className="px-3 pb-2.5 pt-0">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <Sparkles className="w-3 h-3 text-gdpro-accent shrink-0" strokeWidth={2} />
                <div>
                  <div className="text-[10px] font-medium text-gdpro-text-secondary leading-tight">Graphic Design Pro</div>
                  <div className="text-[9px] text-gdpro-text-muted leading-tight">Console v3.0</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Collapsed state: mini status dot */}
      {collapsed && (
        <div className="mt-auto shrink-0 p-2 flex justify-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onOpenSettings}
            className="relative p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={isConnected ? '已连接' : '点击配置 Gateway'}
          >
            <span className={`block w-2 h-2 rounded-full ${status.dot}`} />
            {!isConnected && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-gdpro-danger border-2 border-gdpro-bg-sidebar" />
            )}
          </button>
        </div>
      )}
    </div>
    </>
  );
}
