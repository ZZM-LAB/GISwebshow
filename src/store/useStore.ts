/** 全局状态管理 */
import { create } from "zustand";
import type { ParkProperties } from "@/utils/types";
import { SCENARIOS } from "@/utils/types";
import { weightedTOPSIS, type Recommendation } from "@/utils/topsis";
import { parks } from "@/utils/data";

type LayerMode = "topsis" | "type" | "hai";

interface AppState {
  // 推荐面板状态
  selectedScenarios: string[]; // 选中的场景key
  userCity: string; // 用户城市
  recommendations: Recommendation[]; // 推荐结果
  topN: number; // 推荐数量

  // 地图状态
  layerMode: LayerMode; // 图层模式
  selectedPark: ParkProperties | null; // 当前选中公园（用于弹窗/高亮）
  flyToCoords: [number, number] | null; // 地图飞行目标

  // Actions
  toggleScenario: (key: string) => void;
  setCity: (city: string) => void;
  setTopN: (n: number) => void;
  runRecommend: () => void;
  setLayerMode: (mode: LayerMode) => void;
  selectPark: (park: ParkProperties | null) => void;
  flyTo: (coords: [number, number]) => void;
  clearFlyTo: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  selectedScenarios: [],
  userCity: "",
  recommendations: [],
  topN: 5,

  layerMode: "topsis",
  selectedPark: null,
  flyToCoords: null,

  toggleScenario: (key) => {
    const current = get().selectedScenarios;
    if (current.includes(key)) {
      set({ selectedScenarios: current.filter((k) => k !== key) });
    } else {
      set({ selectedScenarios: [...current, key] });
    }
  },

  setCity: (city) => set({ userCity: city }),
  setTopN: (n) => set({ topN: n }),

  runRecommend: () => {
    const { selectedScenarios, userCity, topN } = get();
    if (selectedScenarios.length === 0) {
      // 无选择时使用均衡权重
      const balanced = SCENARIOS.find((s) => s.key === "balanced")!;
      const recs = weightedTOPSIS(parks, balanced.weights, undefined);
      set({ recommendations: recs.slice(0, topN) });
      return;
    }

    // 多场景权重取平均
    const selectedScns = SCENARIOS.filter((s) => selectedScenarios.includes(s.key));
    const avgWeights = new Array(7).fill(0);
    for (const s of selectedScns) {
      for (let i = 0; i < 7; i++) {
        avgWeights[i] += s.weights[i];
      }
    }
    for (let i = 0; i < 7; i++) {
      avgWeights[i] /= selectedScns.length;
    }

    const city = userCity || undefined;
    const recs = weightedTOPSIS(parks, avgWeights, city);
    set({ recommendations: recs.slice(0, topN) });
  },

  setLayerMode: (mode) => set({ layerMode: mode }),

  selectPark: (park) => set({ selectedPark: park }),

  flyTo: (coords) => set({ flyToCoords: coords }),

  clearFlyTo: () => set({ flyToCoords: null }),
}));
