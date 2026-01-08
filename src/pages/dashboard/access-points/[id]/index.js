import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { get, isEmpty } from "lodash";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";
import ExcelButton from "@/components/button/excel-button";
import Link from "next/link";
import ContentLoader from "@/components/loader";
import NoData from "@/components/no-data";
import usePostQuery from "@/hooks/java/usePostQuery";
import { useState, useMemo } from "react";
import MethodModal from "@/components/modal/method-modal";
import { Typography, Button, Switch } from "@mui/material";
import CustomSelect from "@/components/select";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ShareIcon from "@mui/icons-material/Share";
import DeleteModal from "@/components/modal/delete-modal";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { config } from "@/config";
import usePutQuery from "@/hooks/java/usePutQuery";
import SyncButton from "@/components/button/sync-button";
import PrimaryButton from "@/components/button/primary-button";
import EntryPointOrgUnitScheduleCard from "@/components/card/entrypointOrgUnitSchedule";
import SearchIcon from "@mui/icons-material/Search";
import SearchInput from "@/components/search";
import SelectedEmployeesBadge from "@/components/selected-employee";
import useAppTheme from "@/hooks/useAppTheme";

const Index = () => {
  const queryClient = useQueryClient();
  const { bg, isDark, text, border } = useAppTheme();
  const { data: session } = useSession();
  const [selectScheduleId, setSelectScheduleId] = useState(null);
  const [entryPointScheduleId, setEntryPointScheduleId] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isPriority, setIsPriority] = useState(false);
  const [createConnectModal, setCreateConnectModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [tab, setTab] = useState("org-units");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedScheduleTab, setSelectedScheduleTab] = useState("all");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { id } = router.query;

  // entrypoint/{id}
  const {
    data: entrypoint,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.entrypoint,
    url: `${URLS.newEntryPoints}/${id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!id && !!session?.accessToken,
  });

  // schedules connected to entrypoint/{id}
  const {
    data: schedulesOfEntrypoints,
    isLoading: isLoadingSchedules,
    isFetching: isFetchingSchedules,
  } = useGetQuery({
    key: KEYS.schedulesOfEntrypoints,
    url: `${URLS.schedulesOfEntrypoints}${id}/schedules`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!id && !!session?.accessToken,
  });

  const scheduleOptions = get(schedulesOfEntrypoints, "data.schedules", []).map(
    (item) => ({
      label: `${item.scheduleName} - ${item.unitCodeName}`,
      value: item.entryPointScheduleId,
    })
  );

  const { data: allSchedules } = useGetQuery({
    key: KEYS.allSchedules,
    url: URLS.allSchedules,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
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
  const { data: connectedEmployeesToSchedule } = useGetQuery({
    key: KEYS.connectedEmployeesToSchedule,
    url: `${URLS.newEntryPoints}/${id}/employees`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!id && !!session?.accessToken,
  });

  const scheduleNames = useMemo(() => {
    const employees = get(connectedEmployeesToSchedule, "data.employees", []);
    const uniqueSchedules = [
      ...new Set(employees.map((emp) => emp.scheduleName)),
    ];
    return uniqueSchedules.filter(Boolean);
  }, [connectedEmployeesToSchedule]);

  // 3. REPLACE your filteredEmployeesConnectedToSchedule with this:
  const filteredEmployeesConnectedToSchedule = useMemo(() => {
    const employees = get(connectedEmployeesToSchedule, "data.employees", []);

    return employees.filter((employee) => {
      // Filter by schedule
      if (
        selectedScheduleTab !== "all" &&
        employee.scheduleName !== selectedScheduleTab
      ) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const fullName = `${get(employee, "firstName", "")} ${get(
          employee,
          "lastName",
          ""
        )}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      }

      return true;
    });
  }, [connectedEmployeesToSchedule, selectedScheduleTab, searchQuery]);
  const handleExportToExcel = () => {
    // Get filtered employees
    const employees = filteredEmployeesConnectedToSchedule;

    if (employees.length === 0) {
      toast.error("Нет данных для экспорта");
      return;
    }

    // Prepare data for Excel
    const excelData = employees.map((employee, index) => ({
      "№": index + 1,
      Фамилия: get(employee, "lastName", ""),
      Имя: get(employee, "firstName", ""),
      Отчество: get(employee, "fatherName", ""),
      // "UUID сотрудника": get(employee, "employeeUuid", ""),
      Расписание: get(employee, "scheduleName", ""),
      // "ID расписания": get(employee, "scheduleId", ""),
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Сотрудники");

    // Set column widths
    ws["!cols"] = [
      { wch: 5 }, // №
      { wch: 20 }, // Фамилия
      { wch: 20 }, // Имя
      { wch: 20 }, // Отчество
      { wch: 40 }, // UUID
      { wch: 25 }, // Расписание
      { wch: 15 }, // ID расписания
    ];

    // Generate file name with current date
    const date = new Date().toLocaleDateString("ru-RU").replace(/\./g, "-");
    const fileName = `Сотрудники_точки_доступа_${id}_${date}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fileName);

    toast.success(`Экспортировано ${employees.length} сотрудников`);
  };

  // connect employees to schedule of the entrypoint

  const { mutate: connectEmployeesToSchedule } = usePostQuery({
    listKeyId: "connect-employee-to-schedule",
  });

  const SubmitConnectionOfEmployeeToSchedule = () => {
    if (selectedEmployees.size === 0) {
      toast.warning("Пожалуйста, выберите хотя бы одного сотрудника!");
    }
    const selectedEmployeeList = Array.from(selectedEmployees);
    connectEmployeesToSchedule(
      {
        url: `${URLS.connectScheduleAndEmployee}?entryPointScheduleId=${selectedSchedule}`,
        attributes: selectedEmployeeList,
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          setCreateConnectModal(false);
          setSelectScheduleId(null);
          setSelectedEmployees(new Set());
          toast.success("Успешно привязан", {
            position: "top-center",
          });

          queryClient.invalidateQueries(KEYS.connectScheduleAndEmployee);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  const handleToggleEmployee = (id) => {
    const updated = new Set(selectedEmployees);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedEmployees(updated);
  };

  // edit priority of schedule for entrypoint

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }
  const tabs = [
    { key: "org-units", label: "Подразделения и расписание" },
    // { key: "schedule", label: "Расписания" },
    { key: "employees", label: "Сотрудники" },
  ];

  return (
    <DashboardLayout headerTitle={"Точки доступа"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${bg} p-6 my-[20px] rounded-md border ${border}`}
        style={{
          background: bg("white", "#1E1E1E"),
          borderColor: border("#d1d5db", "#4b5563"),
        }}
      >
        <div className={`${bg} rounded-xl mx-auto`}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h1
              className={`text-2xl font-bold ${text} border-b ${border} pb-3`}
            >
              Точка доступа №{id}
            </h1>

            <SyncButton
              id={id}
              session={session}
              url={`${URLS.newEntryPoints}/${id}/cameras/sync-schedules`}
            />
          </div>

          <div className="space-y-4">
            <div>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Полное название
              </p>
              <p className={`text-lg font-medium ${text}`}>
                {get(entrypoint, "data.entryPointName", [])}
              </p>
            </div>

            <div>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Короткое название
              </p>
              <p className={`text-lg font-medium ${text}`}>
                {get(entrypoint, "data.entryPointShortName", [])}
              </p>
            </div>
            <div>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Описание здания
              </p>
              <p className={`text-lg font-medium ${text}`}>
                {get(entrypoint, "data.buildingDescription", [])}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {isEmpty(get(schedulesOfEntrypoints, "data.schedules", [])) ? (
        <NoData
          title="Для этой точки входа нет расписания"
          description="Нажмите кнопку ниже, чтобы создать новое расписание для доступа"
          onCreate={() => setCreateModal(true)}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="my-[20px] rounded-md border"
          style={{
            background: isDark ? "#1E1E1E" : "white",
            borderColor: isDark ? "#4b5563" : "#d1d5db",
          }}
        >
          <div className="rounded-md grid grid-cols-12">
            {/* Sidebar (vertical tabs) */}
            <div
              className="col-span-3 self-start flex flex-col border-r"
              style={{
                borderColor: isDark ? "#4b5563" : "#d1d5db",
                background: isDark ? "#1f2937" : "#f9fafb",
              }}
            >
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="relative text-left px-4 py-3 text-[15px] font-medium transition-colors border-r-4"
                  style={{
                    color:
                      tab === t.key
                        ? "#2563eb"
                        : isDark
                        ? "#d1d5db"
                        : "#4b5563",
                    background:
                      tab === t.key
                        ? isDark
                          ? "rgba(30, 58, 138, 0.3)"
                          : "#eff6ff"
                        : "transparent",
                    borderRightColor: tab === t.key ? "#2563eb" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (tab !== t.key) {
                      e.currentTarget.style.background = isDark
                        ? "#374151"
                        : "#f3f4f6";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tab !== t.key) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {t.label}

                  {tab === t.key && (
                    <motion.span
                      layoutId="underline"
                      className="absolute right-0 top-0 h-full w-[4px] rounded-l-full"
                      style={{ background: "#2563eb" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content section */}
            <div className="col-span-9 p-[15px]">
              {tab === "org-units" && (
                <div>
                  <div className="flex justify-between mb-[20px] items-center">
                    <h2
                      className="text-xl font-semibold"
                      style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    >
                      Подразделения точки доступа
                    </h2>

                    <Link
                      className="px-4 py-2 rounded-md text-white text-sm transition"
                      style={{ background: "#4182F9" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#2563eb")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#4182F9")
                      }
                      href={
                        "/dashboard/structure-organizations/management-organizations"
                      }
                    >
                      Все подразделения
                    </Link>
                  </div>

                  {isEmpty(get(entrypoint, "data.unitCodes", [])) ? (
                    <p
                      className="italic text-sm"
                      style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                    >
                      Подразделения не привязаны
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {get(entrypoint, "data.unitCodes", []).map(
                        (unitCode, index) => (
                          <li
                            key={index}
                            className="border rounded-xl shadow-sm transition p-4"
                            style={{
                              borderColor: isDark ? "#374151" : "#e5e7eb",
                              background: isDark ? "#1f2937" : "white",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow =
                                "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                            }}
                          >
                            <EntryPointOrgUnitScheduleCard
                              unitCodeName={get(unitCode, "name", "")}
                              unitCodeCode={get(unitCode, "code")}
                              unitCodeIsMain={get(unitCode, "isMain")}
                              schedules={get(unitCode, "schedules", [])}
                            />
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              )}

              {tab === "employees" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-[10px] rounded-md"
                  style={{ background: isDark ? "#1E1E1E" : "white" }}
                >
                  <div className="flex justify-between items-center">
                    <Typography
                      variant="h6"
                      style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    >
                      Сотрудники в точке доступа
                    </Typography>

                    <div className="flex items-center gap-2">
                      {/* Excel Download Button */}
                      <ExcelButton onClick={handleExportToExcel} />

                      {/* Existing Connect Button */}
                      <PrimaryButton
                        onClick={() => setCreateConnectModal(true)}
                      >
                        <ShareIcon sx={{ width: "20px", height: "20px" }} />
                        <p>Привязать</p>
                      </PrimaryButton>
                    </div>
                  </div>

                  {/* Schedule Filter Tabs */}
                  <div className="flex gap-2 my-4 flex-wrap text-sm">
                    <button
                      onClick={() => setSelectedScheduleTab("all")}
                      className="px-4 py-2 rounded-md whitespace-nowrap  transition-all"
                      style={{
                        background:
                          selectedScheduleTab === "all"
                            ? isDark
                              ? "#2563eb"
                              : "#3b82f6"
                            : isDark
                            ? "#374151"
                            : "#e5e7eb",
                        color:
                          selectedScheduleTab === "all"
                            ? "white"
                            : isDark
                            ? "#d1d5db"
                            : "#4b5563",
                        fontWeight:
                          selectedScheduleTab === "all" ? "600" : "400",
                      }}
                    >
                      Все расписания
                    </button>
                    {scheduleNames.map((scheduleName) => (
                      <button
                        key={scheduleName}
                        onClick={() => setSelectedScheduleTab(scheduleName)}
                        className="px-4 py-2 rounded-md whitespace-nowrap transition-all"
                        style={{
                          background:
                            selectedScheduleTab === scheduleName
                              ? isDark
                                ? "#2563eb"
                                : "#3b82f6"
                              : isDark
                              ? "#374151"
                              : "#e5e7eb",
                          color:
                            selectedScheduleTab === scheduleName
                              ? "white"
                              : isDark
                              ? "#d1d5db"
                              : "#4b5563",
                          fontWeight:
                            selectedScheduleTab === scheduleName
                              ? "600"
                              : "400",
                        }}
                      >
                        {scheduleName}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-[10px]">
                    {/* Search Input */}
                    <SearchInput
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск сотрудника"
                    />

                    {/* Employee List */}
                    {filteredEmployeesConnectedToSchedule.length > 0 ? (
                      filteredEmployeesConnectedToSchedule.map(
                        (employee, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center gap-4 p-4 rounded-lg transition-all duration-200"
                            style={{
                              background: isDark ? "#1f2937" : "#ffffff",
                              border: `1px solid ${
                                isDark ? "#374151" : "#e5e7eb"
                              }`,
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {/* Index Badge */}
                              <div
                                className="w-8 h-8 flex-shrink-0 flex justify-center items-center rounded-full text-xs font-medium"
                                style={{
                                  background: isDark ? "#374151" : "#f3f4f6",
                                  color: isDark ? "#9ca3af" : "#6b7280",
                                }}
                              >
                                {index + 1}
                              </div>

                              {/* Avatar */}
                              <div
                                className="w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-base shadow-sm"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                  color: "#ffffff",
                                }}
                              >
                                {employee.firstName?.[0] || "?"}
                                {employee.lastName?.[0] || "?"}
                              </div>

                              {/* Employee Info */}
                              <div className="flex-1 min-w-0">
                                {/* Name */}
                                <p
                                  className="font-medium text-base truncate"
                                  style={{
                                    color: isDark ? "#f9fafb" : "#111827",
                                  }}
                                >
                                  {get(employee, "lastName", "")}{" "}
                                  {get(employee, "firstName", "")}{" "}
                                  {get(employee, "fatherName", "")}
                                </p>

                                {/* Unit Code Name */}
                                {get(employee, "empoloyeeUnitCodeName", "") && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <svg
                                      className="w-3.5 h-3.5 flex-shrink-0"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      style={{
                                        color: isDark ? "#6b7280" : "#9ca3af",
                                      }}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                      />
                                    </svg>
                                    <p
                                      className="text-xs truncate"
                                      style={{
                                        color: isDark ? "#9ca3af" : "#6b7280",
                                      }}
                                    >
                                      {get(
                                        employee,
                                        "empoloyeeUnitCodeName",
                                        ""
                                      )}
                                    </p>
                                  </div>
                                )}

                                {/* Schedule Tag */}
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className="text-xs"
                                    style={{
                                      color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                  >
                                    Расписание:
                                  </span>
                                  <span
                                    className="text-xs px-2.5 py-1 rounded-md border font-medium inline-flex items-center"
                                    style={{
                                      color: isDark ? "#93c5fd" : "#2563eb",
                                      borderColor: isDark
                                        ? "#3b82f6"
                                        : "#93c5fd",
                                      background: isDark
                                        ? "rgba(37, 99, 235, 0.1)"
                                        : "#eff6ff",
                                    }}
                                  >
                                    {get(employee, "scheduleName", "")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Button */}
                            <a
                              href={`/dashboard/employees/${get(
                                employee,
                                "employeeUuid"
                              )}`}
                              target="_blank"
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-shrink-0"
                              style={{
                                background: isDark ? "#374151" : "#f3f4f6",
                                color: isDark ? "#e5e7eb" : "#374151",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = isDark
                                  ? "#4b5563"
                                  : "#e5e7eb";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = isDark
                                  ? "#374151"
                                  : "#f3f4f6";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                              }}
                            >
                              Открыть профиль
                            </a>
                          </div>
                        )
                      )
                    ) : (
                      <div
                        className="text-center py-12 rounded-lg"
                        style={{
                          background: isDark ? "#1f2937" : "#f9fafb",
                          border: `1px dashed ${
                            isDark ? "#374151" : "#d1d5db"
                          }`,
                        }}
                      >
                        <svg
                          className="w-12 h-12 mx-auto mb-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          style={{ color: isDark ? "#4b5563" : "#d1d5db" }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p
                          className="text-sm font-medium"
                          style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
                        >
                          Сотрудники не найдены
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {/* create connection between employee and schedule */}
      {createConnectModal && (
        // create connection between employee and schedule

        <MethodModal
          showCloseIcon={true}
          open={createConnectModal}
          closeClick={() => {
            setCreateConnectModal(false);
            setSelectedSchedule(null);
            setSelectedEmployees(new Set());
            setSelectedPosition(null);
            setSearchTerm("");
          }}
        >
          <Typography variant="h6" className="mb-4">
            Подключить сотрудников к расписанию
          </Typography>

          <div className="mt-[10px]">
            <CustomSelect
              options={scheduleOptions}
              value={selectedSchedule}
              onChange={(val) => setSelectedSchedule(val)}
              label="Расписание"
              required
              placeholder="Выберите расписание"
            />
          </div>

          {/* Search Input */}
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск сотрудника"
          />

          {/* ✨ Selected Employees Badge - NEW */}
          <SelectedEmployeesBadge
            employees={filteredEmployees.filter((emp) =>
              selectedEmployees.has(emp.id)
            )}
            onRemove={(id) => {
              const newSelected = new Set(selectedEmployees);
              newSelected.delete(id);
              setSelectedEmployees(newSelected);
            }}
          />

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              onClick={() => {
                const all = new Set(filteredEmployees.map((e) => e.id));
                setSelectedEmployees(all);
              }}
              className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition"
            >
              Выбрать всех сотрудников
            </button>

            <button
              onClick={() => setSelectedEmployees(new Set())}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Очистить
            </button>

            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full h-[46px] rounded-md border border-gray-300 bg-white px-3.5 text-[15px] text-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 hover:border-blue-400 appearance-none cursor-pointer"
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
                Xodimlar topilmadi
              </div>
            ) : (
              filteredEmployees.map((emp, index) => (
                <div
                  key={index}
                  onClick={() => handleToggleEmployee(emp?.id)}
                  className={`group transition-all duration-200 border-2 rounded-xl p-4 cursor-pointer shadow-sm hover:shadow-md
            ${
              selectedEmployees?.has(emp?.id)
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner 
                ${
                  selectedEmployees.has(emp.id)
                    ? "bg-white bg-opacity-20"
                    : "bg-blue-100 text-blue-700"
                }`}
                    >
                      {emp.first_name?.[0] || emp.name?.[0] || "?"}
                    </div>

                    <div className="flex-1">
                      <p
                        className={`font-medium truncate ${
                          selectedEmployees.has(emp.id)
                            ? "text-white"
                            : "text-gray-900"
                        }`}
                      >
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p
                        className={`text-sm ${
                          selectedEmployees.has(emp.id)
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {emp.workplace?.position?.name ||
                          "Bo'lim ko'rsatilmagan"}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border-2
                ${
                  selectedEmployees.has(emp.id)
                    ? "bg-white border-white"
                    : "border-gray-300"
                }`}
                    >
                      {selectedEmployees.has(emp.id) && (
                        <svg
                          className="w-3 h-3 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 
                      0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 
                      12.586l7.293-7.293a1 1 0 011.414 0z"
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

          <div className="flex items-end justify-end">
            <Button
              onClick={SubmitConnectionOfEmployeeToSchedule}
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
              }}
              variant="contained"
            >
              <p>Привязать</p>
            </Button>
          </div>
        </MethodModal>
      )}
    </DashboardLayout>
  );
};

export default Index;
