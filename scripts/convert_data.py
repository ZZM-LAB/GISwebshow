# -*- coding: utf-8 -*-
"""问题七 · 数据转换脚本：CSV + GPKG → GeoJSON (parks.json) + 公平性看板JSON + 候选区GeoJSON
将问题1-6的研究成果合并为前端可用的公园数据，并输出：
  1. parks.json        - 70公园GeoJSON（含水文/HAI/短板诊断新字段）
  2. candidates.json   - 建园候选区GeoJSON（WGS84，供地图图层使用）
  3. equity.json       - 14市州公平性看板数据
"""
import os
import json
import numpy as np
import pandas as pd
import geopandas as gpd

# 路径配置
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.dirname(BASE)

PARKS_GPKG = os.path.join(WORK, "问题一", "湿地公园点位.gpkg")
TOPSIS_CSV = os.path.join(WORK, "问题六", "output", "TOPSIS排名表.csv")
HAI_CSV = os.path.join(WORK, "问题四", "output", "HAI干扰指数排序表.csv")
BIAS_CSV = os.path.join(WORK, "问题六", "output", "偏科公园清单.csv")
HYDRO_CSV = os.path.join(WORK, "问题三", "output", "park_hydro_score.csv")
CANDIDATES_GPKG = os.path.join(WORK, "问题五", "output", "建园候选区.gpkg")
EQUITY_CSV = os.path.join(WORK, "问题五", "output", "市州公平性对比表.csv")

OUTPUT_DIR = os.path.join(BASE, "src", "data")
OUTPUT_JSON = os.path.join(OUTPUT_DIR, "parks.json")
OUTPUT_CANDIDATES = os.path.join(OUTPUT_DIR, "candidates.json")
OUTPUT_EQUITY = os.path.join(OUTPUT_DIR, "equity.json")

# 14市州列表（用于过滤公平性表中的区县行）
PREFECTURE_CITIES = {
    "长沙市", "株洲市", "湘潭市", "衡阳市", "邵阳市", "岳阳市", "常德市",
    "张家界市", "益阳市", "郴州市", "永州市", "怀化市", "娄底市",
    "湘西土家族苗族自治州",
}

# 七维标签映射：用于短板诊断改善建议生成
DIM_TO_LABEL = {
    "可达性": "A1", "游憩设施": "A2", "生态体验": "A3",
    "科普教育": "A4", "景观美学": "A5", "公众热度": "A6", "安全便利": "A7",
}
LABEL_TO_DIM = {v: k for k, v in DIM_TO_LABEL.items()}

# 改善建议模板（按维度）
IMPROVEMENT_TEMPLATES = {
    "可达性": "建议增开旅游公交专线/接驳班车，优化主干道至公园最后一公里衔接",
    "游憩设施": "建议增设观景平台、栈道与休憩驿站，完善亲子游乐与无障碍设施",
    "生态体验": "建议划定核心保育区与生态步道，增设掩体式观鸟廊与生境体验点",
    "科普教育": "建议建设湿地科普馆与解说牌系统，开展研学课程与志愿者讲解",
    "景观美学": "建议优化季相植物配置与夜景照明，塑造标志性与多层次视廊",
    "公众热度": "建议加强新媒体营销与节事活动策划，联合OTA打造网红打卡点",
    "安全便利": "建议完善安防监控、医疗点与应急避险设施，配齐停车与导览系统",
}


def get_season_tag(wtype, hai):
    """根据湿地类型和HAI生成季节标签"""
    if wtype == "湖泊型":
        return "春秋最佳"
    elif wtype == "河流型":
        return "四季皆宜"
    else:  # 复合型
        return "春秋最佳"


def build_weakest_dim(topsis_row, bias_list_for_park):
    """从TOPSIS归一化值中找出最弱维度（值最小者），并结合偏科清单中"弱"方向做诊断。
    返回 (weakest_dim_label, z_score_or_None, improvement_suggestion)
    """
    dim_cols = [
        ("可达性", "A1_可达性_norm"),
        ("游憩设施", "A2_游憩_norm"),
        ("生态体验", "A3_生态_norm"),
        ("科普教育", "A4_科教_norm"),
        ("景观美学", "A5_景观_norm"),
        ("公众热度", "A6_热度_norm"),
        ("安全便利", "A7_安全_norm"),
    ]
    # 找到归一化值最小的维度
    dim_values = [(label, float(topsis_row[col])) for label, col in dim_cols]
    dim_values.sort(key=lambda x: x[1])
    weakest_label, weakest_val = dim_values[0]

    # 查找偏科清单中是否对应该维度的"弱"方向z-score
    z_score = None
    for b in bias_list_for_park:
        # bias格式为 "维度偏方向(z=xx)"
        for label in DIM_TO_LABEL:
            if b.startswith(label) and "偏弱" in b:
                try:
                    z_str = b.split("z=")[1].rstrip(")")
                    z_score = float(z_str)
                except (IndexError, ValueError):
                    pass
                break

    suggestion = IMPROVEMENT_TEMPLATES.get(weakest_label, "建议针对性提升短板维度")
    return weakest_label, z_score, suggestion


def main():
    print("=" * 60)
    print("数据转换：GPKG + CSV → GeoJSON + 公平性看板JSON")
    print("=" * 60)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. 读取公园点位（WGS84坐标）
    print("\n[1] 读取公园GPKG...")
    parks_gdf = gpd.read_file(PARKS_GPKG)
    if parks_gdf.crs and parks_gdf.crs != "EPSG:4326":
        parks_gdf = parks_gdf.to_crs("EPSG:4326")
    print(f"  公园数: {len(parks_gdf)}")
    print(f"  列名: {list(parks_gdf.columns)}")

    # 2. 读取TOPSIS排名表
    print("\n[2] 读取TOPSIS排名表...")
    topsis_df = pd.read_csv(TOPSIS_CSV)
    print(f"  记录数: {len(topsis_df)}")

    # 3. 读取HAI排序表
    print("\n[3] 读取HAI排序表...")
    hai_df = pd.read_csv(HAI_CSV)
    print(f"  记录数: {len(hai_df)}")

    # 4. 读取偏科清单
    print("\n[4] 读取偏科清单...")
    bias_df = pd.read_csv(BIAS_CSV)
    print(f"  偏科记录: {len(bias_df)}")

    # 5. 读取水文适宜性评分
    print("\n[5] 读取水文适宜性评分...")
    hydro_df = pd.read_csv(HYDRO_CSV)
    print(f"  记录数: {len(hydro_df)}")

    # 6. 构建公园属性字典
    print("\n[6] 合并数据并构建GeoJSON...")

    # 预处理偏科：按公园名分组
    bias_map = {}
    for _, row in bias_df.iterrows():
        name = row["name"]
        dim = row["维度"]
        z = row["z_score"]
        direction = row["方向"]
        if name not in bias_map:
            bias_map[name] = []
        bias_map[name].append(f"{dim}偏{direction}(z={z:.2f})")

    # 构建TOPSIS字典（按name索引）
    topsis_map = {row["name"]: row for _, row in topsis_df.iterrows()}

    # 构建HAI字典
    hai_map = {row["名称"]: row for _, row in hai_df.iterrows()}

    # 构建水文字典
    hydro_map = {row["park_name"]: row for _, row in hydro_df.iterrows()}

    # 按水文score排名生成hydro_rank
    hydro_sorted = hydro_df.sort_values("score", ascending=False).reset_index(drop=True)
    hydro_rank_map = {row["park_name"]: i + 1 for i, row in hydro_sorted.iterrows()}

    # 构建GeoJSON FeatureCollection
    features = []
    name_col = "名称" if "名称" in parks_gdf.columns else "name"

    for _, row in parks_gdf.iterrows():
        name = row[name_col]
        geom = row.geometry

        if geom is None or name not in topsis_map:
            print(f"  ⚠️ 跳过: {name} (无几何或无TOPSIS数据)")
            continue

        t = topsis_map[name]
        h = hai_map.get(name, {})
        hy = hydro_map.get(name, {})

        wtype = row.get("湿地类型", t.get("湿地类型", "未知"))
        hai_val = h.get("HAI", 0)
        hai_level = h.get("HAI等级", "未知")
        season = get_season_tag(wtype, hai_val)

        # 偏科信息
        bias_list = bias_map.get(name, [])

        # 短板诊断
        weakest_dim, weakest_z, suggestion = build_weakest_dim(t, bias_list)

        # 水文适宜性
        hydro_score = float(hy.get("score", 0)) if len(hy) else 0.0
        trend_type = str(hy.get("trend_type", "未知")) if len(hy) else "未知"
        change_pct = float(hy.get("change_pct", 0)) if len(hy) else 0.0
        risk_level = str(hy.get("risk_level", "未知")) if len(hy) else "未知"
        hydro_rank = hydro_rank_map.get(name, 0)

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [round(geom.x, 6), round(geom.y, 6)]
            },
            "properties": {
                "name": name,
                "type": wtype,
                "area_ha": float(row.get("总面积_公顷", t.get("总面积_公顷", 0))),
                "city": row.get("市州", t.get("市州", "未知")),
                "year": int(row.get("批复年份", t.get("批复年份", 0))),
                "topsis_rank": int(t["排名"]),
                "topsis_score": round(float(t["TOPSIS得分"]), 4),
                "hai": round(float(hai_val), 4),
                "hai_level": hai_level,
                "season": season,
                "dims": {
                    "A1": round(float(t["A1_可达性_norm"]), 4),
                    "A2": round(float(t["A2_游憩_norm"]), 4),
                    "A3": round(float(t["A3_生态_norm"]), 4),
                    "A4": round(float(t["A4_科教_norm"]), 4),
                    "A5": round(float(t["A5_景观_norm"]), 4),
                    "A6": round(float(t["A6_热度_norm"]), 4),
                    "A7": round(float(t["A7_安全_norm"]), 4),
                },
                "bias": bias_list,
                # 新增：水文适宜性（问题三）
                "hydro_score": round(hydro_score, 4),
                "hydro_rank": int(hydro_rank),
                "trend_type": trend_type,
                "change_pct": round(change_pct, 2),
                "risk_level": risk_level,
                # 新增：短板诊断（问题六）
                "weakest_dim": weakest_dim,
                "weakest_z": round(weakest_z, 2) if weakest_z is not None else None,
                "improvement_suggestion": suggestion,
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    # 7. 输出parks.json
    def clean_nans(obj):
        """递归将NaN/Infinity替换为None（JSON null），避免TS1328错误"""
        if isinstance(obj, dict):
            return {k: clean_nans(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [clean_nans(v) for v in obj]
        if isinstance(obj, float):
            if np.isnan(obj) or np.isinf(obj):
                return None
        return obj

    geojson = clean_nans(geojson)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2, allow_nan=False)
    print(f"\n[7] parks.json输出: {OUTPUT_JSON}")
    print(f"  公园数: {len(features)}")
    print(f"  文件大小: {os.path.getsize(OUTPUT_JSON) / 1024:.1f} KB")

    # 8. 转换建园候选区GPKG为GeoJSON
    print("\n[8] 转换建园候选区GPKG...")
    if os.path.exists(CANDIDATES_GPKG):
        cand_gdf = gpd.read_file(CANDIDATES_GPKG)
        if cand_gdf.crs and cand_gdf.crs != "EPSG:4326":
            cand_gdf = cand_gdf.to_crs("EPSG:4326")
        # 仅保留必要字段以减小文件体积
        keep_cols = ["geometry"]
        for c in cand_gdf.columns:
            if c != "geometry" and c in {"area_km2", "score", "priority", "name", "fid", "id"}:
                keep_cols.append(c)
        cand_gdf = cand_gdf[keep_cols].copy()
        # 将area字段统一为area_km2（若无则计算）
        if "area_km2" not in cand_gdf.columns:
            cand_proj = cand_gdf.to_crs("EPSG:32649")
            cand_gdf["area_km2"] = (cand_proj.geometry.area / 1e6).round(3)
        cand_geojson = json.loads(cand_gdf.to_json())
        with open(OUTPUT_CANDIDATES, "w", encoding="utf-8") as f:
            json.dump(cand_geojson, f, ensure_ascii=False, indent=2)
        print(f"  候选区数量: {len(cand_gdf)}")
        print(f"  文件: {OUTPUT_CANDIDATES}")
        print(f"  大小: {os.path.getsize(OUTPUT_CANDIDATES) / 1024:.1f} KB")
    else:
        print(f"  ⚠️ 未找到建园候选区GPKG: {CANDIDATES_GPKG}")

    # 9. 生成14市州公平性看板JSON
    print("\n[9] 生成市州公平性看板JSON...")
    if os.path.exists(EQUITY_CSV):
        eq_df = pd.read_csv(EQUITY_CSV)
        # 仅保留14市州
        eq_df = eq_df[eq_df["name"].isin(PREFECTURE_CITIES)].copy()
        eq_df = eq_df.sort_values("人均可达性(1/km)", ascending=False).reset_index(drop=True)

        # 按人均可达性排名
        eq_df["access_rank"] = np.arange(1, len(eq_df) + 1)

        equity_data = {
            "cities": [
                {
                    "name": row["name"],
                    "population": int(row["总人口"]) if pd.notna(row["总人口"]) else 0,
                    "mean_distance_km": round(float(row["平均距公园_km"]), 2),
                    "median_distance_km": round(float(row["中位距公园_km"]), 2),
                    "max_distance_km": round(float(row["最大距公园_km"]), 2),
                    "blind_ratio": round(float(row["盲区人口比例"]), 4) if pd.notna(row["盲区人口比例"]) else 0.0,
                    "blind_population": int(row["盲区人口"]) if pd.notna(row["盲区人口"]) else 0,
                    "access_per_km": round(float(row["人均可达性(1/km)"]), 4),
                    "access_rank": int(row["access_rank"]),
                }
                for _, row in eq_df.iterrows()
            ],
            "summary": {
                "total_parks": len(features),
                "total_blind_population": int(eq_df["盲区人口"].fillna(0).sum()),
                "avg_blind_ratio": round(float(eq_df["盲区人口比例"].fillna(0).mean()), 4),
                "avg_access": round(float(eq_df["人均可达性(1/km)"].mean()), 4),
                "best_city": eq_df.iloc[0]["name"],
                "worst_city": eq_df.iloc[-1]["name"],
            }
        }

        with open(OUTPUT_EQUITY, "w", encoding="utf-8") as f:
            json.dump(equity_data, f, ensure_ascii=False, indent=2)
        print(f"  市州数: {len(eq_df)}")
        print(f"  文件: {OUTPUT_EQUITY}")
        print(f"  大小: {os.path.getsize(OUTPUT_EQUITY) / 1024:.1f} KB")
    else:
        print(f"  ⚠️ 未找到公平性对比表: {EQUITY_CSV}")

    # 验证：打印前3个
    print("\n[验证] 前3个公园:")
    for f in features[:3]:
        p = f["properties"]
        print(f"  #{p['topsis_rank']} {p['name']} ({p['type']}, {p['city']}, "
              f"C={p['topsis_score']}, HAI={p['hai']}, Hydro={p['hydro_score']})")
        print(f"    短板: {p['weakest_dim']} (z={p['weakest_z']})")
        print(f"    建议: {p['improvement_suggestion']}")

    print("\n✅ 数据转换完成")


if __name__ == "__main__":
    main()
