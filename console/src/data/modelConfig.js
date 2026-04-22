// 语言大模型预设（检测成功后会替换为用户实际可用的）
export const LANGUAGE_MODELS_PRESET = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', icon: '🧠', desc: '通用最强，适合复杂设计推理' },
  { id: 'claude-sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', icon: '🎨', desc: '审美理解强，适合设计分析' },
  { id: 'claude-opus', name: 'Claude 3.7 Opus', provider: 'Anthropic', icon: '👑', desc: '深度推理，适合品牌战略' },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', provider: 'Google', icon: '🔮', desc: '多模态强，适合图文分析' },
  { id: 'deepseek', name: 'DeepSeek-V3', provider: 'DeepSeek', icon: '⚡', desc: '中文理解强，性价比高' },
  { id: 'kimi', name: 'Kimi k1.5', provider: 'Moonshot', icon: '🌙', desc: '长上下文，适合文档分析' },
];

// 生图大模型预设
export const IMAGE_MODELS_PRESET = [
  { id: 'seedream', name: 'Seedream 5.0', provider: 'ByteDance', icon: '🌱', desc: '中文理解强，适合国风/电商' },
  { id: 'flux', name: 'Flux 2.0', provider: 'Black Forest Labs', icon: '🔥', desc: '细节丰富，适合概念图' },
  { id: 'ideogram', name: 'Ideogram 3.0', provider: 'Ideogram', icon: '✏️', desc: '文字渲染最佳' },
  { id: 'gpt-image', name: 'GPT Image 1', provider: 'OpenAI', icon: '🖼️', desc: '指令跟随强，适合精确控制' },
  { id: 'imagen4', name: 'Imagen 4', provider: 'Google', icon: '🌈', desc: '色彩自然，适合插画' },
  { id: 'nano-banana', name: 'Nano Banana', provider: 'MiniMax', icon: '🍌', desc: '速度快，适合快速迭代' },
  { id: 'hunyuan', name: '混元', provider: 'Tencent', icon: '☯️', desc: '中文场景优化' },
  { id: 'stable-image', name: 'Stable Image Ultra', provider: 'Stability AI', icon: '🎭', desc: '风格多样，适合探索' },
];

// 示例占位模型（未检测到配置时显示）
export const EXAMPLE_LLM = { id: 'example', name: '示例模型', provider: '未配置', icon: '🔧', desc: '请在 Agent 工具中配置 API Key' };
export const EXAMPLE_IMAGE_MODEL = { id: 'example', name: '示例模型', provider: '未配置', icon: '🔧', desc: '请在 Agent 工具中配置 API Key' };

// 获取动态模型列表（未检测到则返回示例）
export function getLanguageModels(detected) {
  const custom = getCustomModels().llm || [];
  const base = detected ? LANGUAGE_MODELS_PRESET : [EXAMPLE_LLM];
  return [...base, ...custom];
}

export function getImageModels(detected) {
  const custom = getCustomModels().image || [];
  const base = detected ? IMAGE_MODELS_PRESET : [EXAMPLE_IMAGE_MODEL];
  return [...base, ...custom];
}

// 用户自定义模型存储
export function getCustomModels() {
  try {
    return JSON.parse(localStorage.getItem('gdpro_custom_models') || '{"llm":[],"image":[]}');
  } catch {
    return { llm: [], image: [] };
  }
}

export function saveCustomModels(models) {
  localStorage.setItem('gdpro_custom_models', JSON.stringify(models));
}

export function addCustomModel(type, model) {
  const current = getCustomModels();
  current[type] = [...(current[type] || []), { ...model, id: `custom_${Date.now()}` }];
  saveCustomModels(current);
  return current;
}

export function removeCustomModel(type, id) {
  const current = getCustomModels();
  current[type] = (current[type] || []).filter((m) => m.id !== id);
  saveCustomModels(current);
  return current;
}

// 向后兼容
export const LANGUAGE_MODELS = getLanguageModels(true);
export const IMAGE_MODELS = getImageModels(true);

export function getConfiguredModels() {
  try {
    return JSON.parse(localStorage.getItem('gdpro_model_config') || '{}');
  } catch {
    return {};
  }
}

export function saveModelConfig(config) {
  localStorage.setItem('gdpro_model_config', JSON.stringify(config));
}
