import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import GroupsIcon from "@mui/icons-material/Groups";
import { Typography } from "@mui/material";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CountUp from "react-countup";
import Image from "next/image";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import HiredFiredBarChart from "@/components/charts/HiredFiredBarChart";
import NewHiresOverTimeChart from "@/components/charts/LineChartHiredByMonth";
import EmployeesByDepartment from "@/components/charts/EmployeesByDepartment";

const data = [
  { month: "Янв", hires: 5 },
  { month: "Фев", hires: 8 },
  { month: "Март", hires: 3 },
  { month: "Апр", hires: 9 },
  { month: "Май", hires: 12 },
];

const dataDepartment = [
  { department: "Производственный", employees: 52 },
  { department: "Тех. обслуживание", employees: 28 },
  { department: "Охрана труда", employees: 12 },
  { department: "Кадровый", employees: 6 },
  { department: "Администрация", employees: 9 },
];

const Index = () => {
  return (
    <DashboardLayout headerTitle={"Обзор"}>
      <div className="grid grid-cols-12 gap-4 my-[50px]">
        <div className="col-span-2 bg-white p-4 rounded-md flex items-center justify-start flex-col space-y-[15px]">
          <div className="inline p-4 rounded-full bg-[#5C90FF] ">
            <GroupsIcon
              sx={{ width: "40px", height: "40px", color: "white" }}
            />
          </div>
          <Typography variant="h4" className="mt-2">
            <CountUp end={240} duration={3} />
          </Typography>

          <Typography
            className="text-gray-700 mt-[20px]"
            sx={{ marginTop: "10px", fontSize: "18px", textAlign: "center" }}
          >
            Общее количество сотрудников
          </Typography>
        </div>

        <div className="col-span-2 bg-white p-4 rounded-md flex items-center justify-start flex-col space-y-[15px]">
          <div className=" inline p-5 rounded-full bg-[#5C90FF] ">
            <ContactMailIcon
              sx={{ width: "30px", height: "30px", color: "white" }}
            />
          </div>
          <Typography variant="h4" className="mt-2">
            <CountUp end={15} duration={3} />
          </Typography>

          <Typography
            className="text-gray-700 mt-[20px]"
            sx={{ marginTop: "10px", fontSize: "18px", textAlign: "center" }}
          >
            Новые сотрудники за месяц
          </Typography>
        </div>

        <div className="col-span-2 bg-white p-4 rounded-md flex items-center justify-start flex-col space-y-[15px]">
          <div className=" inline p-5 rounded-full bg-[#5C90FF] ">
            <BusinessCenterIcon
              sx={{ width: "30px", height: "30px", color: "white" }}
            />
          </div>
          <Typography variant="h4" className="mt-2">
            <CountUp end={8} duration={3} />
          </Typography>

          <Typography
            className="text-gray-700 mt-[20px]"
            sx={{ marginTop: "10px", fontSize: "18px", textAlign: "center" }}
          >
            Открытые вакансии
          </Typography>
        </div>

        <div className="col-span-6 bg-white rounded-md flex p-4 flex-col">
          <h3 className="text-xl font-medium mb-1 text-gray-800">
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
            Движение кадров
          </h3>
          <p className="text-gray-500 mb-2">
            Количество принятых и уволенных сотрудников за текущий месяц
          </p>
          <HiredFiredBarChart hired={12} fired={5} />
        </div>
        <div className="col-span-6 p-4 bg-white rounded-md">
          <NewHiresOverTimeChart data={data} />
        </div>
        <div className="col-span-6 p-4 bg-white rounded-md">
          <EmployeesByDepartment data={dataDepartment} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
