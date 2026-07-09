# -*- coding: utf-8 -*-
"""问题七 · 重新获取GCJ-02坐标并更新parks.json
用高德POI搜索API重新查询70个湿地公园的准确坐标（GCJ-02），
直接更新parks.json中的geometry.coordinates，确保与高德瓦片完美对齐。
"""
import os
import json
import time
import requests

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARKS_JSON = os.path.join(BASE, "src", "data", "parks.json")
AMAP_KEY = "76087f87bab6727c2637eba3e5d681c6"

# 难以直接搜索的公园，使用特定关键词
PARK_KEYWORDS = {
    "茶陵东阳湖国家湿地公园": ["洮水水库", "东阳湖"],
    "麻阳锦江国家湿地公园": ["黄土溪水库", "锦江"],
    "靖州五龙潭国家湿地公园": ["水酿塘电站", "五龙潭"],
    "平江黄金河国家湿地公园": ["黄金洞", "黄金河"],
}


def geocode_poi(name, city, api_key, session, types=None):
    """高德POI搜索"""
    url = "https://restapi.amap.com/v3/place/text"
    params = {
        "key": api_key,
        "keywords": name,
        "city": city,
        "output": "json",
        "offset": 10,
    }
    if types:
        params["types"] = types
    try:
        resp = session.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") == "1" and int(data.get("count", 0)) > 0:
            for poi in data["pois"]:
                poi_name = poi.get("name", "")
                if "湿地" in poi_name or "公园" in poi_name or "湖" in poi_name:
                    loc = poi["location"].split(",")
                    return float(loc[0]), float(loc[1]), poi_name  # [lng, lat] GCJ-02
            poi = data["pois"][0]
            loc = poi["location"].split(",")
            return float(loc[0]), float(loc[1]), poi.get("name", "")
    except:
        pass
    return None, None, ""


def geocode_geo(address, city, api_key, session):
    """高德地理编码"""
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {
        "key": api_key,
        "address": address,
        "city": city,
        "output": "json",
    }
    try:
        resp = session.get(url, params=params, timeout=10)
        data = resp.json()
        if data.get("status") == "1" and int(data.get("count", 0)) > 0:
            loc = data["geocodes"][0]["location"].split(",")
            return float(loc[0]), float(loc[1])  # [lng, lat] GCJ-02
    except:
        pass
    return None, None


def main():
    print("=" * 60)
    print("重新获取GCJ-02坐标 → 更新parks.json")
    print("=" * 60)

    # 读取现有parks.json
    with open(PARKS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data["features"]
    total = len(features)
    updated = 0
    failed = []

    session = requests.Session()

    for i, feature in enumerate(features, 1):
        props = feature["properties"]
        name = props["name"]
        city = props["city"]
        old_coords = feature["geometry"]["coordinates"]

        print(f"[{i:2d}/{total}] {name} ... ", end="", flush=True)

        lng, lat = None, None
        poi_name = ""

        # 查询策略
        strategies = []

        # 特定关键词优先
        if name in PARK_KEYWORDS:
            for kw in PARK_KEYWORDS[name]:
                strategies.append((
                    f"关键词:{kw}",
                    lambda k=kw: geocode_poi(k, props.get("county", city), AMAP_KEY, session)
                ))

        county = props.get("county", "")

        strategies.extend([
            ("县名+全名", lambda: geocode_poi(name, county, AMAP_KEY, session)),
            ("市名+全名", lambda: geocode_poi(name, city, AMAP_KEY, session)),
            ("县名+简化名", lambda: geocode_poi(
                name.replace("国家湿地公园", ""), county, AMAP_KEY, session)),
            ("市名+简化名", lambda: geocode_poi(
                name.replace("国家湿地公园", ""), city, AMAP_KEY, session)),
            ("省名+全名", lambda: geocode_poi(name, "湖南省", AMAP_KEY, session)),
            ("地理编码", lambda: (*geocode_geo(f"湖南省{city}{name}", city, AMAP_KEY, session), "")),
            ("POI类型限定", lambda: geocode_poi(name, city, AMAP_KEY, session, types="110100")),
        ])

        for strategy_name, strategy_func in strategies:
            result = strategy_func()
            lng, lat = result[0], result[1]
            if lng is not None:
                break

        if lng is not None and lat is not None:
            feature["geometry"]["coordinates"] = [lng, lat]
            updated += 1
            print(f"✓ ({lat:.6f}, {lng:.6f})")
        else:
            print(f"✗ 保持原坐标 ({old_coords[1]:.6f}, {old_coords[0]:.6f})")
            failed.append(name)

        time.sleep(0.15)

    # 保存
    with open(PARKS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\n{'=' * 60}")
    print(f"完成! 更新 {updated}/{total} 个公园坐标")
    if failed:
        print(f"失败 {len(failed)} 个（保持原坐标）:")
        for name in failed:
            print(f"  - {name}")
    print(f"\nparks.json 已更新: {PARKS_JSON}")


if __name__ == "__main__":
    main()
