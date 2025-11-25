import CustomTable from "../table";
import { useEffect, useState } from "react"; // ✅ useState qo'shildi
import { Typography } from "@mui/material";
import { motion } from "framer-motion";
import ContentLoader from "../loader";
import { get, isEmpty } from "lodash";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import dayjs from "dayjs";
import ExcelButton from "../button/excel-button";
import { exportReportToExcel } from "@/utils/exportReportToExcel";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import NoData from "../no-data";

const COLORS = ["#22C55E", "#E7042E"];

const ReportComponent = ({
  data,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  isLoadingReport,
  isFetchingReport,
  fileNameEmployee,
}) => {
  // ✅ Yangi state: tanlangan davr turi
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      const start = new Date();
      start.setHours(0, 0, 0, 0); // 00:00
      const end = new Date();
      end.setHours(23, 59, 59, 999); // 23:59

      setStartDate(formatDateTime(start));
      setEndDate(formatDateTime(end));
      setSelectedPeriod("today"); // ✅ Boshlang'ich qiymat
    }
  }, [startDate, endDate, setStartDate, setEndDate]);

  // ✅ Davr nomlarini olish funksiyasi
  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case "today":
        return "Статистика доступа за сегодня";
      case "yesterday":
        return "Статистика доступа за вчера";
      case "week":
        return "Статистика доступа за неделю";
      case "month":
        return "Статистика доступа за месяц";
      default:
        return "Статистика доступа";
    }
  };

  const exportToExcel = (data, filename = "employees.xlsx") => {
    if (!data || data.length === 0) {
      alert("Ma'lumot topilmadi");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, filename);
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "time",
      header: "Время действие",
      cell: ({ getValue }) => {
        const datetime = getValue();
        const date = dayjs(datetime).format("DD.MM.YYYY");
        const time = dayjs(datetime).format("HH:mm:ss");

        return (
          <div className="flex flex-col">
            <span className="font-medium">{date}</span>
            <span className="text-gray-400 text-xs">{time}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "errorCode",
      header: "Статус",
      cell: ({ getValue }) => {
        const errorCode = getValue();

        return (
          <span
            className={
              errorCode === 0
                ? "text-green-600 font-medium bg-[#E8F6F0] p-1 rounded-md border border-green-600"
                : "text-red-600 font-medium bg-[#FAE7E7] p-1 rounded-md border border-red-600"
            }
          >
            {errorCode === 0 ? "доступ разрешен" : "отказ в доступе"}
          </span>
        );
      },
    },
    {
      accessorKey: "event",
      header: "Событие",
      cell: ({ getValue }) => {
        const event = getValue();
        return (
          <span
            className={
              event
                ? "text-green-600 font-medium bg-[#E8F6F0] p-1 px-3 rounded-md border border-green-600"
                : "text-red-600 font-medium bg-[#FAE7E7] p-1 rounded-md border border-red-600"
            }
          >
            {event === "enter" ? "Вход" : "Выход"}
          </span>
        );
      },
    },
    {
      accessorKey: "eventType",
      header: "Тип доступа",
      cell: ({ getValue }) => {
        const eventType = getValue();
        return (
          <div
            className={
              "text-[#1E5EFF] font-medium bg-[#ECF2FF] p-1 px-3 rounded-md border border-[#1E5EFF]  items-center gap-1 inline-flex"
            }
          >
            <EmojiEmotionsIcon
              sx={{ width: "15px", height: "15px", color: "#1E5EFF" }}
            />
            <span>{eventType === 15 ? "FACE ID" : "Другое"}</span>
          </div>
        );
      },
    },
    { accessorKey: "entryPointName", header: "Точка входа" },
  ];

  const accessGranted = data.filter((e) => e.errorCode === 0).length;
  const accessDenied = data.filter((e) => e.errorCode !== 0).length;

  const pieData = [
    { name: "Доступ разрешен", value: accessGranted },
    { name: "Отказ в доступе", value: accessDenied },
  ];

  return (
    <>
      <div className="grid grid-cols-12 gap-4 self-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`bg-white ${
            isEmpty(data) ? "col-span-12" : "col-span-8"
          } p-6 rounded-md border border-[#E9E9E9] `}
        >
          <div className="border-b border-b-gray-200 pb-[10px] flex justify-between">
            <Typography
              variant="h6"
              sx={{ fontSize: "20px", fontWeight: "600" }}
            >
              Отчёты о сотруднике
            </Typography>

            <ExcelButton
              onClick={() =>
                exportReportToExcel(data, getPeriodTitle(), fileNameEmployee)
              }
              enableHover={false}
            />
          </div>
          <div className="flex gap-6 items-end flex-wrap mt-[15px]">
            {/* Start date */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата начала
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedPeriod("custom"); // ✅ Custom tanlanganida
                }}
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
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedPeriod("custom"); // ✅ Custom tanlanganida
                }}
                className="!h-[44px] border !border-[#C9C9C9] px-2 rounded-md"
              />
            </div>

            <div className="flex gap-3 mb-4">
              {/* Сегодня */}
              <button
                onClick={() => {
                  const start = new Date();
                  start.setHours(0, 0, 0, 0);
                  const end = new Date();
                  end.setHours(23, 59, 59, 999);

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                  setSelectedPeriod("today"); // ✅ Davrni belgilash
                }}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  selectedPeriod === "today"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Сегодня
              </button>

              {/* Вчера */}
              <button
                onClick={() => {
                  const start = new Date();
                  start.setDate(start.getDate() - 1);
                  start.setHours(0, 0, 0, 0);
                  const end = new Date();
                  end.setDate(end.getDate() - 1);
                  end.setHours(23, 59, 59, 999);

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                  setSelectedPeriod("yesterday"); // ✅ Davrni belgilash
                }}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  selectedPeriod === "yesterday"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Вчера
              </button>

              {/* Последние 7 дней (неделя) */}
              <button
                onClick={() => {
                  const end = new Date();
                  end.setHours(23, 59, 59, 999);
                  const start = new Date();
                  start.setDate(start.getDate() - 6);
                  start.setHours(0, 0, 0, 0);

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                  setSelectedPeriod("week"); // ✅ Davrni belgilash
                }}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  selectedPeriod === "week"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Неделя
              </button>

              {/* Один месяц */}
              <button
                onClick={() => {
                  const end = new Date();
                  end.setHours(23, 59, 59, 999);
                  const start = new Date();
                  start.setMonth(start.getMonth() - 1);
                  start.setHours(0, 0, 0, 0);

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                  setSelectedPeriod("month"); // ✅ Davrni belgilash
                }}
                className={`px-4 py-2 rounded-md transition cursor-pointer ${
                  selectedPeriod === "month"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Месяц
              </button>
            </div>
          </div>

          {isEmpty(data) ? (
            <NoData
              title="Нет данных"
              description="За выбранный период данные по сотрудникам не найдены. Попробуйте изменить диапазон дат"
            />
          ) : (
            <div>
              {isLoadingReport || isFetchingReport ? (
                <ContentLoader />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white my-[20px]   w-full p-3 rounded-md border border-gray-200"
                >
                  <CustomTable data={data} columns={columns} />
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {!isEmpty(data) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white col-span-4 self-start p-6 rounded-md border border-gray-200"
          >
            {/* ✅ Yangilangan sarlavha */}
            <h3 className="text-lg font-semibold mb-4">{getPeriodTitle()}</h3>

            {/* Statistik ma'lumotlar */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {accessGranted}
                </div>
                <div className="text-sm text-green-700">Разрешено</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {accessDenied}
                </div>
                <div className="text-sm text-red-700">Запрещено</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => `Количество: ${label}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ReportComponent;
