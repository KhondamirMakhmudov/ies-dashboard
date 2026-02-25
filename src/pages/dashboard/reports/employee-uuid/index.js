import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import useGetQuery from "@/hooks/java/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useMemo } from "react";
import CustomTable from "@/components/table";
import { motion } from "framer-motion";
import { get, isEmpty } from "lodash";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import Input from "@/components/input";
import Image from "next/image";
import { Search, Close, Delete } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CustomSelect from "@/components/select";
import { getEmployeesLogsByRange } from "@/utils/getEmployeesLogsByRange";
import toast from "react-hot-toast";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { config } from "@/config";
import { exportToExcelStyled } from "@/utils/exportToExcelStyled";
import useAppTheme from "@/hooks/useAppTheme";
import ContentLoader from "@/components/loader";

const Index = () => {
  const { bg, isDark, text, border } = useAppTheme();
  const { data: session } = useSession();
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [employeeDataMap, setEmployeeDataMap] = useState({});
  const wrapperRef = useRef();

  const {
    data: employees,
    isLoading: isLoadingEmployee,
    isFetching: isFetchingEmployee,
  } = useGetPythonQuery({
    key: KEYS.employees,
    url: URLS.employees,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      limit: 1000,
      offset: 0,
    },
    enabled: !!session?.accessToken,
  });

  const employeeList = get(employees, "data.data", []);

  const uniquePositions = [
    ...new Set(
      employeeList.map((emp) => emp.workplace?.position?.name).filter(Boolean),
    ),
  ];

  const filteredEmployees = employeeList.filter((emp) => {
    const matchesPosition = selectedPosition
      ? emp.workplace?.position?.name === selectedPosition
      : true;
    const matchesSearch = emp.first_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const notSelected = !selectedEmployees.find(
      (selected) => selected.id === emp.id,
    );
    return matchesPosition && matchesSearch && notSelected;
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (employee) => {
    setSelectedEmployees((prev) => [...prev, employee]);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = (employeeId) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
    setEmployeeDataMap((prev) => {
      const newMap = { ...prev };
      delete newMap[employeeId];
      return newMap;
    });
  };

  const handleRemoveAll = () => {
    setSelectedEmployees([]);
    setEmployeeDataMap({});
  };

  const fetchEmployeeData = async (employeeId) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.logEntersOfEmployeeById}${employeeId}/dates/new-output?startDate=${startDateTime}&endDate=${endDateTime}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/json",
          },
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data for employee ${employeeId}:`, error);
      return null;
    }
  };

  const token = session?.accessToken;

  const handleExport = async () => {
    try {
      toast.loading("Экспорт данных...", { id: "exporting" });

      const employeeIds = selectedEmployees.map((emp) => emp.id);

      const data = await getEmployeesLogsByRange({
        token,
        employeeIds,
        startDate: startDateTime,
        endDate: endDateTime,
      });

      if (!data || data.length === 0) {
        toast.error("Данные не найдены.", { id: "exporting" });
        return;
      }

      exportToExcelStyled(data);
      toast.success("Excel файл успешно загружен.", { id: "exporting" });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при загрузке Excel файла.", { id: "exporting" });
    }
  };

  if (isLoadingEmployee || isFetchingEmployee) {
    return (
      <DashboardLayout headerTitle={"Отчёт по сотрудникам"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Отчёт по сотрудникам"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-md border w-full my-[15px]"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        {/* Position Filter */}
        <div className="mb-6">
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
            Фильтрация сотрудников
          </h3>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: text("#374151", "#d1d5db") }}
          >
            Должность:
          </label>
          <CustomSelect
            options={[
              { label: "Все должности", value: "" },
              ...uniquePositions.map((position) => ({
                label: position,
                value: position,
              })),
            ]}
            value={selectedPosition}
            onChange={(val) => setSelectedPosition(val)}
            placeholder="Все должности"
          />
        </div>

        {/* Employee Search */}
        <div className="mb-6">
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: text("#374151", "#d1d5db") }}
          >
            Сотрудники:
          </label>
          <div ref={wrapperRef} className="relative">
            <div className="relative">
              <div
                className="flex items-center gap-2 border-2 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[48px]"
                style={{
                  backgroundColor: bg("#ffffff", "#2d2d2d"),
                  borderColor: border("#e5e7eb", "#444444"),
                }}
              >
                <Search
                  className="transition-colors"
                  fontSize="small"
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                />

                {/* Selected Employees Tags */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(59, 130, 246, 0.2)"
                          : "#dbeafe",
                        color: isDark ? "#93c5fd" : "#1e40af",
                      }}
                    >
                      <span>
                        {employee.last_name} {employee.first_name}
                      </span>
                      <button
                        onClick={() => handleRemove(employee.id)}
                        className="rounded-full p-0.5 transition hover:opacity-70"
                      >
                        <Close style={{ fontSize: 14 }} />
                      </button>
                    </div>
                  ))}

                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={
                      selectedEmployees.length === 0
                        ? "Поиск сотрудников..."
                        : "Добавить еще..."
                    }
                    className="flex-1 outline-none min-w-[150px]"
                    style={{
                      backgroundColor: "transparent",
                      color: text("#1f2937", "#f3f4f6"),
                    }}
                  />
                </div>

                {selectedEmployees.length > 0 && (
                  <button
                    onClick={handleRemoveAll}
                    className="transition hover:opacity-70"
                    title="Очистить все"
                    style={{ color: isDark ? "#f87171" : "#dc2626" }}
                  >
                    <Delete fontSize="small" />
                  </button>
                )}

                <KeyboardArrowDownIcon
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fontSize="small"
                  style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                />
              </div>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
              <div
                className="absolute z-10 w-full mt-2 border rounded-lg shadow-xl max-h-64 overflow-y-auto"
                style={{
                  backgroundColor: bg("#ffffff", "#2d2d2d"),
                  borderColor: border("#e5e7eb", "#444444"),
                }}
              >
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => handleSelect(employee)}
                      className="px-4 py-3 cursor-pointer border-b last:border-b-0 transition"
                      style={{
                        borderColor: border("#f3f4f6", "#374151"),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? "#374151"
                          : "#eff6ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <div
                        className="font-medium"
                        style={{ color: text("#1f2937", "#f3f4f6") }}
                      >
                        {employee.last_name} {employee.first_name}{" "}
                        {employee.middle_name}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: text("#6b7280", "#9ca3af") }}
                      >
                        {employee.workplace?.position?.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="px-4 py-3 text-center"
                    style={{ color: text("#6b7280", "#9ca3af") }}
                  >
                    {selectedEmployees.length === employeeList.length
                      ? "Все сотрудники выбраны"
                      : "Сотрудники не найдены"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected count */}
          {selectedEmployees.length > 0 && (
            <p
              className="text-sm mt-2"
              style={{ color: text("#6b7280", "#9ca3af") }}
            >
              Выбрано сотрудников:{" "}
              <span className="font-semibold">{selectedEmployees.length}</span>
            </p>
          )}
        </div>

        {/* Divider */}
        <div
          className="border-t my-6"
          style={{ borderColor: border("#e5e7eb", "#374151") }}
        ></div>

        {/* Date Range */}
        <div className="mb-6">
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
        </div>

        {/* Divider */}
        <div
          className="border-t mb-6"
          style={{ borderColor: border("#e5e7eb", "#374151") }}
        ></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            disabled={
              selectedEmployees.length === 0 || !startDateTime || !endDateTime
            }
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3 rounded-lg font-medium disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            style={{
              backgroundColor:
                selectedEmployees.length === 0 || !startDateTime || !endDateTime
                  ? isDark
                    ? "#4b5563"
                    : "#9ca3af"
                  : "#00733B",
              color: "#ffffff",
              opacity:
                selectedEmployees.length === 0 || !startDateTime || !endDateTime
                  ? 0.6
                  : 1,
            }}
            onMouseEnter={(e) => {
              if (
                selectedEmployees.length > 0 &&
                startDateTime &&
                endDateTime
              ) {
                e.currentTarget.style.backgroundColor = "#00632F";
              }
            }}
            onMouseLeave={(e) => {
              if (
                selectedEmployees.length > 0 &&
                startDateTime &&
                endDateTime
              ) {
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
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
