import React, { useState, useCallback } from 'react';
import { User, Palette, Bookmark, Ban, Tag, Wrench, Plus, X } from 'lucide-react';
import { AESTHETIC_TEMPLATE, DEFAULT_DESIGNER_PROFILE } from '../data/designerProfile';
import { saveToLocal, loadFromLocal } from '../lib/storage';


export default function DesignerProfile() {
  const [profile, setProfile] = useState(() =>
    loadFromLocal('designer_profile', DEFAULT_DESIGNER_PROFILE)
  );
  const [editing, setEditing] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newTool, setNewTool] = useState('');

  const persist = useCallback((next) => {
    setProfile(next);
    saveToLocal('designer_profile', next);
  }, []);

  const updateDimension = (key, value) => {
    persist({
      ...profile,
      aesthetic: {
        ...profile.aesthetic,
        dimensions: {
          ...profile.aesthetic.dimensions,
          [key]: { ...profile.aesthetic.dimensions[key], value },
        },
      },
    });
  };

  const addListItem = (listKey, value) => {
    if (!value.trim()) return;
    persist({
      ...profile,
      aesthetic: {
        ...profile.aesthetic,
        [listKey]: [...(profile.aesthetic[listKey] || []), value.trim()],
      },
    });
  };

  const removeListItem = (listKey, index) => {
    persist({
      ...profile,
      aesthetic: {
        ...profile.aesthetic,
        [listKey]: (profile.aesthetic[listKey] || []).filter((_, i) => i !== index),
      },
    });
  };

  const addTag = (listKey, input, setInput) => {
    addListItem(listKey, input);
    setInput('');
  };

  const applyTemplate = (key) => {
    const t = AESTHETIC_TEMPLATE[key];
    if (!t) return;
    persist({
      ...profile,
      aesthetic: {
        ...profile.aesthetic,
        dimensions: Object.fromEntries(
          Object.entries(profile.aesthetic.dimensions).map(([k, dim]) => [
            k, { ...dim, value: t[k] || dim.value },
          ])
        ),
      },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-4 border-b border-gdpro-border">
        <div className="flex items-center gap-2.5">
          <User className="w-4 h-4 text-gdpro-accent" strokeWidth={1.5} />
          <h2 className="text-[15px] font-semibold text-gdpro-text tracking-tight">设计师档案</h2>
          <span className="text-[11px] text-gdpro-text-muted">审美偏好 · 风格固化 · 个人设计 DNA</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Basic Info */}
          <div className="gdpro-card p-4 rounded-[10px]">
            <h3 className="text-[13px] font-semibold text-gdpro-text mb-3 tracking-tight">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="gdpro-label">设计师名称</label>
                <input className="gdpro-input" value={profile.name}
                  onChange={(e) => persist({ ...profile, name: e.target.value })}
                  placeholder="你的名字或工作室名" />
              </div>
              <div className="md:col-span-2">
                <label className="gdpro-label">简介</label>
                <textarea className="gdpro-input min-h-[50px] resize-y" value={profile.bio}
                  onChange={(e) => persist({ ...profile, bio: e.target.value })}
                  placeholder="简短描述你的设计背景和专长..." />
              </div>
            </div>
          </div>

          {/* 7 Dimensions */}
          <div className="gdpro-card p-4 rounded-[10px]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
                <h3 className="text-[13px] font-semibold text-gdpro-text tracking-tight">7维度审美画像</h3>
              </div>
              <div className="flex gap-1">
                {Object.entries(AESTHETIC_TEMPLATE).map(([key, t]) => (
                  <button key={key} onClick={() => applyTemplate(key)}
                    className="px-2 py-[2px] rounded-md text-[11px] font-medium bg-gdpro-bg-hover text-gdpro-text-secondary hover:text-gdpro-text hover:bg-gdpro-bg-surface border border-gdpro-border transition-colors">
                    {key === 'minimal' ? '极简' : key === 'warm' ? '温暖' : '科技'}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(profile.aesthetic.dimensions).map(([key, dim]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[12px] font-medium text-gdpro-text">{dim.label}</label>
                    <span className="text-[10px] text-gdpro-text-muted">{dim.desc}</span>
                  </div>
                  {editing[`dim_${key}`] ? (
                    <textarea autoFocus className="gdpro-input text-[12px] min-h-[50px] resize-y" value={dim.value}
                      onChange={(e) => updateDimension(key, e.target.value)}
                      onBlur={() => setEditing((prev) => ({ ...prev, [`dim_${key}`]: false }))}
                      placeholder={dim.desc} />
                  ) : (
                    <div onClick={() => setEditing((prev) => ({ ...prev, [`dim_${key}`]: true }))}
                      className={`min-h-[32px] px-3 py-[5px] rounded-md text-[12px] border transition-colors cursor-text ${
                        dim.value ? 'bg-gdpro-bg-hover border-gdpro-border text-gdpro-text-secondary' : 'bg-gdpro-bg-surface/50 border-gdpro-border/50 text-gdpro-text-muted italic'
                      } hover:border-gdpro-border-light`}>
                      {dim.value || `点击编辑${dim.label}...`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="gdpro-card p-4 rounded-[10px]">
            <h3 className="text-[13px] font-semibold text-gdpro-text mb-2 tracking-tight flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
              已固化偏好 (AP 档案)
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(profile.aesthetic.preferences || []).map((pref, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-[3px] bg-gdpro-accent-dim border border-gdpro-accent/15 rounded-md text-[11px] text-gdpro-accent font-medium">
                  {pref}
                  <button onClick={() => removeListItem('preferences', i)} className="hover:text-gdpro-danger transition-colors">
                    <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input className="gdpro-input text-[12px] flex-1 py-[5px]"
                placeholder="添加偏好..." value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('preferences', newTag, setNewTag)} />
              <button onClick={() => addTag('preferences', newTag, setNewTag)} className="gdpro-button text-[11px] py-[5px] px-2.5 flex items-center gap-1">
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                添加
              </button>
            </div>
          </div>

          {/* Prohibitions */}
          <div className="gdpro-card p-4 rounded-[10px]">
            <h3 className="text-[13px] font-semibold text-gdpro-text mb-2 tracking-tight flex items-center gap-2">
              <Ban className="w-4 h-4 text-gdpro-danger" strokeWidth={2} />
              审美禁止清单
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(profile.aesthetic.prohibitions || []).map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-[3px] bg-gdpro-danger/8 border border-gdpro-danger/15 rounded-md text-[11px] text-gdpro-danger font-medium">
                  {item}
                  <button onClick={() => removeListItem('prohibitions', i)} className="hover:text-gdpro-text transition-colors">
                    <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input className="gdpro-input text-[12px] flex-1 py-[5px]"
                placeholder="添加禁止项..."
                onKeyDown={(e) => { if (e.key === 'Enter') { addListItem('prohibitions', e.target.value); e.target.value = ''; } }} />
              <button onClick={(e) => { const input = e.target.previousElementSibling; addListItem('prohibitions', input.value); input.value = ''; }}
                className="gdpro-button text-[11px] py-[5px] px-2.5 flex items-center gap-1">
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                添加
              </button>
            </div>
          </div>

          {/* Style Tags */}
          <div className="gdpro-card p-4 rounded-[10px]">
            <h3 className="text-[13px] font-semibold text-gdpro-text mb-2 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-gdpro-info" strokeWidth={2} />
              风格标签
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(profile.aesthetic.styleTags || []).map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-[3px] bg-gdpro-bg-hover border border-gdpro-border rounded-md text-[11px] text-gdpro-text-secondary font-medium">
                  {tag}
                  <button onClick={() => removeListItem('styleTags', i)} className="hover:text-gdpro-danger transition-colors">
                    <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input className="gdpro-input text-[12px] flex-1 py-[5px]"
                placeholder="添加标签..." value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('styleTags', newTag, setNewTag)} />
              <button onClick={() => addTag('styleTags', newTag, setNewTag)} className="gdpro-button text-[11px] py-[5px] px-2.5 flex items-center gap-1">
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                添加
              </button>
            </div>
          </div>

          {/* Tools */}
          <div className="gdpro-card p-4 rounded-[10px]">
            <h3 className="text-[13px] font-semibold text-gdpro-text mb-2 tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gdpro-success" strokeWidth={2} />
              常用工具
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(profile.aesthetic.tools || []).map((tool, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-[3px] bg-gdpro-bg-hover border border-gdpro-border rounded-md text-[11px] text-gdpro-text-secondary font-medium">
                  {tool}
                  <button onClick={() => removeListItem('tools', i)} className="hover:text-gdpro-danger transition-colors">
                    <X className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input className="gdpro-input text-[12px] flex-1 py-[5px]"
                placeholder="添加工具..." value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('tools', newTool, setNewTool)} />
              <button onClick={() => addTag('tools', newTool, setNewTool)} className="gdpro-button text-[11px] py-[5px] px-2.5 flex items-center gap-1">
                <Plus className="w-3 h-3" strokeWidth={2.5} />
                添加
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
