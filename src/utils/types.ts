/** 公园属性类型定义 */

export interface ParkDims {
  A1: number; // 可达性
  A2: number; // 游憩设施
  A3: number; // 生态体验
  A4: number; // 科普教育
  A5: number; // 景观美学
  A6: number; // 公众热度
  A7: number; // 安全便利
}

export interface ParkProperties {
  name: string;
  type: string; // 河流型/湖泊型/复合型
  area_ha: number;
  city: string;
  year: number;
  topsis_rank: number;
  topsis_score: number;
  hai: number;
  hai_level: string;
  season: string;
  dims: ParkDims;
  bias: string[];
  // 新增：水文适宜性（问题三）
  hydro_score: number;
  hydro_rank: number;
  trend_type: string;
  change_pct: number;
  risk_level: string;
  // 新增：短板诊断（问题六）
  weakest_dim: string;
  weakest_z: number | null;
  improvement_suggestion: string;
}

export interface ParkFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: ParkProperties;
}

export interface ParkCollection {
  type: "FeatureCollection";
  features: ParkFeature[];
}

/** 七维标签 */
export const DIM_LABELS = [
  "可达性",
  "游憩设施",
  "生态体验",
  "科普教育",
  "景观美学",
  "公众热度",
  "安全便利",
] as const;

/** 七维key顺序 */
export const DIM_KEYS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7"] as const;

/** 预设场景 */
export interface Scenario {
  key: string;
  label: string;
  icon: string;
  weights: number[]; // 7个权重，对应A1-A7
  desc: string;
}

export const SCENARIOS: Scenario[] = [
  {
    key: "family",
    label: "亲子出游",
    icon: "baby",
    weights: [0.30, 0.25, 0.15, 0.15, 0.05, 0.05, 0.05],
    desc: "可达性优先，游憩设施次之",
  },
  {
    key: "birding",
    label: "观鸟摄影",
    icon: "bird",
    weights: [0.05, 0.05, 0.45, 0.05, 0.30, 0.05, 0.05],
    desc: "生态体验+景观美学为核心",
  },
  {
    key: "education",
    label: "科普研学",
    icon: "graduation-cap",
    weights: [0.15, 0.10, 0.15, 0.35, 0.10, 0.10, 0.05],
    desc: "科普教育最重",
  },
  {
    key: "leisure",
    label: "休闲健身",
    icon: "bike",
    weights: [0.25, 0.15, 0.20, 0.05, 0.15, 0.10, 0.10],
    desc: "可达性+生态+安全便利",
  },
  {
    key: "balanced",
    label: "全维度均衡",
    icon: "scale",
    weights: [0.22, 0.13, 0.29, 0.07, 0.14, 0.07, 0.07],
    desc: "AHP原始权重",
  },
];

/** TOPSIS得分5级分级（基于四分位数） */
export function getScoreLevel(score: number): { level: string; color: string; label: string } {
  if (score >= 0.5685) return { level: "I", color: "#1a5f4a", label: "高价值" };
  if (score >= 0.4765) return { level: "II", color: "#3d8869", label: "中高价值" };
  if (score >= 0.4148) return { level: "III", color: "#8dc4ac", label: "中等价值" };
  if (score >= 0.3354) return { level: "IV", color: "#f59e0b", label: "中低价值" };
  return { level: "V", color: "#d97706", label: "低价值" };
}

/** 湿地类型颜色 */
export function getTypeColor(type: string): string {
  switch (type) {
    case "河流型": return "#2563eb";
    case "湖泊型": return "#0891b2";
    case "复合型": return "#7c3aed";
    default: return "#6b7280";
  }
}

/** HAI等级颜色 */
export function getHaiColor(level: string): string {
  if (level.includes("I级")) return "#22c55e";
  if (level.includes("II级")) return "#84cc16";
  if (level.includes("III级")) return "#f59e0b";
  if (level.includes("IV级")) return "#ef4444";
  return "#6b7280";
}

/** 是否为高干扰公园（HAI≥III级，用于7-E4预警） */
export function isHighHai(level: string): boolean {
  return level.includes("III级") || level.includes("IV级");
}

/** 水文风险等级颜色（用于7-S2水文展示） */
export function getHydroRiskColor(risk: string): string {
  if (risk.includes("高风险")) return "#ef4444";
  if (risk.includes("中风险")) return "#f59e0b";
  if (risk.includes("低风险")) return "#84cc16";
  return "#22c55e"; // 无风险
}

/** 公平性看板：单个市州数据 */
export interface EquityCity {
  name: string;
  population: number;
  mean_distance_km: number;
  median_distance_km: number;
  max_distance_km: number;
  blind_ratio: number;
  blind_population: number;
  access_per_km: number;
  access_rank: number;
}

/** 公平性看板：汇总信息 */
export interface EquitySummary {
  total_parks: number;
  total_blind_population: number;
  avg_blind_ratio: number;
  avg_access: number;
  best_city: string;
  worst_city: string;
}

/** 公平性看板：整体数据 */
export interface EquityData {
  cities: EquityCity[];
  summary: EquitySummary;
}

/** 建园候选区GeoJSON Feature */
export interface CandidateFeature {
  type: "Feature";
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    area_km2?: number;
    score?: number;
    priority?: number;
    name?: string;
    [key: string]: unknown;
  };
}

/** 建园候选区GeoJSON FeatureCollection */
export interface CandidateCollection {
  type: "FeatureCollection";
  features: CandidateFeature[];
}
