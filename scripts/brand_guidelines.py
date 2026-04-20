#!/usr/bin/env python3
"""
品牌视觉识别规范手册生成脚本
将品牌信息、色彩系统、字体系统、Logo规范等输出为结构化 Markdown 文档
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path


def generate_guidelines(
    brand_name: str,
    output_path: str = None,
    brand_personality: list = None,
    target_audience: str = "",
    competitors: str = "",
    brand_voice: str = "",
    primary_colors: list = None,
    secondary_colors: list = None,
    accent_colors: list = None,
    neutral_colors: list = None,
    heading_font: str = "",
    body_font: str = "",
    logo_files: list = None,
    design_philosophy: str = "",
    industry: str = "",
):
    """
    生成品牌视觉识别规范手册

    Args:
        brand_name: 品牌名称
        output_path: 输出路径（默认 品牌名-brand-guidelines.md）
        brand_personality: 品牌个性关键词列表
        target_audience: 目标受众描述
        competitors: 竞品描述
        brand_voice: 品牌声音描述
        primary_colors: 主色列表 [{"name": "品牌蓝", "hex": "#1A73E8", "cmyk": "C90 M60 Y0 K0", "rgb": "26,115,232"}]
        secondary_colors: 辅色列表
        accent_colors: 强调色列表
        neutral_colors: 中性色列表
        heading_font: 标题字体
        body_font: 正文字体
        logo_files: Logo文件列表 [{"name": "主Logo", "path": "logo-primary.svg", "bg": "浅色/深色/任意"}]
        design_philosophy: 设计哲学/美学运动名称
        industry: 行业
    """
    if output_path is None:
        output_path = f"{brand_name}-brand-guidelines.md"

    brand_personality = brand_personality or []
    primary_colors = primary_colors or []
    secondary_colors = secondary_colors or []
    accent_colors = accent_colors or []
    neutral_colors = neutral_colors or []
    logo_files = logo_files or []

    lines = []

    # ===== 标题 =====
    lines.append(f"# {brand_name} 品牌视觉识别规范")
    lines.append("")
    lines.append(f"> 版本 1.0 | {datetime.now().strftime('%Y年%m月%d日')}")
    lines.append(f"> 设计哲学: {design_philosophy or '待定义'}")
    lines.append(f"> 行业: {industry or '通用'}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # ===== 目录 =====
    lines.append("## 目录")
    lines.append("")
    lines.append("1. [品牌概述](#1-品牌概述)")
    lines.append("2. [Logo规范](#2-logo规范)")
    lines.append("3. [色彩系统](#3-色彩系统)")
    lines.append("4. [字体系统](#4-字体系统)")
    lines.append("5. [图形元素](#5-图形元素)")
    lines.append("6. [排版规范](#6-排版规范)")
    lines.append("7. [应用场景](#7-应用场景)")
    lines.append("8. [禁用规范](#8-禁用规范)")
    lines.append("")
    lines.append("---")
    lines.append("")

    # ===== 1. 品牌概述 =====
    lines.append("## 1. 品牌概述")
    lines.append("")
    lines.append(f"**品牌名称**: {brand_name}")
    lines.append(f"**行业**: {industry or '—'}")
    lines.append(f"**设计哲学**: {design_philosophy or '—'}")
    lines.append("")

    if brand_personality:
        lines.append("### 品牌个性")
        lines.append("")
        for kw in brand_personality:
            lines.append(f"- {kw}")
        lines.append("")

    if target_audience:
        lines.append("### 目标受众")
        lines.append("")
        lines.append(target_audience)
        lines.append("")

    if competitors:
        lines.append("### 竞争语境")
        lines.append("")
        lines.append(competitors)
        lines.append("")

    if brand_voice:
        lines.append("### 品牌声音")
        lines.append("")
        lines.append(brand_voice)
        lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 2. Logo规范 =====
    lines.append("## 2. Logo规范")
    lines.append("")

    if logo_files:
        lines.append("### 2.1 Logo变体")
        lines.append("")
        lines.append("| 变体 | 文件 | 适用背景 |")
        lines.append("|------|------|---------|")
        for lf in logo_files:
            lines.append(f"| {lf.get('name', '—')} | `{lf.get('path', '—')}` | {lf.get('bg', '—')} |")
        lines.append("")
    else:
        lines.append("### 2.1 Logo变体")
        lines.append("")
        lines.append("| 变体 | 文件 | 适用背景 |")
        lines.append("|------|------|---------|")
        lines.append("| 主Logo(彩色) | `logo-primary.svg` | 浅色背景 |")
        lines.append("| 主Logo(反白) | `logo-reverse.svg` | 深色背景 |")
        lines.append("| 纯图标版 | `logo-icon.svg` | 应用图标/Favicon |")
        lines.append("| 纯字标版 | `logo-wordmark.svg` | 空间有限时 |")
        lines.append("| 横版组合 | `logo-horizontal.svg` | 横幅/信纸 |")
        lines.append("| 竖版组合 | `logo-vertical.svg` | 社交媒体头像 |")
        lines.append("")

    lines.append("### 2.2 安全空间")
    lines.append("")
    lines.append("Logo周围必须保留最小安全空间，距离为Logo高度的 **1/4**。")
    lines.append("任何文字、图形或其他视觉元素不得进入此区域。")
    lines.append("")

    lines.append("### 2.3 最小使用尺寸")
    lines.append("")
    lines.append("| 场景 | 最小宽度 |")
    lines.append("|------|---------|")
    lines.append("| 印刷品 | 20mm |")
    lines.append("| 屏幕 | 48px |")
    lines.append("| 图标/Favicon | 16px (仅纯图标版) |")
    lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 3. 色彩系统 =====
    lines.append("## 3. 色彩系统")
    lines.append("")

    def color_table(title, colors):
        if not colors:
            return
        lines.append(f"### {title}")
        lines.append("")
        lines.append("| 色名 | 色板 | HEX | RGB | CMYK |")
        lines.append("|------|------|-----|-----|------|")
        for c in colors:
            name = c.get("name", "—")
            hex_val = c.get("hex", "—")
            rgb = c.get("rgb", "—")
            cmyk = c.get("cmyk", "—")
            # 用色块emoji近似显示
            lines.append(f"| {name} | ![{name}](https://via.placeholder.com/24/{hex_val.replace('#','')}/FFFFFF?text=+) | `{hex_val}` | {rgb} | {cmyk} |")
        lines.append("")

    color_table("3.1 主色", primary_colors)
    color_table("3.2 辅色", secondary_colors)
    color_table("3.3 强调色", accent_colors)
    color_table("3.4 中性色", neutral_colors)

    lines.append("### 3.5 色彩搭配规则")
    lines.append("")
    lines.append("- **主色**占比约60%，用于大面积背景、主视觉元素")
    lines.append("- **辅色**占比约30%，用于次要元素、分区、图表")
    lines.append("- **强调色**占比约10%，用于CTA按钮、重点标注、链接")
    lines.append("- **中性色**用于文字、边框、分割线")
    lines.append("- 深色背景下，确保文字与背景对比度 ≥ 4.5:1（WCAG AA标准）")
    lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 4. 字体系统 =====
    lines.append("## 4. 字体系统")
    lines.append("")

    lines.append("### 4.1 字体选型")
    lines.append("")
    if heading_font or body_font:
        lines.append(f"| 用途 | 字体 | 备选 |")
        lines.append(f"|------|------|------|")
        lines.append(f"| 标题 | {heading_font or '待定'} | — |")
        lines.append(f"| 正文 | {body_font or '待定'} | — |")
    else:
        lines.append("| 用途 | 字体 | 备选 |")
        lines.append("|------|------|------|")
        lines.append("| 标题 | 待定 | — |")
        lines.append("| 正文 | 待定 | — |")
    lines.append("")

    lines.append("### 4.2 字号层级")
    lines.append("")
    lines.append("| 层级 | 印刷 | 屏幕 | 字重 |")
    lines.append("|------|------|------|------|")
    lines.append("| H1 大标题 | 36pt | 48px | Bold |")
    lines.append("| H2 标题 | 28pt | 36px | SemiBold |")
    lines.append("| H3 小标题 | 20pt | 24px | Medium |")
    lines.append("| 正文 | 12pt | 16px | Regular |")
    lines.append("| 辅助文字 | 9pt | 12px | Light |")
    lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 5. 图形元素 =====
    lines.append("## 5. 图形元素")
    lines.append("")
    lines.append("### 5.1 辅助图形")
    lines.append("")
    lines.append("辅助图形是品牌视觉的延展元素，用于丰富画面层次、统一视觉风格。")
    lines.append("辅助图形应与Logo和色彩系统保持一致，可从Logo中提取几何特征延伸。")
    lines.append("")

    lines.append("### 5.2 图片风格")
    lines.append("")
    lines.append("| 场景 | 风格指南 |")
    lines.append("|------|---------|")
    lines.append("| 摄影 | 待定 |")
    lines.append("| 插画 | 待定 |")
    lines.append("| 图标 | 待定 |")
    lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 6. 排版规范 =====
    lines.append("## 6. 排版规范")
    lines.append("")
    lines.append("### 6.1 网格系统")
    lines.append("")
    lines.append("| 类型 | 栏数 | 间距 | 边距 |")
    lines.append("|------|------|------|------|")
    lines.append("| A4竖版 | 12栏 | 5mm | 20mm |")
    lines.append("| A3横版 | 12栏 | 5mm | 25mm |")
    lines.append("| 社交媒体 | 4栏 | 16px | 32px |")
    lines.append("")

    lines.append("### 6.2 行距与字距")
    lines.append("")
    lines.append("- 标题行距: 1.2倍")
    lines.append("- 正文行距: 1.5-1.8倍")
    lines.append("- 中文正文: 字距0，段间距0.5em")
    lines.append("- 英文正文: 字距0，段间距1em")
    lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 7. 应用场景 =====
    lines.append("## 7. 应用场景")
    lines.append("")
    lines.append("以下为品牌在不同触点的视觉应用示意：")
    lines.append("")
    lines.append("| 触点 | 物料 | 参考文件 |")
    lines.append("|------|------|---------|")
    lines.append("| 办公 | 名片/信纸 | — |")
    lines.append("| 数字 | 微信头图/PPT模板 | — |")
    lines.append("| 户外 | 招牌/灯箱 | — |")
    lines.append("| 宣传 | 海报/折页/易拉宝 | — |")
    lines.append("| 包装 | 手提袋/包装盒 | — |")
    lines.append("")

    lines.append("---")
    lines.append("")

    # ===== 8. 禁用规范 =====
    lines.append("## 8. 禁用规范")
    lines.append("")
    lines.append("### ❌ Logo禁用")
    lines.append("")
    lines.append("- 不得拉伸、压缩Logo")
    lines.append("- 不得改变Logo颜色（仅限品牌规范中定义的变体）")
    lines.append("- 不得在Logo上叠加文字或图形")
    lines.append("- 不得旋转Logo")
    lines.append("- 不得为Logo添加阴影、描边等效果")
    lines.append("- 不得将Logo放置在过于复杂的背景上")
    lines.append("")

    lines.append("### ❌ 色彩禁用")
    lines.append("")
    lines.append("- 不得使用规范外的颜色作为主色调")
    lines.append("- 不得降低主色的饱和度至失真")
    lines.append("- 深色背景上不得使用深色文字")
    lines.append("")

    lines.append("### ❌ 字体禁用")
    lines.append("")
    lines.append("- 不得在品牌物料中使用规范外的装饰字体")
    lines.append("- 不得过度使用粗体或斜体")
    lines.append("- 中文优先使用规范汉字，避免繁体/异体字")
    lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"*{brand_name} 品牌视觉识别规范 v1.0 — {datetime.now().strftime('%Y-%m-%d')}*")

    # 写入文件
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"[OK] Brand guidelines generated: {output_path}")
    print(f"  Brand: {brand_name}")
    print(f"  Sections: 8")
    print(f"  Primary colors: {len(primary_colors)}")
    print(f"  Secondary colors: {len(secondary_colors)}")

    return str(output_path)


def main():
    parser = argparse.ArgumentParser(description="品牌视觉识别规范手册生成工具")
    parser.add_argument("brand_name", help="品牌名称")
    parser.add_argument("--output", "-o", default=None, help="输出路径")
    parser.add_argument("--config", "-c", default=None, help="品牌配置JSON文件路径")

    args = parser.parse_args()

    if args.config:
        with open(args.config, "r", encoding="utf-8") as f:
            config = json.load(f)
        result = generate_guidelines(
            brand_name=config.get("brand_name", args.brand_name),
            output_path=args.output or config.get("output_path"),
            brand_personality=config.get("brand_personality"),
            target_audience=config.get("target_audience", ""),
            competitors=config.get("competitors", ""),
            brand_voice=config.get("brand_voice", ""),
            primary_colors=config.get("primary_colors"),
            secondary_colors=config.get("secondary_colors"),
            accent_colors=config.get("accent_colors"),
            neutral_colors=config.get("neutral_colors"),
            heading_font=config.get("heading_font", ""),
            body_font=config.get("body_font", ""),
            logo_files=config.get("logo_files"),
            design_philosophy=config.get("design_philosophy", ""),
            industry=config.get("industry", ""),
        )
    else:
        result = generate_guidelines(
            brand_name=args.brand_name,
            output_path=args.output,
        )

    return result


if __name__ == "__main__":
    main()
