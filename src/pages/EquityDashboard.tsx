/** 7-E3: 区域公平性看板
 *  按14市州展示人均可达性、服务盲区人口比例、平均距离等指标
 *  数据来自问题五2SFCA可达性分析
 */
import { Link } from "react-router-dom";
import { Map, BarChart3, TrendingUp, Users, AlertTriangle, Award, Lightbulb } from "lucide-react";
import { equity } from "@/utils/data";

/** 格式化人口数 */
function fmtPop(n: number): string {
  if (n >= 1e8) return (n / 1e8).toFixed(2) + "亿";
  if (n >= 1e4) return (n / 1e4).toFixed(1) + "万";
  return n.toLocaleString();
}

/** 格式化百分比 */
function fmtPct(ratio: number): string {
  return (ratio * 100).toFixed(2) + "%";
}

export default function EquityDashboard() {
  const { cities, summary } = equity;
  const sortedByAccess = [...cities].sort((a, b) => b.access_per_km - a.access_per_km);
  const sortedByBlind = [...cities].sort((a, b) => b.blind_ratio - a.blind_ratio);
  const maxAccess = Math.max(...cities.map((c) => c.access_per_km));
  const maxBlind = Math.max(...cities.map((c) => c.blind_ratio));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="flex items-center justify-between bg-wetland-800 px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-amber-400" />
          <span className="font-serif text-sm font-bold text-white">
            区域公平性看板 · 湖南省14市州
          </span>
        </div>
        <nav className="flex gap-1">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-wetland-200 transition hover:bg-wetland-700 hover:text-white"
          >
            <Map size={14} />
            地图推荐
          </Link>
          <Link
            to="/ranking"
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-wetland-200 transition hover:bg-wetland-700 hover:text-white"
          >
            <BarChart3 size={14} />
            排名总览
          </Link>
          <span className="rounded-md bg-wetland-700 px-3 py-1.5 text-xs font-medium text-white">
            公平性看板
          </span>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* 标题 */}
        <div className="mb-5">
          <h1 className="font-serif text-2xl font-bold text-wetland-800">
            湖南省湿地公园区域公平性看板
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            基于2SFCA两步移动搜索法计算的14市州人均可达性与服务盲区人口比例（问题五成果）
          </p>
        </div>

        {/* 汇总卡片 */}
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-lg border border-wetland-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Award size={12} className="text-wetland-500" />
              公园总数
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-wetland-800">
              {summary.total_parks}
            </div>
          </div>
          <div className="rounded-lg border border-red-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={12} className="text-red-500" />
              盲区总人口
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-red-700">
              {fmtPop(summary.total_blind_population)}
            </div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <AlertTriangle size={12} className="text-amber-500" />
              平均盲区比例
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-amber-700">
              {fmtPct(summary.avg_blind_ratio)}
            </div>
          </div>
          <div className="rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrendingUp size={12} className="text-blue-500" />
              平均人均可达性
            </div>
            <div className="mt-1 font-serif text-xl font-bold text-blue-700">
              {summary.avg_access.toFixed(4)}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            <div className="text-xs text-gray-500">最优/最差市州</div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-700">
                {summary.best_city}
              </span>
              <span className="text-gray-400">/</span>
              <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-700">
                {summary.worst_city}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* 左：人均可达性柱状图 */}
          <div className="rounded-lg border border-wetland-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-wetland-800">
              <TrendingUp size={15} className="text-wetland-600" />
              人均可达性排名（1/km）
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              数值越高表示该市州居民人均可获得的湿地公园服务越充足
            </p>
            <div className="space-y-2">
              {sortedByAccess.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-24 shrink-0 truncate text-xs text-gray-700" title={c.name}>
                    {c.name}
                  </div>
                  <div className="relative h-5 flex-1 rounded bg-gray-100">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${(c.access_per_km / maxAccess) * 100}%`,
                        backgroundColor: c.access_rank <= 3 ? "#1a5f4a" : c.access_rank <= 8 ? "#3d8869" : "#f59e0b",
                      }}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white">
                      {c.access_per_km.toFixed(4)}
                    </span>
                  </div>
                  <span className="w-8 shrink-0 text-right text-[10px] text-gray-400">
                    #{c.access_rank}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 右：盲区人口比例柱状图 */}
          <div className="rounded-lg border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-red-800">
              <AlertTriangle size={15} className="text-red-600" />
              服务盲区人口比例
            </h2>
            <p className="mb-3 text-xs text-gray-500">
              距最近湿地公园超过30km的人口占比，比例越高表示服务覆盖越不足
            </p>
            <div className="space-y-2">
              {sortedByBlind.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-24 shrink-0 truncate text-xs text-gray-700" title={c.name}>
                    {c.name}
                  </div>
                  <div className="relative h-5 flex-1 rounded bg-gray-100">
                    <div
                      className="h-full rounded transition-all"
                      style={{
                        width: `${Math.max((c.blind_ratio / maxBlind) * 100, 1)}%`,
                        backgroundColor:
                          c.blind_ratio >= 0.3 ? "#dc2626" :
                          c.blind_ratio >= 0.1 ? "#f59e0b" :
                          c.blind_ratio >= 0.03 ? "#84cc16" : "#22c55e",
                      }}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold ${c.blind_ratio > maxBlind * 0.5 ? "text-white" : "text-gray-700"}`}>
                      {fmtPct(c.blind_ratio)}
                    </span>
                  </div>
                  <span className="w-16 shrink-0 text-right text-[10px] text-gray-400">
                    {fmtPop(c.blind_population)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 完整数据表 */}
        <div className="mt-6 overflow-x-auto rounded-lg border border-wetland-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-wetland-50">
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold text-wetland-700">可达性排名</th>
                <th className="px-3 py-2.5 text-left font-semibold text-wetland-700">市州</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">总人口</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">平均距离(km)</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">中位距离(km)</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">最大距离(km)</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">盲区人口</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">盲区比例</th>
                <th className="px-3 py-2.5 text-right font-semibold text-wetland-700">人均可达性</th>
              </tr>
            </thead>
            <tbody>
              {sortedByAccess.map((c) => (
                <tr
                  key={c.name}
                  className={`border-t border-gray-50 transition hover:bg-wetland-50/50 ${
                    c.access_rank <= 3 ? "bg-green-50/40" : c.access_rank >= 11 ? "bg-red-50/30" : ""
                  }`}
                >
                  <td className="px-3 py-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        backgroundColor: c.access_rank <= 3 ? "#1a5f4a" : c.access_rank <= 8 ? "#3d8869" : "#f59e0b",
                      }}
                    >
                      {c.access_rank}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium text-wetland-800">{c.name}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{fmtPop(c.population)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{c.mean_distance_km.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{c.median_distance_km.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{c.max_distance_km.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {c.blind_population > 0 ? fmtPop(c.blind_population) : "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                        c.blind_ratio >= 0.3 ? "bg-red-100 text-red-700" :
                        c.blind_ratio >= 0.1 ? "bg-amber-100 text-amber-700" :
                        c.blind_ratio >= 0.03 ? "bg-lime-100 text-lime-700" :
                        "bg-green-100 text-green-700"
                      }`}
                    >
                      {fmtPct(c.blind_ratio)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-serif font-bold text-wetland-700">
                      {c.access_per_km.toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 规划建议 */}
        <div className="mt-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 font-serif text-base font-bold text-amber-800">
            <Lightbulb className="text-amber-600" size={16} />
            规划建议
          </h3>
          <ul className="space-y-1.5 text-xs leading-relaxed text-gray-700">
            <li>
              • <strong>{summary.worst_city}</strong> 盲区比例高达 <strong>{fmtPct(cities.find(c => c.name === summary.worst_city)?.blind_ratio || 0)}</strong>，
              建议优先布局新建湿地公园（参考建园候选区图层）。
            </li>
            <li>
              • <strong>郴州市、邵阳市</strong>盲区人口均超50万，应作为重点补盲对象，结合问题五候选区选址加快落地。
            </li>
            <li>
              • <strong>{summary.best_city}</strong> 可达性最优，但需关注"过度集中"导致的生态压力，参考HAI预警标识强化管理。
            </li>
            <li>
              • 全省平均盲区比例 <strong>{fmtPct(summary.avg_blind_ratio)}</strong>，仍有 <strong>{fmtPop(summary.total_blind_population)}</strong> 人口处于服务盲区，需持续推进湿地公园空间均衡布局。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
