import CustomTable from "../table";
import { useEffect } from "react";
import { Typography } from "@mui/material";
import { motion } from "framer-motion";
import ContentLoader from "../loader";
import { get, isEmpty } from "lodash";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import dayjs from "dayjs";
import ExcelButton from "../button/excel-button";
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
}) => {
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
    }
  }, [startDate, endDate, setStartDate, setEndDate]);

  const exportToExcel = (data, filename = "employees.xlsx") => {
    if (!data || data.length === 0) {
      alert("Ma'lumot topilmadi");
      return;
    }

    // 1. API dan kelgan obyektlarni oddiy array-of-objects ko‘rinishga o‘tkazamiz
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Workbook yaratamiz
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // 3. Blob qilib olish va yuklab berish
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
        const datetime = getValue(); // masalan: "2025-07-22T11:14:56"
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
            {errorCode === 0
              ? "доступ разрешен"
              : "отказ в доступе (режим графика)"}
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
    // { accessorKey: "structureName", header: "Отдел" },
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
          <div className="border-b border-b-gray-200 pb-[10px]">
            <Typography
              variant="h6"
              sx={{ fontSize: "20px", fontWeight: "600" }}
            >
              Отчёты о сотруднике
            </Typography>
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
                className="!h-[44px] border !border-[#C9C9C9] px-2 rounded-md"
              />
            </div>

            <div className="flex gap-3 mb-4">
              {/* Сегодня */}
              <button
                onClick={() => {
                  const start = new Date();
                  start.setHours(0, 0, 0, 0); // bugun 00:00

                  const end = new Date();
                  end.setHours(23, 59, 59, 999); // bugun 23:59

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Сегодня
              </button>

              {/* Вчера */}
              <button
                onClick={() => {
                  const start = new Date();
                  start.setDate(start.getDate() - 1);
                  start.setHours(0, 0, 0, 0); // kecha 00:00

                  const end = new Date();
                  end.setDate(end.getDate() - 1);
                  end.setHours(23, 59, 59, 999); // kecha 23:59

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Вчера
              </button>

              {/* Последние 7 дней (неделя) */}
              <button
                onClick={() => {
                  const end = new Date();
                  end.setHours(23, 59, 59, 999); // bugun 23:59

                  const start = new Date();
                  start.setDate(start.getDate() - 6); // oxirgi 7 kun (bugun ham ichida)
                  start.setHours(0, 0, 0, 0);

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Неделя
              </button>

              {/* Один месяц */}
              <button
                onClick={() => {
                  const end = new Date();
                  end.setHours(23, 59, 59, 999); // bugun 23:59

                  const start = new Date();
                  start.setMonth(start.getMonth() - 1); // 1 oy oldin
                  start.setHours(0, 0, 0, 0);

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition cursor-pointer"
              >
                Месяц
              </button>
            </div>
          </div>

          <ExcelButton
            onClick={() => exportToExcel(data)}
            enableHover={false}
          />
        </motion.div>

        {!isEmpty(data) && (
          <div className="bg-white col-span-4 p-6 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Статистика доступа</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
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
    </>
  );
};

export default ReportComponent;
