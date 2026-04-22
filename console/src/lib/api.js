/**
 * OpenClaw Gateway API 客户端
 * 默认端口: 18789
 */

const DEFAULT_GATEWAY_URL = 'http://127.0.0.1:18789';

class OpenClawAPI {
  constructor(baseUrl = DEFAULT_GATEWAY_URL, token = '') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  setConfig(baseUrl, token) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  // 健康检查（无需认证）
  async healthCheck() {
    return this.request('/api/status');
  }

  // 发送消息到主会话
  async sendMessage(message, sessionKey = 'main') {
    return this.request(`/api/sessions/${sessionKey}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // 获取会话历史
  async getSessionHistory(sessionKey = 'main') {
    return this.request(`/api/sessions/${sessionKey}/history`);
  }

  // 列出所有会话
  async listSessions() {
    return this.request('/api/sessions');
  }

  // 列出已安装 skills
  async listSkills() {
    return this.request('/api/skills');
  }
}

export const openclaw = new OpenClawAPI();

// 本地文件系统操作（通过后端代理或直接读取，MVP 阶段简化处理）
export function saveToLocal(key, data) {
  localStorage.setItem(`gdpro_${key}`, JSON.stringify(data));
}

export function loadFromLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(`gdpro_${key}`));
  } catch {
    return null;
  }
}
