/** 加权TOPSIS推荐算法 */
import type { ParkProperties } from "./types";
import { DIM_KEYS, DIM_LABELS } from "./types";

export interface Recommendation {
  park: ParkProperties;
  matchScore: number; // 相对贴近度 0-1
  dPlus: number; // 距正理想解距离
  dMinus: number; // 距负理想解距离
  strengths: string[]; // 优势维度
  weaknesses: string[]; // 短板维度
  coords: [number, number];
}

/**
 * 加权TOPSIS计算
 * @param parks 公园列表
 * @param weights 7维权重（A1-A7）
 * @param userCity 用户城市（可选，用于距离加权）
 * @returns 按匹配得分降序排列的推荐列表
 */
export function weightedTOPSIS(
  parks: Array<{ properties: ParkProperties; coords: [number, number] }>,
  weights: number[],
  userCity?: string,
): Recommendation[] {
  const n = parks.length;
  if (n === 0) return [];

  // 1. 构建加权归一化矩阵 Z_ij = dims[j] * weights[j]
  const Z: number[][] = parks.map((p) => {
    const dims = p.properties.dims;
    return DIM_KEYS.map((k, j) => dims[k] * weights[j]);
  });

  // 2. 正/负理想解
  const zPlus: number[] = [];
  const zMinus: number[] = [];
  for (let j = 0; j < 7; j++) {
    const col = Z.map((row) => row[j]);
    zPlus.push(Math.max(...col));
    zMinus.push(Math.min(...col));
  }

  // 3. 距离计算 + 相对贴近度
  const results: Recommendation[] = parks.map((p, i) => {
    let dPlus = 0;
    let dMinus = 0;
    for (let j = 0; j < 7; j++) {
      dPlus += (Z[i][j] - zPlus[j]) ** 2;
      dMinus += (Z[i][j] - zMinus[j]) ** 2;
    }
    dPlus = Math.sqrt(dPlus);
    dMinus = Math.sqrt(dMinus);
    const matchScore = dMinus / (dPlus + dMinus + 1e-10);

    // 4. 优势/短板维度（加权后贡献最大/最小的维度）
    const contributions = Z[i].map((z, j) => ({ idx: j, val: z }));
    const sorted = [...contributions].sort((a, b) => b.val - a.val);
    const strengths = sorted.slice(0, 2).map((s) => DIM_LABELS[s.idx]);
    const weaknesses = sorted.slice(-2).map((s) => DIM_LABELS[s.idx]);

    return {
      park: p.properties,
      matchScore,
      dPlus,
      dMinus,
      strengths,
      weaknesses,
      coords: p.coords,
    };
  });

  // 5. 城市距离加权（可选）
  if (userCity) {
    const cityParks = parks.filter((p) => p.properties.city === userCity);
    if (cityParks.length > 0) {
      // 计算城市中心坐标
      const cityCenter = cityParks.reduce(
        (acc, p) => [acc[0] + p.coords[0], acc[1] + p.coords[1]] as [number, number],
        [0, 0] as [number, number],
      );
      cityCenter[0] /= cityParks.length;
      cityCenter[1] /= cityParks.length;

      // 距离归一化后融合（α=0.85，推荐质量为主）
      const alpha = 0.85;
      const distances = results.map((r) => {
        const dx = r.coords[0] - cityCenter[0];
        const dy = r.coords[1] - cityCenter[1];
        return Math.sqrt(dx * dx + dy * dy);
      });
      const maxDist = Math.max(...distances, 1);

      results.forEach((r, i) => {
        const distNorm = distances[i] / maxDist;
        r.matchScore = alpha * r.matchScore + (1 - alpha) * (1 - distNorm);
      });
    }
  }

  // 6. 按匹配得分降序排序
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}
