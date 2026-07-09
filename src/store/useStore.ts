/** 全局状态管理 */
import { create } from "zustand";
import type { ParkProperties } from "@/utils/types";
import { SCENARIOS } from "@/utils/types";
import { weightedTOPSIS, type Recommendation } from "@/utils/topsis";
import { parks } from "@/utils/data";
import type { DrivingRoute, WeatherInfo } from "@/utils/amap";

type LayerMode = "topsis" | "type" | "hai";

interface AppState {
  // 推荐面板状态
  selectedScenarios: string[];
  userCity: string;
  recommendations: Recommendation[];
  topN: number;

  // 地图状态
  layerMode: LayerMode;
  selectedPark: ParkProperties | null;
  flyToCoords: [number, number] | null;

  // 用户定位
  userLocation: [number, number] | null; // [lng, lat] GCJ-02
  locating: boolean;

  // 驾车路线
  drivingRoute: DrivingRoute | null;
  routeLoading: boolean;

  // 天气
  weather: WeatherInfo | null;

  // Actions
  toggleScenario: (key: string) => void;
  setCity: (city: string) => void;
  setTopN: (n: number) => void;
  runRecommend: () => void;
  setLayerMode: (mode: LayerMode) => void;
  selectPark: (park: ParkProperties | null) => void;
  flyTo: (coords: [number, number]) => void;
  clearFlyTo: () => void;
  setUserLocation: (loc: [number, number] | null) => void;
  setLocating: (v: boolean) => void;
  setDrivingRoute: (r: DrivingRoute | null) => void;
  setRouteLoading: (v: boolean) => void;
  setWeather: (w: WeatherInfo | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  selectedScenarios: [],
  userCity: "",
  recommendations: [],
  topN: 5,

  layerMode: "topsis",
  selectedPark: null,
  flyToCoords: null,

  userLocation: null,
  locating: false,
  drivingRoute: null,
  routeLoading: false,
  weather: null,

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
      const balanced = SCENARIOS.find((s) => s.key === "balanced")!;
      const recs = weightedTOPSIS(parks, balanced.weights, undefined);
      set({ recommendations: recs.slice(0, topN) });
      return;
    }

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

  selectPark: (park) => set({ selectedPark: park, drivingRoute: null, weather: null }),

  flyTo: (coords) => set({ flyToCoords: coords }),

  clearFlyTo: () => set({ flyToCoords: null }),

  setUserLocation: (loc) => set({ userLocation: loc }),
  setLocating: (v) => set({ locating: v }),
  setDrivingRoute: (r) => set({ drivingRoute: r }),
  setRouteLoading: (v) => set({ routeLoading: v }),
  setWeather: (w) => set({ weather: w }),
}));
