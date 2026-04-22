export const DEFAULT_DESIGNER_PROFILE = {
  name: '',
  bio: '',
  aesthetic: {
    dimensions: {
      composition: { label: '构图', desc: '对称/均衡/动态/网格化', value: '' },
      color: { label: '色彩', desc: '对比度/饱和度/冷暖/单色系', value: '' },
      typography: { label: '字体', desc: '衬线/无衬线/字重/层级', value: '' },
      texture: { label: '质感', desc: '扁平/拟物/毛玻璃/噪点', value: '' },
      spacing: { label: '留白', desc: '紧凑/适中/呼吸感/负空间', value: '' },
      detail: { label: '细节', desc: '极简/丰富/装饰性/克制', value: '' },
      mood: { label: '情绪', desc: '活泼/沉稳/科技感/人文', value: '' },
    },
    preferences: [],
    prohibitions: [],
    styleTags: [],
    tools: [],
  },
};

export const AESTHETIC_TEMPLATE = {
  minimal: {
    composition: '对称均衡，网格化布局，严格的秩序感',
    color: '低饱和度，大面积留白，单色或双色配色',
    typography: '无衬线字体为主，字重对比鲜明，层级清晰',
    texture: '扁平化为主，无多余装饰',
    spacing: '大量留白，元素间距统一，呼吸感强',
    detail: '极简克制，去除所有非必要元素',
    mood: '沉稳专业，高级感',
  },
  warm: {
    composition: '有机布局，不规则但和谐，有亲和力',
    color: '暖色调为主，米白/浅棕/珊瑚色',
    typography: '衬线标题 + 无衬线正文，有温度感',
    texture: '轻微纸质纹理，手作感',
    spacing: '适中留白，元素间距温暖不压抑',
    detail: '适度装饰，手写体点缀，插画元素',
    mood: '温暖亲切，有人情味',
  },
  tech: {
    composition: '动态非对称，打破常规网格，有冲击力',
    color: '高对比度，深色背景 + 霓虹点缀',
    typography: '几何无衬线，等宽字体点缀，科技感',
    texture: '毛玻璃、渐变、光影、粒子效果',
    spacing: '紧凑密集，信息密度高',
    detail: '丰富细节，微交互暗示，数据可视化',
    mood: '前沿未来，精密感',
  },
};
