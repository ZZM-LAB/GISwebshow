/** Leaflet地图组件：70公园点位+分级着色+点击选中 */
import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import { parks, HUNAN_CENTER, INITIAL_ZOOM } from "@/utils/data";
import { useStore } from "@/store/useStore";
import { getScoreLevel, getTypeColor, getHaiColor } from "@/utils/types";

/** 地图飞行控制器：响应flyToCoords变化 */
function FlyController() {
  const flyToCoords = useStore((s) => s.flyToCoords);
  const clearFlyTo = useStore((s) => s.clearFlyTo);
  const map = useMap();

  useMemo(() => {
    if (flyToCoords) {
      map.flyTo(flyToCoords, 11, { duration: 1.2 });
      clearFlyTo();
    }
  }, [flyToCoords, map, clearFlyTo]);

  return null;
}

/** 地图空白点击：取消选中 */
function MapClickHandler() {
  const selectPark = useStore((s) => s.selectPark);
  useMapEvents({
    click: () => {
      selectPark(null);
    },
  });
  return null;
}

/** 图例组件 */
function Legend({ mode }: { mode: string }) {
  const items = useMemo(() => {
    if (mode === "topsis") {
      return [
        { color: "#1a5f4a", label: "I级 高价值" },
        { color: "#3d8869", label: "II级 中高" },
        { color: "#8dc4ac", label: "III级 中等" },
        { color: "#f59e0b", label: "IV级 中低" },
        { color: "#d97706", label: "V级 低价值" },
      ];
    }
    if (mode === "type") {
      return [
        { color: "#2563eb", label: "河流型" },
        { color: "#0891b2", label: "湖泊型" },
        { color: "#7c3aed", label: "复合型" },
      ];
    }
    return [
      { color: "#22c55e", label: "I级 低干扰" },
      { color: "#84cc16", label: "II级 中低" },
      { color: "#f59e0b", label: "III级 中高" },
      { color: "#ef4444", label: "IV级 高干扰" },
    ];
  }, [mode]);

  return (
    <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 text-xs font-semibold text-wetland-800">
        {mode === "topsis" ? "TOPSIS分级" : mode === "type" ? "湿地类型" : "HAI压力等级"}
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-white/50"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MapView() {
  const layerMode = useStore((s) => s.layerMode);
  const selectedPark = useStore((s) => s.selectedPark);
  const selectPark = useStore((s) => s.selectPark);

  /** 获取标记颜色 */
  function getMarkerColor(props: typeof parks[0]["properties"]): string {
    if (layerMode === "topsis") {
      return getScoreLevel(props.topsis_score).color;
    }
    if (layerMode === "type") {
      return getTypeColor(props.type);
    }
    return getHaiColor(props.hai_level);
  }

  /** 获取标记半径 */
  function getMarkerRadius(props: typeof parks[0]["properties"]): number {
    if (props.area_ha > 10000) return 9;
    if (props.area_ha > 3000) return 7;
    return 6;
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={HUNAN_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={6}
        maxZoom={14}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          subdomains={["a", "b", "c", "d"]}
          attribution='&copy; OpenStreetMap, &copy; CARTO'
        />

        <MapClickHandler />

        {parks.map((park) => {
          const props = park.properties;
          const isSelected = selectedPark?.name === props.name;
          const color = getMarkerColor(props);
          const radius = getMarkerRadius(props);

          return (
            <CircleMarker
              key={props.name}
              center={[park.coords[1], park.coords[0]]}
              radius={isSelected ? radius + 3 : radius}
              pathOptions={{
                color: isSelected ? "#d97706" : color,
                fillColor: color,
                fillOpacity: 0.8,
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => {
                  selectPark(props);
                },
              }}
            />
          );
        })}

        <FlyController />
      </MapContainer>

      <Legend mode={layerMode} />
    </div>
  );
}
