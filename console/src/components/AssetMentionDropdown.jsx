import React, { useRef, useEffect } from 'react';
import { Image, FileText, Box, Palette, Check } from 'lucide-react';

const CATEGORY_ICONS = {
  logo: Palette,
  product: Box,
  scene: Image,
  reference: Image,
  draft: FileText,
  deliverable: Box,
  report: FileText,
};

const CATEGORY_NAMES = {
  logo: 'Logo',
  product: '产品图',
  scene: '场景',
  reference: '参考',
  draft: '设计稿',
  deliverable: '交付物',
  report: '报告',
};

export default function AssetMentionDropdown({ items, selectedIndex, onSelect, onClose, anchorRef }) {
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          anchorRef?.current && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose, anchorRef]);

  // Scroll selected item into view
  useEffect(() => {
    const el = dropdownRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!items || items.length === 0) return null;

  // Group by category
  const grouped = {};
  items.forEach((item) => {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 bottom-full mb-1 w-64 max-h-60 overflow-y-auto bg-gdpro-bg-elevated border border-gdpro-border rounded-[10px] shadow-lg z-50 py-1"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="px-2.5 py-1 text-[10px] font-semibold text-gdpro-text-muted uppercase tracking-wider">
        引用项目资产
      </div>
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <div className="px-2.5 py-1 text-[10px] text-gdpro-text-muted/70 font-medium">
            {CATEGORY_NAMES[cat] || cat}
          </div>
          {catItems.map((item, idx) => {
            const globalIdx = items.indexOf(item);
            const isSelected = globalIdx === selectedIndex;
            const Icon = CATEGORY_ICONS[item.category] || FileText;
            return (
              <button
                key={item.id}
                data-index={globalIdx}
                onClick={() => onSelect(item)}
                className={`w-full flex items-center gap-2 px-2.5 py-[5px] text-left transition-colors ${
                  isSelected ? 'bg-gdpro-accent text-white' : 'text-gdpro-text hover:bg-gdpro-bg-hover'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-gdpro-text-muted'}`} strokeWidth={1.5} />
                <span className="text-[12px] truncate flex-1">{item.name}</span>
                {item.status === 'adopted' && (
                  <Check className={`w-3 h-3 shrink-0 ${isSelected ? 'text-white/80' : 'text-gdpro-success'}`} strokeWidth={2.5} />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
