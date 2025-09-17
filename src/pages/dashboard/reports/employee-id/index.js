import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "@/components/input";
import Image from "next/image";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { exportToExcelStyled } from "@/utils/exportToExcelStyled";
import { getEmployeesLogsByRange } from "@/utils/getEmployeesLogsByRange";
import { toast } from "react-hot-toast";
import ContentLoader from "@/components/loader";
import { useSession } from "next-auth/react";
import CustomTable from "@/components/table";
import DownloadIcon from "@mui/icons-material/Download";
import useGetQuery from "@/hooks/java/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { get, isEmpty } from "lodash";
import dayjs from "dayjs";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import NoData from "@/components/no-data";

// ✅ Recharts import
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22C55E", "#EF4444"]; // yashil / qizil

const Index = () => {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: employeeRange,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: [KEYS.logEntersOfEmployees, employeeId, shouldFetch],
    url: `${URLS.logEntersOfEmployeeById}${employeeId}/dates/new-output`,
    params: {
      startDate: startDate,
      endDate: endDate,
    },
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!shouldFetch,
  });

  const token = session?.accessToken;
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await getEmployeesLogsByRange({
        token,
        rangeString: employeeId,
        startDate,
        endDate,
      });

      if (!data || data.length === 0) {
        toast.error("Ma'lumot topilmadi.");
        return;
      }

      exportToExcelStyled(data);
      toast.success("Excel файл успешно загружен.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при загрузке Excel файла.");
    } finally {
      setIsExporting(false);
    }
  };
  const handleFetch = () => {
    if (!employeeId) {
      toast.error("Пожалуйста, введите диапазон ID сотрудников.");
      return;
    }
    if (!startDate) {
      toast.error("Пожалуйста, выберите дату начала.");
      return;
    }
    if (!endDate) {
      toast.error("Пожалуйста, выберите дату окончания.");
      return;
    }

    setShouldFetch(true);
  };

  if (!isClient) return null;

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    { header: "Имя", accessorKey: "empName" },
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
          <div className="text-[#1E5EFF] font-medium bg-[#ECF2FF] p-1 px-3 rounded-md border border-[#1E5EFF]  items-center gap-1 inline-flex">
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

  // ✅ ErrorCode statistikasi
  const employees = get(employeeRange, "data", []);
  const accessGranted = employees.filter((e) => e.errorCode === 0).length;
  const accessDenied = employees.filter((e) => e.errorCode !== 0).length;

  const pieData = [
    { name: "Доступ разрешен", value: accessGranted },
    { name: "Отказ в доступе", value: accessDenied },
  ];

  return (
    <DashboardLayout headerTitle={"Отчеты"}>
      <div className="grid grid-cols-12 gap-[12px]  my-[50px]">
        {isExporting ? (
          <div className="col-span-12">
            <ContentLoader />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-white ${
              isEmpty(employees) ? "col-span-12" : "col-span-8"
            } p-6 rounded-md border border-gray-200 w-full`}
          >
            {/* Filtr formasi */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Сотрудники (диапазон ID ##-##)
              </label>
              <Input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                inputClass={"!h-[44px] !border !border-[#E9E9E9]"}
                placeholder="например, 1-10 или 5"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата начала:
              </label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                inputClass={"!h-[44px] !border !border-[#E9E9E9]"}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата окончания:
              </label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                inputClass={"!h-[44px] !border !border-[#E9E9E9]"}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleFetch}
                className="flex gap-x-[10px] bg-blue-500 hover:bg-blue-600 px-[15px] py-[11px] rounded-[8px] text-white"
              >
                <DownloadIcon sx={{ color: "white" }} />
                Загрузить
              </button>
              <button
                onClick={handleExport}
                className="flex gap-x-[10px] bg-[#00733B] hover:bg-[#00632F] px-[15px] py-[9px] rounded-[8px] text-white"
              >
                <Image
                  src={"/icons/excel.svg"}
                  alt="excel"
                  width={28}
                  height={28}
                />
                Выгрузить в Excel
              </button>
            </div>
          </motion.div>
        )}

        {!isEmpty(employees) && (
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

      {/* ✅ PieChart */}

      {isEmpty(employees) ? (
        <NoData
          title="Нет данных"
          description="За выбранный период данные по сотрудникам не найдены. Попробуйте изменить диапазон дат или ID."
        />
      ) : (
        <motion.div className="bg-white p-6 rounded-md border border-gray-200">
          <CustomTable columns={columns} data={employees} />
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Index;
