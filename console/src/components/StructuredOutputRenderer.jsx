import React from 'react';
import {
  ComplianceReport,
  DesignPhilosophyCard,
  MoodboardGrid,
  CritiqueScoreCard,
  ColorPalette,
  VIManualViewer,
} from './outputs';

const RENDERERS = {
  compliance_report: ComplianceReport,
  design_philosophy: DesignPhilosophyCard,
  moodboard: MoodboardGrid,
  critique: CritiqueScoreCard,
  color_system: ColorPalette,
  vi_manual: VIManualViewer,
};

/**
 * Render Skill structured output based on type.
 * Falls back to null if type is unknown or data is missing.
 */
export default function StructuredOutputRenderer({ data }) {
  if (!data || !data.type) return null;
  const Component = RENDERERS[data.type];
  if (!Component) {
    // Unknown type: log for debugging but don't crash
    console.warn('[StructuredOutput] Unknown type:', data.type);
    return null;
  }
  return <Component data={data.data} />;
}
