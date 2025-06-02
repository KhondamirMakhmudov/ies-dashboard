import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const HiredFiredBarChart = ({ hired = 0, fired = 0 }) => {
  const data = [
    { name: "Приняты на работу", value: hired, color: "#318CE7" }, // yashil
    { name: "Приняты на работу", value: fired, color: "#28E1E7" }, // qizil
  ];

  return (
    <div className="w-full h-28">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{
              fontSize: 12,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          <Tooltip />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HiredFiredBarChart;
