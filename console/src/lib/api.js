// OpenClaw / WorkBuddy Gateway API 封装
const API = {
  url: null,
  token: null,

  setConfig(url, token) {
    this.url = url?.replace(/\/$/, '') || null;
    this.token = token || null;
  },

  async fetch(path, options = {}) {
    if (!this.url) throw new Error('Gateway URL 未配置');
    const res = await fetch(`${this.url}${path}`, {
      ...options,
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      throw new Error(`Gateway ${res.status}: ${text}`);
    }
    if (res.status === 204) return null;
    return res.json().catch(() => null);
  },

  async healthCheck() {
    return this.fetch('/health');
  },

  async sendMessage(projectId, message, { llm, imageModel, systemPrompt, references, assets, action } = {}) {
    return this.fetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ projectId, message, llm, imageModel, systemPrompt, references, assets, action }),
    });
  },

  async generateImage(prompt, { model, size = '1024x1024', n = 1 } = {}) {
    return this.fetch('/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, model, size, n }),
    });
  },

  // ── File System Bridge (.gdpro/ sync) ──

  /**
   * Read a file from the agent workspace via Gateway.
   * @param {string} relPath - Relative path (e.g. '.gdpro/designer-profile.json')
   * @returns {Promise<{content: string, exists: boolean}>}
   */
  async fsRead(relPath) {
    return this.fetch('/fs/read', {
      method: 'POST',
      body: JSON.stringify({ path: relPath }),
    });
  },

  /**
   * Write a file to the agent workspace via Gateway.
   * @param {string} relPath - Relative path
   * @param {string} content - File content (JSON string)
   * @returns {Promise<{success: boolean, path: string}>}
   */
  async fsWrite(relPath, content) {
    return this.fetch('/fs/write', {
      method: 'POST',
      body: JSON.stringify({ path: relPath, content }),
    });
  },

  /**
   * List directory contents.
   * @param {string} relPath - Directory path
   * @returns {Promise<{entries: Array<{name: string, type: 'file'|'dir'}>}>}
   */
  async fsList(relPath) {
    return this.fetch('/fs/list', {
      method: 'POST',
      body: JSON.stringify({ path: relPath }),
    });
  },

  /**
   * Check if a file exists.
   * @param {string} relPath
   * @returns {Promise<{exists: boolean}>}
   */
  async fsExists(relPath) {
    return this.fetch('/fs/exists', {
      method: 'POST',
      body: JSON.stringify({ path: relPath }),
    });
  },

  /**
   * Batch sync .gdpro/ directory to workspace.
   * @param {Object} files - Map of relPath -> content
   * @returns {Promise<{success: boolean, written: string[]}>}
   */
  async fsSyncGdpro(files) {
    return this.fetch('/fs/sync-gdpro', {
      method: 'POST',
      body: JSON.stringify({ files }),
    });
  },
};

export const openclaw = API;
