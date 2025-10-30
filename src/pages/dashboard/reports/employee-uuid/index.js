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
import { getEmployeesLogsByRange } from "@/utils/getEmployeesLogsByRange";
import toast from "react-hot-toast";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { config } from "@/config";
import { exportToExcelStyled } from "@/utils/exportToExcelStyled";

const Index = () => {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [selectedEmployees, setSelectedEmployees] = useState([]); // Array of selected employees
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [employeeDataMap, setEmployeeDataMap] = useState({}); // Store data for each employee
  const wrapperRef = useRef();

  const {
    data: employees,
    isLoading: isLoadingEmployee,
    isFetching: isFetchingEmployee,
  } = useGetPythonQuery({
    key: KEYS.employees,
    url: URLS.employees,
    params: {
      limit: 1000,
      offset: 0,
    },
  });

  const employeeList = get(employees, "data.data", []);

  // Combine date and time into datetime strings
  const startDateTime = useMemo(() => {
    return startDate && startTime ? `${startDate}T${startTime}` : "";
  }, [startDate, startTime]);

  const endDateTime = useMemo(() => {
    return endDate && endTime ? `${endDate}T${endTime}` : "";
  }, [endDate, endTime]);

  // Get unique positions from employee list
  const uniquePositions = [
    ...new Set(
      employeeList.map((emp) => emp.workplace?.position?.name).filter(Boolean)
    ),
  ];

  // Filter employees by position first, then by search term
  const filteredEmployees = employeeList.filter((emp) => {
    const matchesPosition = selectedPosition
      ? emp.workplace?.position?.name === selectedPosition
      : true;
    const matchesSearch = emp.first_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const notSelected = !selectedEmployees.find(
      (selected) => selected.id === emp.id
    );
    return matchesPosition && matchesSearch && notSelected;
  });

  // Close dropdown when clicking outside
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
    // Remove data for this employee
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

  // Fetch data for each selected employee
  const fetchEmployeeData = async (employeeId) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.logEntersOfEmployeeById}${employeeId}/dates/new-output?startDate=${startDateTime}&endDate=${endDateTime}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data for employee ${employeeId}:`, error);
      return null;
    }
  };

  // Fetch all employee data when button is clicked
  const handleFetchAllData = async () => {
    if (!startDateTime || !endDateTime || selectedEmployees.length === 0) {
      toast.error("Выберите сотрудников и даты");
      return;
    }

    toast.loading("Загрузка данных...", { id: "fetching" });
    const dataMap = {};

    for (const employee of selectedEmployees) {
      const data = await fetchEmployeeData(employee.id);
      dataMap[employee.id] = data;
    }

    setEmployeeDataMap(dataMap);
    toast.success("Данные успешно загружены", { id: "fetching" });
  };

  const token = session?.accessToken;

  const handleExport = async () => {
    try {
      toast.loading("Экспорт данных...", { id: "exporting" });

      // Extract employee IDs from selected employees
      const employeeIds = selectedEmployees.map((emp) => emp.id);

      const data = await getEmployeesLogsByRange({
        token,
        employeeIds, // Pass array of IDs instead of rangeString
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

  return (
    <DashboardLayout headerTitle={"Отчёт по сотрудникам"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-md border border-gray-200 w-full my-[15px]"
      >
        {/* Position Filter */}
        <div className="mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
              1
            </span>
            Фильтрация сотрудников
          </h3>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Должность:
          </label>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full h-[48px] rounded-lg border-2 border-gray-200 bg-white px-4 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 hover:border-blue-400 appearance-none cursor-pointer"
          >
            <option value="">Все должности</option>
            {uniquePositions.map((position, index) => (
              <option key={index} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Search */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Сотрудники:
          </label>
          <div ref={wrapperRef} className="relative">
            <div className="relative">
              <div className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 min-h-[48px]">
                <Search className="text-gray-400" fontSize="small" />

                {/* Selected Employees Tags */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium"
                    >
                      <span>
                        {employee.last_name} {employee.first_name}
                      </span>
                      <button
                        onClick={() => handleRemove(employee.id)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition"
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
                    className="flex-1 outline-none text-gray-700 min-w-[150px]"
                  />
                </div>

                {selectedEmployees.length > 0 && (
                  <button
                    onClick={handleRemoveAll}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Очистить все"
                  >
                    <Delete fontSize="small" />
                  </button>
                )}

                <KeyboardArrowDownIcon
                  className={`text-gray-400 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  fontSize="small"
                />
              </div>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => handleSelect(employee)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                    >
                      <div className="font-medium text-gray-800">
                        {employee.last_name} {employee.first_name}{" "}
                        {employee.middle_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.workplace?.position?.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-500 text-center">
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
            <p className="text-sm text-gray-600 mt-2">
              Выбрано сотрудников:{" "}
              <span className="font-semibold">{selectedEmployees.length}</span>
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Date Range */}
        <div className="mb-6">
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
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6"></div>

        {/* Time Range */}
        <div className="mb-6">
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
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            disabled={
              selectedEmployees.length === 0 || !startDateTime || !endDateTime
            }
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#00733B] hover:bg-[#00632F] px-5 py-3 rounded-lg text-white font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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

      {/* {selectedEmployees.length > 0 && (
        <div className="space-y-4">
          {selectedEmployees.map((employee) => {
            const employeeData = employeeDataMap[employee.id];

            return (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-md border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {employee.last_name} {employee.first_name}{" "}
                      {employee.middle_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {employee.workplace?.position?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(employee.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Удалить"
                  >
                    <Delete />
                  </button>
                </div>

                {!employeeData ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : get(employeeData, "data", []).length > 0 ? (
                  <div className="overflow-x-auto">
                    <CustomTable
                      data={get(employeeData, "data", [])}
                      columns={[
                        { title: "Дата", dataIndex: "date", key: "date" },
                        {
                          title: "Время входа",
                          dataIndex: "enterTime",
                          key: "enterTime",
                        },
                        {
                          title: "Время выхода",
                          dataIndex: "exitTime",
                          key: "exitTime",
                        },
                        {
                          title: "Всего часов",
                          dataIndex: "totalHours",
                          key: "totalHours",
                        },
                        { title: "Статус", dataIndex: "status", key: "status" },
                      ]}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    Нет данных за выбранный период
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )} */}
    </DashboardLayout>
  );
};

export default Index;
