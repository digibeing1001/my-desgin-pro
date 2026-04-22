import { loadFromLocal } from './storage';
import { buildPhaseGuardPrompt } from './phaseGuard';
import { openclaw } from './api';

/**
 * Mapping from Console dimension keys to Skill aesthetic archive dimension names.
 * Console 的 7 维度表单 ↔ Skill brand-profile.md 审美档案的 6 个偏好分类
 */
const DIMENSION_MAP = {
  color:       { skillDim: '色彩偏好',   desc: '明度/饱和度/色相倾向、冷暖偏好、特定颜色偏好/禁止' },
  typography:  { skillDim: '字体偏好',   desc: '衬线/无衬线、字重、中文/英文匹配' },
  composition: { skillDim: '构图偏好',   desc: '对称/不对称、中心/偏移、层次数量' },
  spacing:     { skillDim: '排版偏好',   desc: '留白量、对齐方式、信息密度' },
  texture:     { skillDim: '风格偏好',   desc: '质感方向：扁平/拟物/毛玻璃/噪点/手作感' },
  detail:      { skillDim: '风格偏好',   desc: '细节程度：极简/丰富/装饰性/克制' },
  mood:        { skillDim: '氛围偏好',   desc: '高级/亲民、活力/沉静、温暖/冷静' },
};

function getNextAPNumber(preferences = []) {
  const nums = preferences
    .map((p) => p.id?.match(/AP-(\d+)/)?.[1])
    .filter(Boolean)
    .map(Number);
  const max = nums.length ? Math.max(...nums) : 0;
  return `AP-${String(max + 1).padStart(3, '0')}`;
}

/**
 * Convert Console designer-profile dimensions into Skill-style AP-numbered preferences.
 */
function buildAPPreferences(profile) {
  const prefs = [];
  const dims = profile.aesthetic?.dimensions || {};

  Object.entries(dims).forEach(([key, dim]) => {
    if (!dim?.value?.trim()) return;
    const mapping = DIMENSION_MAP[key];
    if (!mapping) return;
    prefs.push({
      id: getNextAPNumber(prefs),
      dimension: mapping.skillDim,
      preference: dim.value.trim(),
      parameter: mapping.desc,
      source: 'Console-设计师档案',
    });
  });

  return prefs;
}

function buildAPProhibitions(profile) {
  const prohibs = profile.aesthetic?.prohibitions || [];
  let counter = 1;
  return prohibs
    .filter((p) => p?.trim())
    .map((p) => ({
      id: `AP-P${String(counter++).padStart(3, '0')}`,
      item: p.trim(),
      reason: '设计师明确禁止',
      source: 'Console-设计师档案',
    }));
}

/**
 * Build a system prompt from designer profile + knowledge base + project assets.
 * Output format is aligned with Skill's brand-profile.md aesthetic archive structure.
 */
function buildBrandProfileSection(project) {
  // Try to read brand-profile from project's documents or localStorage
  const projectId = project?.id;
  if (!projectId) return '';

  // 1. Check project.documents.brief (adopted during Phase 1)
  const brief = project?.documents?.brief;
  if (brief?.content) {
    const lines = ['## 📋 品牌档案（brand-profile.md · 锁定项）'];
    lines.push('> 以下内容为 Skill 创建的品牌档案，所有产出必须逐字引用，不得擅自修改。');
    lines.push('');
    // Include first 800 chars as context
    const snippet = brief.content.slice(0, 800).replace(/\n/g, ' ');
    lines.push(snippet);
    if (brief.content.length > 800) lines.push('...（内容已截断）');
    return lines.join('\n');
  }

  // 2. Check localStorage for parsed brand profile
  const stored = loadFromLocal(`brand_profile_${projectId}`, null);
  if (stored?.content) {
    const lines = ['## 📋 品牌档案（brand-profile.md · 锁定项）'];
    const snippet = stored.content.slice(0, 800).replace(/\n/g, ' ');
    lines.push(snippet);
    return lines.join('\n');
  }

  return '';
}

export function buildSystemPrompt({ profile, references, assets, project, assetMentions } = {}) {
  const p = profile || loadFromLocal('designer_profile', {});
  const apPrefs = buildAPPreferences(p);
  const apProhibs = buildAPProhibitions(p);
  const hasProfile = p.name || p.bio || apPrefs.length > 0 || apProhibs.length > 0;

  const parts = [];

  // ── 1. Designer Profile (global aesthetic DNA) ──
  if (hasProfile) {
    const lines = ['## 🎨 设计师档案（全局审美 DNA · 与 Skill 审美档案对齐）'];
    if (p.name) lines.push(`**设计师**：${p.name}`);
    if (p.bio) lines.push(`**简介**：${p.bio}`);

    const tags = p.aesthetic?.styleTags || [];
    if (tags.length) lines.push(`**风格标签**：${tags.join('、')}`);

    const tools = p.aesthetic?.tools || [];
    if (tools.length) lines.push(`**常用工具**：${tools.join('、')}`);

    if (apPrefs.length) {
      lines.push('');
      lines.push('### 审美偏好（AP 编号）');
      lines.push('| AP编号 | 维度 | 偏好 | 参数 | 来源 |');
      lines.push('|--------|------|------|------|------|');
      apPrefs.forEach((pref) => {
        lines.push(`| ${pref.id} | ${pref.dimension} | ${pref.preference} | ${pref.parameter} | ${pref.source} |`);
      });
    }

    if (apProhibs.length) {
      lines.push('');
      lines.push('### 禁止偏好');
      lines.push('| AP编号 | 禁止项 | 原因 | 来源 |');
      lines.push('|--------|--------|------|------|');
      apProhibs.forEach((prohib) => {
        lines.push(`| ${prohib.id} | ${prohib.item} | ${prohib.reason} | ${prohib.source} |`);
      });
    }

    parts.push(lines.join('\n'));
  }

  // ── 2. Knowledge Base (references) ──
  const refs = references || [];
  const parsedRefs = refs.filter((r) => r.parsed?.status === 'parsed' && r.parsed?.text);
  if (parsedRefs.length) {
    const lines = ['## 📚 知识库参考资料'];
    parsedRefs.slice(0, 8).forEach((r) => {
      const snippet = r.parsed.text.slice(0, 400).replace(/\s+/g, ' ');
      lines.push(`[${r.category || '参考'}] ${r.name}：${snippet}`);
    });
    parts.push(lines.join('\n'));
  }

  // ── 2.5 Asset Mentions (user explicitly referenced in current message) ──
  const mentions = assetMentions || [];
  if (mentions.length) {
    const lines = ['## 🔗 用户引用的资产（当前消息）'];
    mentions.forEach((a) => {
      lines.push(`- **[${a.category || '资产'}] ${a.name}**${a.description ? ` — ${a.description}` : ''}${a.status === 'adopted' ? ' （已采纳）' : ''}`);
    });
    lines.push('> 请基于以上引用资产进行设计回应。');
    parts.push(lines.join('\n'));
  }

  // ── 3. Project Assets (adopted history) ──
  const assetMap = assets || {};
  const allAssets = Object.values(assetMap).flat();
  const adopted = allAssets.filter((a) => a.status === 'adopted');
  if (adopted.length) {
    const lines = ['## 📦 本项目已采纳资产'];
    adopted.slice(0, 10).forEach((a) => {
      lines.push(`- [${a.category || '资产'}] ${a.name}${a.description ? `：${a.description}` : ''}`);
    });
    parts.push(lines.join('\n'));
  }

  // ── 3.5 Brand Profile (R6 locked items) ──
  const brandProfileSection = buildBrandProfileSection(project);
  if (brandProfileSection) {
    parts.push(brandProfileSection);
  }

  // ── 3.6 Phase Guard Context ──
  if (project) {
    parts.push(buildPhaseGuardPrompt(project.currentPhase || 1));
  }

  // ── 4. Project Phase Context ──
  if (project) {
    const phaseNames = ['需求追问', '竞品分析', '样稿生成', '物料扩展', '合规审查', '落地交付'];
    const phase = project.currentPhase || 1;
    parts.push(`## 📍 项目状态\n- 项目名称：${project.name}\n- 当前阶段：${phaseNames[phase - 1] || '未知'}（第 ${phase} 阶段）`);
  }

  // ── 5. Instruction footer ──
  parts.push(
    '## ⚡ 执行指令\n' +
    '1. 以上「🎨 设计师档案」是你的**最高优先级**执行参照，所有输出必须严格符合档案中的审美偏好和禁止项。\n' +
    '2. 审美偏好按 AP 编号追溯，新增偏好不得与已有 AP 冲突。\n' +
    '3. 主动引用知识库中与用户需求相关的参考资料。\n' +
    '4. 保持与已采纳资产的风格一致性。\n' +
    '5. 每次回复末尾提供可操作的按钮：采纳(✓)、拒绝(✕)、修改(✎)。'
  );

  return parts.join('\n\n---\n\n');
}

/**
 * Build a human-readable summary of what context was loaded.
 */
export function buildContextSummary({ profile, references, assets, project, assetMentions } = {}) {
  const p = profile || loadFromLocal('designer_profile', {});
  const apPrefs = buildAPPreferences(p);
  const apProhibs = buildAPProhibitions(p);
  const hasProfile = p.name || p.bio || apPrefs.length > 0 || apProhibs.length > 0;

  const refs = references || [];
  const parsedCount = refs.filter((r) => r.parsed?.status === 'parsed').length;

  const assetMap = assets || {};
  const adoptedCount = Object.values(assetMap)
    .flat()
    .filter((a) => a.status === 'adopted').length;

  const lines = [];
  if (hasProfile) {
    const tags = (p.aesthetic?.styleTags || []).slice(0, 3);
    const tagStr = tags.length ? `（${tags.join('、')}）` : '';
    lines.push(`• 设计师档案${tagStr} — ${apPrefs.length} 条审美偏好 · ${apProhibs.length} 条禁止项`);
  } else {
    lines.push('• 设计师档案 — 尚未配置，建议前往「设计师档案」完善风格偏好');
  }

  lines.push(`• 知识库 — ${parsedCount} 份已解析参考资料可用`);
  lines.push(`• 项目资产 — ${adoptedCount} 个已采纳设计资产`);

  const mentions = assetMentions || [];
  if (mentions.length) {
    lines.push(`• 当前引用 — ${mentions.length} 个资产（${mentions.map((a) => a.name).join('、')}）`);
  }

  if (project) {
    const phaseNames = ['需求追问', '竞品分析', '样稿生成', '物料扩展', '合规审查', '落地交付'];
    lines.push(`• 当前阶段 — ${project.name} / ${phaseNames[project.currentPhase - 1] || '未知'}`);
  }

  return lines.join('\n');
}

/**
 * Export designer profile in Skill-aligned format (for .gdpro/designer-profile.json).
 */
export function buildSkillAlignedProfile(profile) {
  const p = profile || loadFromLocal('designer_profile', {});
  return {
    version: '1.0',
    updatedAt: new Date().toISOString(),
    name: p.name || '',
    bio: p.bio || '',
    aesthetic: {
      // AP-numbered preferences aligned with Skill's brand-profile.md structure
      preferences: buildAPPreferences(p),
      prohibitions: buildAPProhibitions(p),
      styleTags: p.aesthetic?.styleTags || [],
      tools: p.aesthetic?.tools || [],
      // Raw dimensions preserved for Console UI compatibility
      dimensions: p.aesthetic?.dimensions || {},
    },
  };
}
