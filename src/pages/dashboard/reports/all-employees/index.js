import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CustomTable from "@/components/table";
import { get } from "lodash";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import dayjs from "dayjs";
import ContentLoader from "@/components/loader";

const Index = () => {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Format function: converts to 'YYYY-MM-DDTHH:mm'
  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16);
  };

  // Set default date range on first render (last 7 days)
  useEffect(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 1);

    setStartDate(formatDateTime(weekAgo));
    setEndDate(formatDateTime(now));
  }, []);

  const {
    data: reportOfEmployees,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.reportOfEmployees,
    url: URLS.reportOfEmployees,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "empName", header: "Имя сотрудника" },
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
    { accessorKey: "structureName", header: "Отдел" },
  ];

  const employees = get(reportOfEmployees, "data", []).flat();

  // Statistikalar
  const onTimeCount = employees.filter((emp) => emp.errorCode === 0).length;
  const lateCount = employees.filter((emp) => emp.errorCode !== 0).length;

  return (
    <DashboardLayout headerTitle={"Отчёты всех сотрудников"}>
      <div className="flex gap-6 my-6">
        {/* Vaqtida kelganlar */}
        <div className="flex-1 bg-[#E8F6F0] border border-green-600 rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold text-green-700">
            Пришли вовремя
          </h3>
          <p className="text-3xl font-bold text-green-800">{onTimeCount}</p>
        </div>

        {/* Kechikkanlar */}
        <div className="flex-1 bg-[#FAE7E7] border border-red-600 rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold text-red-700">Опоздавшие</h3>
          <p className="text-3xl font-bold text-red-800">{lateCount}</p>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white col-span-12 p-6 my-[50px] rounded-md shadow-md w-full"
      >
        <div className="flex gap-6 items-end flex-wrap">
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
            <button
              onClick={() => {
                const now = new Date();
                const start = new Date();
                start.setHours(0, 0, 0, 0); // bugun 00:00

                setStartDate(formatDateTime(start));
                setEndDate(formatDateTime(now));
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Сегодня
            </button>

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
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Вчера
            </button>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      {isLoading || isFetching ? (
        <ContentLoader />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white col-span-12 p-6 my-[50px] rounded-md shadow-md w-full"
        >
          <CustomTable
            data={get(reportOfEmployees, "data", []).flat()}
            columns={columns}
          />
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Index;
