/** 公园详情弹窗内容（用于Leaflet Popup和侧边详情）
 *  7-E2: 短板诊断面板（最弱维度 + 改善建议 + 水文适宜性）
 */
import { MapPin, Calendar, Award, AlertCircle, Leaf, Stethoscope, Droplets, Lightbulb } from "lucide-react";
import type { ParkProperties } from "@/utils/types";
import { getScoreLevel, getHaiColor, getHydroRiskColor, isHighHai } from "@/utils/types";
import ParkRadarChart from "./RadarChart";

interface ParkPopupProps {
  park: ParkProperties;
  onClose?: () => void;
}

export default function ParkPopup({ park, onClose }: ParkPopupProps) {
  const level = getScoreLevel(park.topsis_score);
  const highHai = isHighHai(park.hai_level);

  return (
    <div className="park-popup-card bg-white p-4">
      {/* 标题 */}
      <div className="mb-3 border-b border-wetland-100 pb-2">
        <div className="flex items-start justify-between">
          <h3 className="font-serif text-base font-bold text-wetland-800 leading-snug pr-2">
            {park.name}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition"
              aria-label="关闭"
            >
              ✕
            </button>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-wetland-50 px-2 py-0.5 text-xs text-wetland-700">
            {park.type}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-xs text-white"
            style={{ backgroundColor: level.color }}
          >
            {level.level}级 · {level.label}
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600">
            排名 #{park.topsis_rank}
          </span>
          {highHai && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 ring-1 ring-red-300">
              高干扰预警
            </span>
          )}
        </div>
      </div>

      {/* 基础信息 */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={12} className="text-wetland-500" />
          <span>{park.city}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Calendar size={12} className="text-wetland-500" />
          <span>{park.year}年批复</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Award size={12} className="text-wetland-500" />
          <span>{park.area_ha.toLocaleString()} 公顷</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <Leaf size={12} className="text-wetland-500" />
          <span>{park.season}</span>
        </div>
      </div>

      {/* TOPSIS得分 */}
      <div className="mb-3 rounded-lg bg-wetland-50 p-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-wetland-700">综合得分</span>
          <span className="font-serif text-lg font-bold text-wetland-800">
            {park.topsis_score.toFixed(3)}
          </span>
        </div>
      </div>

      {/* 七维雷达图 */}
      <div className="mb-3">
        <div className="mb-1 text-xs font-medium text-wetland-700">七维指标雷达图</div>
        <ParkRadarChart dims={park.dims} color={level.color} height={180} />
      </div>

      {/* 7-E2: 短板诊断面板 */}
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Stethoscope size={13} className="text-amber-700" />
          <span className="text-xs font-semibold text-amber-800">短板诊断</span>
        </div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-gray-600">最弱维度</span>
          <span className="rounded-full bg-amber-200 px-2 py-0.5 font-bold text-amber-900">
            {park.weakest_dim}
            {park.weakest_z !== null && (
              <span className="ml-1 text-amber-700">(z={park.weakest_z})</span>
            )}
          </span>
        </div>
        <div className="flex items-start gap-1.5 rounded bg-white/70 p-1.5">
          <Lightbulb size={12} className="mt-0.5 shrink-0 text-amber-600" />
          <span className="text-[11px] leading-relaxed text-gray-700">
            {park.improvement_suggestion}
          </span>
        </div>
      </div>

      {/* 7-S2: 水文适宜性（问题三） */}
      <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50/40 p-2.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <Droplets size={13} className="text-blue-700" />
          <span className="text-xs font-semibold text-blue-800">水文适宜性</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">水文得分</span>
            <span className="font-serif font-bold text-blue-700">
              {park.hydro_score.toFixed(3)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">水文排名</span>
            <span className="font-serif font-bold text-blue-700">#{park.hydro_rank}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">变化趋势</span>
            <span className="text-gray-700">{park.trend_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">变化幅度</span>
            <span className="text-gray-700">{park.change_pct > 0 ? "+" : ""}{park.change_pct}%</span>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between border-t border-blue-100 pt-1.5 text-xs">
          <span className="text-gray-600">风险等级</span>
          <span
            className="rounded-full px-2 py-0.5 font-medium text-white"
            style={{ backgroundColor: getHydroRiskColor(park.risk_level) }}
          >
            {park.risk_level}
          </span>
        </div>
      </div>

      {/* HAI压力标签 */}
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">人类活动压力：</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs text-white"
          style={{ backgroundColor: getHaiColor(park.hai_level) }}
        >
          {park.hai_level} (HAI={park.hai.toFixed(3)})
        </span>
      </div>

      {/* 偏科信息 */}
      {park.bias.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-2">
          <div className="mb-1 text-xs font-medium text-amber-700">偏科特征</div>
          <div className="flex flex-wrap gap-1">
            {park.bias.map((b, i) => (
              <span
                key={i}
                className={`rounded px-1.5 py-0.5 text-xs ${
                  b.includes("偏强")
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
