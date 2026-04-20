#!/usr/bin/env python3
"""
平面设计合规审查脚本
基于国内法律法规自动审查设计文案和物料
"""

import os
import sys
import json
import argparse
from datetime import datetime
from pathlib import Path


# ==================== 绝对化用语检测 ====================

ABSOLUTE_WORDS = [
    # 广告法§9禁用的绝对化用语
    "最", "最佳", "最好", "最优", "最强", "最大", "最小", "最高", "最低",
    "第一", "No.1", "NO.1", "首位", "冠军", "独家", "唯一",
    "顶级", "极品", "绝版", "万能",
    "独一无二", "绝无仅有", "空前绝后", "史无前例",
    "全网最低", "全国最好", "世界领先",
    "100%", "百分之百", "零风险", "包治",
    "国家级", "世界级",
]

# 部分绝对化用语的替代建议
ABSOLUTE_WORD_SUGGESTIONS = {
    "最": "优选/精选/品质之选",
    "最佳": "优选/优秀/卓越",
    "最好": "优质/优良",
    "第一": "领先/前列",
    "顶级": "高端/卓越",
    "极品": "精品/上乘",
    "独家": "特色/专属",
    "唯一": "独特/罕见",
    "100%": "显著/有效",
    "零风险": "低风险/安全可靠",
    "国家级": "行业认可/专业级",
    "世界级": "国际水准/一流",
}


# ==================== 外文/拼音检测 ====================

def detect_foreign_text(text: str) -> dict:
    """检测文案中的外文使用情况"""
    import re

    result = {
        "has_foreign": False,
        "foreign_only": False,
        "foreign_ratio": 0.0,
        "has_chinese": False,
        "foreign_segments": [],
    }

    # 检测中文字符
    chinese_chars = re.findall(r'[\u4e00-\u9fff]', text)
    result["has_chinese"] = len(chinese_chars) > 0

    # 检测英文字符
    english_segments = re.findall(r'[a-zA-Z][a-zA-Z\s\.]+', text)
    if english_segments:
        result["has_foreign"] = True
        result["foreign_segments"] = [s.strip() for s in english_segments if len(s.strip()) > 1]

    # 检测是否纯外文
    if result["has_foreign"] and not result["has_chinese"]:
        result["foreign_only"] = True

    # 外文占比
    total_chars = len(text.replace(" ", ""))
    foreign_chars = sum(len(s) for s in result["foreign_segments"])
    if total_chars > 0:
        result["foreign_ratio"] = foreign_chars / total_chars

    return result


def detect_pinyin_only(text: str) -> bool:
    """检测是否单独使用拼音（无对应中文）"""
    import re
    # 简单检测：全是小写字母且看起来像拼音
    pinyin_pattern = re.compile(r'^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$')
    return bool(pinyin_pattern.match(text.strip()))


# ==================== 商标符号检测 ====================

def detect_trademark_issues(text: str, is_registered: bool = None) -> list:
    """检测商标使用问题"""
    issues = []

    has_registered_mark = "®" in text or "（注册商标）" in text or "(注册商标)" in text
    has_tm_mark = "™" in text or "TM" in text.upper()

    if has_registered_mark and is_registered is False:
        issues.append({
            "level": "CRITICAL",
            "rule": "商标法§63",
            "message": "未注册商标不得标注®，构成冒充注册商标违法行为",
            "suggestion": "如未注册，请移除®标记，可使用™标记",
        })

    if is_registered and not has_registered_mark and not has_tm_mark:
        issues.append({
            "level": "INFO",
            "rule": "商标法§63",
            "message": "注册商标建议标注®标记",
            "suggestion": "在商标右上角添加®标记",
        })

    return issues


# ==================== 行业特殊审查 ====================

INDUSTRY_KEYWORDS = {
    "医疗": {
        "keywords": ["医疗", "医院", "诊所", "药品", "治疗", "手术", "诊断"],
        "rules": [
            "须标注医疗广告审查证明文号",
            "禁止保证治愈或隐含保证",
            "禁止利用患者/医生形象作推荐",
            "非药品不得宣传治疗功效",
        ],
    },
    "酒类": {
        "keywords": ["白酒", "啤酒", "红酒", "洋酒", "酒精", "酒庄"],
        "rules": [
            "不得诱导/劝饮",
            "不得出现饮酒动作",
            "不得明示/暗示消除紧张焦虑",
            "不得针对未成年人",
        ],
    },
    "教育": {
        "keywords": ["培训", "学校", "教育", "课程", "考试", "升学", "留学"],
        "rules": [
            "不得保证升学/通过考试",
            "不得暗示有考试命题人参与",
            "不得利用科研/学术机构名义",
        ],
    },
    "房产": {
        "keywords": ["楼盘", "房产", "别墅", "公寓", "住宅", "地产"],
        "rules": [
            "须标明建筑面积/套内面积",
            "不得以到达时间表示距离",
            "不得承诺升值/投资回报",
            "须标明预售许可证号",
        ],
    },
    "食品": {
        "keywords": ["食品", "保健品", "营养品", "保健食品"],
        "rules": [
            "不得宣传治疗功效",
            "保健食品须标明'不能代替药物'",
            "不得使用医疗机构/医生名义",
        ],
    },
    "烟草": {
        "keywords": ["香烟", "烟草", "烟"],
        "rules": [
            "禁止在大众媒体发布烟草广告",
            "禁止变相发布",
        ],
    },
}


def detect_industry(text: str) -> list:
    """检测文案所属行业"""
    detected = []
    for industry, config in INDUSTRY_KEYWORDS.items():
        for kw in config["keywords"]:
            if kw in text:
                detected.append(industry)
                break
    return detected


# ==================== 主审查函数 ====================

def compliance_check(
    text: str,
    design_type: str = "",
    is_outdoor: bool = False,
    is_registered_trademark: bool = None,
    has_chinese: bool = None,
    chinese_font_size: int = None,
    foreign_font_size: int = None,
) -> dict:
    """
    执行完整的合规审查

    Args:
        text: 待审查文案
        design_type: 设计类型（名片/海报/招牌等）
        is_outdoor: 是否为户外广告/招牌
        is_registered_trademark: 商标是否已注册
        has_chinese: 是否包含中文
        chinese_font_size: 中文字号(pt)
        foreign_font_size: 外文字号(pt)

    Returns:
        审查结果字典
    """
    results = {
        "text": text[:100] + "..." if len(text) > 100 else text,
        "design_type": design_type,
        "timestamp": datetime.now().isoformat(),
        "checks": [],
        "summary": {"pass": 0, "warning": 0, "fail": 0},
    }

    def add_check(item, status, rule, message, suggestion=""):
        results["checks"].append({
            "item": item,
            "status": status,  # PASS / WARNING / FAIL
            "rule": rule,
            "message": message,
            "suggestion": suggestion,
        })
        results["summary"][status.lower()] += 1

    # === 1. 绝对化用语检测 ===
    found_absolutes = []
    for word in ABSOLUTE_WORDS:
        if word in text:
            found_absolutes.append(word)

    if found_absolutes:
        suggestions = []
        for w in found_absolutes:
            sug = ABSOLUTE_WORD_SUGGESTIONS.get(w, "请替换为客观表述")
            suggestions.append(f"'{w}' → {sug}")

        add_check(
            "绝对化用语",
            "FAIL",
            "广告法§9(3)",
            f"发现禁用词: {', '.join(found_absolutes)}",
            "; ".join(suggestions),
        )
    else:
        add_check("绝对化用语", "PASS", "广告法§9(3)", "未发现绝对化用语")

    # === 2. 外文使用检测 ===
    foreign_result = detect_foreign_text(text)

    if foreign_result["foreign_only"]:
        add_check(
            "中文为主",
            "FAIL",
            "国家通用语言文字法§14",
            "文案中仅使用外文，缺少中文",
            "必须同时使用规范汉字",
        )
    elif foreign_result["has_foreign"]:
        if not foreign_result["has_chinese"]:
            add_check(
                "中文为主",
                "WARNING",
                "国家通用语言文字法§14",
                "外文内容缺少对应中文",
                "建议添加中文翻译或标注",
            )
        else:
            add_check("中文为主", "PASS", "国家通用语言文字法§14", "中外文同时使用")
    else:
        add_check("中文为主", "PASS", "国家通用语言文字法§14", "纯中文内容")

    # === 3. 字号比例检测（如提供）===
    if chinese_font_size and foreign_font_size:
        if chinese_font_size < foreign_font_size:
            add_check(
                "字号比例",
                "FAIL",
                "各地招牌规范",
                f"中文字号({chinese_font_size}pt) < 外文字号({foreign_font_size}pt)",
                "中文字号应 ≥ 外文字号",
            )
        elif chinese_font_size == foreign_font_size:
            add_check(
                "字号比例",
                "WARNING",
                "各地招牌规范",
                f"中文字号({chinese_font_size}pt) = 外文字号({foreign_font_size}pt)",
                "建议中文字号略大于外文字号，以体现中文为主",
            )
        else:
            add_check("字号比例", "PASS", "各地招牌规范", f"中文字号({chinese_font_size}pt) > 外文字号({foreign_font_size}pt)")

    # === 4. 拼音检测 ===
    if detect_pinyin_only(text):
        add_check(
            "拼音使用",
            "FAIL",
            "国家通用语言文字法§14",
            "单独使用拼音，缺少对应汉字",
            "拼音须与规范汉字同时使用",
        )
    else:
        add_check("拼音使用", "PASS", "国家通用语言文字法§14", "未单独使用拼音")

    # === 5. 商标检测 ===
    trademark_issues = detect_trademark_issues(text, is_registered_trademark)
    if trademark_issues:
        for issue in trademark_issues:
            add_check("商标使用", issue["level"], issue["rule"], issue["message"], issue["suggestion"])
    else:
        add_check("商标使用", "PASS", "商标法", "未发现商标使用问题")

    # === 6. 行业特殊审查 ===
    industries = detect_industry(text)
    if industries:
        for ind in industries:
            rules = INDUSTRY_KEYWORDS[ind]["rules"]
            add_check(
                f"行业规范({ind})",
                "WARNING",
                f"{ind}行业广告法规",
                f"涉及{ind}行业，需遵守以下规则: {'; '.join(rules)}",
                "请逐一核实以上行业规范",
            )
    else:
        add_check("行业规范", "PASS", "各行业法规", "未涉及特殊行业")

    # === 7. 户外招牌特殊要求 ===
    if is_outdoor or design_type in ["招牌", "灯箱", "道旗", "车身广告", "建筑围挡"]:
        add_check(
            "户外招牌规范",
            "WARNING",
            "CJJ/T 149-2021",
            "户外广告/招牌需遵守当地城管审批要求",
            "设计前确认当地审批规范，招牌高度≤店面层高1/3",
        )

    return results


def format_report(results: dict) -> str:
    """格式化审查报告"""
    lines = []
    lines.append("=" * 50)
    lines.append("📋 合规审查报告")
    lines.append("=" * 50)
    lines.append(f"物料类型: {results['design_type'] or '未指定'}")
    lines.append(f"审查时间: {results['timestamp']}")
    lines.append(f"审查文案: {results['text']}")
    lines.append("")

    status_icons = {"PASS": "✅", "WARNING": "⚠️", "FAIL": "❌"}

    for check in results["checks"]:
        icon = status_icons.get(check["status"], "❓")
        lines.append(f"{icon} {check['item']}")
        lines.append(f"   法规: {check['rule']}")
        lines.append(f"   说明: {check['message']}")
        if check["suggestion"]:
            lines.append(f"   建议: {check['suggestion']}")
        lines.append("")

    s = results["summary"]
    lines.append("-" * 50)
    lines.append(f"审查结果: ✅通过{s['pass']}项 | ⚠️警告{s['warning']}项 | ❌不合规{s['fail']}项")
    lines.append("-" * 50)

    if s["fail"] > 0:
        lines.append("⛔ 存在不合规项，必须修改后才能使用！")
    elif s["warning"] > 0:
        lines.append("⚠️ 存在警告项，建议修改以确保合规。")
    else:
        lines.append("✅ 全部通过，设计合规！")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="平面设计合规审查工具")
    parser.add_argument("text", help="待审查文案")
    parser.add_argument("--type", "-t", default="", help="设计类型")
    parser.add_argument("--outdoor", "-o", action="store_true", help="是否户外广告")
    parser.add_argument("--registered", "-r", action="store_true", help="商标已注册")
    parser.add_argument("--chinese-size", type=int, default=None, help="中文字号(pt)")
    parser.add_argument("--foreign-size", type=int, default=None, help="外文字号(pt)")
    parser.add_argument("--json", "-j", action="store_true", help="JSON格式输出")

    args = parser.parse_args()

    results = compliance_check(
        text=args.text,
        design_type=args.type,
        is_outdoor=args.outdoor,
        is_registered_trademark=args.registered if args.registered else None,
        chinese_font_size=args.chinese_size,
        foreign_font_size=args.foreign_size,
    )

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print(format_report(results))


if __name__ == "__main__":
    main()
