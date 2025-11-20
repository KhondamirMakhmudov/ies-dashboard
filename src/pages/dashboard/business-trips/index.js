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

const Index = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
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
    label: `${item.entryPoint.entryPointName} - ${item.schedule.name}`,
    value: item.id,
  }));

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
          entryPointScheduleId: selectedSchedule.value,
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
              setEditModal(true);
              setSelectedUnitType(row.original.id);
            }}
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: "#F0D8C8",
              color: "#FF6200",
            }}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            onClick={() => {
              setDeleteModal(true);
              setSelectedUnitType(row.original.id);
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
        title="Назначить командировку"
      >
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер приказа *
              </label>
              <input
                type="text"
                value={numOrder}
                onChange={(e) => setNumOrder(e.target.value)}
                className="w-full h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400"
                placeholder="Введите номер приказа"
              />
            </div>

            <div className="col-span-2">
              <CustomSelect
                options={scheduleOptions}
                value={selectedSchedule}
                onChange={(val) => {
                  setSelectedSchedule(val);
                }}
                label="Расписание *"
                required
                placeholder="Выберите расписание"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата начала *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата окончания *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400"
              />
            </div>
          </div>

          {/* Employee Selection Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Выбор сотрудников ({selectedEmployeesForJobTrip.size} выбрано)
            </h3>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск сотрудника"
                className="w-full h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400"
              />
            </div>

            {/* Selected Employees Badge */}
            <SelectedEmployeesBadge
              employees={filteredEmployees.filter((emp) =>
                selectedEmployeesForJobTrip.has(emp.id)
              )}
              onRemove={(id) => {
                const newSelected = new Set(selectedEmployeesForJobTrip);
                newSelected.delete(id);
                setSelectedEmployeesForJobTrip(newSelected);
              }}
            />

            {/* Action Buttons and Filter */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition"
              >
                Выбрать всех сотрудников
              </button>

              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                Очистить
              </button>

              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full md:w-auto h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400 appearance-none cursor-pointer"
                style={{
                  backgroundImage:
                    'url(\'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="%23666" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="feather feather-chevron-down"><path d="M6 9l6 6 6-6"/></svg>\')',
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.9rem center",
                  backgroundSize: "1rem",
                }}
              >
                <option value="">Все позиции</option>
                {positions.map((pos, i) => (
                  <option key={i} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee List */}
            <div className="space-y-[10px] gap-3 max-h-[250px] overflow-y-auto pr-1 my-[10px]">
              {filteredEmployees.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Сотрудники не найдены
                </div>
              ) : (
                filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleToggleEmployee(emp.id)}
                    className={`group transition-all duration-200 border-2 rounded-xl p-4 cursor-pointer shadow-sm hover:shadow-md
                      ${
                        selectedEmployeesForJobTrip.has(emp.id)
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner 
                          ${
                            selectedEmployeesForJobTrip.has(emp.id)
                              ? "bg-white bg-opacity-20"
                              : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {emp.first_name?.[0]?.toUpperCase() || "?"}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`font-medium truncate ${
                            selectedEmployeesForJobTrip.has(emp.id)
                              ? "text-white"
                              : "text-gray-900"
                          }`}
                        >
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p
                          className={`text-sm ${
                            selectedEmployeesForJobTrip.has(emp.id)
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {emp.workplace?.position?.name ||
                            "Должность не указана"}
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2
                          ${
                            selectedEmployeesForJobTrip.has(emp.id)
                              ? "bg-white border-white"
                              : "border-gray-300"
                          }`}
                      >
                        {selectedEmployeesForJobTrip.has(emp.id) && (
                          <svg
                            className="w-3 h-3 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-end justify-end pt-4">
            <Button
              onClick={submitCreateJobTrip}
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#4182F9",
                boxShadow: "none",
                color: "white",
                display: "flex",
                gap: "4px",
                fontSize: "14px",
                borderRadius: "8px",
                padding: "8px 16px",
                "&:hover": {
                  backgroundColor: "#3369d6",
                  boxShadow: "none",
                },
              }}
              variant="contained"
            >
              Создать командировку
            </Button>
          </div>
        </div>
      </MethodModal>
    </DashboardLayout>
  );
};

export default Index;
