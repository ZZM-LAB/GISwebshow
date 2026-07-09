/** 浮动详情面板：点击地图标记时显示公园详情 */
import { X, Navigation } from "lucide-react";
import { useStore } from "@/store/useStore";
import { parks } from "@/utils/data";
import ParkPopup from "./ParkPopup";

export default function ParkDetailPanel() {
  const selectedPark = useStore((s) => s.selectedPark);
  const selectPark = useStore((s) => s.selectPark);
  const flyTo = useStore((s) => s.flyTo);

  if (!selectedPark) return null;

  // 查找坐标用于飞行
  const park = parks.find((p) => p.properties.name === selectedPark.name);

  function handleClose() {
    selectPark(null);
  }

  function handleFlyTo() {
    if (park) {
      flyTo([park.coords[1], park.coords[0]]);
    }
  }

  return (
    <div className="absolute right-4 top-4 z-[1000] w-[380px] animate-slide-in-left">
      <div className="max-h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-wetland-200/50">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between bg-wetland-800 px-4 py-2.5">
          <span className="font-serif text-sm font-semibold text-white">
            公园详情
          </span>
          <div className="flex items-center gap-1">
            {park && (
              <button
                onClick={handleFlyTo}
                className="flex items-center gap-1 rounded-md bg-wetland-700 px-2 py-1 text-xs text-wetland-100 transition hover:bg-wetland-600 hover:text-white"
                title="飞行至该公园"
              >
                <Navigation size={12} />
                定位
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
        </div>
      </div>
    </div>
  );
}
