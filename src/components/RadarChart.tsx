/** 七维雷达图组件 */
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import type { ParkDims } from "@/utils/types";
import { DIM_LABELS, DIM_KEYS } from "@/utils/types";

interface RadarChartProps {
  dims: ParkDims;
  color?: string;
  height?: number;
}

export default function ParkRadarChart({ dims, color = "#1a5f4a", height = 200 }: RadarChartProps) {
  const data = DIM_KEYS.map((k, i) => ({
    dim: DIM_LABELS[i],
    value: Math.round(dims[k] * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#dceee7" />
        <PolarAngleAxis dataKey="dim" tick={{ fontSize: 11, fill: "#164d3c" }} />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: "#8dc4ac" }}
          axisLine={false}
        />
        <Radar
          dataKey="value"
          stroke={color}
          fill={color}
          fillOpacity={0.45}
          strokeWidth={2.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
