#!/usr/bin/env python3
"""
品牌色彩系统生成脚本
从基础色生成完整的品牌色彩系统：主色、辅色、强调色、中性色、渐变方案
支持从图片提取色彩、从色相生成色阶、WCAG对比度检测
"""

import os
import sys
import json
import argparse
import colorsys
from pathlib import Path


def hex_to_rgb(hex_str: str) -> tuple:
    """HEX → RGB"""
    hex_str = hex_str.lstrip("#")
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """RGB → HEX"""
    return f"#{r:02X}{g:02X}{b:02X}"


def rgb_to_cmyk(r: int, g: int, b: int) -> str:
    """RGB → CMYK"""
    if r == 0 and g == 0 and b == 0:
        return "C0 M0 Y0 K100"
    c = 1 - r / 255
    m = 1 - g / 255
    y = 1 - b / 255
    k = min(c, m, y)
    c = round((c - k) / (1 - k) * 100)
    m = round((m - k) / (1 - k) * 100)
    y = round((y - k) / (1 - k) * 100)
    k = round(k * 100)
    return f"C{c} M{m} Y{y} K{k}"


def rgb_to_hsl(r: int, g: int, b: int) -> tuple:
    """RGB → HSL"""
    r, g, b = r / 255, g / 255, b / 255
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return round(h * 360, 1), round(s * 100, 1), round(l * 100, 1)


def relative_luminance(r: int, g: int, b: int) -> float:
    """计算相对亮度（WCAG 2.0）"""
    def linearize(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)


def contrast_ratio(color1: tuple, color2: tuple) -> float:
    """计算两个颜色的对比度（WCAG 2.0）"""
    l1 = relative_luminance(*color1)
    l2 = relative_luminance(*color2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def generate_shades(hex_color: str, num: int = 9) -> list:
    """从一个基础色生成明度色阶（如50-900）"""
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)

    # 色阶：从浅到深
    lightness_values = [95, 90, 82, 74, 62, 52, 42, 32, 22]
    if num <= len(lightness_values):
        lightness_values = lightness_values[:num]

    shades = []
    for i, lv in enumerate(lightness_values):
        # 保持色相和饱和度，调整亮度
        new_l = lv / 100
        new_s = s / 100
        # 非常浅的色阶降低饱和度
        if lv > 80:
            new_s = new_s * (1 - (lv - 80) / 30)

        nr, ng, nb = colorsys.hls_to_rgb(h / 360, new_l, new_s)
        nr, ng, nb = int(nr * 255), int(ng * 255), int(nb * 255)
        shade_hex = rgb_to_hex(nr, ng, nb)

        shade_name = f"{50 * (i + 1)}" if num >= 9 else f"shade_{i+1}"
        shades.append({
            "name": shade_name,
            "hex": shade_hex,
            "rgb": f"{nr},{ng},{nb}",
            "cmyk": rgb_to_cmyk(nr, ng, nb),
        })

    return shades


def generate_complementary(hex_color: str) -> str:
    """生成互补色"""
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)
    comp_h = (h + 180) % 360
    cr, cg, cb = colorsys.hls_to_rgb(comp_h / 360, l / 100, s / 100)
    return rgb_to_hex(int(cr * 255), int(cg * 255), int(cb * 255))


def generate_analogous(hex_color: str, angle: int = 30) -> list:
    """生成类似色（±angle度）"""
    r, g, b = hex_to_rgb(hex_color)
    h, s, l = rgb_to_hsl(r, g, b)
    colors = []
    for offset in [-angle, angle]:
        new_h = (h + offset) % 360
        nr, ng, nb = colorsys.hls_to_rgb(new_h / 360, l / 100, s / 100)
        colors.append(rgb_to_hex(int(nr * 255), int(ng * 255), int(nb * 255)))
    return colors


def generate_neutrals(base_hex: str = "#6B7280", num: int = 7) -> list:
    """生成中性色色阶"""
    return generate_shades(base_hex, num)


def check_accessibility(fg_hex: str, bg_hex: str = "#FFFFFF") -> dict:
    """检查WCAG对比度"""
    fg = hex_to_rgb(fg_hex)
    bg = hex_to_rgb(bg_hex)
    ratio = contrast_ratio(fg, bg)

    return {
        "foreground": fg_hex,
        "background": bg_hex,
        "ratio": round(ratio, 2),
        "aa_normal": ratio >= 4.5,   # AA级正常文字
        "aa_large": ratio >= 3.0,    # AA级大文字
        "aaa_normal": ratio >= 7.0,  # AAA级正常文字
        "aaa_large": ratio >= 4.5,   # AAA级大文字
    }


def generate_color_system(
    primary_hex: str,
    secondary_hex: str = None,
    accent_hex: str = None,
    output_path: str = None,
) -> dict:
    """
    生成完整的品牌色彩系统

    Args:
        primary_hex: 主色 HEX
        secondary_hex: 辅色 HEX（可选，不提供则自动生成互补色）
        accent_hex: 强调色 HEX（可选，不提供则自动生成类似色）
        output_path: 输出JSON路径

    Returns:
        色彩系统字典
    """
    system = {
        "primary": {
            "base": primary_hex,
            "name": "主色",
            "rgb": ",".join(str(c) for c in hex_to_rgb(primary_hex)),
            "cmyk": rgb_to_cmyk(*hex_to_rgb(primary_hex)),
            "hsl": "{}°, {}%, {}%".format(*rgb_to_hsl(*hex_to_rgb(primary_hex))),
            "shades": generate_shades(primary_hex),
        },
    }

    # 辅色：如未提供则用互补色
    if secondary_hex:
        sec_hex = secondary_hex
    else:
        sec_hex = generate_complementary(primary_hex)

    system["secondary"] = {
        "base": sec_hex,
        "name": "辅色",
        "rgb": ",".join(str(c) for c in hex_to_rgb(sec_hex)),
        "cmyk": rgb_to_cmyk(*hex_to_rgb(sec_hex)),
        "hsl": "{}°, {}%, {}%".format(*rgb_to_hsl(*hex_to_rgb(sec_hex))),
        "shades": generate_shades(sec_hex),
    }

    # 强调色：如未提供则用类似色
    if accent_hex:
        acc_hex = accent_hex
    else:
        analogous = generate_analogous(primary_hex, 30)
        acc_hex = analogous[1]  # 取暖方向的类似色

    system["accent"] = {
        "base": acc_hex,
        "name": "强调色",
        "rgb": ",".join(str(c) for c in hex_to_rgb(acc_hex)),
        "cmyk": rgb_to_cmyk(*hex_to_rgb(acc_hex)),
        "hsl": "{}°, {}%, {}%".format(*rgb_to_hsl(*hex_to_rgb(acc_hex))),
        "shades": generate_shades(acc_hex),
    }

    # 中性色
    neutral_base = "#6B7280"
    system["neutral"] = {
        "base": neutral_base,
        "name": "中性色",
        "shades": generate_neutrals(neutral_base),
    }

    # 渐变方案
    system["gradients"] = [
        {"name": "主渐变", "from": primary_hex, "to": sec_hex},
        {"name": "强调渐变", "from": primary_hex, "to": acc_hex},
        {"name": "暖色渐变", "from": primary_hex, "to": analogous[1] if not accent_hex else acc_hex},
    ]

    # 无障碍检测
    system["accessibility"] = {
        "primary_on_white": check_accessibility(primary_hex, "#FFFFFF"),
        "primary_on_dark": check_accessibility(primary_hex, "#1F2937"),
        "white_on_primary": check_accessibility("#FFFFFF", primary_hex),
    }

    # 输出
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(json.dumps(system, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[OK] Color system generated: {output_path}")
    else:
        print(json.dumps(system, ensure_ascii=False, indent=2))

    # 打印摘要
    print(f"\n--- Color System Summary ---")
    print(f"  Primary: {primary_hex}")
    print(f"  Secondary: {sec_hex} {'(auto complementary)' if not secondary_hex else '(manual)'}")
    print(f"  Accent: {acc_hex} {'(auto analogous)' if not accent_hex else '(manual)'}")
    print(f"  Primary shades: {len(system['primary']['shades'])} levels")
    print(f"  WCAG primary/white: {system['accessibility']['primary_on_white']['ratio']}:1")

    return system


def main():
    parser = argparse.ArgumentParser(description="品牌色彩系统生成工具")
    parser.add_argument("primary", help="主色HEX值 (如 #1A73E8)")
    parser.add_argument("--secondary", "-s", default=None, help="辅色HEX值 (可选，默认自动生成互补色)")
    parser.add_argument("--accent", "-a", default=None, help="强调色HEX值 (可选，默认自动生成类似色)")
    parser.add_argument("--output", "-o", default=None, help="输出JSON路径")

    args = parser.parse_args()

    generate_color_system(
        primary_hex=args.primary,
        secondary_hex=args.secondary,
        accent_hex=args.accent,
        output_path=args.output,
    )


if __name__ == "__main__":
    main()
