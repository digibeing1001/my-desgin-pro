import React, { useState, useRef, useEffect } from 'react';
import { Brain, Image as ImageIcon, ChevronDown, Check, Settings, Plus, Trash2 } from 'lucide-react';
import { getLanguageModels, getImageModels, addCustomModel, removeCustomModel, getCustomModels } from '../data/modelConfig';

function ModelDropdown({ label, selected, onSelect, icon: Icon, isDetected, onConfigure, getModels }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const models = getModels(isDetected);
  const selectedModel = models.find((m) => m.id === selected) || models[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-[3px] rounded-lg text-[11px] transition-all duration-150 border ${
          open ? 'text-gdpro-accent' : 'text-gdpro-text-secondary hover:text-gdpro-text'
        }`}
        style={open ? { background: 'rgba(45,212,191,0.1)', borderColor: 'rgba(45,212,191,0.2)' } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <Icon className="w-3 h-3" strokeWidth={2} />
        <span className="hidden sm:inline max-w-[80px] truncate font-medium">{selectedModel?.name}</span>
        {!isDetected && (
          <span className="text-[9px] px-1 py-[1px] rounded bg-gdpro-text-muted/15 text-gdpro-text-muted ml-0.5 font-medium">示例</span>
        )}
        <ChevronDown className={`w-2.5 h-2.5 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {open && (
        <div className="mac-menu right-0 top-full mt-1 w-64">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-gdpro-text-muted uppercase tracking-wider">{label}</div>

          {!isDetected && (
            <div className="px-2.5 py-1.5" style={{ background: 'rgba(45,212,191,0.06)' }}>
              <p className="text-[11px] text-gdpro-text-secondary leading-relaxed">
                当前显示为示例模型。请在 Agent 工具中配置 API Key。
              </p>
            </div>
          )}

          <div className="max-h-52 overflow-y-auto py-0.5">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => { onSelect(model.id); setOpen(false); }}
                className={`mac-menu-item ${selected === model.id ? 'text-gdpro-accent' : ''}`}
                style={selected === model.id ? { background: 'rgba(45,212,191,0.1)' } : {}}
              >
                <span className="text-sm">{model.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className={`text-[12px] font-medium ${selected === model.id ? 'text-gdpro-accent' : 'text-gdpro-text'}`}>
                    {model.name}
                  </div>
                  <div className="text-[10px] text-gdpro-text-muted">{model.provider} · {model.desc}</div>
                </div>
                {selected === model.id && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />}
              </button>
            ))}
          </div>

          <div className="mac-divider" />

          <button
            onClick={() => { onConfigure?.(); setOpen(false); }}
            className="mac-menu-item text-gdpro-text-muted"
          >
            <Settings className="w-3.5 h-3.5" strokeWidth={2} />
            配置 / 新增模型
          </button>
        </div>
      )}
    </div>
  );
}

export default function ModelSelector({ llm, imageModel, onChangeLLM, onChangeImageModel, modelsDetected }) {
  const [showConfig, setShowConfig] = useState(false);
  const [configTab, setConfigTab] = useState('image');
  const [newModel, setNewModel] = useState({ name: '', provider: '', icon: '🎨', desc: '', type: 'image' });
  const [customModels, setCustomModels] = useState(() => getCustomModels());

  const handleAddModel = () => {
    if (!newModel.name.trim() || !newModel.provider.trim()) return;
    const updated = addCustomModel(newModel.type, { ...newModel });
    setCustomModels(updated);
    setNewModel({ name: '', provider: '', icon: '🎨', desc: '', type: 'image' });
  };

  const handleRemoveModel = (type, id) => {
    const updated = removeCustomModel(type, id);
    setCustomModels(updated);
  };

  return (
    <>
      <div className="flex items-center gap-1.5">
        <ModelDropdown
          label="语言模型"
          selected={llm}
          onSelect={onChangeLLM}
          icon={Brain}
          isDetected={modelsDetected}
          getModels={(d) => getLanguageModels(d)}
        />
        <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <ModelDropdown
          label="生图模型"
          selected={imageModel}
          onSelect={onChangeImageModel}
          icon={ImageIcon}
          isDetected={modelsDetected}
          getModels={(d) => getImageModels(d)}
          onConfigure={() => { setConfigTab('image'); setShowConfig(true); }}
        />
      </div>

      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfig(false); }}>
          <div className="w-full max-w-lg p-5 animate-scale-in max-h-[85vh] overflow-y-auto rounded-[18px]"
            style={{
              background: 'rgba(15, 25, 40, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-gdpro-text tracking-tight">模型配置</h2>
              <button onClick={() => setShowConfig(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <Settings className="w-4 h-4 text-gdpro-text-secondary" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mac-segment mb-4">
              {[
                { id: 'image', label: '生图模型' },
                { id: 'llm', label: '语言模型' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id)}
                  className={`mac-segment-btn ${configTab === tab.id ? 'mac-segment-btn-active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="text-[10px] font-semibold text-gdpro-text-muted uppercase tracking-wider mb-1.5">已添加的自定义模型</h3>
              {(customModels[configTab] || []).length === 0 ? (
                <p className="text-[11px] text-gdpro-text-muted py-1">暂无自定义模型</p>
              ) : (
                <div className="space-y-1">
                  {(customModels[configTab] || []).map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <span className="text-sm">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-gdpro-text truncate">{m.name}</div>
                        <div className="text-[10px] text-gdpro-text-muted">{m.provider}</div>
                      </div>
                      <button onClick={() => handleRemoveModel(configTab, m.id)}
                        className="p-1 rounded-lg hover:bg-gdpro-danger/10 text-gdpro-text-muted hover:text-gdpro-danger transition-colors">
                        <Trash2 className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-[10px] font-semibold text-gdpro-text-muted uppercase tracking-wider mb-2">添加新模型</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="gdpro-label">模型名称</label>
                    <input className="gdpro-input text-[12px] py-[5px]" value={newModel.name}
                      onChange={(e) => setNewModel((m) => ({ ...m, name: e.target.value }))}
                      placeholder="例如：Custom Model" />
                  </div>
                  <div>
                    <label className="gdpro-label">提供商</label>
                    <input className="gdpro-input text-[12px] py-[5px]" value={newModel.provider}
                      onChange={(e) => setNewModel((m) => ({ ...m, provider: e.target.value }))}
                      placeholder="例如：OpenAI" />
                  </div>
                </div>
                <div>
                  <label className="gdpro-label">描述</label>
                  <input className="gdpro-input text-[12px] py-[5px]" value={newModel.desc}
                    onChange={(e) => setNewModel((m) => ({ ...m, desc: e.target.value }))}
                    placeholder="简短描述模型特点..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="gdpro-label">图标</label>
                    <input className="gdpro-input text-[12px] py-[5px]" value={newModel.icon}
                      onChange={(e) => setNewModel((m) => ({ ...m, icon: e.target.value.slice(0, 2) }))}
                      placeholder="🎨" maxLength={2} />
                  </div>
                  <div>
                    <label className="gdpro-label">类型</label>
                    <select className="gdpro-input text-[12px] py-[5px]"
                      value={newModel.type}
                      onChange={(e) => setNewModel((m) => ({ ...m, type: e.target.value }))}>
                      <option value="image">生图模型</option>
                      <option value="llm">语言模型</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="gdpro-label">API Key / 配置</label>
                  <input className="gdpro-input text-[12px] py-[5px] font-mono" type="password" placeholder="sk-..." />
                  <p className="text-[10px] text-gdpro-text-muted mt-0.5">配置仅在本地存储，不会上传到服务器</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button onClick={handleAddModel} disabled={!newModel.name.trim() || !newModel.provider.trim()}
                  className="gdpro-button flex-1 disabled:opacity-40 text-[12px] flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                  添加模型
                </button>
                <button onClick={() => setShowConfig(false)} className="gdpro-button-secondary flex-1 text-[12px]">关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
