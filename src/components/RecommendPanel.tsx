/** 左侧推荐面板：位置选择+偏好场景+推荐结果 */
import { useState } from "react";
import { Search, Sparkles, ChevronRight, Star, AlertTriangle, TrendingUp, LocateFixed } from "lucide-react";
import { useStore } from "@/store/useStore";
import { SCENARIOS } from "@/utils/types";
import { cities } from "@/utils/data";
import { regeocode } from "@/utils/amap";
import { wgs84ToGcj02 } from "@/utils/coordTransform";
import type { Recommendation } from "@/utils/topsis";

export default function RecommendPanel() {
  const {
    selectedScenarios,
    userCity,
    recommendations,
    topN,
    toggleScenario,
    setCity,
    setTopN,
    runRecommend,
    selectPark,
    flyTo,
    userLocation,
    locating,
    setUserLocation,
    setLocating,
    setCity: setStoreCity,
  } = useStore();

  const [showResults, setShowResults] = useState(false);

  function handleRecommend() {
    runRecommend();
    setShowResults(true);
  }

  function handleResultClick(rec: Recommendation) {
    selectPark(rec.park);
    flyTo([rec.coords[1], rec.coords[0]]);
  }

  async function handleLocate() {
    if (!navigator.geolocation) {
      alert("您的浏览器不支持定位功能");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // WGS84 → GCJ-02
        const [lng, lat] = wgs84ToGcj02(pos.coords.longitude, pos.coords.latitude);
        setUserLocation([lng, lat]);
        setLocating(false);
        // 逆地理编码获取城市
        const result = await regeocode(lng, lat);
        if (result?.city) {
          setStoreCity(result.city);
        }
      },
      (err) => {
        setLocating(false);
        alert(`定位失败：${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="flex h-full flex-col bg-cream">
      {/* 标题区 */}
      <div className="border-b border-wetland-100 bg-wetland-700 px-4 py-3">
        <h1 className="font-serif text-base font-bold text-white">
          湖南省湿地公园智能推荐
        </h1>
        <p className="mt-0.5 text-xs text-wetland-200">
          基于TOPSIS的个性化推荐引擎 · 70个国家级湿地公园
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* 位置选择 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-wetland-700">
            您所在的位置
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={userCity}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-wetland-200 bg-white py-2 pl-8 pr-3 text-sm text-wetland-800 focus:border-wetland-500 focus:outline-none focus:ring-1 focus:ring-wetland-500"
              >
                <option value="">不限（全省推荐）</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLocate}
              disabled={locating}
              title="自动定位我的位置"
              className="flex shrink-0 items-center gap-1 rounded-lg border border-wetland-300 bg-white px-3 text-xs font-medium text-wetland-700 transition hover:bg-wetland-50 disabled:opacity-50"
            >
              <LocateFixed size={14} className={locating ? "animate-spin" : ""} />
              定位
            </button>
          </div>
          {userLocation && (
            <p className="mt-1 text-xs text-wetland-500">
              已定位：{userLocation[1].toFixed(4)}, {userLocation[0].toFixed(4)}
              {userCity && ` · ${userCity}`}
            </p>
          )}
        </div>

        {/* 偏好场景 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-wetland-700">
            出游偏好（可多选）
          </label>
          <div className="space-y-1.5">
            {SCENARIOS.map((s) => {
              const checked = selectedScenarios.includes(s.key);
              return (
                <label
                  key={s.key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition ${
                    checked
                      ? "border-wetland-500 bg-wetland-50"
                      : "border-gray-200 bg-white hover:border-wetland-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleScenario(s.key)}
                    className="h-4 w-4 accent-wetland-700"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-wetland-800">{s.label}</span>
                    <span className="ml-2 text-xs text-gray-400">{s.desc}</span>
                  </div>
                </label>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {selectedScenarios.length === 0
              ? "未选择则使用均衡权重"
              : `已选 ${selectedScenarios.length} 项（权重取平均）`}
          </p>
        </div>

        {/* 推荐数量 */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold text-wetland-700">
            推荐数量
          </label>
          <div className="flex gap-2">
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setTopN(n)}
                className={`flex-1 rounded-lg border py-1.5 text-sm transition ${
                  topN === n
                    ? "border-wetland-500 bg-wetland-700 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-wetland-300"
                }`}
              >
                Top {n}
              </button>
            ))}
          </div>
        </div>

        {/* 推荐按钮 */}
        <button
          onClick={handleRecommend}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700 active:scale-[0.98]"
        >
          <Sparkles size={16} />
          智能推荐
        </button>

        {/* 推荐结果 */}
        {showResults && recommendations.length > 0 && (
          <div className="mt-4 animate-slide-up">
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-wetland-600" />
              <span className="text-xs font-semibold text-wetland-700">
                推荐结果（{recommendations.length}个）
              </span>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <RecommendCard
                  key={rec.park.name}
                  rec={rec}
                  rank={idx + 1}
                  onClick={() => handleResultClick(rec)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 推荐结果卡片 */
function RecommendCard({
  rec,
  rank,
  onClick,
}: {
  rec: Recommendation;
  rank: number;
  onClick: () => void;
}) {
  const { park, matchScore, strengths, weaknesses } = rec;
  const scorePercent = Math.round(matchScore * 100);

  return (
    <button
      onClick={onClick}
      className="group w-full rounded-lg border border-wetland-100 bg-white p-3 text-left transition hover:border-wetland-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
              rank <= 3 ? "bg-amber-600" : "bg-wetland-600"
            }`}
          >
            {rank}
          </span>
          <div>
            <div className="text-sm font-medium text-wetland-800 group-hover:text-wetland-900">
              {park.name.replace("国家湿地公园", "")}
            </div>
            <div className="text-xs text-gray-400">
              {park.type} · {park.city}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-base font-bold text-wetland-700">
            {scorePercent}%
          </div>
          <div className="text-xs text-gray-400">匹配度</div>
        </div>
      </div>

      {/* 优势/短板 */}
      <div className="mt-2 flex flex-wrap gap-1">
        {strengths.map((s) => (
          <span
            key={`s-${s}`}
            className="flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-700"
          >
            <Star size={10} /> {s}
          </span>
        ))}
        {weaknesses.map((w) => (
          <span
            key={`w-${w}`}
            className="flex items-center gap-0.5 rounded bg-orange-50 px-1.5 py-0.5 text-xs text-orange-700"
          >
            <AlertTriangle size={10} /> {w}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-1.5">
        <span className="text-xs text-gray-400">
          综合排名 #{park.topsis_rank} · {park.season}
        </span>
        <ChevronRight size={14} className="text-wetland-400 group-hover:text-wetland-600" />
      </div>
    </button>
  );
}
