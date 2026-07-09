/** 高德Web服务API封装 */
const AMAP_KEY = "76087f87bab6727c2637eba3e5d681c6";
const BASE_URL = "https://restapi.amap.com/v3";

/** 驾车路径规划结果 */
export interface DrivingRoute {
  distance: number; // 米
  duration: number; // 秒
  polyline: [number, number][]; // [lng, lat] 数组（GCJ-02）
}

/** 天气信息 */
export interface WeatherInfo {
  city: string;
  temperature: string;
  weather: string;
  humidity: string;
  windDirection: string;
  windPower: string;
  reportTime: string;
}

/** 逆地理编码结果 */
export interface RegeocodeResult {
  city: string;
  district: string;
  address: string;
}

/** 驾车路径规划 */
export async function getDrivingRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<DrivingRoute | null> {
  const url = `${BASE_URL}/direction/driving`;
  const params = new URLSearchParams({
    key: AMAP_KEY,
    origin: `${origin[0]},${origin[1]}`,
    destination: `${destination[0]},${destination[1]}`,
    strategy: "0", // 速度优先
    output: "json",
  });

  try {
    const resp = await fetch(`${url}?${params}`);
    const data = await resp.json();
    if (data.status !== "1" || !data.route?.paths?.length) return null;

    const path = data.route.paths[0];
    // 合并所有steps的polyline
    const points: [number, number][] = [];
    for (const step of path.steps) {
      const coords = step.polyline.split(";");
      for (const c of coords) {
        if (c) {
          const [lng, lat] = c.split(",").map(Number);
          points.push([lng, lat]);
        }
      }
    }

    return {
      distance: parseInt(path.distance),
      duration: parseInt(path.duration),
      polyline: points,
    };
  } catch {
    return null;
  }
}

/** 天气查询（实时） */
export async function getWeather(city: string): Promise<WeatherInfo | null> {
  const url = `${BASE_URL}/weather/weatherInfo`;
  const params = new URLSearchParams({
    key: AMAP_KEY,
    city: city,
    extensions: "base",
    output: "json",
  });

  try {
    const resp = await fetch(`${url}?${params}`);
    const data = await resp.json();
    if (data.status !== "1" || !data.lives?.length) return null;

    const live = data.lives[0];
    return {
      city: live.city,
      temperature: live.temperature,
      weather: live.weather,
      humidity: live.humidity,
      windDirection: live.winddirection,
      windPower: live.windpower,
      reportTime: live.reporttime,
    };
  } catch {
    return null;
  }
}

/** 逆地理编码 */
export async function regeocode(lng: number, lat: number): Promise<RegeocodeResult | null> {
  const url = `${BASE_URL}/geocode/regeo`;
  const params = new URLSearchParams({
    key: AMAP_KEY,
    location: `${lng},${lat}`,
    output: "json",
  });

  try {
    const resp = await fetch(`${url}?${params}`);
    const data = await resp.json();
    if (data.status !== "1") return null;

    const comp = data.regeocode?.addressComponent;
    return {
      city: comp?.city || comp?.province || "",
      district: comp?.district || "",
      address: data.regeocode?.formatted_address || "",
    };
  } catch {
    return null;
  }
}

/** 格式化距离 */
export function formatDistance(meters: number): string {
  if (meters >= 10000) return `${(meters / 1000).toFixed(0)}km`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/** 格式化时长 */
export function formatDuration(seconds: number): string {
  const min = Math.ceil(seconds / 60);
  if (min >= 60) return `${Math.floor(min / 60)}h${min % 60}min`;
  return `${min}min`;
}
