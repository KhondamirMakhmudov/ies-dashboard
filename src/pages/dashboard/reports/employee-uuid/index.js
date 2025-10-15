import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import useGetQuery from "@/hooks/java/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import CustomTable from "@/components/table";
import DownloadIcon from "@mui/icons-material/Download";
import { motion } from "framer-motion";
import { get, isEmpty } from "lodash";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import Input from "@/components/input";
import Image from "next/image";
import { Search } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Close } from "@mui/icons-material";
import { getEmployeesLogsByRange } from "@/utils/getEmployeesLogsByRange";
import toast from "react-hot-toast";

const Index = () => {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeUUID, setEmployeeUUID] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(""); // New state for position filter
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef();

  const {
    data: employeeRange,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: [KEYS.logEntersOfEmployees, employeeUUID],
    url: `${URLS.logEntersOfEmployeeById}${employeeUUID}/dates/new-output`,
    params: {
      startDate: startDate,
      endDate: endDate,
    },
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

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

  // Get unique positions from employee list
  const uniquePositions = [
    ...new Set(
      employeeList.map((emp) => emp.workplace?.position?.name).filter(Boolean)
    ),
  ];

  console.log(employeeUUID, "employee uuid");

  // Filter employees by position first, then by search term
  const filteredEmployees = employeeList.filter((emp) => {
    const matchesPosition = selectedPosition
      ? emp.workplace?.position?.name === selectedPosition
      : true;
    const matchesSearch = emp.first_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesPosition && matchesSearch;
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
    setSelectedEmployee(employee);
    setEmployeeUUID(employee?.id);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleRemove = () => {
    setSelectedEmployee(null);
    setEmployeeUUID("");
    setSearchTerm("");
  };

  const token = session?.accessToken;

  const handleExport = async () => {
    try {
      const data = await getEmployeesLogsByRange({
        token,
        rangeString: employeeUUID,
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
    }
  };

  return (
    <DashboardLayout headerTitle={"Отчёты"}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-white ${
          isEmpty(employees) ? "col-span-12" : "col-span-8"
        } p-6 rounded-md border border-gray-200 w-full my-[15px]`}
      >
        {/* Position Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Должность:</label>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400 appearance-none cursor-pointer"
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
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Сотрудник:</label>
          <div ref={wrapperRef} className="relative">
            <div className="relative">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Search className="text-gray-400" fontSize="small" />

                {/* Selected Employee Tag */}
                {selectedEmployee && (
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm">
                    <span className="font-medium">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </span>
                    <button
                      onClick={handleRemove}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition"
                    >
                      <Close style={{ fontSize: 14 }} />
                    </button>
                  </div>
                )}

                {/* Search Input */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Поиск"
                  className="flex-1 outline-none text-gray-700"
                />

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
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
                    Сотрудники не найдены
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Дата начала:</label>
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
            disabled={!employeeUUID || !startDate || !endDate}
            onClick={handleExport}
            className="flex gap-x-[10px] bg-[#00733B] hover:bg-[#00632F] px-[15px] py-[9px] rounded-[8px] text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
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

      {/* Employee Range Data Table */}
      {employeeUUID && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-md border border-gray-200 w-full my-[15px]"
        >
          <h2 className="text-xl font-semibold mb-4">
            Журнал входов и выходов
          </h2>

          {isLoading || isFetching ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : employeeRange && get(employeeRange, "data", []).length > 0 ? (
            <div className="overflow-x-auto">
              <CustomTable
                data={get(employeeRange, "data", [])}
                columns={[
                  {
                    title: "Дата",
                    dataIndex: "date",
                    key: "date",
                  },
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
                  {
                    title: "Статус",
                    dataIndex: "status",
                    key: "status",
                  },
                ]}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {startDate && endDate
                ? "Нет данных за выбранный период"
                : "Выберите даты для просмотра данных"}
            </div>
          )}
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default Index;
