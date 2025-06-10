import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { Button, Typography } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
const Index = () => {
  const [departments, setDepartments] = useState(false);

  const toggleDepartments = () => {
    setDepartments(!departments);
  };
  return (
    <DashboardLayout headerTitle={"Структура организации"}>
      <div className="grid grid-cols-12 gap-4 my-[50px]">
        <div className="col-span-3 bg-white p-[24px] rounded-md ">
          <div className="flex justify-between">
            <Typography variant="h6" className="mb-4">
              Отделы
            </Typography>

            <Button
              onClick={toggleDepartments}
              variant="text"
              sx={{
                borderRadius: "100%",
                padding: 0,
                minWidth: 0,
                width: "32px",
                height: "32px",
                border: "1px solid #4182F9",
                transform: departments ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <KeyboardArrowDownIcon />
            </Button>
          </div>
        </div>
        <div className="col-span-9 bg-white p-[24px] rounded-md ">
          <Typography variant="h6" className="mb-4">
            Список сотрудников
          </Typography>
        </div>
      </div>
      {/* <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between"></div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">No organizations found.</p>
        </div>
      </div> */}
    </DashboardLayout>
  );
};

export default Index;
