import React, { useState } from 'react';

const TABS = [
  { id: 'assets', name: '资产库', nameEn: 'Assets' },
  { id: 'preview', name: '设计稿', nameEn: 'Preview' },
  { id: 'deliver', name: '交付物', nameEn: 'Deliver' },
];

export default function AssetGallery({ activeTab, onTabChange, assets = [], designFiles = [], deliverables = [] }) {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <div className="w-80 bg-gdpro-bg-elevated border-l border-gdpro-border flex flex-col shrink-0">
      {/* Tab 导航 */}
      <div className="flex border-b border-gdpro-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 text-center text-xs font-medium transition-colors relative
              ${activeTab === tab.id ? 'text-gdpro-accent' : 'text-gdpro-text-muted hover:text-gdpro-text-secondary'}
            `}
          >
            <span>{tab.name}</span>
            <span className="ml-1 text-2xs font-mono opacity-60">{tab.nameEn}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gdpro-accent" />
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'assets' && (
          <div className="space-y-3 animate-fade-in">
            {assets.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-gdpro-bg-surface border border-gdpro-border flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gdpro-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gdpro-text-secondary">暂无资产</p>
                <p className="text-2xs text-gdpro-text-muted mt-1">在对话中上传 Logo、场景照片等</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {assets.map((asset, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAsset(asset)}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-gdpro-border hover:border-gdpro-accent transition-colors bg-gdpro-bg-surface"
                  >
                    {asset.type?.startsWith('image/') ? (
                      <img
                        src={asset.url || asset.preview}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <svg className="w-8 h-8 text-gdpro-text-muted mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-2xs text-gdpro-text-secondary text-center truncate w-full">{asset.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-2xs text-white truncate block">{asset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-3 animate-fade-in">
            {designFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-gdpro-bg-surface border border-gdpro-border flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gdpro-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gdpro-text-secondary">暂无设计稿</p>
                <p className="text-2xs text-gdpro-text-muted mt-1">设计稿生成后将在此预览</p>
              </div>
            ) : (
              designFiles.map((file, i) => (
                <div key={i} className="gdpro-card overflow-hidden group">
                  <div className="aspect-video bg-gdpro-bg relative">
                    {file.type?.startsWith('image/') ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : file.type === 'text/html' ? (
                      <iframe
                        src={file.url}
                        title={file.name}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gdpro-text-muted text-sm">
                        {file.name}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 flex items-center justify-between">
                    <span className="text-2xs text-gdpro-text-secondary truncate">{file.name}</span>
                    <button className="p-1 rounded hover:bg-gdpro-bg-surface text-gdpro-text-muted hover:text-gdpro-accent transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'deliver' && (
          <div className="space-y-3 animate-fade-in">
            {deliverables.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-gdpro-bg-surface border border-gdpro-border flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gdpro-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-sm text-gdpro-text-secondary">暂无交付物</p>
                <p className="text-2xs text-gdpro-text-muted mt-1">完成 Phase 6 后可在此下载</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deliverables.map((item, i) => (
                  <div key={i} className="gdpro-card p-3 flex items-center gap-3 group hover:border-gdpro-text-muted transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-gdpro-accent/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono font-bold text-gdpro-accent uppercase">
                        {item.ext?.replace('.', '') || 'FILE'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gdpro-text truncate">{item.name}</p>
                      <p className="text-2xs text-gdpro-text-muted">{item.size || ''}</p>
                    </div>
                    <button className="p-1.5 rounded-md hover:bg-gdpro-bg-surface text-gdpro-text-muted hover:text-gdpro-accent transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
