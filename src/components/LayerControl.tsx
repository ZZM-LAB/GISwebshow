/** 图层控制组件：切换TOPSIS分级/湿地类型/HAI分级 + 候选区/预警开关 */
import { Layers, MapPin, AlertTriangle } from "lucide-react";
import { useStore } from "@/store/useStore";

const LAYERS = [
  { key: "topsis" as const, label: "TOPSIS分级", desc: "综合价值" },
  { key: "type" as const, label: "湿地类型", desc: "河流/湖泊/复合" },
  { key: "hai" as const, label: "HAI压力", desc: "人类干扰" },
];

export default function LayerControl() {
  const layerMode = useStore((s) => s.layerMode);
  const setLayerMode = useStore((s) => s.setLayerMode);
  const showCandidates = useStore((s) => s.showCandidates);
  const setShowCandidates = useStore((s) => s.setShowCandidates);
  const showHaiWarning = useStore((s) => s.showHaiWarning);
  const setShowHaiWarning = useStore((s) => s.setShowHaiWarning);

  return (
    <div className="absolute top-4 right-4 z-[1000] w-[220px] rounded-lg bg-white/95 p-2.5 shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 flex items-center gap-1 px-1">
        <Layers size={12} className="text-wetland-600" />
        <span className="text-xs font-semibold text-wetland-700">图层模式</span>
      </div>
      <div className="mb-2 flex gap-1">
        {LAYERS.map((layer) => (
          <button
            key={layer.key}
            onClick={() => setLayerMode(layer.key)}
            className={`flex-1 rounded px-2 py-1 text-xs transition ${
              layerMode === layer.key
                ? "bg-wetland-700 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-wetland-50"
            }`}
            title={layer.desc}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* 7-E1 & 7-E4 开关 */}
      <div className="space-y-1 border-t border-gray-200 pt-2">
        <button
          onClick={() => setShowCandidates(!showCandidates)}
          className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition ${
            showCandidates
              ? "bg-pink-50 text-pink-700 ring-1 ring-pink-300"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
          title="显示问题五识别的建园候选区"
        >
          <span className="flex items-center gap-1.5">
            <MapPin size={11} />
            建园候选区
          </span>
          <span className={`h-2 w-2 rounded-full ${showCandidates ? "bg-pink-500" : "bg-gray-300"}`} />
        </button>
        <button
          onClick={() => setShowHaiWarning(!showHaiWarning)}
          className={`flex w-full items-center justify-between rounded px-2 py-1 text-xs transition ${
            showHaiWarning
              ? "bg-red-50 text-red-700 ring-1 ring-red-300"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
          title="对HAI≥III级的公园显示预警标识"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle size={11} />
            高干扰预警
          </span>
          <span className={`h-2 w-2 rounded-full ${showHaiWarning ? "bg-red-500" : "bg-gray-300"}`} />
        </button>
      </div>
    </div>
  );
}
