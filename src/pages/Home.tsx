/** 地图主页：推荐面板 + 地图 */
import { Link } from "react-router-dom";
import { Map, BarChart3, PieChart } from "lucide-react";
import RecommendPanel from "@/components/RecommendPanel";
import MapView from "@/components/MapView";
import LayerControl from "@/components/LayerControl";
import ParkDetailPanel from "@/components/ParkDetailPanel";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between bg-wetland-800 px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <Map size={20} className="text-amber-400" />
          <span className="font-serif text-sm font-bold text-white">
            湖南省湿地公园智能推荐系统
          </span>
        </div>
        <nav className="flex gap-1">
          <Link
            to="/"
            className="rounded-md bg-wetland-700 px-3 py-1.5 text-xs font-medium text-white"
          >
            地图推荐
          </Link>
          <Link
            to="/ranking"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-wetland-200 transition hover:bg-wetland-700 hover:text-white"
          >
            <BarChart3 size={14} />
            排名总览
          </Link>
          <Link
            to="/equity"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-wetland-200 transition hover:bg-wetland-700 hover:text-white"
          >
            <PieChart size={14} />
            公平性看板
          </Link>
        </nav>
      </header>

      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧面板 */}
        <aside className="w-[360px] shrink-0 border-r border-wetland-100 md:block">
          <RecommendPanel />
        </aside>

        {/* 右侧地图 */}
        <main className="relative flex-1">
          <MapView />
          <LayerControl />
          <ParkDetailPanel />
        </main>
      </div>
    </div>
  );
}
