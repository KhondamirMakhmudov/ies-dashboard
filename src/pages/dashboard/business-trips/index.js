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
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import PrimaryButton from "@/components/button/primary-button";
import ContentLoader from "@/components/loader";
import { normalizeDateInputValue } from "@/utils/normalizeDateInput";
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
  FileUpload,
  CheckCircle,
  Cancel as CancelIcon,
  Download,
} from "@mui/icons-material";
import DeleteModal from "@/components/modal/delete-modal";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";
import SearchInput from "@/components/search";

const Index = () => {
  const queryClient = useQueryClient();
  const { bg, border, text, isDark } = useAppTheme();
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedJobTripForDetails, setSelectedJobTripForDetails] =
    useState(null);
  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [fileForReplacement, setFileForReplacement] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
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
  const [jobTripSearch, setJobTripSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const canCreateJobTrip = canUserDo(session?.user, "job-trips", "create");
  const canDeleteJobTrip = canUserDo(session?.user, "job-trips", "delete");
  const canReadJobTrip = canUserDo(session?.user, "job-trips", "read");

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
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      limit: 1000,
      offset: 0,
    },
    enabled: !!session?.accessToken,
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

    // Create FormData
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        employeeUuids: selectedEmployeeList,
        numOrder: numOrder,
        startDate: startDate,
        endDate: endDate,
        entryPointScheduleId: selectedSchedule,
      }),
    );

    // Append file if selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    createJobTrip(
      {
        url: URLS.createJobTripsForEmployee,
        attributes: formData,
        config: {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${session?.accessToken}`,
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

  // Approve job trip
  const handleApproveJobTrip = async () => {
    if (!selectedJobTripForDetails?.jobTripID) return;

    setIsApproving(true);
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}/api/job-trips/${selectedJobTripForDetails.jobTripID}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при подтверждении");
      }

      toast.success("Командировка успешно подтверждена");
      setDetailsModal(false);
      setSelectedJobTripForDetails(null);
      queryClient.invalidateQueries(KEYS.jobTrips);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось подтвердить командировку");
    } finally {
      setIsApproving(false);
    }
  };

  // Reject job trip
  const handleRejectJobTrip = async () => {
    if (!selectedJobTripForDetails?.jobTripID || !rejectionReason.trim()) {
      toast.warning("Пожалуйста, укажите причину отклонения");
      return;
    }

    setIsRejecting(true);
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}/api/job-trips/${selectedJobTripForDetails.jobTripID}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ rejectionReason: rejectionReason }),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при отклонении");
      }

      toast.success("Командировка отклонена");
      setRejectionModal(false);
      setRejectionReason("");
      setDetailsModal(false);
      setSelectedJobTripForDetails(null);
      queryClient.invalidateQueries(KEYS.jobTrips);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось отклонить командировку");
    } finally {
      setIsRejecting(false);
    }
  };

  // Update order file
  const handleReplaceOrderFile = async () => {
    if (!selectedJobTripForDetails?.jobTripID || !fileForReplacement) {
      toast.warning("Пожалуйста, выберите файл");
      return;
    }

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", fileForReplacement);

      const response = await fetch(
        `${config.JAVA_API_URL}api/job-trips/${selectedJobTripForDetails.jobTripID}/order-file`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при загрузке файла");
      }

      toast.success("Файл успешно заменён");
      setFileForReplacement(null);
      queryClient.invalidateQueries(KEYS.jobTrips);
      // Refresh details
      if (selectedJobTripForDetails) {
        const updatedData = {
          ...selectedJobTripForDetails,
          hasOrderFile: true,
        };
        setSelectedJobTripForDetails(updatedData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Не удалось загрузить файл");
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Download order file
  const handleDownloadOrderFile = async () => {
    if (!selectedJobTripForDetails?.jobTripID) return;

    setIsDownloadingFile(true);
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}/api/job-trips/${selectedJobTripForDetails.jobTripID}/order-file-url`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при получении ссылки на файл");
      }

      const data = await response.json();
      const fileUrl = data.url || data.fileUrl;

      if (fileUrl) {
        // Open file in new tab or download
        window.open(fileUrl, "_blank");
      } else {
        throw new Error("URL файла не получен");
      }
    } catch (error) {
      console.error(error);
      toast.error("Не удалось скачать файл");
    } finally {
      setIsDownloadingFile(false);
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
    setSelectedFile(null);
  };

  // File size validation (50MB limit)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

  const handleFileSelect = (file, setFileState, context = "") => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `Файл слишком большой! Максимальный размер: 50MB (текущий размер: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
        { position: "top-right" },
      );
      return;
    }

    setFileState(file);
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
          <Link
            href={`/dashboard/employees/${row.original.uuidSus}`}
            className="hover:underline text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {row.original.lastName} {row.original.firstName}{" "}
            {row.original.fatherName}
          </Link>
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
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusColor = "";
        let statusBg = "";
        let statusText = "";

        switch (status) {
          case "PENDING_APPROVAL":
            statusText = "Ожидает";
            statusColor = isDark ? "#fbbf24" : "#f59e0b";
            statusBg = isDark ? "#78350f" : "#fef3c7";
            break;
          case "APPROVED":
            statusText = "Подтверждена";
            statusColor = isDark ? "#86efac" : "#22c55e";
            statusBg = isDark ? "#166534" : "#dcfce7";
            break;
          case "REJECTED":
            statusText = "Отклонена";
            statusColor = isDark ? "#f87171" : "#ef4444";
            statusBg = isDark ? "#7f1d1d" : "#fee2e2";
            break;
          default:
            statusText = status;
            statusColor = text("#6b7280", "#9ca3af");
            statusBg = bg("#f3f4f6", "#2a2a2a");
        }

        return (
          <span
            className="font-medium text-sm px-2 py-1 rounded-md border"
            style={{
              color: statusColor,
              backgroundColor: statusBg,
              borderColor: statusColor,
            }}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedJobTripForDetails(row.original);
              setDetailsModal(true);
            }}
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: isDark ? "#1e3a8a" : "#bfd2f5",
              color: isDark ? "#60a5fa" : "#4182F9",
              "&:hover": {
                background: isDark ? "#1e40af" : "#93c5fd",
              },
            }}
          >
            <VisibilityIcon fontSize="small" />
          </Button>
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

  // prepare filtered / paginated data for table when searching employees
  const allJobTrips = get(jobTrips, "data.data", []) || [];
  const displayedJobTrips = allJobTrips.filter((jt) => {
    const term = jobTripSearch.trim().toLowerCase();
    if (!term) return true;
    const fullName =
      `${jt.lastName || ""} ${jt.firstName || ""} ${jt.fatherName || ""}`.toLowerCase();
    const unit = (
      jt.unitCodeNameLong ||
      jt.destinationUnitCodeNameLong ||
      ""
    ).toLowerCase();
    return fullName.includes(term) || unit.includes(term);
  });

  const paginatedData = jobTripSearch
    ? displayedJobTrips.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      )
    : allJobTrips;

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

        {canReadJobTrip && (
          <>
            <SearchInput
              value={jobTripSearch}
              onChange={(e) => {
                setJobTripSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={"Поиск по сотрудникам или подразделению..."}
            />

            <CustomTable
              data={paginatedData}
              columns={columns}
              pagination={{
                currentPage,
                pageSize,
                total: jobTripSearch
                  ? displayedJobTrips.length
                  : get(jobTrips, "data.totalCount", 0),
                onPaginationChange: ({ page }) => setCurrentPage(page),
              }}
            />
          </>
        )}
      </motion.div>

      <MethodModal
        showCloseIcon={true}
        open={createModal}
        closeClick={handleCloseCreateModal}
        width="min-w-2xl"
        title={"Создание командировки"}
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto overflow-x-hidden">
          {/* Header */}

          <p style={{ color: text("#6b7280", "#9ca3af") }} className="mt-1">
            Заполните информацию о командировке и выберите сотрудников
          </p>

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
                  onChange={(e) =>
                    setStartDate(
                      normalizeDateInputValue(e.target.value, "date"),
                    )
                  }
                  max="9999-12-31"
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
                  onChange={(e) =>
                    setEndDate(normalizeDateInputValue(e.target.value, "date"))
                  }
                  max="9999-12-31"
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
                  Файл документа
                </label>
                <div
                  className="relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer hover:border-blue-400"
                  style={{
                    backgroundColor: selectedFile
                      ? bg("#f0fdf4", "#1a3a1a")
                      : bg("#f9fafb", "#1e1e1e"),
                    borderColor: selectedFile
                      ? "#10b981"
                      : border("#d1d5db", "#4b5563"),
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#3b82f6";
                    e.currentTarget.style.backgroundColor = bg(
                      "#eff6ff",
                      "#1e3a8a",
                    );
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = selectedFile
                      ? "#10b981"
                      : border("#d1d5db", "#4b5563");
                    e.currentTarget.style.backgroundColor = selectedFile
                      ? bg("#f0fdf4", "#1a3a1a")
                      : bg("#f9fafb", "#1e1e1e");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = selectedFile
                      ? "#10b981"
                      : border("#d1d5db", "#4b5563");
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      handleFileSelect(file, setSelectedFile, "create");
                    }
                  }}
                >
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileSelect(
                        e.target.files?.[0] || null,
                        setSelectedFile,
                        "create",
                      )
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    {selectedFile ? (
                      <>
                        <div className="text-2xl" style={{ color: "#10b981" }}>
                          ✓
                        </div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: text("#111827", "#f3f4f6") }}
                        >
                          {selectedFile.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: text("#6b7280", "#9ca3af") }}
                        >
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <div
                          className="text-2xl"
                          style={{ color: text("#9ca3af", "#6b7280") }}
                        >
                          📎
                        </div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: text("#374151", "#d1d5db") }}
                        >
                          Перетащите файл сюда
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: text("#6b7280", "#9ca3af") }}
                        >
                          или нажмите для выбора
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {selectedFile && (
                  <div className="mt-2 space-y-2">
                    <p
                      className="text-xs"
                      style={{ color: text("#059669", "#10b981") }}
                    >
                      ✓ Размер файла:{" "}
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB (макс.
                      50MB)
                    </p>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
                    >
                      ✕ Удалить файл
                    </button>
                  </div>
                )}
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
              <div className="flex flex-col  gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Поиск по имени или должности..."
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

                <CustomSelect
                  options={[
                    { label: "Все должности", value: "" },
                    ...positions.map((pos) => ({ label: pos, value: pos })),
                  ]}
                  value={selectedPosition}
                  onChange={(val) => setSelectedPosition(val)}
                  placeholder="Все должности"
                />
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

      <MethodModal
        showCloseIcon={true}
        open={detailsModal}
        closeClick={() => {
          setDetailsModal(false);
          setSelectedJobTripForDetails(null);
        }}
        width="min-w-2xl"
        title={"Детали командировки"}
      >
        {selectedJobTripForDetails && (
          <div className="flex flex-col max-h-[70vh]">
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 space-y-4 pr-2">
              {/* Employee Information */}
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: bg("#f9fafb", "#2a2a2a"),
                  borderColor: border("#e5e7eb", "#333333"),
                }}
              >
                <h3
                  className="text-base font-semibold mb-3 flex items-center gap-2"
                  style={{ color: text("#111827", "#f3f4f6") }}
                >
                  <Person fontSize="small" />
                  Сотрудник
                </h3>
                <p
                  className="text-sm font-medium"
                  style={{ color: text("#111827", "#f3f4f6") }}
                >
                  {selectedJobTripForDetails.lastName}{" "}
                  {selectedJobTripForDetails.firstName}{" "}
                  {selectedJobTripForDetails.fatherName}
                </p>
              </div>

              {/* Trip Details */}
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: bg("#f9fafb", "#2a2a2a"),
                  borderColor: border("#e5e7eb", "#333333"),
                }}
              >
                <h3
                  className="text-base font-semibold mb-3 flex items-center gap-2"
                  style={{ color: text("#111827", "#f3f4f6") }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Командировка
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Номер приказа
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: text("#111827", "#f3f4f6") }}
                    >
                      {selectedJobTripForDetails.numOrder}
                    </p>
                  </div>

                  <div>
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Статус
                    </span>
                    <div className="mt-1">
                      {(() => {
                        const status = selectedJobTripForDetails.status;
                        let statusColor = "";
                        let statusBg = "";
                        let statusText = "";

                        switch (status) {
                          case "PENDING_APPROVAL":
                            statusText = "Ожидает";
                            statusColor = isDark ? "#fbbf24" : "#f59e0b";
                            statusBg = isDark ? "#78350f" : "#fef3c7";
                            break;
                          case "APPROVED":
                            statusText = "Подтверждена";
                            statusColor = isDark ? "#86efac" : "#22c55e";
                            statusBg = isDark ? "#166534" : "#dcfce7";
                            break;
                          case "REJECTED":
                            statusText = "Отклонена";
                            statusColor = isDark ? "#f87171" : "#ef4444";
                            statusBg = isDark ? "#7f1d1d" : "#fee2e2";
                            break;
                          default:
                            statusText = status;
                            statusColor = text("#6b7280", "#9ca3af");
                            statusBg = bg("#f3f4f6", "#2a2a2a");
                        }

                        return (
                          <span
                            className="text-xs px-2 py-1 rounded border inline-block font-medium"
                            style={{
                              color: statusColor,
                              backgroundColor: statusBg,
                              borderColor: statusColor,
                            }}
                          >
                            {statusText}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  <div>
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Начало
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: text("#111827", "#f3f4f6") }}
                    >
                      {dayjs(selectedJobTripForDetails.startDate).format(
                        "DD.MM.YYYY",
                      )}
                    </p>
                  </div>

                  <div>
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Окончание
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: text("#111827", "#f3f4f6") }}
                    >
                      {dayjs(selectedJobTripForDetails.endDate).format(
                        "DD.MM.YYYY",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: bg("#f9fafb", "#2a2a2a"),
                  borderColor: border("#e5e7eb", "#333333"),
                }}
              >
                <h3
                  className="text-base font-semibold mb-3 flex items-center gap-2"
                  style={{ color: text("#111827", "#f3f4f6") }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Место
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Откуда
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: text("#111827", "#f3f4f6") }}
                    >
                      {selectedJobTripForDetails.unitCodeNameLong}
                    </p>
                  </div>

                  <div>
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Куда
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: text("#111827", "#f3f4f6") }}
                    >
                      {selectedJobTripForDetails.destinationUnitCodeNameLong}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span
                      className="text-xs"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      Точка входа
                    </span>
                    <p
                      className="font-medium"
                      style={{ color: text("#111827", "#f3f4f6") }}
                    >
                      {selectedJobTripForDetails.entryPointName}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Section */}
              {selectedJobTripForDetails.hasOrderFile && (
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: bg("#f9fafb", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className="text-base font-semibold mb-1"
                        style={{ color: text("#111827", "#f3f4f6") }}
                      >
                        📄 Файл приказа
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: text("#6b7280", "#9ca3af") }}
                      >
                        Нажмите для загрузки
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadOrderFile}
                      disabled={isDownloadingFile}
                      className="px-3 py-2 bg-blue-500 text-white font-medium text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Download fontSize="small" />
                      {isDownloadingFile ? "Загрузка..." : "Скачать"}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons - Based on Status */}
              {selectedJobTripForDetails.status === "PENDING_APPROVAL" && (
                <div
                  className="rounded-lg p-4 border space-y-2"
                  style={{
                    backgroundColor: bg("#f9fafb", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
                >
                  <button
                    onClick={handleApproveJobTrip}
                    disabled={isApproving}
                    className="w-full px-3 py-2 bg-green-500 text-white font-medium text-sm rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle fontSize="small" />
                    {isApproving ? "Подтверждение..." : "Подтвердить"}
                  </button>

                  <button
                    onClick={() => setRejectionModal(true)}
                    className="w-full px-3 py-2 bg-red-500 text-white font-medium text-sm rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <CancelIcon fontSize="small" />
                    Отклонить
                  </button>
                </div>
              )}

              {/* File Replacement */}
              {selectedJobTripForDetails.status === "APPROVED" && (
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: bg("#f9fafb", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
                >
                  <label
                    className="block text-xs font-medium mb-2"
                    style={{ color: text("#374151", "#d1d5db") }}
                  >
                    Заменить файл приказа
                  </label>
                  <div
                    className="relative border-2 border-dashed rounded-lg p-3 transition-all duration-200 cursor-pointer text-center"
                    style={{
                      backgroundColor: fileForReplacement
                        ? bg("#f0fdf4", "#1a3a1a")
                        : bg("#f9fafb", "#1e1e1e"),
                      borderColor: fileForReplacement
                        ? "#10b981"
                        : border("#d1d5db", "#4b5563"),
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = "#3b82f6";
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = fileForReplacement
                        ? "#10b981"
                        : border("#d1d5db", "#4b5563");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        handleFileSelect(
                          file,
                          setFileForReplacement,
                          "replace",
                        );
                      }
                    }}
                  >
                    <input
                      type="file"
                      onChange={(e) =>
                        handleFileSelect(
                          e.target.files?.[0] || null,
                          setFileForReplacement,
                          "replace",
                        )
                      }
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {fileForReplacement ? (
                      <div className="text-xs">
                        <div style={{ color: "#10b981" }}>✓</div>
                        <p
                          className="font-medium mt-1 truncate"
                          style={{ color: text("#111827", "#f3f4f6") }}
                        >
                          {fileForReplacement.name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs">
                        <FileUpload
                          fontSize="small"
                          style={{
                            color: text("#9ca3af", "#6b7280"),
                            margin: "0 auto 4px",
                          }}
                        />
                        <p style={{ color: text("#374151", "#d1d5db") }}>
                          Перетащите или нажмите
                        </p>
                      </div>
                    )}
                  </div>

                  {fileForReplacement && (
                    <>
                      <p
                        className="text-xs mt-2"
                        style={{ color: text("#059669", "#10b981") }}
                      >
                        ✓ Размер файла:{" "}
                        {(fileForReplacement.size / (1024 * 1024)).toFixed(2)}MB
                        (макс. 50MB)
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleReplaceOrderFile}
                          disabled={isUploadingFile}
                          className="flex-1 px-3 py-1 bg-blue-500 text-white font-medium text-xs rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploadingFile ? "Загрузка..." : "Загрузить"}
                        </button>
                        <button
                          onClick={() => setFileForReplacement(null)}
                          className="px-3 py-1 border text-xs font-medium rounded-lg transition-colors duration-200"
                          style={{
                            borderColor: border("#d1d5db", "#4b5563"),
                            color: text("#374151", "#d1d5db"),
                          }}
                        >
                          Отмена
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sticky Action Button */}
            <div
              className="flex items-center justify-end gap-3 pt-3 border-t mt-4"
              style={{ borderColor: border("#e5e7eb", "#333333") }}
            >
              <button
                onClick={() => {
                  setDetailsModal(false);
                  setSelectedJobTripForDetails(null);
                }}
                className="px-6 py-2 font-medium rounded-lg border transition-colors duration-200"
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
                Закрыть
              </button>
            </div>
          </div>
        )}
      </MethodModal>

      <MethodModal
        showCloseIcon={true}
        open={rejectionModal}
        closeClick={() => {
          setRejectionModal(false);
          setRejectionReason("");
        }}
        width="min-w-xl"
        title={"Отклонить командировку"}
      >
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: text("#374151", "#d1d5db") }}
            >
              Причина отклонения *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Укажите причину отклонения командировки..."
              rows={4}
              className="w-full rounded-lg border px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              style={{
                backgroundColor: bg("#ffffff", "#1e1e1e"),
                borderColor: border("#d1d5db", "#4b5563"),
                color: text("#111827", "#f3f4f6"),
              }}
            />
          </div>

          <div
            className="flex items-center justify-end gap-3 pt-4 border-t"
            style={{ borderColor: border("#e5e7eb", "#333333") }}
          >
            <button
              onClick={() => {
                setRejectionModal(false);
                setRejectionReason("");
              }}
              className="px-6 py-2 font-medium rounded-lg border transition-colors duration-200"
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
              Отмена
            </button>

            <button
              onClick={handleRejectJobTrip}
              disabled={isRejecting || !rejectionReason.trim()}
              className="px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRejecting ? "Отклонение..." : "Отклонить"}
            </button>
          </div>
        </div>
      </MethodModal>
    </DashboardLayout>
  );
};

export default Index;
