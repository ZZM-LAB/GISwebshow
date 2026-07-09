/** 浮动详情面板：点击地图标记时显示公园详情 */
import { useEffect } from "react";
import { X, Navigation, Route as RouteIcon, CloudSun } from "lucide-react";
import { useStore } from "@/store/useStore";
import { parks } from "@/utils/data";
import { getDrivingRoute, getWeather, formatDistance, formatDuration } from "@/utils/amap";
import ParkPopup from "./ParkPopup";

export default function ParkDetailPanel() {
  const selectedPark = useStore((s) => s.selectedPark);
  const selectPark = useStore((s) => s.selectPark);
  const flyTo = useStore((s) => s.flyTo);
  const userLocation = useStore((s) => s.userLocation);
  const setUserLocation = useStore((s) => s.setUserLocation);

  const drivingRoute = useStore((s) => s.drivingRoute);
  const setDrivingRoute = useStore((s) => s.setDrivingRoute);
  const routeLoading = useStore((s) => s.routeLoading);
  const setRouteLoading = useStore((s) => s.setRouteLoading);

  const weather = useStore((s) => s.weather);
  const setWeather = useStore((s) => s.setWeather);

  // 选中公园变化时重置路线和天气
  useEffect(() => {
    setDrivingRoute(null);
    setWeather(null);
  }, [selectedPark, setDrivingRoute, setWeather]);

  if (!selectedPark) return null;

  const park = parks.find((p) => p.properties.name === selectedPark.name);

  function handleClose() {
    selectPark(null);
  }

  function handleFlyTo() {
    if (park) flyTo([park.coords[1], park.coords[0]]);
  }

  async function handleRoute() {
    if (!park || !userLocation) {
      alert("请先点击左侧「定位」按钮获取您的位置");
      return;
    }
    setRouteLoading(true);
    const route = await getDrivingRoute(userLocation, park.coords);
    setRouteLoading(false);
    setDrivingRoute(route);
    if (!route) alert("路径规划失败，请稍后重试");
  }

  async function handleWeather() {
    const city = selectedPark.city;
    if (!city) return;
    const w = await getWeather(city);
    setWeather(w);
  }

  return (
    <div className="absolute right-4 top-4 z-[1000] w-[380px] animate-slide-in-left">
      <div className="max-h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-wetland-200/50">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between bg-wetland-800 px-4 py-2.5">
          <span className="font-serif text-sm font-semibold text-white">公园详情</span>
          <div className="flex items-center gap-1">
            {park && (
              <button
                onClick={handleFlyTo}
                className="flex items-center gap-1 rounded-md bg-wetland-700 px-2 py-1 text-xs text-wetland-100 transition hover:bg-wetland-600 hover:text-white"
                title="飞行至该公园"
              >
                <Navigation size={12} /> 定位
              </button>
            )}
            <button
              onClick={handleClose}
              className="rounded-md p-1 text-wetland-200 transition hover:bg-wetland-700 hover:text-white"
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 详情内容（可滚动） */}
        <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
          <ParkPopup park={selectedPark} />

          {/* 实用工具区 */}
          <div className="border-t border-wetland-100 px-4 py-3">
            <div className="flex gap-2">
              {/* 驾车路线按钮 */}
              <button
                onClick={handleRoute}
                disabled={routeLoading || !userLocation}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-wetland-300 bg-wetland-50 px-3 py-2 text-xs font-medium text-wetland-700 transition hover:bg-wetland-100 disabled:opacity-40"
                title={userLocation ? "规划驾车路线" : "请先定位"}
              >
                <RouteIcon size={14} />
                {routeLoading ? "规划中..." : "驾车路线"}
              </button>

              {/* 天气按钮 */}
              <button
                onClick={handleWeather}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
              >
                <CloudSun size={14} />
                实时天气
              </button>
            </div>

            {/* 路线结果 */}
            {drivingRoute && (
              <div className="mt-2 animate-slide-up rounded-lg bg-wetland-50 px-3 py-2 text-xs text-wetland-700">
                <div className="flex items-center justify-between">
                  <span className="font-medium">驾车距离</span>
                  <span className="font-serif font-bold text-wetland-800">
                    {formatDistance(drivingRoute.distance)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-medium">预计用时</span>
                  <span className="font-serif font-bold text-amber-600">
                    {formatDuration(drivingRoute.duration)}
                  </span>
                </div>
              </div>
            )}

            {/* 天气结果 */}
            {weather && (
              <div className="mt-2 animate-slide-up rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{weather.city} · {weather.reportTime.slice(0, 10)}</span>
                  <span className="text-sm font-bold">{weather.weather} {weather.temperature}°C</span>
                </div>
                <div className="mt-1 text-amber-600">
                  湿度 {weather.humidity}% · {weather.windDirection}风 {weather.windPower}级
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
