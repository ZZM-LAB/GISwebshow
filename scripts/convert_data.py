# -*- coding: utf-8 -*-
"""问题七 · 数据转换脚本：CSV + GPKG → GeoJSON (parks.json)
将问题1-6的研究成果合并为前端可用的公园数据。
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

OUTPUT_DIR = os.path.join(BASE, "src", "data")
OUTPUT_JSON = os.path.join(OUTPUT_DIR, "parks.json")

# 季节标签（基于问题3结论：春夏降水多水位高，秋冬降水少宜观鸟）
def get_season_tag(wtype, hai):
    """根据湿地类型和HAI生成季节标签"""
    if wtype == "湖泊型":
        return "春秋最佳"
    elif wtype == "河流型":
        return "四季皆宜"
    else:  # 复合型
        return "春秋最佳"


def main():
    print("=" * 60)
    print("数据转换：GPKG + CSV → GeoJSON")
    print("=" * 60)

    # 1. 读取公园点位（WGS84坐标）
    print("[1] 读取公园GPKG...")
    parks_gdf = gpd.read_file(PARKS_GPKG)
    # GPKG原始可能是CGCS2000，与WGS84差异极小，直接使用
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

    # 5. 构建公园属性字典
    print("\n[5] 合并数据并构建GeoJSON...")

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
    topsis_map = {}
    for _, row in topsis_df.iterrows():
        topsis_map[row["name"]] = row

    # 构建HAI字典
    hai_map = {}
    for _, row in hai_df.iterrows():
        hai_map[row["名称"]] = row

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

        wtype = row.get("湿地类型", t.get("湿地类型", "未知"))
        hai_val = h.get("HAI", 0)
        hai_level = h.get("HAI等级", "未知")
        season = get_season_tag(wtype, hai_val)

        # 构建偏科信息
        bias_list = bias_map.get(name, [])

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
            }
        }
        features.append(feature)

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    # 6. 输出
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)

    print(f"\n[6] 输出完成: {OUTPUT_JSON}")
    print(f"  公园数: {len(features)}")
    print(f"  文件大小: {os.path.getsize(OUTPUT_JSON) / 1024:.1f} KB")

    # 验证：打印前3个
    print("\n[验证] 前3个公园:")
    for f in features[:3]:
        p = f["properties"]
        print(f"  #{p['topsis_rank']} {p['name']} ({p['type']}, {p['city']}, "
              f"C={p['topsis_score']}, HAI={p['hai']})")
        print(f"    坐标: {f['geometry']['coordinates']}")
        print(f"    偏科: {p['bias']}")

    print("\n✅ 数据转换完成")


if __name__ == "__main__":
    main()
