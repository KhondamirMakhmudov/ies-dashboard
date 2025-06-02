import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

const NewHiresOverTimeChart = ({ data }) => {
  return (
    <div className="w-full h-74 bg-white  p-4 ">
      <h3 className="text-lg font-medium mb-2 text-gray-800">
        <SignalCellularAltIcon
          sx={{
            color: "white",
            background: "#5C90FF",
            padding: "8px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
          }}
        />{" "}
        Принятые сотрудники по месяцам
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="hires"
            stroke="#318CE7"
            strokeWidth={2}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NewHiresOverTimeChart;
