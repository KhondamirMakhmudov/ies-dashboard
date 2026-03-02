import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CustomTable from "@/components/table";
import { get } from "lodash";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import dayjs from "dayjs";
import ContentLoader from "@/components/loader";
import useAppTheme from "@/hooks/useAppTheme";
import { normalizeDateInputValue } from "@/utils/normalizeDateInput";

const Index = () => {
  const { bg, isDark, text, border } = useAppTheme();
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(2);
  const [pageSize] = useState(30);

  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16);
  };

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
      size: pageSize,
      page: Math.max(0, currentPage - 1),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    enabled: !!session?.accessToken && !!startDate && !!endDate,
  });

  const columns = [
    {
      header: "№",
      cell: ({ row }) => {
        return (currentPage - 1) * pageSize + (row.index + 1);
      },
    },
    { accessorKey: "empName", header: "Имя сотрудника" },
    {
      accessorKey: "time",
      header: "Время действие",
      cell: ({ getValue }) => {
        const datetime = getValue();
        const date = dayjs(datetime).format("DD.MM.YYYY");
        const time = dayjs(datetime).format("HH:mm:ss");

        return (
          <div className="flex flex-col">
            <span
              className="font-medium"
              style={{ color: text("#1f2937", "#f3f4f6") }}
            >
              {date}
            </span>
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
            className="font-medium p-1 rounded-md border line-clamp-1"
            style={{
              color:
                errorCode === 0
                  ? isDark
                    ? "#4ade80"
                    : "#16a34a"
                  : isDark
                    ? "#f87171"
                    : "#dc2626",
              backgroundColor:
                errorCode === 0
                  ? isDark
                    ? "rgba(34, 197, 94, 0.15)"
                    : "#E8F6F0"
                  : isDark
                    ? "rgba(239, 68, 68, 0.15)"
                    : "#FAE7E7",
              borderColor:
                errorCode === 0
                  ? isDark
                    ? "rgba(34, 197, 94, 0.3)"
                    : "#16a34a"
                  : isDark
                    ? "rgba(239, 68, 68, 0.3)"
                    : "#dc2626",
            }}
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
        const isEnter = event === "enter";

        return (
          <span
            className="font-medium p-1 px-3 rounded-md border"
            style={{
              color: isEnter
                ? isDark
                  ? "#4ade80"
                  : "#16a34a"
                : isDark
                  ? "#f87171"
                  : "#dc2626",
              backgroundColor: isEnter
                ? isDark
                  ? "rgba(34, 197, 94, 0.15)"
                  : "#E8F6F0"
                : isDark
                  ? "rgba(239, 68, 68, 0.15)"
                  : "#FAE7E7",
              borderColor: isEnter
                ? isDark
                  ? "rgba(34, 197, 94, 0.3)"
                  : "#16a34a"
                : isDark
                  ? "rgba(239, 68, 68, 0.3)"
                  : "#dc2626",
            }}
          >
            {isEnter ? "Вход" : "Выход"}
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
            className="font-medium p-1 px-3 rounded-md border items-center gap-1 inline-flex"
            style={{
              color: isDark ? "#60a5fa" : "#1E5EFF",
              backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#ECF2FF",
              borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#1E5EFF",
            }}
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

  return (
    <DashboardLayout headerTitle={"Отчёты всех сотрудников"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="col-span-12 p-6 my-[20px] rounded-md border w-full"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <div className="flex gap-6 items-end flex-wrap">
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
              onChange={(e) =>
                setStartDate(
                  normalizeDateInputValue(e.target.value, "datetime-local"),
                )
              }
              max="9999-12-31T23:59"
              className="!h-[44px] border px-2 rounded-md"
              style={{
                backgroundColor: bg("#ffffff", "#2d2d2d"),
                borderColor: border("#C9C9C9", "#555555"),
                color: text("#1f2937", "#f3f4f6"),
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
              onChange={(e) =>
                setEndDate(
                  normalizeDateInputValue(e.target.value, "datetime-local"),
                )
              }
              max="9999-12-31T23:59"
              className="!h-[44px] border px-2 rounded-md"
              style={{
                backgroundColor: bg("#ffffff", "#2d2d2d"),
                borderColor: border("#C9C9C9", "#555555"),
                color: text("#1f2937", "#f3f4f6"),
              }}
            />
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => {
                const now = new Date();
                const start = new Date();
                start.setHours(0, 0, 0, 0);

                setStartDate(formatDateTime(start));
                setEndDate(formatDateTime(now));
              }}
              className="px-4 py-2 rounded-md transition font-medium"
              style={{
                backgroundColor: isDark ? "#1e40af" : "#3b82f6",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark
                  ? "#1e3a8a"
                  : "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark
                  ? "#1e40af"
                  : "#3b82f6";
              }}
            >
              Сегодня
            </button>

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
              }}
              className="px-4 py-2 rounded-md transition font-medium"
              style={{
                backgroundColor: isDark ? "#1e40af" : "#3b82f6",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark
                  ? "#1e3a8a"
                  : "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark
                  ? "#1e40af"
                  : "#3b82f6";
              }}
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
          className="col-span-12 p-6 my-[20px] rounded-md border w-full"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          <CustomTable
            data={get(reportOfEmployees, "data.content", []).flat()}
            columns={columns}
            pagination={{
              currentPage,
              pageSize,
              total: get(reportOfEmployees, "data.totalElements", 0),
              onPaginationChange: ({ page }) => setCurrentPage(page),
            }}
          />
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Index;
