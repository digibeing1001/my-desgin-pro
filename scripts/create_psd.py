#!/usr/bin/env python3
"""
将AI生成的图片组织为PSD分层文件
需要: pip install psd-tools Pillow
"""

import os
import sys
import json
import argparse
from pathlib import Path


def create_psd(
    background_image: str = None,
    graphic_images: list = None,
    text_layers: list = None,
    output_path: str = "output.psd",
    width: int = 2048,
    height: int = 2048,
    dpi: int = 300,
):
    """
    创建PSD分层文件

    Args:
        background_image: 背景图片路径
        graphic_images: 图形层图片路径列表
        text_layers: 文字层列表 [{"name": "标题", "text": "品牌名", "x": 100, "y": 100, "font_size": 48}]
        output_path: 输出PSD路径
        width: 画布宽度(px)
        height: 画布高度(px)
        dpi: 分辨率
    """
    try:
        from psd_tools import PSDImage
        from psd_tools.constants import ColorMode
        from PIL import Image
    except ImportError:
        print("ERROR: 请先安装依赖: pip install psd-tools Pillow")
        sys.exit(1)

    # 创建PSD画布
    psd = PSDImage.new(width, height, color_mode=ColorMode.RGB, dpi=dpi)

    # 添加背景层
    if background_image and os.path.exists(background_image):
        bg = Image.open(background_image)
        bg = bg.resize((width, height), Image.LANCZOS)
        bg_layer = psd.add_layer(bg, name="Background")
        print(f"  ✓ 背景层已添加")

    # 添加图形层
    if graphic_images:
        for i, img_path in enumerate(graphic_images):
            if os.path.exists(img_path):
                img = Image.open(img_path).convert("RGBA")
                layer = psd.add_layer(img, name=f"Graphic_{i+1}")
                print(f"  ✓ 图形层 {i+1} 已添加")

    # 添加文字层（占位，psd-tools文字支持有限）
    if text_layers:
        for i, text_info in enumerate(text_layers):
            # 创建文字占位层（使用透明PNG标记位置）
            name = text_info.get("name", f"Text_{i+1}")
            text = text_info.get("text", "")
            print(f"  ⚠ 文字层 '{name}': '{text}' — 需在Photoshop中手动编辑")

    # 保存
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    psd.save(str(output_path))

    print(f"\n✅ PSD已保存: {output_path}")
    print(f"  尺寸: {width}×{height}px")
    print(f"  DPI: {dpi}")

    # 生成配套说明文件
    readme = {
        "file": str(output_path),
        "size": f"{width}x{height}",
        "dpi": dpi,
        "layers": {
            "background": background_image or "空白",
            "graphics": graphic_images or [],
            "texts": [
                {"name": t.get("name"), "content": t.get("text"), "note": "需在PS中手动编辑"}
                for t in (text_layers or [])
            ],
        },
        "note": "文字层需在Photoshop/Illustrator中手动编辑，AI生成的位图文字无法直接转为可编辑文字层",
    }

    readme_path = output_path.with_suffix(".layers.json")
    with open(readme_path, "w", encoding="utf-8") as f:
        json.dump(readme, f, ensure_ascii=False, indent=2)

    print(f"  图层说明: {readme_path}")
    return str(output_path)


def main():
    parser = argparse.ArgumentParser(description="创建PSD分层文件")
    parser.add_argument("--background", "-b", default=None, help="背景图片路径")
    parser.add_argument("--graphics", "-g", nargs="*", default=None, help="图形层图片路径")
    parser.add_argument("--texts", "-t", nargs="*", default=None, help="文字层内容")
    parser.add_argument("--output", "-o", default="output.psd", help="输出PSD路径")
    parser.add_argument("--width", "-W", type=int, default=2048, help="画布宽度")
    parser.add_argument("--height", "-H", type=int, default=2048, help="画布高度")
    parser.add_argument("--dpi", type=int, default=300, help="DPI")

    args = parser.parse_args()

    text_layers = None
    if args.texts:
        text_layers = [
            {"name": f"Text_{i+1}", "text": t}
            for i, t in enumerate(args.texts)
        ]

    create_psd(
        background_image=args.background,
        graphic_images=args.graphics,
        text_layers=text_layers,
        output_path=args.output,
        width=args.width,
        height=args.height,
        dpi=args.dpi,
    )


if __name__ == "__main__":
    main()
