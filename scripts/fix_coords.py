# -*- coding: utf-8 -*-
"""修复几个错误坐标"""
import requests
import json

KEY = "76087f87bab6727c2637eba3e5d681c6"

queries = [
    ("南洲国家湿地公园", "南县", "益阳市"),
    ("新墙河", "岳阳县", "岳阳市"),
    ("白泥湖", "云溪区", "岳阳市"),
    ("南洲湿地", "益阳", "湖南省"),
]

for name, city, parent in queries:
    url = "https://restapi.amap.com/v3/place/text"
    params = {"key": KEY, "keywords": name, "city": city, "output": "json", "offset": 5}
    r = requests.get(url, params=params, timeout=10).json()
    print(f"--- {name} (city={city}) ---")
    if r.get("pois"):
        for p in r["pois"][:3]:
            pname = p["name"]
            loc = p["location"]
            addr = p.get("address", "")
            print(f"  {pname} | {loc} | {addr}")
    else:
        print("  无结果")
