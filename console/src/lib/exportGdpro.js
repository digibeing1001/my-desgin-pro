import { loadFromLocal } from './storage';
import { buildSkillAlignedProfile } from './contextAssembler';

/**
 * Export the current project + designer profile + knowledge base as a .gdpro.json file.
 * Designer profile is exported in Skill-aligned format (AP-numbered preferences).
 * This file can be imported by the Skill to maintain context continuity.
 */
export function exportGdproProject(project) {
  const profile = loadFromLocal('designer_profile', {});
  const allProjects = loadFromLocal('projects', []);

  // Collect all references from all projects into a global knowledge base
  const allReferences = [];
  allProjects.forEach((p) => {
    (p.references || []).forEach((r) => {
      allReferences.push({
        id: r.id,
        name: r.name,
        category: r.category,
        type: r.type,
        parsed: r.parsed || { status: 'pending' },
        projectId: p.id,
        projectName: p.name,
      });
    });
  });

  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    // Designer profile in Skill-aligned format with AP-numbered preferences
    designerProfile: buildSkillAlignedProfile(profile),
    knowledgeBase: {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      references: allReferences,
    },
    project: project
      ? {
          version: '1.0',
          id: project.id,
          name: project.name,
          brandName: project.brandName || project.name,
          currentPhase: project.currentPhase || 1,
          status: project.status || 'active',
          createdAt: project.createdAt,
          updatedAt: Date.now(),
          assets: project.assets || {},
          references: (project.references || []).map((r) => r.id),
        }
      : null,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gdpro-${project?.name || 'export'}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
