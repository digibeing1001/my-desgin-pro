import React from 'react';
import { Droplets } from 'lucide-react';

function ColorSwatch({ color, label, role }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-lg border border-gdpro-border shadow-sm"
        style={{ backgroundColor: color }}
        title={color}
      />
      <span className="text-[9px] font-medium text-gdpro-text-secondary text-center">{label}</span>
      <span className="text-[9px] text-gdpro-text-muted font-mono">{color}</span>
      {role && <span className="text-[8px] text-gdpro-text-muted">{role}</span>}
    </div>
  );
}

export default function ColorPalette({ data }) {
  if (!data) return null;
  const { primary = [], secondary = [], accent = [], neutrals = [], gradients = [] } = data;

  const allColors = [
    ...primary.map((c) => ({ ...c, role: '主色' })),
    ...secondary.map((c) => ({ ...c, role: '辅助色' })),
    ...accent.map((c) => ({ ...c, role: '强调色' })),
    ...neutrals.map((c) => ({ ...c, role: '中性色' })),
  ];

  return (
    <div className="rounded-lg border border-gdpro-border bg-gdpro-bg-elevated overflow-hidden mt-3">
      <div className="px-3 py-2 border-b border-gdpro-border flex items-center gap-2">
        <Droplets className="w-4 h-4 text-gdpro-accent" strokeWidth={2} />
        <span className="text-[13px] font-semibold text-gdpro-text">色彩系统</span>
      </div>

      {allColors.length > 0 && (
        <div className="px-3 py-2.5 flex flex-wrap gap-3">
          {allColors.map((c, i) => (
            <ColorSwatch key={i} color={c.hex || c.color} label={c.name || c.label} role={c.role} />
          ))}
        </div>
      )}

      {gradients.length > 0 && (
        <div className="px-3 pb-2.5 pt-0">
          <div className="h-px bg-gdpro-border/40 mb-2" />
          <div className="text-[10px] font-semibold text-gdpro-text-muted mb-1">渐变</div>
          <div className="flex flex-wrap gap-2">
            {gradients.map((g, i) => (
              <div key={i} className="flex-1 min-w-[80px] h-8 rounded-md border border-gdpro-border" style={{ background: g.css || g.value }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
