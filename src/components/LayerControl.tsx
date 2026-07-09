/** 图层控制组件：切换TOPSIS分级/湿地类型/HAI分级 */
import { Layers } from "lucide-react";
import { useStore } from "@/store/useStore";

const LAYERS = [
  { key: "topsis" as const, label: "TOPSIS分级", desc: "综合价值" },
  { key: "type" as const, label: "湿地类型", desc: "河流/湖泊/复合" },
  { key: "hai" as const, label: "HAI压力", desc: "人类干扰" },
];

export default function LayerControl() {
  const layerMode = useStore((s) => s.layerMode);
  const setLayerMode = useStore((s) => s.setLayerMode);

  return (
    <div className="absolute top-4 right-4 z-[1000] rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-1 px-1">
        <Layers size={12} className="text-wetland-600" />
        <span className="text-xs font-semibold text-wetland-700">图层</span>
      </div>
      <div className="flex gap-1">
        {LAYERS.map((layer) => (
          <button
            key={layer.key}
            onClick={() => setLayerMode(layer.key)}
            className={`rounded px-2 py-1 text-xs transition ${
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
    </div>
  );
}
