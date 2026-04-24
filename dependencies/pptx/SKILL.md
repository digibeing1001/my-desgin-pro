---
name: pptx
description: >
  创建和生成PowerPoint(.pptx)演示文稿。基于PptxGenJS从零生成专业幻灯片。
  支持品牌VI设计规范手册PPT输出、幻灯片布局、配色方案、图表、图标等。
  触发场景：(1) 创建PPT/pptx (2) 演示文稿/幻灯片 (3) VI规范手册PPT输出
  (4) 品牌设计PPT (5) presentation/deck/slides
---

# PPTX Skill — PowerPoint演示文稿生成

基于PptxGenJS的PPT生成技能。支持从零创建专业演示文稿，特别适配品牌VI设计手册输出。

## 依赖

| 依赖 | 安装状态 | 用途 |
|------|---------|------|
| pptxgenjs | `npm install -g pptxgenjs` | PPT生成核心 |
| markitdown | `pip install "markitdown[pptx]"` | PPT文本提取(QA) |
| Pillow | `pip install Pillow` | 图片处理 |

## 核心工作流

### 1. 从零创建PPT（主要模式）

使用PptxGenJS生成，适用于**无模板**场景：

```javascript
const pptxgen = require("pptxgenjs");
let pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Graphic Design Pro';
pres.title = 'Brand VI Manual';

// 添加幻灯片...
let slide = pres.addSlide();

pres.writeFile({ fileName: "output.pptx" });
```

### 2. 品牌VI规范手册PPT模板

VI手册标准章节结构（适配my-desgin Phase 6交付）：

```
Slide 1:  封面（品牌名+Logo+版本号+日期）
Slide 2:  目录
Slide 3:  品牌概述（品牌定位/愿景/价值观/Slogan）
Slide 4:  标志规范-标志释义
Slide 5:  标志规范-标准制图与网格
Slide 6:  标志规范-标志版本（横版/竖版/彩色/墨稿/反白）
Slide 7:  标志规范-安全空间与最小尺寸
Slide 8:  标志规范-错误应用禁令
Slide 9:  色彩规范-标准色（主色/辅色/中性色+4种色值标注）
Slide 10: 色彩规范-色彩应用比例（60-30-10）
Slide 11: 字体规范-指定字体（中文/英文+字体层级）
Slide 12: 辅助图形规范
Slide 13: 品牌图片/影像风格
Slide 14+: VI应用物料（按项目需求扩展）
Slide N:  VI规范维护指南
```

## PptxGenJS关键API速查

### 布局
| 布局 | 尺寸 |
|------|------|
| LAYOUT_16x9 | 10" × 5.625" |
| LAYOUT_16x10 | 10" × 6.25" |
| LAYOUT_4x3 | 10" × 7.5" |

### 文本
```javascript
slide.addText("Title", {
  x: 0.5, y: 0.5, w: 9, h: 1,
  fontSize: 36, fontFace: "Arial",
  color: "363636", bold: true,
  align: "center", valign: "middle"
});

// 富文本
slide.addText([
  { text: "Bold ", options: { bold: true } },
  { text: "Normal" }
], { x: 1, y: 3, w: 8, h: 1 });

// 列表
slide.addText([
  { text: "Item 1", options: { bullet: true, breakLine: true } },
  { text: "Item 2", options: { bullet: true } }
], { x: 0.5, y: 0.5, w: 8, h: 3 });
```

### 形状
```javascript
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1, y: 1, w: 3, h: 2,
  fill: { color: "FF0000" }
});
slide.addShape(pres.shapes.OVAL, {
  x: 4, y: 1, w: 2, h: 2,
  fill: { color: "0000FF" }
});
```

### 图片
```javascript
slide.addImage({ path: "logo.png", x: 1, y: 1, w: 5, h: 3 });
slide.addImage({ data: "image/png;base64,...", x: 1, y: 1, w: 5, h: 3 });
```

### 表格
```javascript
slide.addTable([
  [{ text: "色名", options: { bold: true, fill: { color: "333333" }, color: "FFFFFF" } }, { text: "HEX", options: { bold: true, fill: { color: "333333" }, color: "FFFFFF" } }],
  ["主色", "#E4000B"],
  ["辅色", "#333333"]
], { x: 1, y: 1, w: 8, border: { pt: 1, color: "CCCCCC" } });
```

### 背景
```javascript
slide.background = { color: "F1F1F1" };
slide.background = { path: "bg.jpg" };
```

### 图表
```javascript
slide.addChart(pres.charts.BAR, [{
  name: "Data", labels: ["A", "B", "C"], values: [10, 20, 30]
}], { x: 0.5, y: 1, w: 9, h: 4 });
```

## ⚠️ 关键避坑

| 规则 | 说明 |
|------|------|
| ❌ HEX颜色不带`#` | `color: "FF0000"` ✅ / `color: "#FF0000"` ❌ (损坏文件) |
| ❌ 不用8位HEX透明度 | 用 `opacity: 0.5` 而非 `"00000020"` |
| ❌ 不用Unicode项目符号 | 用 `bullet: true` 而非 `"•"` |
| ❌ 数组项间用`breakLine: true` | 否则文本连在一起 |
| ❌ 不重用选项对象 | PptxGenJS会原地修改，每次创建新对象 |
| ❌ 标题不画下划强调线 | AI生成PPT的标志性错误，用留白代替 |

## 配色方案（10套主题）

| 主题 | 主色 | 辅色 | 强调色 |
|------|------|------|--------|
| 午夜高管 | #1E2761 | #CADCFC | #FFFFFF |
| 森林苔藓 | #2C5F2D | #97BC62 | #F5F5F5 |
| 珊瑚活力 | #F96167 | #F9E795 | #2F3C7E |
| 温暖陶土 | #B85042 | #E7E8D1 | #A7BEAE |
| 海洋渐变 | #065A82 | #1C7293 | #21295C |
| 炭灰极简 | #36454F | #F2F2F2 | #212121 |
| 青绿信任 | #028090 | #00A896 | #02C39A |
| 浆果奶油 | #6D2E46 | #A26769 | #ECE2D0 |
| 鼠尾草宁静 | #84B59F | #69A297 | #50808E |
| 樱桃大胆 | #990011 | #FCF6F5 | #2F3C7E |

## 字号规范

| 元素 | 字号 |
|------|------|
| 幻灯片标题 | 36-44pt 粗体 |
| 章节标题 | 20-24pt 粗体 |
| 正文 | 14-16pt |
| 说明文字 | 10-12pt 灰色 |

## QA流程

1. **文本检查**: `python -m markitdown output.pptx` — 检查缺失/错别字/模板残留
2. **模板残留**: `python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum"`
3. **视觉检查**: 逐页审查重叠/溢出/间距/对齐/对比度
4. **验证循环**: 生成→检查→修复→重新验证（至少1轮）
