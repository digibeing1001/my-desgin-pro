import { openclaw } from './api';

// ── localStorage operations ──

export function saveToLocal(key, data) {
  try {
    localStorage.setItem(`gdpro_${key}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadFromLocal(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`gdpro_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function removeFromLocal(key) {
  localStorage.removeItem(`gdpro_${key}`);
}

// ── Gateway File System Bridge (.gdpro/ sync) ──

const SYNC_DEBOUNCE_MS = 2000;
let syncTimer = null;
let syncQueue = new Map();

/**
 * Queue a file for sync to Gateway workspace.
 * Files are batched and sent after a debounce period.
 */
export function queueSync(relPath, content) {
  syncQueue.set(relPath, content);
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => flushSyncQueue(), SYNC_DEBOUNCE_MS);
}

/**
 * Immediately flush all queued files to Gateway.
 */
export async function flushSyncQueue() {
  if (syncQueue.size === 0) return { success: true, written: [] };
  if (!openclaw.url) return { success: false, error: 'Gateway not configured', written: [] };

  const files = Object.fromEntries(syncQueue);
  syncQueue = new Map();

  try {
    const result = await openclaw.fsSyncGdpro(files);
    console.log('[Gateway Sync] Written:', result?.written || []);
    return result;
  } catch (err) {
    console.warn('[Gateway Sync] Failed:', err.message);
    // Re-queue on failure for retry
    Object.entries(files).forEach(([path, content]) => syncQueue.set(path, content));
    return { success: false, error: err.message, written: [] };
  }
}

/**
 * Pull .gdpro/ data from Gateway workspace into localStorage.
 * Call once during app initialization if Gateway is connected.
 */
export async function pullFromGateway() {
  if (!openclaw.url) return { success: false, error: 'Gateway not configured' };

  const pulled = [];

  try {
    // 1. Designer profile
    const profileRes = await openclaw.fsRead('.gdpro/designer-profile.json');
    if (profileRes?.exists && profileRes.content) {
      const profile = JSON.parse(profileRes.content);
      saveToLocal('designer_profile', profile);
      pulled.push('.gdpro/designer-profile.json');
    }

    // 2. Knowledge base
    const kbRes = await openclaw.fsRead('.gdpro/knowledge-base.json');
    if (kbRes?.exists && kbRes.content) {
      // Knowledge base is project-scoped in Console; we store refs in projects
      // For now, just log that we received it
      console.log('[Gateway Pull] Knowledge base received');
      pulled.push('.gdpro/knowledge-base.json');
    }

    // 3. Projects list
    const listRes = await openclaw.fsList('.gdpro/projects');
    if (listRes?.entries) {
      for (const entry of listRes.entries.filter((e) => e.type === 'file' && e.name.endsWith('.json'))) {
        const projRes = await openclaw.fsRead(`.gdpro/projects/${entry.name}`);
        if (projRes?.exists && projRes.content) {
          const project = JSON.parse(projRes.content);
          // Merge into existing projects list
          const existing = loadFromLocal('projects', []);
          const idx = existing.findIndex((p) => p.id === project.id);
          if (idx >= 0) {
            existing[idx] = { ...existing[idx], ...project };
          } else {
            existing.push(project);
          }
          saveToLocal('projects', existing);
          pulled.push(`.gdpro/projects/${entry.name}`);
        }
      }
    }

    console.log('[Gateway Pull] Pulled files:', pulled);
    return { success: true, pulled };
  } catch (err) {
    console.warn('[Gateway Pull] Failed:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Convenience: save + auto-sync to Gateway.
 * Use this for designer profile, projects, and references.
 */
export function saveToLocalAndSync(key, data, gdproPath) {
  saveToLocal(key, data);
  if (gdproPath) {
    queueSync(gdproPath, JSON.stringify(data, null, 2));
  }
}
