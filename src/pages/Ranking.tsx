/** 排名总览页 */
import { Link } from "react-router-dom";
import { Map, ArrowLeft, BarChart3, PieChart } from "lucide-react";
import RankingTable from "@/components/RankingTable";

export default function Ranking() {
  return (
    <div className="min-h-screen bg-cream">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-wetland-800 px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-amber-400" />
          <span className="font-serif text-sm font-bold text-white">
            TOPSIS综合排名总览
          </span>
        </div>
        <nav className="flex gap-1">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-wetland-200 transition hover:bg-wetland-700 hover:text-white"
          >
            <ArrowLeft size={14} />
            返回地图
          </Link>
          <Link
            to="/ranking"
            className="rounded-md bg-wetland-700 px-3 py-1.5 text-xs font-medium text-white"
          >
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

      <RankingTable />
    </div>
  );
}
