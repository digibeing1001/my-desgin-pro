import React from 'react';
import { Star, TrendingUp, CheckCircle2 } from 'lucide-react';

const DIM_LABELS = {
  philosophy: '哲学一致性',
  hierarchy: '视觉层级',
  execution: '细节执行',
  functionality: '功能性',
  innovation: '创新性',
};

const DIM_COLORS = {
  philosophy: 'bg-gdpro-accent',
  hierarchy: 'bg-gdpro-success',
  execution: 'bg-gdpro-info',
  functionality: 'bg-gdpro-accent-dim',
  innovation: 'bg-gdpro-text-muted',
};

function ScoreBar({ score, max = 10, color = 'bg-gdpro-accent' }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gdpro-bg-hover overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-gdpro-text w-8 text-right">{score}</span>
    </div>
  );
}

export default function CritiqueScoreCard({ data }) {
  if (!data) return null;
  const { total, dimensions = [], strengths = [], issues = [] } = data;

  return (
    <div className="rounded-lg border border-gdpro-border bg-gdpro-bg-elevated overflow-hidden mt-3">
      <div className="px-3 py-2.5 border-b border-gdpro-border flex items-center gap-2">
        <Star className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-gdpro-text">设计评审</span>
        {total != null && (
          <span className="ml-auto text-[18px] font-bold text-gdpro-accent">{total}<span className="text-[11px] text-gdpro-text-muted font-normal">/10</span></span>
        )}
      </div>

      {dimensions.length > 0 && (
        <div className="px-3 py-2.5 space-y-2">
          {dimensions.map((dim, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gdpro-text-secondary">{DIM_LABELS[dim.key] || dim.label}</span>
                {dim.score >= 8 && <CheckCircle2 className="w-3 h-3 text-gdpro-success" strokeWidth={2} />}
              </div>
              <ScoreBar score={dim.score} color={DIM_COLORS[dim.key] || 'bg-gdpro-accent'} />
              {dim.note && <p className="text-[10px] text-gdpro-text-muted mt-0.5">{dim.note}</p>}
            </div>
          ))}
        </div>
      )}

      {(strengths.length > 0 || issues.length > 0) && (
        <div className="px-3 pb-2.5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {strengths.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gdpro-success mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" strokeWidth={2} /> 优点
              </div>
              <ul className="space-y-0.5">
                {strengths.map((s, i) => (
                  <li key={i} className="text-[10px] text-gdpro-text-secondary">• {s}</li>
                ))}
              </ul>
            </div>
          )}
          {issues.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gdpro-danger mb-1">待修复</div>
              <ul className="space-y-0.5">
                {issues.map((issue, i) => (
                  <li key={i} className="text-[10px] text-gdpro-text-secondary">• {issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
