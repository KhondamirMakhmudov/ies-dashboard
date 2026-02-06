import CustomTable from "../table";
import { useEffect, useState } from "react";
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
import useAppTheme from "@/hooks/useAppTheme";

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
  name,
}) => {
  const { isDark, bg, text, border } = useAppTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      setStartDate(formatDateTime(start));
      setEndDate(formatDateTime(end));
      setSelectedPeriod("today");
    }
  }, [startDate, endDate, setStartDate, setEndDate]);

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
            <span
              className="text-xs"
              style={{ color: text("#9ca3af", "#6b7280") }}
            >
              {time}
            </span>
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
            className={`font-medium p-1 rounded-md border ${
              errorCode === 0
                ? isDark
                  ? "text-green-400 bg-green-900/30 border-green-600"
                  : "text-green-600 bg-[#E8F6F0] border-green-600"
                : isDark
                  ? "text-red-400 bg-red-900/30 border-red-600"
                  : "text-red-600 bg-[#FAE7E7] border-red-600"
            }`}
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
            className={`font-medium p-1 px-3 rounded-md border ${
              event
                ? isDark
                  ? "text-green-400 bg-green-900/30 border-green-600"
                  : "text-green-600 bg-[#E8F6F0] border-green-600"
                : isDark
                  ? "text-red-400 bg-red-900/30 border-red-600"
                  : "text-red-600 bg-[#FAE7E7] border-red-600"
            }`}
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
            className={`font-medium p-1 px-3 rounded-md border items-center gap-1 inline-flex ${
              isDark
                ? "text-blue-400 bg-blue-900/30 border-blue-600"
                : "text-[#1E5EFF] bg-[#ECF2FF] border-[#1E5EFF]"
            }`}
          >
            <EmojiEmotionsIcon
              sx={{
                width: "15px",
                height: "15px",
                color: isDark ? "#60a5fa" : "#1E5EFF",
              }}
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
          className={`${
            isEmpty(data) ? "col-span-12" : "col-span-8"
          } p-6 rounded-md border`}
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e9e9e9", "#333333"),
          }}
        >
          <div
            className="border-b pb-[10px] flex justify-between"
            style={{ borderColor: border("#e5e7eb", "#333333") }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "20px",
                fontWeight: "600",
                color: text("#000000", "#f3f4f6"),
              }}
            >
              Отчёты о сотруднике
            </Typography>

            <ExcelButton
              onClick={() =>
                exportReportToExcel(
                  data,
                  name,
                  getPeriodTitle(),
                  fileNameEmployee,
                )
              }
              enableHover={false}
            />
          </div>
          <div className="flex gap-6 items-end flex-wrap mt-[15px]">
            {/* Start date */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: text("#374151", "#d1d5db") }}
              >
                Дата начала
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedPeriod("custom");
                }}
                className="!h-[44px] border px-2 rounded-md"
                style={{
                  backgroundColor: bg("#ffffff", "#2a2a2a"),
                  borderColor: border("#c9c9c9", "#4b5563"),
                  color: text("#000000", "#f3f4f6"),
                }}
              />
            </div>

            {/* End date */}
            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: text("#374151", "#d1d5db") }}
              >
                Дата окончания
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedPeriod("custom");
                }}
                className="!h-[44px] border px-2 rounded-md"
                style={{
                  backgroundColor: bg("#ffffff", "#2a2a2a"),
                  borderColor: border("#c9c9c9", "#4b5563"),
                  color: text("#000000", "#f3f4f6"),
                }}
              />
            </div>

            <div className="flex gap-3 mb-4">
              {/* Period buttons */}
              {[
                { key: "today", label: "Сегодня" },
                { key: "yesterday", label: "Вчера" },
                { key: "week", label: "Неделя" },
                { key: "month", label: "Месяц" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    let start = new Date();
                    let end = new Date();

                    if (key === "today") {
                      start.setHours(0, 0, 0, 0);
                      end.setHours(23, 59, 59, 999);
                    } else if (key === "yesterday") {
                      start.setDate(start.getDate() - 1);
                      start.setHours(0, 0, 0, 0);
                      end.setDate(end.getDate() - 1);
                      end.setHours(23, 59, 59, 999);
                    } else if (key === "week") {
                      end.setHours(23, 59, 59, 999);
                      start.setDate(start.getDate() - 6);
                      start.setHours(0, 0, 0, 0);
                    } else if (key === "month") {
                      end.setHours(23, 59, 59, 999);
                      start.setMonth(start.getMonth() - 1);
                      start.setHours(0, 0, 0, 0);
                    }

                    setStartDate(formatDateTime(start));
                    setEndDate(formatDateTime(end));
                    setSelectedPeriod(key);
                  }}
                  className={`px-4 py-2 rounded-md transition cursor-pointer ${
                    selectedPeriod === key
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {label}
                </button>
              ))}
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
                  className="my-[20px] w-full p-3 rounded-md border"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
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
            className="col-span-4 self-start p-6 rounded-md border"
            style={{
              backgroundColor: bg("#ffffff", "#1e1e1e"),
              borderColor: border("#e5e7eb", "#333333"),
            }}
          >
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: text("#000000", "#f3f4f6") }}
            >
              {getPeriodTitle()}
            </h3>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className="border rounded-lg p-3 text-center"
                style={{
                  backgroundColor: isDark ? "#14532d" : "#f0fdf4",
                  borderColor: isDark ? "#16a34a" : "#bbf7d0",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: isDark ? "#4ade80" : "#16a34a" }}
                >
                  {accessGranted}
                </div>
                <div
                  className="text-sm"
                  style={{ color: isDark ? "#86efac" : "#15803d" }}
                >
                  Разрешено
                </div>
              </div>
              <div
                className="border rounded-lg p-3 text-center"
                style={{
                  backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
                  borderColor: isDark ? "#dc2626" : "#fecaca",
                }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: isDark ? "#f87171" : "#dc2626" }}
                >
                  {accessDenied}
                </div>
                <div
                  className="text-sm"
                  style={{ color: isDark ? "#fca5a5" : "#b91c1c" }}
                >
                  Запрещено
                </div>
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
                  contentStyle={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#e5e7eb", "#333333"),
                    color: text("#000000", "#f3f4f6"),
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: text("#000000", "#f3f4f6"),
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ReportComponent;
