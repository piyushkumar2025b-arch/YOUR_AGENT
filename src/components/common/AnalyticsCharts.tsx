import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface AnalyticsDataPoint {
  time: string;
  value: number;
  secondary?: number;
}

interface AnalyticsChartsProps {
  data: AnalyticsDataPoint[];
  title?: string;
  color?: string;
}

export const AnalyticsAreaChart: React.FC<AnalyticsChartsProps> = ({
  data,
  title = "System Activity Trend",
  color = "#6366f1"
}) => {
  return (
    <div className="w-full p-4 rounded-2xl border border-zinc-800 bg-zinc-900/90 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">{title}</h4>
      </div>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="time" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#3f3f46",
                borderRadius: "8px",
                color: "#f4f4f5"
              }}
            />
            <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
