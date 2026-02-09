import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import usePostQuery from "@/hooks/java/usePostQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import CustomTable from "@/components/table";
import { get } from "lodash";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import PrimaryButton from "@/components/button/primary-button";
import ContentLoader from "@/components/loader";
import { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import MethodModal from "@/components/modal/method-modal";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import CustomSelect from "@/components/select";
import { config } from "@/config";
import {
  Search,
  Check,
  Clear,
  Person,
  Group,
  Cancel,
  Delete,
} from "@mui/icons-material";
import DeleteModal from "@/components/modal/delete-modal";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";

const Index = () => {
  const queryClient = useQueryClient();
  const { bg, border, text, isDark } = useAppTheme();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedJobTrip, setSelectedJobTrip] = useState(null);
  const [selectedEmployeesForJobTrip, setSelectedEmployeesForJobTrip] =
    useState(new Set());
  const [pageSize] = useState(15);
  const [numOrder, setNumOrder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const canCreateJobTrip = canUserDo(session?.user, "командировки", "create");
  const canDeleteJobTrip = canUserDo(session?.user, "командировки", "delete");
  const canReadJobTrip = canUserDo(session?.user, "командировки", "read");

  const {
    data: jobTrips,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.jobTrips,
    url: URLS.jobTrips,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    enabled: !!session?.accessToken,
  });

  const filteredEmployeesOfJobTrips = get(jobTrips, "data.data", []).filter(
    (trip) => {
      const term = tableSearchTerm.toLowerCase();
      if (!term) return true;

      const lastName = trip.lastName?.toLowerCase() || "";
      const firstName = trip.firstName?.toLowerCase() || "";
      const fatherName = trip.fatherName?.toLowerCase() || "";
      const numOrder = trip.numOrder?.toLowerCase() || "";
      const entryPointName = trip.entryPointName?.toLowerCase() || "";

      return (
        lastName.includes(term) ||
        firstName.includes(term) ||
        fatherName.includes(term) ||
        numOrder.includes(term) ||
        entryPointName.includes(term)
      );
    },
  );

  const {
    data: employee,
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

  const filteredEmployees = get(employee, "data.data", []).filter((emp) => {
    const firstName = emp.first_name?.toLowerCase() || "";
    const lastName = emp.last_name?.toLowerCase() || "";
    const fio = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
    const position = emp.workplace?.position?.name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    // Search by surname (last_name), first name, full name, or position
    const matchesSearch =
      lastName.includes(term) ||
      firstName.includes(term) ||
      fio.includes(term) ||
      position.includes(term);
    const matchesPosition = selectedPosition
      ? emp.workplace?.position?.name === selectedPosition
      : true;

    return matchesSearch && matchesPosition;
  });

  const positions = Array.from(
    new Set(
      filteredEmployees.map((e) => e.workplace?.position?.name).filter(Boolean),
    ),
  );

  const {
    data: entrypointSchedules,
    isLoading: isLoadingEntrypointSchedules,
    isFetching: isFetchingEntrypointSchedules,
  } = useGetQuery({
    key: KEYS.entrypointSchedules,
    url: URLS.entrypointSchedules,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const scheduleOptions = get(entrypointSchedules, "data", []).map((item) => ({
    label: `${item.unitCode.nameLong} - ${item.entryPoint.entryPointName} - ${item.schedule.name}`,
    value: item.id,
  }));
  // create business-trip for employees
  const { mutate: createJobTrip } = usePostQuery({
    listKeyId: "create-job-trip",
  });
  const submitCreateJobTrip = () => {
    // Validation
    if (selectedEmployeesForJobTrip.size === 0) {
      toast.warning("Пожалуйста, выберите хотя бы одного сотрудника!");
      return;
    }
    if (!numOrder || !startDate || !endDate || !selectedSchedule) {
      toast.warning("Пожалуйста, заполните все обязательные поля!");
      return;
    }

    // Convert Set to Array of UUIDs
    const selectedEmployeeList = Array.from(selectedEmployeesForJobTrip);

    createJobTrip(
      {
        url: URLS.createJobTripsForEmployee,
        attributes: {
          employeeUuids: selectedEmployeeList,
          numOrder: numOrder,
          startDate: startDate,
          endDate: endDate,
          entryPointScheduleId: selectedSchedule, // ✅ Convert to number
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/json",
          },
        },
      },
      {
        onSuccess: () => {
          handleCloseCreateModal();
          toast.success("Командировка успешно создана", {
            position: "top-center",
          });
          queryClient.invalidateQueries(KEYS.jobTrips);
        },
        onError: (error) => {
          console.error("Error creating job trip:", error);
          toast.error(`Ошибка: ${error.message || "Неизвестная ошибка"}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // delete business-trip

  const submitDeleteJobTrip = async () => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.jobTrips}/${selectedJobTrip}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ jobTripId: selectedJobTrip }),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      setSelectedJobTrip(null);
      setDeleteModal(false);
      queryClient.invalidateQueries(KEYS.jobTrips);
      console.log("Deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  const handleToggleEmployee = (employeeId) => {
    const updated = new Set(selectedEmployeesForJobTrip);
    if (updated.has(employeeId)) {
      updated.delete(employeeId);
    } else {
      updated.add(employeeId);
    }
    setSelectedEmployeesForJobTrip(updated);
  };

  const handleSelectAll = () => {
    const allEmployeeIds = new Set(filteredEmployees.map((emp) => emp.id));
    setSelectedEmployeesForJobTrip(allEmployeeIds);
  };

  const handleClearAll = () => {
    setSelectedEmployeesForJobTrip(new Set());
  };

  const handleCloseCreateModal = () => {
    setCreateModal(false);
    setSelectedEmployeesForJobTrip(new Set());
    setNumOrder("");
    setStartDate("");
    setEndDate("");
    setSelectedSchedule(null);
    setSearchTerm("");
    setSelectedPosition("");
  };

  const SelectedEmployeesBadge = ({ employees, onRemove }) => {
    if (employees.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
            >
              <span>
                {emp.first_name} {emp.last_name}
              </span>
              <button
                onClick={() => onRemove(emp.id)}
                className="text-blue-500 hover:text-blue-700 font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => {
        return (currentPage - 1) * pageSize + (row.index + 1);
      },
    },
    {
      accessorKey: "firstName",
      header: "Имя",
      cell: ({ row }) => {
        return (
          <span>
            {row.original.lastName} {row.original.firstName}{" "}
            {row.original.fatherName}
          </span>
        );
      },
    },
    {
      header: "Откуда",
      accessorKey: "unitCodeNameLong",
    },
    {
      header: "Куда",
      accessorKey: "destinationUnitCodeNameLong",
    },
    {
      header: "Точки входа",
      accessorKey: "entryPointName",
    },
    {
      accessorKey: "startDate",
      header: "Начало",
      cell: ({ row }) => {
        return (
          <span
            className={`${
              isDark
                ? "text-green-600 bg-green-900/30"
                : "bg-[#E8F6F0] text-green-600"
            } font-medium text-sm  p-1 rounded-md border border-green-600`}
          >
            {dayjs(row.original.startDate).format("DD.MM.YYYY")}
          </span>
        );
      },
    },
    {
      accessorKey: "endDate",
      header: "Конец",
      cell: ({ row }) => {
        return (
          <span
            className={`${
              isDark
                ? "text-red-600 bg-red-900/30"
                : "bg-[#f7dcdc] text-red-600"
            } font-medium text-sm  p-1 rounded-md border `}
          >
            {dayjs(row.original.endDate).format("DD.MM.YYYY")}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link
            className={`${
              isDark
                ? "bg-blue-900/30 text-blue-600 border border-blue-600"
                : "bg-[#bfd2f5] text-[#4182F9]"
            } h-[32px] px-2 flex justify-center items-center rounded-md`}
            href={`/dashboard/employees/${row.original.uuidSus}`}
          >
            <VisibilityIcon fontSize="small" />
          </Link>
          {canDeleteJobTrip && (
            <Button
              onClick={() => {
                setDeleteModal(true);
                setSelectedJobTrip(row.original.jobTripID);
              }}
              sx={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                background: isDark ? "#7f1d1d" : "#FCD8D3",
                color: isDark ? "#fca5a5" : "#FF1E00",
                "&:hover": {
                  background: isDark ? "#991b1b" : "#FCA89D",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Командировки"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Командировки"}>
      <motion.div
        initial={{ opacity: 0, translateY: "20px" }}
        animate={{ opacity: 1, translateY: "0" }}
        className="bg-white p-[12px] mb-[50px] rounded-md border border-gray-200 my-[20px]"
        style={{
          background: bg("white", "#1E1E1E"),
          borderColor: border("#d1d5db", "#4b5563"),
        }}
      >
        <div className="my-[10px]">
          {canCreateJobTrip && (
            <PrimaryButton onClick={() => setCreateModal(true)}>
              Назначить командировку
            </PrimaryButton>
          )}
        </div>

        {/* Search and Filter for Job Trips Table */}
        {canReadJobTrip && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={tableSearchTerm}
                onChange={(e) => {
                  setTableSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Поиск по фамилии сотрудника, приказу или точке входа..."
                className="w-full h-12 rounded-lg border pl-11 pr-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: bg("#ffffff", "#1e1e1e"),
                  borderColor: border("#d1d5db", "#4b5563"),
                  color: text("#111827", "#f3f4f6"),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = border(
                    "#9ca3af",
                    "#6b7280",
                  );
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = border(
                    "#d1d5db",
                    "#4b5563",
                  );
                }}
              />
              <div
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                style={{ color: text("#9ca3af", "#6b7280") }}
              >
                <Search fontSize="small" />
              </div>
            </div>
          </div>
        )}

        {canReadJobTrip && (
          <CustomTable
            data={filteredEmployeesOfJobTrips}
            columns={columns}
            pagination={{
              currentPage,
              pageSize,
              total: get(jobTrips, "data.totalCount", 0),
              onPaginationChange: ({ page }) => setCurrentPage(page),
            }}
          />
        )}
      </motion.div>

      <MethodModal
        showCloseIcon={true}
        open={createModal}
        closeClick={handleCloseCreateModal}
        width="min-w-2xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div
            className="text-center sticky z-50 top-0 pt-2 pb-4 border-b -mx-6 px-6"
            style={{
              backgroundColor: bg("#ffffff", "#1e1e1e"),
              borderColor: border("#e5e7eb", "#333333"),
            }}
          >
            <h2
              className="text-2xl font-bold"
              style={{ color: text("#111827", "#f3f4f6") }}
            >
              Создание командировки
            </h2>
            <p style={{ color: text("#6b7280", "#9ca3af") }} className="mt-1">
              Заполните информацию о командировке и выберите сотрудников
            </p>
          </div>

          {/* Basic Information Card */}
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: bg("#f9fafb", "#2a2a2a"),
              borderColor: border("#e5e7eb", "#333333"),
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: text("#111827", "#f3f4f6") }}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Основная информация
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: text("#374151", "#d1d5db") }}
                >
                  Номер приказа *
                </label>
                <input
                  type="text"
                  value={numOrder}
                  onChange={(e) => setNumOrder(e.target.value)}
                  className="w-full h-12 rounded-lg border px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#d1d5db", "#4b5563"),
                    color: text("#111827", "#f3f4f6"),
                  }}
                  placeholder="Например: 123-К"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#9ca3af",
                      "#6b7280",
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#d1d5db",
                      "#4b5563",
                    );
                  }}
                />
              </div>

              <div>
                <CustomSelect
                  options={scheduleOptions}
                  value={selectedSchedule}
                  onChange={(val) => setSelectedSchedule(val)}
                  label="Расписание"
                  required
                  placeholder="Выберите расписание"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: text("#374151", "#d1d5db") }}
                >
                  Дата начала *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 rounded-lg border px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#d1d5db", "#4b5563"),
                    color: text("#111827", "#f3f4f6"),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#9ca3af",
                      "#6b7280",
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#d1d5db",
                      "#4b5563",
                    );
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: text("#374151", "#d1d5db") }}
                >
                  Дата окончания *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 rounded-lg border px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#d1d5db", "#4b5563"),
                    color: text("#111827", "#f3f4f6"),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#9ca3af",
                      "#6b7280",
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#d1d5db",
                      "#4b5563",
                    );
                  }}
                />
              </div>
            </div>
          </div>

          {/* Employee Selection Card */}
          <div
            className="rounded-xl p-6 border"
            style={{
              backgroundColor: bg("#f9fafb", "#2a2a2a"),
              borderColor: border("#e5e7eb", "#333333"),
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: text("#111827", "#f3f4f6") }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Выбор сотрудников
              </h3>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm px-3 py-1 rounded-full border"
                  style={{
                    color: text("#6b7280", "#9ca3af"),
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#d1d5db", "#4b5563"),
                  }}
                >
                  Выбрано:{" "}
                  <strong className="text-blue-600">
                    {selectedEmployeesForJobTrip.size}
                  </strong>
                </span>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск по фамилии, имени или должности..."
                      className="w-full h-12 rounded-lg border pl-11 pr-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        backgroundColor: bg("#ffffff", "#1e1e1e"),
                        borderColor: border("#d1d5db", "#4b5563"),
                        color: text("#111827", "#f3f4f6"),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = border(
                          "#9ca3af",
                          "#6b7280",
                        );
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = border(
                          "#d1d5db",
                          "#4b5563",
                        );
                      }}
                    />
                    <div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      style={{ color: text("#9ca3af", "#6b7280") }}
                    >
                      <Search fontSize="small" />
                    </div>
                  </div>
                </div>

                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="h-12 rounded-lg border px-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#d1d5db", "#4b5563"),
                    color: text("#111827", "#f3f4f6"),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#9ca3af",
                      "#6b7280",
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = border(
                      "#d1d5db",
                      "#4b5563",
                    );
                  }}
                >
                  <option value="">Все должности</option>
                  {positions.map((pos, i) => (
                    <option key={i} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selection Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                >
                  <Check fontSize="small" />
                  Выбрать всех
                </button>

                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor: bg("#e5e7eb", "#4b5563"),
                    color: text("#374151", "#d1d5db"),
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = bg(
                      "#d1d5db",
                      "#6b7280",
                    );
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = bg(
                      "#e5e7eb",
                      "#4b5563",
                    );
                  }}
                >
                  <Clear fontSize="small" />
                  Очистить
                </button>
              </div>
            </div>

            {/* Selected Employees Preview */}
            {selectedEmployeesForJobTrip.size > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label
                    className="block text-sm font-medium flex items-center gap-2"
                    style={{ color: text("#374151", "#d1d5db") }}
                  >
                    <Group fontSize="small" />
                    Выбранные сотрудники:
                  </label>
                  <span
                    className="text-sm"
                    style={{ color: text("#6b7280", "#9ca3af") }}
                  >
                    {selectedEmployeesForJobTrip.size} сотрудников
                  </span>
                </div>

                {/* Compact selected employees view */}
                <div
                  className="max-h-32 overflow-y-auto border rounded-lg p-3"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
                >
                  <div className="flex flex-wrap gap-2">
                    {filteredEmployees
                      .filter((emp) => selectedEmployeesForJobTrip.has(emp.id))
                      .slice(0, 20)
                      .map((emp) => (
                        <div
                          key={emp.id}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm group hover:bg-blue-600 transition-colors"
                        >
                          <span className="max-w-[120px] truncate">
                            {emp.first_name} {emp.last_name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleEmployee(emp.id);
                            }}
                            className="text-white hover:text-gray-200 transition-colors font-bold text-md leading-none flex-shrink-0"
                          >
                            <Cancel fontSize="small" />
                          </button>
                        </div>
                      ))}

                    {selectedEmployeesForJobTrip.size > 20 && (
                      <div className="bg-blue-300 text-blue-800 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                        +{selectedEmployeesForJobTrip.size - 20} еще
                      </div>
                    )}
                  </div>
                </div>

                {/* Bulk actions */}
                {selectedEmployeesForJobTrip.size > 5 && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Delete fontSize="small" />
                      Очистить все
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Employee List */}
            <div
              className=" border rounded-lg"
              style={{
                backgroundColor: bg("#ffffff", "#1e1e1e"),
                borderColor: border("#e5e7eb", "#333333"),
              }}
            >
              <div className="max-h-48 min-h-[200px] overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: text("#6b7280", "#9ca3af") }}
                  >
                    <Person
                      sx={{ fontSize: 48 }}
                      className="mx-auto mb-3"
                      style={{ color: text("#9ca3af", "#6b7280") }}
                    />
                    <p>Сотрудники не найдены</p>
                    <p className="text-sm mt-1">
                      Попробуйте изменить параметры поиска
                    </p>
                  </div>
                ) : (
                  <div style={{ borderColor: border("#f3f4f6", "#2a2a2a") }}>
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployeesForJobTrip.has(
                        emp.id,
                      );
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleEmployee(emp.id)}
                          className={`p-3 cursor-pointer transition-all duration-200 group ${
                            isSelected ? "border-l-4 border-l-blue-500" : ""
                          }`}
                          style={{
                            backgroundColor: isSelected
                              ? isDark
                                ? "#1e3a8a20"
                                : "#eff6ff"
                              : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor = bg(
                                "#f9fafb",
                                "#2a2a2a",
                              );
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {/* Avatar */}
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-sm ${
                                isSelected ? "bg-blue-500" : "bg-gray-400"
                              }`}
                            >
                              {emp.first_name?.[0]?.toUpperCase() || "?"}
                            </div>

                            {/* Employee Info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium truncate text-sm`}
                                style={{
                                  color: isSelected
                                    ? isDark
                                      ? "#93c5fd"
                                      : "#1e3a8a"
                                    : text("#111827", "#f3f4f6"),
                                }}
                              >
                                {emp.first_name} {emp.last_name}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{
                                  color: isSelected
                                    ? isDark
                                      ? "#60a5fa"
                                      : "#1e40af"
                                    : text("#6b7280", "#9ca3af"),
                                }}
                              >
                                {emp.workplace?.position?.name ||
                                  "Должность не указана"}
                              </p>
                            </div>

                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected ? "bg-blue-500 border-blue-500" : ""
                              }`}
                              style={
                                !isSelected
                                  ? {
                                      borderColor: border("#d1d5db", "#4b5563"),
                                    }
                                  : {}
                              }
                            >
                              {isSelected && (
                                <Check
                                  sx={{ fontSize: 14 }}
                                  className="text-white"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Sticky at bottom */}
          <div
            className="sticky bottom-0 pt-4 pb-2 border-t -mx-6 px-6"
            style={{
              backgroundColor: bg("#ffffff", "#1e1e1e"),
              borderColor: border("#e5e7eb", "#333333"),
            }}
          >
            <div className="flex items-center justify-between">
              <button
                onClick={handleCloseCreateModal}
                className="px-6 py-3 font-medium rounded-lg border transition-colors duration-200 flex items-center gap-2"
                style={{
                  color: text("#374151", "#d1d5db"),
                  borderColor: border("#d1d5db", "#4b5563"),
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = bg(
                    "#f9fafb",
                    "#2a2a2a",
                  );
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <Clear fontSize="small" />
                Отмена
              </button>

              <button
                onClick={submitCreateJobTrip}
                disabled={
                  selectedEmployeesForJobTrip.size === 0 ||
                  !numOrder ||
                  !startDate ||
                  !endDate ||
                  !selectedSchedule
                }
                className="px-8 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check fontSize="small" />
                Создать командировку ({selectedEmployeesForJobTrip.size})
              </button>
            </div>
          </div>
        </div>
      </MethodModal>

      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        deleting={() => {
          submitDeleteJobTrip();
          setDeleteModal(false);
          setSelectedJobTrip(null);
        }}
        title="Вы уверены, что хотите удалить эту назначенную командировку"
      />
    </DashboardLayout>
  );
};

export default Index;
