/** Leaflet地图组件：70公园点位+分级着色+点击选中+驾车路线+用户定位
 *  7-E1: 建园候选区图层（多边形标注）
 *  7-E4: HAI≥III级高干扰预警标识
 */
import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { parks, HUNAN_CENTER, INITIAL_ZOOM, candidates } from "@/utils/data";
import { useStore } from "@/store/useStore";
import { getScoreLevel, getTypeColor, getHaiColor, isHighHai } from "@/utils/types";

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

/** 图例组件 */
function Legend({ mode }: { mode: string }) {
  const showCandidates = useStore((s) => s.showCandidates);
  const showHaiWarning = useStore((s) => s.showHaiWarning);

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
        {showCandidates && (
          <div className="mt-1 flex items-center gap-2 border-t border-gray-200 pt-1">
            <span
              className="h-3 w-3 rounded-sm border border-pink-700"
              style={{ backgroundColor: "rgba(236,72,153,0.35)" }}
            />
            <span className="text-xs text-gray-600">建园候选区</span>
          </div>
        )}
        {showHaiWarning && (
          <div className={`mt-1 flex items-center gap-2 ${showCandidates ? "" : "border-t border-gray-200 pt-1"}`}>
            <span className="flex h-3 w-3 items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: "#dc2626" }}>!</span>
            <span className="text-xs text-gray-600">高干扰预警</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapView() {
  const layerMode = useStore((s) => s.layerMode);
  const selectedPark = useStore((s) => s.selectedPark);
  const selectPark = useStore((s) => s.selectPark);
  const drivingRoute = useStore((s) => s.drivingRoute);
  const userLocation = useStore((s) => s.userLocation);
  const showCandidates = useStore((s) => s.showCandidates);
  const showHaiWarning = useStore((s) => s.showHaiWarning);

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

  const baseMap = useStore((s) => s.baseMap);
  const setBaseMap = useStore((s) => s.setBaseMap);

  /** 候选区样式 */
  const candidateStyle = useMemo(() => ({
    color: "#be185d",
    weight: 1,
    opacity: 0.8,
    fillColor: "#ec4899",
    fillOpacity: 0.35,
  }), []);

  /** 候选区GeoJSON数据 */
  const candidatesGeoJSON = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: candidates,
  }), []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={HUNAN_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={6}
        maxZoom={18}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        {baseMap === "amap" ? (
          <TileLayer
            url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}"
            subdomains={["1", "2", "3", "4"]}
            attribution='&copy; AutoNavi'
            maxZoom={18}
          />
        ) : (
          <>
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
              maxZoom={19}
            />
            <TileLayer
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri'
              maxZoom={19}
            />
          </>
        )}

        {/* 7-E1: 建园候选区图层 */}
        {showCandidates && candidates.length > 0 && (
          <GeoJSON data={candidatesGeoJSON} style={() => candidateStyle} />
        )}

        {parks.map((park) => {
          const props = park.properties;
          const isSelected = selectedPark?.name === props.name;
          const color = getMarkerColor(props);
          const radius = getMarkerRadius(props);
          const highHai = isHighHai(props.hai_level);

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
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  selectPark(props);
                },
              }}
            >
              {/* 7-E4: HAI≥III级高干扰预警标识 */}
              {showHaiWarning && highHai && (
                <Popup>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: "#dc2626" }}
                    >
                      !
                    </span>
                    <div>
                      <div className="font-bold text-red-700">{props.name}</div>
                      <div className="text-red-600">高干扰预警 · {props.hai_level}</div>
                      <div className="text-gray-600">HAI={props.hai.toFixed(3)}，建议加强人为活动管控</div>
                    </div>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          );
        })}

        {/* 7-E4: 高干扰预警标识浮层（独立于popup的视觉警示） */}
        {showHaiWarning && parks.map((park) => {
          const props = park.properties;
          if (!isHighHai(props.hai_level)) return null;
          return (
            <Marker
              key={`warn-${props.name}`}
              position={[park.coords[1], park.coords[0]]}
              icon={L.divIcon({
                className: "hai-warning-marker",
                html: '<div style="position:relative;width:0;height:0;"><div style="position:absolute;top:-22px;left:-9px;width:18px;height:18px;background:#dc2626;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px;box-shadow:0 0 6px rgba(220,38,38,0.7);animation:pulse 1.5s infinite;">!</div></div>',
                iconSize: [0, 0],
                iconAnchor: [0, 0],
              })}
              interactive={false}
            />
          );
        })}

        {/* 驾车路线绘制 */}
        {drivingRoute && drivingRoute.polyline.length > 0 && (
          <Polyline
            positions={drivingRoute.polyline.map(([lng, lat]) => [lat, lng])}
            pathOptions={{ color: "#d97706", weight: 4, opacity: 0.8, dashArray: "8 6" }}
          />
        )}

        {/* 用户位置标记 */}
        {userLocation && (
          <Marker
            position={[userLocation[1], userLocation[0]]}
            icon={L.divIcon({
              className: "user-location-marker",
              html: '<div style="width:16px;height:16px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(37,99,235,0.5);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-xs">您的位置</div>
            </Popup>
          </Marker>
        )}

        <FlyController />
      </MapContainer>

      <Legend mode={layerMode} />

      {/* 底图切换按钮 */}
      <div className="absolute bottom-3 left-3 z-[1000] flex bg-white/95 backdrop-blur rounded-lg shadow-lg overflow-hidden">
        <button
          onClick={() => setBaseMap("amap")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            baseMap === "amap"
              ? "bg-wetland-700 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          高德地图
        </button>
        <button
          onClick={() => setBaseMap("satellite")}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            baseMap === "satellite"
              ? "bg-wetland-700 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          卫星影像
        </button>
      </div>
    </div>
  );
}
