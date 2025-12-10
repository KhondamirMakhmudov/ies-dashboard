import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "lodash";
import CustomSelect from "@/components/select";
import Input from "@/components/input";
import DateRangeIcon from "@mui/icons-material/DateRange";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { getEmployeesLogsByRange } from "@/utils/getEmployeesLogsByRange";
import { exportToExcelStyled } from "@/utils/exportToExcelStyled";
import toast from "react-hot-toast";
import Image from "next/image";
import { config } from "@/config";
import useAppTheme from "@/hooks/useAppTheme";

const Index = () => {
  const { bg, isDark, text, border } = useAppTheme();
  const { data: session } = useSession();

  const [selectOrgUnitCode, setSelectOrgUnitCode] = useState(null);
  const [selectEntryPointId, setSelectEntryPointId] = useState(null);

  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const { data: orgUnits } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { limit: 150 },
  });

  const optionsOrgUnits = get(orgUnits, "data", []).map((item) => ({
    value: item.unit_code,
    label: item.name,
  }));

  const isFormComplete = selectOrgUnitCode && startDateTime && endDateTime;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleExport = async () => {
    try {
      const data = await getEmployeesLogsByRange({
        token: session?.accessToken,
        employeeIds: [selectOrgUnitCode],
        startDate: startDateTime,
        baseUrl: `${config.JAVA_API_URL}`,
        endDate: endDateTime,
        endpoint: `${URLS.logsByOrgUnitCodeAndEntrypointId}`,
        pathSuffix: `/dates`,
      });

      if (!data || data.length === 0) {
        toast.error("Данные не найдены.", { id: "exporting" });
        return;
      }

      exportToExcelStyled(data);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при загрузке Excel файла.", { id: "exporting" });
    }
  };

  return (
    <DashboardLayout headerTitle="Отчёты по подразделениям">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className=" "
      >
        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-md border my-[15px] overflow-hidden"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          {/* Card Header */}
          <div
            className="px-6 sm:px-8 py-6 border-b"
            style={{
              backgroundColor: bg("#ffffff", "#1e1e1e"),
              borderColor: border("#f3f4f6", "#374151"),
            }}
          >
            <h2
              className="text-lg sm:text-xl font-semibold flex items-center gap-2"
              style={{ color: text("#1f2937", "#f3f4f6") }}
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Параметры фильтрации
            </h2>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Selection Section */}
            <motion.div variants={itemVariants}>
              <h3
                className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: text("#1f2937", "#f3f4f6") }}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: isDark ? "#1e40af" : "#dbeafe",
                    color: isDark ? "#93c5fd" : "#1e40af",
                  }}
                >
                  1
                </span>
                Выбор подразделения и точки доступа
              </h3>
              <div className="w-full">
                <div className="space-y-2">
                  <CustomSelect
                    label="Подразделение"
                    options={optionsOrgUnits}
                    value={selectOrgUnitCode}
                    placeholder="Выберите подразделение"
                    onChange={(val) => setSelectOrgUnitCode(val)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div
              className="border-t"
              style={{ borderColor: border("#e5e7eb", "#374151") }}
            ></div>

            {/* Date Section */}
            <motion.div variants={itemVariants}>
              <h3
                className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: text("#1f2937", "#f3f4f6") }}
              >
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: isDark ? "#1e40af" : "#dbeafe",
                    color: isDark ? "#93c5fd" : "#1e40af",
                  }}
                >
                  2
                </span>
                Период отчёта
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{ color: text("#374151", "#d1d5db") }}
                  >
                    <DateRangeIcon />
                    <p>Дата и время начала</p>
                  </label>
                  <Input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    inputClass="!h-[48px] !border-2 !rounded-lg transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-semibold mb-2 flex items-center gap-2"
                    style={{ color: text("#374151", "#d1d5db") }}
                  >
                    <DateRangeIcon />
                    <p>Дата и время окончания</p>
                  </label>

                  <Input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    inputClass="!h-[48px] !border-2 !rounded-lg transition-colors"
                  />
                </div>
              </div>
            </motion.div>

            {/* Status Indicator */}
            <AnimatePresence>
              {isFormComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 p-4 border rounded-xl"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(34, 197, 94, 0.15)"
                      : "#f0fdf4",
                    borderColor: isDark ? "rgba(34, 197, 94, 0.3)" : "#bbf7d0",
                  }}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: isDark ? "#4ade80" : "#16a34a" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: isDark ? "#86efac" : "#166534" }}
                    >
                      Все параметры заполнены
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className="flex items-center gap-3 flex-wrap pt-4 border-t"
              style={{ borderColor: border("#e5e7eb", "#374151") }}
            >
              <button
                onClick={handleExport}
                disabled={!isFormComplete}
                className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                style={{
                  backgroundColor: !isFormComplete
                    ? isDark
                      ? "#4b5563"
                      : "#9ca3af"
                    : "#00733B",
                  color: "#ffffff",
                  opacity: !isFormComplete ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (isFormComplete) {
                    e.currentTarget.style.backgroundColor = "#00632F";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFormComplete) {
                    e.currentTarget.style.backgroundColor = "#00733B";
                  }
                }}
              >
                <Image
                  src={"/icons/excel.svg"}
                  alt="excel"
                  width={24}
                  height={24}
                />
                Выгрузить в Excel
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="mt-6 rounded-xl p-4 sm:p-6 border"
          style={{
            background: isDark
              ? "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))"
              : "linear-gradient(to right, #eff6ff, #eef2ff)",
            borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe",
          }}
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5"
              style={{ color: isDark ? "#60a5fa" : "#2563eb" }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h4
                className="text-sm sm:text-base font-semibold mb-1"
                style={{ color: isDark ? "#93c5fd" : "#1e3a8a" }}
              >
                Информация
              </h4>
              <p
                className="text-xs sm:text-sm"
                style={{ color: isDark ? "#bfdbfe" : "#1e40af" }}
              >
                Заполните все поля для получения детальной аналитики по
                выбранным параметрам. Данные обновляются в режиме реального
                времени.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
