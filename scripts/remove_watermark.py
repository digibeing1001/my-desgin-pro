#!/usr/bin/env python3
"""
AI生成图片水印/标识移除脚本
使用Pillow进行简单的水印区域检测与修复
对于复杂水印建议使用专业工具手动处理
"""

import os
import sys
import argparse
from pathlib import Path


def detect_watermark_region(image_path: str):
    """
    检测常见AI水印区域
    大多数AI水印位于图片右下角或底部
    返回 (x, y, w, h) 区域坐标
    """
    try:
        from PIL import Image
        img = Image.open(image_path)
        w, h = img.size

        # 常见水印位置：右下角
        regions = [
            # (x, y, width, height) - 右下角
            (int(w * 0.7), int(h * 0.9), int(w * 0.3), int(h * 0.1)),
            # 底部中央
            (int(w * 0.3), int(h * 0.92), int(w * 0.4), int(h * 0.08)),
            # 右下角小面积
            (int(w * 0.85), int(h * 0.93), int(w * 0.15), int(h * 0.07)),
        ]

        return regions
    except Exception as e:
        print(f"  WARNING: 水印区域检测失败: {e}")
        return []


def remove_watermark_simple(image_path: str, output_path: str = None, regions: list = None):
    """
    简单水印移除：使用周围像素填充水印区域

    注意：此方法适用于纯色/简单背景上的小水印
    复杂背景上的水印建议使用 Photoshop 内容感知填充等专业工具
    """
    try:
        from PIL import Image, ImageFilter, ImageDraw
    except ImportError:
        print("ERROR: 请先安装 Pillow: pip install Pillow")
        return None

    img = Image.open(image_path).convert("RGBA")
    w, h = img.size

    if output_path is None:
        output_path = str(Path(image_path).with_name(
            Path(image_path).stem + "_no_watermark" + Path(image_path).suffix
        ))

    if regions is None:
        regions = detect_watermark_region(image_path)

    if not regions:
        print("  ⚠ 未检测到水印区域，跳过处理")
        return image_path

    # 使用高斯模糊填充水印区域
    result = img.copy()
    blurred = img.filter(ImageFilter.GaussianBlur(radius=20))

    for x, y, rw, rh in regions:
        # 确保区域在图片范围内
        x = max(0, min(x, w - 1))
        y = max(0, min(y, h - 1))
        rw = min(rw, w - x)
        rh = min(rh, h - y)

        # 从模糊版本中裁取区域
        patch = blurred.crop((x, y, x + rw, y + rh))
        result.paste(patch, (x, y))

    # 保存
    result = result.convert("RGB")
    result.save(output_path, quality=95)
    print(f"  ✓ 水印已移除: {output_path}")

    return output_path


def check_ai_watermark(image_path: str):
    """
    检查图片是否包含AI生成标识
    返回检测结果
    """
    result = {
        "has_watermark": False,
        "confidence": "low",
        "note": "",
    }

    try:
        from PIL import Image
        import io

        # 检查EXIF数据
        img = Image.open(image_path)
        exif = img._getexif() if hasattr(img, "_getexif") else None

        if exif:
            for tag_id, value in exif.items():
                value_str = str(value).lower()
                if any(kw in value_str for kw in ["ai", "generated", "stable diffusion", "midjourney", "dall-e", "seedream"]):
                    result["has_watermark"] = True
                    result["confidence"] = "high"
                    result["note"] = f"EXIF中发现AI标识: {value_str[:100]}"
                    return result

        # 检查文件大小和元数据
        file_size = os.path.getsize(image_path)
        if file_size < 10000:  # 小于10KB不太可能有水印
            result["note"] = "文件过小，不太可能包含水印"

        # 豆包即梦API已强制关闭水印，大概率无水印
        result["note"] = "豆包即梦API水印已服务端强制关闭，通常无需处理"

    except Exception as e:
        result["note"] = f"检测过程出错: {e}"

    return result


def main():
    parser = argparse.ArgumentParser(description="AI图片水印移除工具")
    parser.add_argument("input", help="输入图片路径")
    parser.add_argument("--output", "-o", default=None, help="输出路径")
    parser.add_argument("--check-only", "-c", action="store_true", help="仅检测不移除")
    parser.add_argument("--regions", "-r", nargs=4, type=int, action="append",
                        metavar=("X", "Y", "W", "H"), help="手动指定水印区域")

    args = parser.parse_args()

    if args.check_only:
        result = check_ai_watermark(args.input)
        print(f"\n水印检测结果:")
        print(f"  是否有水印: {'是' if result['has_watermark'] else '否'}")
        print(f"  置信度: {result['confidence']}")
        print(f"  说明: {result['note']}")
    else:
        regions = None
        if args.regions:
            regions = [tuple(r) for r in args.regions]

        result = remove_watermark_simple(args.input, args.output, regions)
        if result:
            print(f"\n✅ 处理完成: {result}")
        else:
            print("\n❌ 处理失败")
            sys.exit(1)


if __name__ == "__main__":
    main()
