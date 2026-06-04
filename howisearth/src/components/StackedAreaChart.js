import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

// A colour per line; cycles if there are more series than colours.
const COLORS = [
  '#4f46e5', '#16a34a', '#ea580c', '#0891b2',
  '#dc2626', '#9333ea', '#ca8a04', '#0d9488',
];

// One line per series. `chartData` is an array of rows keyed by year (see
// App.js); `series` lists the keys to draw. ResponsiveContainer lets the chart
// fill whatever width the layout gives it; connectNulls keeps biennial/sparse
// series (e.g. waste) from breaking into disconnected dots.
const RenderChart = ({ chartData = [], series = [] }) => {
  if (chartData.length === 0 || series.length === 0) {
    return <p className="chart-empty">Pick a country from the sidebar to plot it.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={520}>
      <LineChart data={chartData} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
        <CartesianGrid stroke="#eee" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        {series.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[i % COLORS.length]}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RenderChart;
