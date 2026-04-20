#!/usr/bin/env python3
"""
豆包即梦(Seedream) AI 生图脚本
支持文生图和图生图，兼容火山引擎官方API和DMXAPI代理
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime
from pathlib import Path


# ==================== 配置 ====================

# API端点
# 火山引擎方舟（官方推荐，支持 Seedream 5.0）
ARK_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations"
# DMXAPI 代理（备选）
DMXAPI_URL = "https://www.dmxapi.cn/v1/images/generations"

# 模型映射
MODELS = {
    "5.0": "doubao-seedream-5-0-260128",     # Seedream 5.0（推荐，最新最强）
    "4.5": "doubao-seedream-4-5-251128",      # Seedream 4.5
    "4.0": "doubao-seedream-4.0",             # Seedream 4.0
}

# 设计尺寸映射
# Seedream 5.0 最小像素数: 3,686,400 (≈1920x1920)
# 支持 "2K" 等简写，API 会自动解析
DESIGN_SIZES = {
    "名片": "1920x1920",
    "A4海报": "1920x1920",
    "A3海报": "2048x2048",
    "横版海报": "2560x1440",
    "竖版海报": "1440x2560",
    "招牌": "3024x1296",
    "正方形": "2048x2048",
    "易拉宝": "1440x2560",
    "折页": "2496x1664",
    "灯箱": "2560x1440",
    "道旗": "1440x2560",
    "车身广告": "3024x1296",
    "手提袋": "1920x1920",
    "微信头图": "2560x1440",
    "小红书": "1920x1920",
    "朋友圈海报": "1440x2560",
    "Logo": "2048x2048",
    # 简写
    "2K": "2K",
    "4K": "4K",
}

# 默认质量关键词
QUALITY_KEYWORDS = "professional graphic design, high resolution, clean layout, print-ready, sharp details, meticulously crafted, master-level execution"


def get_api_config():
    """获取API配置，优先使用火山引擎方舟"""
    ark_key = os.getenv("ARK_API_KEY")
    dmx_key = os.getenv("DMX_API_KEY")

    if ark_key:
        return {
            "url": ARK_URL,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ark_key}",
            },
            "provider": "ark",
        }
    elif dmx_key:
        return {
            "url": DMXAPI_URL,
            "headers": {
                "Content-Type": "application/json",
                "Authorization": f"{dmx_key}",
            },
            "provider": "dmxapi",
        }
    else:
        print("ERROR: 请设置 ARK_API_KEY 或 DMX_API_KEY 环境变量")
        sys.exit(1)


def build_prompt(user_prompt: str, design_type: str = "", style: str = "") -> str:
    """构建完整的生图prompt"""
    parts = []

    if design_type:
        parts.append(design_type)
    if style:
        parts.append(style)
    parts.append(user_prompt)
    parts.append(QUALITY_KEYWORDS)

    full_prompt = ", ".join(parts)

    # 截断至300汉字以内
    if len(full_prompt) > 300:
        full_prompt = full_prompt[:297] + "..."

    return full_prompt


def resolve_size(size_input: str) -> str:
    """解析尺寸输入，支持设计类型名称、2K/4K简写和直接像素值"""
    if size_input in DESIGN_SIZES:
        return DESIGN_SIZES[size_input]

    # 支持 "2K" / "4K" 等简写直接传给 API
    if size_input.upper() in ("2K", "4K"):
        return size_input.upper()

    # 验证直接像素值格式
    if "x" in size_input.lower():
        w, h = size_input.lower().split("x")
        try:
            w_px, h_px = int(w), int(h)
            total = w_px * h_px
            if total < 3686400:
                # Seedream 5.0 要求最小 3,686,400 像素
                # 自动向上取整到最近合规尺寸
                import math
                ratio = h_px / w_px if w_px > 0 else 1
                min_side = math.ceil(math.sqrt(3686400 / ratio)) if ratio > 0 else 1920
                other_side = math.ceil(min_side * ratio)
                new_size = f"{min_side}x{other_side}"
                print(f"WARNING: 总像素 {total} 低于最低要求 3,686,400，自动调整为 {new_size}")
                return new_size
            return f"{w_px}x{h_px}"
        except ValueError:
            pass

    print(f"WARNING: 未知尺寸 '{size_input}'，使用默认 1920x1920")
    return "1920x1920"


def generate_image(
    prompt: str,
    design_type: str = "",
    style: str = "",
    size: str = "2048x2048",
    model: str = "5.0",
    count: int = 1,
    output_dir: str = "./output",
    reference_image: str = None,
    response_format: str = "url",
    watermark: bool = False,
):
    """调用豆包即梦API生成图像"""

    config = get_api_config()
    resolved_size = resolve_size(size)
    full_prompt = build_prompt(prompt, design_type, style)
    model_id = MODELS.get(model, MODELS["5.0"])

    # 构造请求体
    data = {
        "model": model_id,
        "prompt": full_prompt,
        "size": resolved_size,
        "sequential_image_generation": "disabled",
        "stream": False,
        "response_format": response_format,
        "watermark": watermark,
    }

    # 图生图模式
    if reference_image:
        data["image"] = reference_image

    print(f"\n{'='*60}")
    print(f"AI 生图请求")
    print(f"{'='*60}")
    print(f"  模型: {model_id}")
    print(f"  尺寸: {resolved_size}")
    print(f"  Prompt: {full_prompt[:100]}...")
    print(f"  参考图: {'有' if reference_image else '无'}")
    print(f"  水印: {'开启' if watermark else '关闭'}")
    print(f"{'='*60}\n")

    try:
        response = requests.post(
            config["url"],
            headers=config["headers"],
            json=data,
            timeout=120,
        )
        response.raise_for_status()
        result = response.json()

    except requests.exceptions.Timeout:
        print("ERROR: 请求超时（120秒），请稍后重试")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("ERROR: 网络连接失败，请检查网络")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"ERROR: HTTP {e.response.status_code}")
        try:
            error_detail = e.response.json()
            print(f"  详情: {json.dumps(error_detail, ensure_ascii=False, indent=2)}")
        except Exception:
            print(f"  响应: {e.response.text}")
        sys.exit(1)

    # 处理结果
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    saved_files = []

    if "data" in result:
        for i, item in enumerate(result["data"]):
            if response_format == "url" and "url" in item:
                # 下载图片
                img_url = item["url"]
                filename = f"{design_type or 'design'}_{timestamp}_{i+1}.png"
                filepath = output_path / filename

                print(f"  下载图片 {i+1}/{len(result['data'])}...")
                img_response = requests.get(img_url, timeout=60)
                img_response.raise_for_status()

                with open(filepath, "wb") as f:
                    f.write(img_response.content)

                saved_files.append(str(filepath))
                print(f"  ✓ 已保存: {filepath}")

            elif response_format == "b64_json" and "b64_json" in item:
                import base64

                filename = f"{design_type or 'design'}_{timestamp}_{i+1}.png"
                filepath = output_path / filename

                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(item["b64_json"]))

                saved_files.append(str(filepath))
                print(f"  ✓ 已保存: {filepath}")

    # 输出元信息
    if "usage" in result:
        print(f"\n  Token消耗: {result['usage'].get('total_tokens', 'N/A')}")

    print(f"\n共生成 {len(saved_files)} 张图片")

    # 返回结果JSON
    output = {
        "success": True,
        "files": saved_files,
        "model": model_id,
        "size": resolved_size,
        "prompt": full_prompt,
        "timestamp": timestamp,
    }

    meta_file = output_path / f"meta_{timestamp}.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    return output


def main():
    parser = argparse.ArgumentParser(description="豆包即梦(Seedream) AI 生图工具")
    parser.add_argument("prompt", help="图像描述（中文/英文）")
    parser.add_argument("--type", "-t", default="", help="设计类型（如：名片、海报、招牌）")
    parser.add_argument("--style", "-s", default="", help="风格描述（如：极简、国潮、科技感）")
    parser.add_argument("--size", "-z", default="2048x2048", help="尺寸（像素或设计类型名）")
    parser.add_argument("--model", "-m", default="5.0", choices=["5.0", "4.5", "4.0"], help="模型版本")
    parser.add_argument("--count", "-n", type=int, default=1, help="生成数量")
    parser.add_argument("--output", "-o", default="./output", help="输出目录")
    parser.add_argument("--reference", "-r", default=None, help="参考图URL（图生图模式）")
    parser.add_argument("--format", "-f", default="url", choices=["url", "b64_json"], help="响应格式")
    parser.add_argument("--watermark", "-w", action="store_true", help="添加水印（服务端可能忽略）")

    args = parser.parse_args()

    result = generate_image(
        prompt=args.prompt,
        design_type=args.type,
        style=args.style,
        size=args.size,
        model=args.model,
        count=args.count,
        output_dir=args.output,
        reference_image=args.reference,
        response_format=args.format,
        watermark=args.watermark,
    )

    print(f"\n✅ 完成！结果已保存至: {args.output}")


if __name__ == "__main__":
    main()
