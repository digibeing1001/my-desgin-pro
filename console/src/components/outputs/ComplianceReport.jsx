import React from 'react';
import { Shield, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const SEVERITY_CONFIG = {
  red: { icon: XCircle, color: 'text-gdpro-danger', bg: 'bg-gdpro-danger/10', border: 'border-gdpro-danger/20', label: '红旗' },
  yellow: { icon: AlertTriangle, color: 'text-gdpro-accent', bg: 'bg-gdpro-accent/10', border: 'border-gdpro-accent/20', label: '黄旗' },
  green: { icon: CheckCircle2, color: 'text-gdpro-success', bg: 'bg-gdpro-success/10', border: 'border-gdpro-success/20', label: '通过' },
};

export default function ComplianceReport({ data }) {
  if (!data) return null;
  const items = data.items || [];
  const summary = data.summary || {};

  const redCount = items.filter((i) => i.severity === 'red').length;
  const yellowCount = items.filter((i) => i.severity === 'yellow').length;
  const greenCount = items.filter((i) => i.severity === 'green').length;

  return (
    <div className="rounded-lg border border-gdpro-border bg-gdpro-bg-elevated overflow-hidden mt-3">
      <div className="px-3 py-2 border-b border-gdpro-border flex items-center gap-2">
        <Shield className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-gdpro-text">合规审查报告</span>
        <div className="ml-auto flex items-center gap-2">
          {redCount > 0 && <span className="text-[10px] px-1.5 py-[1px] rounded bg-gdpro-danger/10 text-gdpro-danger font-medium">{redCount} 红旗</span>}
          {yellowCount > 0 && <span className="text-[10px] px-1.5 py-[1px] rounded bg-gdpro-accent/10 text-gdpro-accent font-medium">{yellowCount} 黄旗</span>}
          <span className="text-[10px] px-1.5 py-[1px] rounded bg-gdpro-success/10 text-gdpro-success font-medium">{greenCount} 通过</span>
        </div>
      </div>

      {summary.industry && (
        <div className="px-3 py-1.5 bg-gdpro-bg-hover/30 border-b border-gdpro-border">
          <span className="text-[11px] text-gdpro-text-muted">审查行业：{summary.industry}</span>
        </div>
      )}

      <div className="divide-y divide-gdpro-border/50">
        {items.map((item, i) => {
          const cfg = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.yellow;
          const Icon = cfg.icon;
          return (
            <div key={i} className={`px-3 py-2 ${cfg.bg} border-l-2 ${cfg.border}`}>
              <div className="flex items-start gap-2">
                <Icon className={`w-3.5 h-3.5 ${cfg.color} shrink-0 mt-0.5`} strokeWidth={2} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-gdpro-text">{item.category || '审查项'}</span>
                    <span className={`text-[9px] px-1 rounded ${cfg.bg} ${cfg.color} font-medium`}>{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-gdpro-text-secondary mt-0.5 leading-relaxed">{item.description}</p>
                  {item.remediation && (
                    <p className="text-[10px] text-gdpro-text-muted mt-1">修复建议：{item.remediation}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
