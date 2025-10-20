import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "lodash";
import CustomSelect from "@/components/select";
import Input from "@/components/input";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const Index = () => {
  const { data: session } = useSession();

  const [selectOrgUnitCode, setSelectOrgUnitCode] = useState(null);
  const [selectEntryPointId, setSelectEntryPointId] = useState(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: orgUnits } = useGetQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true, limit: 150 },
  });

  const optionsOrgUnits = get(orgUnits, "data", []).map((item) => ({
    value: item.unit_code,
    label: item.name,
  }));

  const { data: entrypoints } = useGetQuery({
    key: KEYS.entrypoints,
    url: URLS.newEntryPoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const optionsEntryPoint = get(entrypoints, "data", []).map((item) => ({
    value: item.id,
    label: item.entryPointName,
  }));

  const startDateTime = useMemo(() => {
    return startDate && startTime ? `${startDate}T${startTime}` : "";
  }, [startDate, startTime]);

  const endDateTime = useMemo(() => {
    return endDate && endTime ? `${endDate}T${endTime}` : "";
  }, [endDate, endTime]);

  const { data: logsByOrgUnitCodeAndEntrypointId, isLoading } = useGetQuery({
    key: KEYS.logsByOrgUnitCodeAndEntrypointId,
    url: `${URLS.logsByOrgUnitCodeAndEntrypointId}${selectOrgUnitCode}/entry-point/${selectEntryPointId}/dates`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      startDate: startDateTime,
      endDate: endDateTime,
    },
    enabled:
      !!session?.accessToken &&
      !!selectOrgUnitCode &&
      !!selectEntryPointId &&
      !!startDateTime &&
      !!endDateTime,
  });

  const isFormComplete =
    selectOrgUnitCode && selectEntryPointId && startDateTime && endDateTime;

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

  return (
    <DashboardLayout headerTitle="Аналитика отчётов">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className=" "
      >
        {/* Main Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-md border border-gray-200 my-[15px] overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-white px-6 sm:px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                  1
                </span>
                Выбор подразделения и точки доступа
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <CustomSelect
                    label="Подразделение"
                    options={optionsOrgUnits}
                    value={selectOrgUnitCode}
                    placeholder="Выберите подразделение"
                    onChange={(val) => setSelectOrgUnitCode(val)}
                  />
                </div>

                <div className="space-y-2">
                  <CustomSelect
                    label="Точка доступа"
                    options={optionsEntryPoint}
                    value={selectEntryPointId}
                    placeholder="Выберите точку доступа"
                    onChange={(val) => setSelectEntryPointId(val)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Date Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                  2
                </span>
                Период отчёта
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center  gap-2">
                    <DateRangeIcon /> <p>Дата начала</p>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    inputClass="!h-[48px] !border-2 !border-gray-200 !rounded-lg hover:!border-blue-400 focus:!border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center  gap-2">
                    <DateRangeIcon /> <p>Дата окончания</p>
                  </label>

                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    inputClass="!h-[48px] !border-2 !border-gray-200 !rounded-lg hover:!border-blue-400 focus:!border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Time Section */}
            <motion.div variants={itemVariants}>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                  3
                </span>
                Временной интервал
              </h3>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <AccessTimeIcon /> <p>Время начала</p>
                  </label>

                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    inputClass="!h-[48px] !border-2 !border-gray-200 !rounded-lg hover:!border-blue-400 focus:!border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <AccessTimeIcon /> <p>Время окончания</p>
                  </label>

                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    inputClass="!h-[48px] !border-2 !border-gray-200 !rounded-lg hover:!border-blue-400 focus:!border-blue-500 transition-colors"
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
                  className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <svg
                    className="w-5 h-5 text-green-600 flex-shrink-0"
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
                    <p className="text-sm font-semibold text-green-800">
                      Все параметры заполнены
                    </p>
                    <p className="text-xs text-green-700">
                      {isLoading
                        ? "Загрузка данных..."
                        : "Готово к генерации отчёта"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-gray-200">
              <button
                disabled={!isFormComplete}
                className="flex items-center gap-2 bg-[#00733B] hover:bg-[#00632F] px-5 py-3 rounded-lg text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Выгрузить в Excel
              </button>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5"
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
              <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-1">
                Информация
              </h4>
              <p className="text-xs sm:text-sm text-blue-800">
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
