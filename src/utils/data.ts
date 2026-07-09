/** 数据加载：读取parks.json并转换为前端可用格式（WGS84→GCJ-02） */
import type { ParkCollection, ParkFeature, ParkProperties } from "./types";
import { wgs84ToGcj02 } from "./coordTransform";

import parksData from "@/data/parks.json";

const collection = parksData as ParkCollection;

/** 所有公园列表（properties + coords，坐标已转为GCJ-02适配高德瓦片） */
export const parks: Array<{ properties: ParkProperties; coords: [number, number] }> =
  collection.features.map((f: ParkFeature) => {
    const [lng, lat] = wgs84ToGcj02(f.geometry.coordinates[0], f.geometry.coordinates[1]);
    return {
      properties: f.properties,
      coords: [lng, lat] as [number, number],
    };
  });

/** 按排名排序的公园 */
export const parksByRank = [...parks].sort(
  (a, b) => a.properties.topsis_rank - b.properties.topsis_rank
);

/** 所有市州列表 */
export const cities = [...new Set(parks.map((p) => p.properties.city))].sort();

/** 所有湿地类型 */
export const parkTypes = [...new Set(parks.map((p) => p.properties.type))].sort();

/** 湖南省中心坐标（用于地图初始视角） */
export const HUNAN_CENTER: [number, number] = [27.5, 111.0];

/** 地图初始缩放 */
export const INITIAL_ZOOM = 7;

/** 按名称查找公园 */
export function findParkByName(name: string) {
  return parks.find((p) => p.properties.name === name);
}
