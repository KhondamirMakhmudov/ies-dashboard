import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

const EmployeesByDepartment = ({ data }) => {
  return (
    <div className="w-full h-74 bg-white p-4 rounded-xl ">
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
        Сотрудники по отделам
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="department"
            type="category"
            width={100}
            tick={{
              fontSize: 12,
              wordBreak: "break-word",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          />
          <Tooltip />
          <Bar dataKey="employees" fill="#318CE7" barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmployeesByDepartment;
