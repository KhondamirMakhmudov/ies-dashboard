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

const Index = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedJobTrip, setSelectedJobTrip] = useState(null);
  const [selectedEmployeesForJobTrip, setSelectedEmployeesForJobTrip] =
    useState(new Set());
  const [pageSize] = useState(15);
  const [numOrder, setNumOrder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);

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
    const fio = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
    const position = emp.workplace?.position?.name?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    const matchesSearch = fio.includes(term) || position.includes(term);
    const matchesPosition = selectedPosition
      ? emp.workplace?.position?.name === selectedPosition
      : true;

    return matchesSearch && matchesPosition;
  });

  const positions = Array.from(
    new Set(
      filteredEmployees.map((e) => e.workplace?.position?.name).filter(Boolean)
    )
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
      }
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
        }
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
            className={
              "text-green-600 font-medium text-sm bg-[#E8F6F0] p-1 rounded-md border border-green-600"
            }
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
            className={
              "text-red-600 font-medium text-sm bg-[#f7dcdc] p-1 rounded-md border border-red-600"
            }
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
            className="bg-[#bfd2f5] text-[#4182F9] h-[32px] px-2 flex justify-center items-center rounded-md"
            href={`/dashboard/employees/${row.original.uuidSus}`}
          >
            <VisibilityIcon fontSize="small" />
          </Link>
          <Button
            onClick={() => {
              setDeleteModal(true);
              setSelectedJobTrip(row.original.jobTripID);
            }}
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: "#FCD8D3",
              color: "#FF1E00",
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
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
      >
        <div className="my-[10px]">
          <PrimaryButton onClick={() => setCreateModal(true)}>
            Назначить командировку
          </PrimaryButton>
        </div>

        <CustomTable
          data={get(jobTrips, "data.data", [])}
          columns={columns}
          pagination={{
            currentPage,
            pageSize,
            total: get(jobTrips, "data.totalCount", 0),
            onPaginationChange: ({ page }) => setCurrentPage(page),
          }}
        />
      </motion.div>

      <MethodModal
        showCloseIcon={true}
        open={createModal}
        closeClick={handleCloseCreateModal}
        width="min-w-2xl"
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <div className="text-center sticky z-50 top-0 bg-white pt-2 pb-4 border-b border-gray-200 -mx-6 px-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Создание командировки
            </h2>
            <p className="text-gray-600 mt-1">
              Заполните информацию о командировке и выберите сотрудников
            </p>
          </div>

          {/* Basic Information Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Основная информация
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер приказа *
                </label>
                <input
                  type="text"
                  value={numOrder}
                  onChange={(e) => setNumOrder(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                  placeholder="Например: 123-К"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата начала *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Employee Selection Card */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Выбор сотрудников
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-300">
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
                      placeholder="Поиск по имени или должности..."
                      className="w-full h-12 rounded-lg border border-gray-300 bg-white pl-11 pr-4 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Search fontSize="small" />
                    </div>
                  </div>
                </div>

                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="h-12 rounded-lg border border-gray-300 bg-white px-4 text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 min-w-[180px]"
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center gap-2"
                >
                  <Clear fontSize="small" />
                  Очистить
                </button>
              </div>
            </div>

            {/* Selected Employees Preview - Collapsible */}
            {selectedEmployeesForJobTrip.size > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Group fontSize="small" />
                    Выбранные сотрудники:
                  </label>
                  <span className="text-sm text-gray-500">
                    {selectedEmployeesForJobTrip.size} сотрудников
                  </span>
                </div>

                {/* Compact selected employees view */}
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg bg-white p-3">
                  <div className="flex flex-wrap gap-2">
                    {filteredEmployees
                      .filter((emp) => selectedEmployeesForJobTrip.has(emp.id))
                      .slice(0, 20) // Show only first 20 to prevent overflow
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

                    {/* Show count if more than 20 selected */}
                    {selectedEmployeesForJobTrip.size > 20 && (
                      <div className="bg-blue-300 text-blue-800 px-3 py-1 rounded-lg text-sm flex items-center gap-1">
                        +{selectedEmployeesForJobTrip.size - 20} еще
                      </div>
                    )}
                  </div>
                </div>

                {/* Bulk actions when many employees selected */}
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

            {/* Employee List with fixed height */}
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="max-h-48 min-h-[200px] overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Person
                      sx={{ fontSize: 48 }}
                      className="mx-auto text-gray-400 mb-3"
                    />
                    <p>Сотрудники не найдены</p>
                    <p className="text-sm mt-1">
                      Попробуйте изменить параметры поиска
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredEmployees.map((emp) => {
                      const isSelected = selectedEmployeesForJobTrip.has(
                        emp.id
                      );
                      return (
                        <div
                          key={emp.id}
                          onClick={() => handleToggleEmployee(emp.id)}
                          className={`p-3 cursor-pointer transition-all duration-200 group ${
                            isSelected
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : "hover:bg-gray-50"
                          }`}
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
                                className={`font-medium truncate text-sm ${
                                  isSelected ? "text-blue-900" : "text-gray-900"
                                }`}
                              >
                                {emp.first_name} {emp.last_name}
                              </p>
                              <p
                                className={`text-xs truncate ${
                                  isSelected ? "text-blue-700" : "text-gray-500"
                                }`}
                              >
                                {emp.workplace?.position?.name ||
                                  "Должность не указана"}
                              </p>
                            </div>

                            {/* Checkbox */}
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-gray-300 group-hover:border-gray-400"
                              }`}
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
          <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-6 px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCloseCreateModal}
                className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
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
