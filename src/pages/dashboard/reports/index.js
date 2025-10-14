import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import CustomSelect from "@/components/select";
import Input from "@/components/input";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { get } from "lodash";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { exportToExcelStyled } from "@/utils/exportToExcelStyled";
import StatisticCard from "@/components/card/statisticCard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CameraswitchIcon from "@mui/icons-material/Cameraswitch";
import BusinessIcon from "@mui/icons-material/Business";
import EastIcon from "@mui/icons-material/East";
import Link from "next/link";

const ExportEmployeesPage = () => {
  const { data: session } = useSession();

  const [selectStructureId, setSelectStructureId] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  };

  // ✅ 1. Get all structures
  const { data: structureOfOrganizations } = useGetQuery({
    key: KEYS.structureOfOrganizations,
    url: URLS.structureOfOrganizations,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const options = get(structureOfOrganizations, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.nameDep,
  }));

  // ✅ 2. Get employees of selected structure
  const {
    data: employeesByStructure,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: [
      KEYS.logEntersOfEmployeesByStructure,
      selectStructureId,
      startDate,
      endDate,
    ],
    url: `${URLS.logEntersOfEmployeesByStructure}${selectStructureId}/dates/new-output`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      startDate: startDate,
      endDate: endDate,
    },
    enabled:
      !!session?.accessToken && !!selectStructureId && !!startDate && !!endDate,
  });

  console.log(employeesByStructure);

  // ✅ 3. Export to Excel handler
  const handleExport = () => {
    exportToExcelStyled(employeesByStructure);
  };

  const handleToday = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    setStartDate(formatDateTime(start));
    setEndDate(formatDateTime(end));
  };

  const handleWeek = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    setStartDate(formatDateTime(start));
    setEndDate(formatDateTime(end));
  };

  const handleMonth = () => {
    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    setStartDate(formatDateTime(start));
    setEndDate(formatDateTime(end));
  };

  return (
    <DashboardLayout headerTitle={"Отчёты"}>
      {/* <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white col-span-12 p-6 my-[20px] rounded-md border border-gray-200 w-full"
      >
        <div className="flex w-full">
          <div className="flex-1">
            <StatisticCard
              title="Количество сотрудников"
              quantity={30}
              icon={<PeopleAltIcon sx={{ color: "#1E5EFF" }} />}
              bgColor={"bg-[#ECF2FF]"}
            />
          </div>
          <div className="w-[1px] h-auto bg-[#E6E9F4] mx-4" />

          <div className="flex-1">
            <StatisticCard
              title="Количество камер"
              quantity={20}
              icon={<CameraswitchIcon sx={{ color: "#00A76F" }} />}
              bgColor={"bg-[#D7FAE4]"}
            />
          </div>
          <div className="w-[1px] h-auto bg-[#E6E9F4] mx-4" />

          <div className="flex-1">
            <StatisticCard
              title="Количество сотрудников"
              quantity={10}
              icon={<BusinessIcon sx={{ color: "#9448F2" }} />}
              bgColor={"bg-[#F5E8FF]"}
            />
          </div>
          <div className="w-[1px] h-auto bg-[#E6E9F4] mx-4" quantity={15} />

          <div className="flex-1">
            <StatisticCard title="Количество сотрудников" quantity={20} />
          </div>
        </div>
      </motion.div> */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white col-span-12 p-6 my-[20px] rounded-md border border-gray-200 w-full "
      >
        <div className="flex gap-6 items-end justify-between flex-wrap">
          {/* Start date */}
          <div className="flex gap-6 items-end flex-wrap">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата начала
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="!h-[44px] border !border-[#C9C9C9] px-2 rounded-md"
              />
            </div>

            {/* End date */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата окончания
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="!h-[44px] border !border-[#C9C9C9] px-2 rounded-md   "
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleToday}
                className="bg-blue-500 text-white px-7 py-[10px] cursor-pointer rounded-md hover:bg-blue-600"
              >
                Сегодня
              </button>
              <button
                onClick={handleWeek}
                className="bg-blue-500 text-white px-7 py-[10px] cursor-pointer rounded-md hover:bg-blue-600"
              >
                Неделя
              </button>
              <button
                onClick={handleMonth}
                className="bg-blue-500 text-white px-7 py-[10px] cursor-pointer rounded-md hover:bg-blue-600"
              >
                Месяц
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white col-span-12 p-6 my-[20px] rounded-md border border-gray-200 w-full"
      >
        {/* Select structure */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Структура организации
          </label>
          <CustomSelect
            options={options}
            value={selectStructureId}
            onChange={(val) => setSelectStructureId(val)}
            returnObject={false}
          />
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="flex gap-x-[10px] bg-[#00733B] hover:bg-[#00733bf1] scale-100 active:scale-90 lg:py-[9px] py-[10px] lg:px-[15px] px-[10px] items-center rounded-[8px] transform-all duration-200 cursor-pointer"
        >
          <Image src={"/icons/excel.svg"} alt="excel" width={28} height={28} />
          <p className="text-xs lg:text-sm font-gilroy text-white">
            Выгрузить в Excel
          </p>
        </button>
      </motion.div>
    </DashboardLayout>
  );
};

export default ExportEmployeesPage;
