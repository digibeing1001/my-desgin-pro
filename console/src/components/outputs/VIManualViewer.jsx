import React from 'react';
import { BookOpen, FileText, Download } from 'lucide-react';

export default function VIManualViewer({ data }) {
  if (!data) return null;
  const { slides = [], downloadUrl, brandName } = data;

  return (
    <div className="rounded-lg border border-gdpro-border bg-gdpro-bg-elevated overflow-hidden mt-3">
      <div className="px-3 py-2 border-b border-gdpro-border flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-gdpro-text">VI 规范手册</span>
        {brandName && <span className="text-[10px] text-gdpro-text-muted ml-1">{brandName}</span>}
        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-[10px] text-gdpro-accent hover:text-gdpro-accent-hover">
            <Download className="w-3 h-3" strokeWidth={2} /> 下载
          </a>
        )}
      </div>

      {slides.length > 0 && (
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {slides.map((slide, i) => (
            <div key={i} className="rounded-md border border-gdpro-border bg-gdpro-bg-hover/30 overflow-hidden">
              <div className="aspect-[16/10] bg-gdpro-bg-hover flex items-center justify-center">
                {slide.thumbnail ? (
                  <img src={slide.thumbnail} alt={slide.title} className="w-full h-full object-cover" />
                ) : (
                  <FileText className="w-5 h-5 text-gdpro-text-muted" strokeWidth={1.5} />
                )}
              </div>
              <div className="px-2 py-1">
                <span className="text-[9px] text-gdpro-text-secondary truncate block">{slide.title || `第 ${i + 1} 页`}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
