/** 排名总览表：70公园完整排名 */
import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { parks } from "@/utils/data";
import { getScoreLevel } from "@/utils/types";
import { DIM_LABELS, DIM_KEYS } from "@/utils/types";
import type { ParkProperties } from "@/utils/types";

type SortKey = "rank" | "score" | "area" | "A1" | "A2" | "A3" | "A4" | "A5" | "A6" | "A7";

export default function RankingTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let list = parks.map((p) => p.properties);
    if (search) {
      list = list.filter((p) =>
        p.name.includes(search) || p.city.includes(search) || p.type.includes(search)
      );
    }
    const dimMap: Record<string, keyof ParkProperties["dims"]> = {
      A1: "A1", A2: "A2", A3: "A3", A4: "A4", A5: "A5", A6: "A6", A7: "A7",
    };
    list.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "rank") { av = a.topsis_rank; bv = b.topsis_rank; }
      else if (sortKey === "score") { av = a.topsis_score; bv = b.topsis_score; }
      else if (sortKey === "area") { av = a.area_ha; bv = b.area_ha; }
      else { av = a.dims[dimMap[sortKey]]; bv = b.dims[dimMap[sortKey]]; }
      return sortAsc ? av - bv : bv - av;
    });
    return list;
  }, [search, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={10} className="text-gray-300" />;
    return sortAsc
      ? <ArrowUp size={10} className="text-wetland-600" />
      : <ArrowDown size={10} className="text-wetland-600" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <h1 className="font-serif text-2xl font-bold text-wetland-800">
          70个湿地公园综合排名
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          按TOPSIS综合得分排序，可点击列头排序或搜索筛选
        </p>
      </div>

      {/* 搜索框 */}
      <div className="mb-4 relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索公园名称/市州/类型..."
          className="w-full rounded-lg border border-wetland-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-wetland-500 focus:outline-none focus:ring-1 focus:ring-wetland-500"
        />
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto rounded-lg border border-wetland-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-wetland-50">
            <tr>
              <th
                className="cursor-pointer px-3 py-2.5 text-left font-semibold text-wetland-700"
                onClick={() => handleSort("rank")}
              >
                <span className="flex items-center gap-1">排名 <SortIcon col="rank" /></span>
              </th>
              <th className="px-3 py-2.5 text-left font-semibold text-wetland-700">公园名称</th>
              <th className="px-3 py-2.5 text-left font-semibold text-wetland-700">类型</th>
              <th className="px-3 py-2.5 text-left font-semibold text-wetland-700">市州</th>
              <th
                className="cursor-pointer px-3 py-2.5 text-right font-semibold text-wetland-700"
                onClick={() => handleSort("area")}
              >
                <span className="flex items-center justify-end gap-1">面积(公顷) <SortIcon col="area" /></span>
              </th>
              <th
                className="cursor-pointer px-3 py-2.5 text-right font-semibold text-wetland-700"
                onClick={() => handleSort("score")}
              >
                <span className="flex items-center justify-end gap-1">TOPSIS <SortIcon col="score" /></span>
              </th>
              {DIM_KEYS.map((k, i) => (
                <th
                  key={k}
                  className="cursor-pointer px-3 py-2.5 text-right font-semibold text-wetland-700"
                  onClick={() => handleSort(k as SortKey)}
                >
                  <span className="flex items-center justify-end gap-1">
                    {DIM_LABELS[i].slice(0, 2)} <SortIcon col={k as SortKey} />
                  </span>
                </th>
              ))}
              <th className="px-3 py-2.5 text-left font-semibold text-wetland-700">HAI等级</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const level = getScoreLevel(p.topsis_score);
              return (
                <tr
                  key={p.name}
                  className="border-t border-gray-50 transition hover:bg-wetland-50/50"
                >
                  <td className="px-3 py-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: level.color }}
                    >
                      {p.topsis_rank}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium text-wetland-800">{p.name}</td>
                  <td className="px-3 py-2 text-gray-600">{p.type}</td>
                  <td className="px-3 py-2 text-gray-600">{p.city}</td>
                  <td className="px-3 py-2 text-right text-gray-600">
                    {p.area_ha.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-serif font-bold text-wetland-700">
                      {p.topsis_score.toFixed(3)}
                    </span>
                  </td>
                  {DIM_KEYS.map((k) => (
                    <td key={k} className="px-3 py-2 text-right text-gray-500">
                      {p.dims[k].toFixed(2)}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <span className="text-xs text-gray-500">{p.hai_level}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        共 {filtered.length} 个公园
      </div>
    </div>
  );
}
