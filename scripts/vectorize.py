#!/usr/bin/env python3
"""
位图转矢量图(SVG)脚本
支持 Vectorizer.AI API 和本地 potrace 两种方式
"""

import os
import sys
import json
import argparse
import subprocess
from pathlib import Path


def vectorize_with_api(input_path: str, output_path: str, api_key: str = None):
    """使用 Vectorizer.AI API 转换"""
    api_key = api_key or os.getenv("VECTORIZER_API_KEY")
    if not api_key:
        print("ERROR: 请设置 VECTORIZER_API_KEY 环境变量")
        return False

    url = "https://api.vectorizer.io/v1/vectorize"

    with open(input_path, "rb") as f:
        files = {"image": f}
        headers = {"Authorization": f"Bearer {api_key}"}
        data = {
            "output_format": "svg",
            "mode": "auto",
        }

        try:
            import requests
            response = requests.post(url, files=files, headers=headers, data=data, timeout=120)
            response.raise_for_status()

            with open(output_path, "wb") as out:
                out.write(response.content)

            print(f"  ✓ SVG已保存: {output_path}")
            return True

        except Exception as e:
            print(f"  ERROR: Vectorizer.AI API 调用失败: {e}")
            return False


def vectorize_with_potrace(input_path: str, output_path: str):
    """使用本地 potrace 转换（需安装 potrace）"""
    # potrace 只支持 BMP/PNM 格式输入，需要先转换
    bmp_path = str(input_path) + ".bmp"

    try:
        # 用 Python PIL 转为 BMP
        from PIL import Image
        img = Image.open(input_path)
        img = img.convert("L")  # 转灰度
        # 二值化
        threshold = 128
        img = img.point(lambda p: 255 if p > threshold else 0)
        img.save(bmp_path)

        # 调用 potrace
        result = subprocess.run(
            ["potrace", "-s", "-o", output_path, bmp_path],
            capture_output=True,
            text=True,
        )

        # 清理临时文件
        if os.path.exists(bmp_path):
            os.remove(bmp_path)

        if result.returncode == 0:
            print(f"  ✓ SVG已保存: {output_path}")
            return True
        else:
            print(f"  ERROR: potrace 失败: {result.stderr}")
            return False

    except ImportError:
        print("  ERROR: 需要安装 Pillow (pip install Pillow)")
        return False
    except FileNotFoundError:
        print("  ERROR: 需要安装 potrace (https://potrace.sourceforge.net/)")
        return False


def vectorize(input_path: str, output_path: str = None, method: str = "auto"):
    """
    将位图转为SVG矢量图

    Args:
        input_path: 输入图片路径
        output_path: 输出SVG路径（默认同名.svg）
        method: 转换方式 auto/api/potrace
    """
    input_path = Path(input_path)
    if not input_path.exists():
        print(f"ERROR: 文件不存在: {input_path}")
        return None

    if output_path is None:
        output_path = str(input_path.with_suffix(".svg"))

    print(f"矢量化: {input_path} → {output_path}")

    if method == "auto":
        # 优先尝试 API，回退到 potrace
        api_key = os.getenv("VECTORIZER_API_KEY")
        if api_key:
            if vectorize_with_api(str(input_path), output_path, api_key):
                return output_path
        if vectorize_with_potrace(str(input_path), output_path):
            return output_path
        print("ERROR: 所有矢量化方式均失败")
        return None

    elif method == "api":
        if vectorize_with_api(str(input_path), output_path):
            return output_path
        return None

    elif method == "potrace":
        if vectorize_with_potrace(str(input_path), output_path):
            return output_path
        return None

    else:
        print(f"ERROR: 未知方法 '{method}'")
        return None


def main():
    parser = argparse.ArgumentParser(description="位图转矢量图(SVG)工具")
    parser.add_argument("input", help="输入图片路径")
    parser.add_argument("--output", "-o", default=None, help="输出SVG路径")
    parser.add_argument(
        "--method", "-m",
        default="auto",
        choices=["auto", "api", "potrace"],
        help="转换方式",
    )

    args = parser.parse_args()
    result = vectorize(args.input, args.output, args.method)

    if result:
        print(f"\n✅ 矢量化完成: {result}")
    else:
        print("\n❌ 矢量化失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
