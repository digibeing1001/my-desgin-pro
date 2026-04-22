import React, { useState, useRef } from 'react';
import { BookOpen, Upload, X, Eye, Trash2, Target, Palette, Ruler, Image as ImageIcon, Lightbulb, FileText, Loader2 } from 'lucide-react';
import { parseFile } from '../lib/parser';


const REF_CATEGORIES = [
  { id: 'competitor', name: '竞品', icon: Target, color: '#FF453A' },
  { id: 'style', name: '风格', icon: Palette, color: '#FF9F0A' },
  { id: 'guideline', name: '规范', icon: Ruler, color: '#0A84FF' },
  { id: 'material', name: '素材', icon: ImageIcon, color: '#30D158' },
];

export default function ReferenceLibrary({ projects, onReferencesChange }) {
  const [filter, setFilter] = useState('all');
  const [previewRef, setPreviewRef] = useState(null);
  const [parsedContent, setParsedContent] = useState(null);
  const [parsingIds, setParsingIds] = useState(new Set());
  const fileInputRef = useRef(null);

  // Collect user-uploaded references from all projects
  const allRefs = [];
  projects.forEach((proj) => {
    (proj.references || []).forEach((r) => {
      allRefs.push({ ...r, projectName: proj.name, projectId: proj.id });
    });
  });

  const filtered = filter === 'all' ? allRefs : allRefs.filter((r) => r.category === filter);

  const handleFiles = async (files) => {
    const targetProject = projects[0];
    if (!targetProject) return;

    const newRefs = Array.from(files).map((file) => ({
      id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      size: file.size,
      type: file.type.startsWith('image/') ? 'image' : file.name.split('.').pop(),
      category: 'style',
      projectId: targetProject.id,
      createdAt: Date.now(),
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      parsed: { status: 'parsing', message: '正在解析...' },
    }));

    // Save refs immediately (with parsing status)
    const updated = [...(targetProject.references || []), ...newRefs];
    onReferencesChange?.(targetProject.id, updated);
    setParsingIds((prev) => new Set([...prev, ...newRefs.map((r) => r.id)]));

    // Parse each file in background
    await Promise.all(
      newRefs.map(async (ref) => {
        const file = Array.from(files).find((f) => f.name === ref.name);
        if (!file) return;
        const result = await parseFile(file);

        const currentProj = projects.find((p) => p.id === targetProject.id);
        if (currentProj) {
          const updatedRefs = (currentProj.references || []).map((r) =>
            r.id === ref.id ? { ...r, parsed: result } : r
          );
          onReferencesChange?.(targetProject.id, updatedRefs);
        }

        setParsingIds((prev) => {
          const next = new Set(prev);
          next.delete(ref.id);
          return next;
        });

        if (result.status === 'parsed') {
          setParsedContent(result);
        }
      })
    );
  };

  const targetProject = projects[0];

  const changeCategory = (id, cat) => {
    const targetProject = projects.find((p) => (p.references || []).some((r) => r.id === id));
    if (!targetProject) return;
    const updated = (targetProject.references || []).map((r) => (r.id === id ? { ...r, category: cat } : r));
    onReferencesChange?.(targetProject.id, updated);
  };

  const deleteRef = (id) => {
    const targetProject = projects.find((p) => (p.references || []).some((r) => r.id === id));
    if (!targetProject) return;
    const updated = (targetProject.references || []).filter((r) => r.id !== id);
    onReferencesChange?.(targetProject.id, updated);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-4 border-b border-gdpro-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-gdpro-accent" strokeWidth={1.5} />
            <h2 className="text-[15px] font-semibold text-gdpro-text tracking-tight">知识库</h2>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="gdpro-button text-[12px] flex items-center gap-1">
            <Upload className="w-3 h-3" strokeWidth={2.5} />
            上传
          </button>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files)} accept="image/*,.pdf,.svg,.md,.txt" />
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-[10px] bg-gradient-to-br from-gdpro-bg-elevated to-gdpro-bg-surface border border-gdpro-border p-4 mb-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gdpro-accent/5 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gdpro-accent/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-gdpro-accent" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-gdpro-text leading-relaxed">
                内置全球顶尖设计机构及顶级消费品牌设计知识库
              </p>
              <p className="text-[11px] text-gdpro-text-muted mt-0.5 leading-relaxed">
                聚合 Pentagram、IDEO、Landor 等 39 家顶尖设计机构的品牌战略方法论与案例库，
                以及 Apple、Nike、星巴克等 10 个顶级消费品牌的 VI 全案体系
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setFilter('all')}
            className={`px-2.5 py-[3px] rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
              filter === 'all' ? 'bg-gdpro-info text-white' : 'bg-gdpro-bg-surface text-gdpro-text-secondary hover:text-gdpro-text'
            }`}>
            全部 ({allRefs.length})
          </button>
          {REF_CATEGORIES.map((cat) => {
            const count = allRefs.filter((r) => r.category === cat.id).length;
            const Icon = cat.icon;
            return (
              <button key={cat.id} onClick={() => setFilter(cat.id)}
                className={`px-2.5 py-[3px] rounded-md text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filter === cat.id ? 'bg-gdpro-info text-white' : 'bg-gdpro-bg-surface text-gdpro-text-secondary hover:text-gdpro-text'
                }`}>
                <Icon className="w-3 h-3" strokeWidth={2} />
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Parsed content preview */}
      {parsedContent && (
        <div className="shrink-0 px-4 py-2 border-b border-gdpro-border">
          <div className="flex items-start gap-2 p-2.5 rounded-md bg-gdpro-info/8 border border-gdpro-info/15">
            <FileText className="w-3.5 h-3.5 text-gdpro-info shrink-0 mt-0.5" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-gdpro-text">{parsedContent.name} — {parsedContent.message}</div>
              {parsedContent.excerpt && (
                <p className="text-[11px] text-gdpro-text-muted mt-1 line-clamp-2 font-mono">{parsedContent.excerpt}</p>
              )}
            </div>
            <button onClick={() => setParsedContent(null)} className="p-0.5 rounded hover:bg-gdpro-bg-hover text-gdpro-text-muted hover:text-gdpro-text transition-colors">
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        {allRefs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <BookOpen className="w-8 h-8 text-gdpro-text-muted mb-2" strokeWidth={1.5} />
            <p className="text-[13px] text-gdpro-text-secondary">知识库为空</p>
            <p className="text-[11px] text-gdpro-text-muted mt-0.5 max-w-xs">
              上传竞品报告、品牌手册、风格参考图或网页链接。<br/>
              系统会自动解析内容，为设计 Agent 提供参考。
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-10">
            <p className="text-[13px] text-gdpro-text-secondary">该分类下暂无内容</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filtered.map((ref) => {
              const isImage = ref.type === 'image' || ref.type === 'svg';
              const catInfo = REF_CATEGORIES.find((c) => c.id === ref.category);
              const CatIcon = catInfo?.icon || ImageIcon;
              const isParsing = parsingIds.has(ref.id);
              const hasParsed = ref.parsed && ref.parsed.status === 'parsed';
              const parseError = ref.parsed && ref.parsed.status === 'error';
              return (
                <div key={ref.id} className="gdpro-card overflow-hidden group gdpro-card-hover border-gdpro-border rounded-[10px] flex flex-col">
                  <div className="aspect-[16/10] bg-gdpro-bg-surface relative cursor-pointer"
                    onClick={() => isImage && !isParsing && setPreviewRef(ref)}>
                    {isImage && ref.previewUrl ? (
                      <img src={ref.previewUrl} alt={ref.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (catInfo?.color || '#FF9F0A') + '12' }}>
                          {isParsing ? (
                            <Loader2 className="w-5 h-5 text-gdpro-text-muted animate-spin" strokeWidth={2} />
                          ) : (
                            <CatIcon className="w-5 h-5" style={{ color: catInfo?.color || '#FF9F0A' }} strokeWidth={1.5} />
                          )}
                        </div>
                        <span className="text-[11px] text-gdpro-text-muted text-center line-clamp-2">{isParsing ? '解析中...' : ref.name}</span>
                      </div>
                    )}
                    {hasParsed && (
                      <div className="absolute top-2 left-2 px-1.5 py-[1px] rounded bg-gdpro-success/20 text-gdpro-success text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                        <FileText className="w-2.5 h-2.5" strokeWidth={2} />
                        已解析
                      </div>
                    )}
                    {parseError && (
                      <div className="absolute top-2 left-2 px-1.5 py-[1px] rounded bg-gdpro-danger/20 text-gdpro-danger text-[10px] font-bold backdrop-blur-sm">
                        解析失败
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {isImage && !isParsing && (
                        <button onClick={(e) => { e.stopPropagation(); setPreviewRef(ref); }} className="p-1.5 rounded-md bg-gdpro-bg/80 text-gdpro-text hover:text-gdpro-accent transition-colors">
                          <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); deleteRef(ref.id); }} className="p-1.5 rounded-md bg-gdpro-bg/80 text-gdpro-text hover:text-gdpro-danger transition-colors">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col">
                    <p className="text-[12px] text-gdpro-text font-medium truncate" title={ref.name}>{ref.name}</p>
                    {ref.parsed?.message && (
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${parseError ? 'text-gdpro-danger' : 'text-gdpro-text-muted'}`}>
                        {ref.parsed.message}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gdpro-border/50">
                      <span className="text-[10px] text-gdpro-text-muted">{ref.projectName}</span>
                      <select value={ref.category} onChange={(e) => changeCategory(ref.id, e.target.value)}
                        className="text-[10px] bg-gdpro-bg-hover border border-gdpro-border rounded px-1.5 py-[1px] text-gdpro-text-muted outline-none focus:border-gdpro-info">
                        {REF_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {previewRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4" onClick={() => setPreviewRef(null)}>
          <div className="max-w-[85vw] max-h-[85vh] relative" onClick={(e) => e.stopPropagation()}>
            <img src={previewRef.previewUrl || previewRef.url} alt={previewRef.name} className="max-w-full max-h-[80vh] object-contain rounded-[10px] shadow-2xl" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-[10px]">
              <p className="text-[13px] text-white font-medium">{previewRef.name}</p>
              <p className="text-[10px] text-white/60">{previewRef.projectName}</p>
            </div>
            <button onClick={() => setPreviewRef(null)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gdpro-bg-elevated border border-gdpro-border flex items-center justify-center text-gdpro-text hover:text-gdpro-danger transition-colors">
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
