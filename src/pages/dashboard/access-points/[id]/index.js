import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { get, isEmpty } from "lodash";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import StarIcon from "@mui/icons-material/Star";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Link from "next/link";
import ContentLoader from "@/components/loader";
import NoData from "@/components/no-data";
import usePostQuery from "@/hooks/java/usePostQuery";
import { useState } from "react";
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

const Index = () => {
  const queryClient = useQueryClient();
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
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [newMainScheduleId, setNewMainScheduleId] = useState(null);
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

  // Filter employees based on search query
  const filteredEmployeesConnectedToSchedule = get(
    connectedEmployeesToSchedule,
    "data.employees",
    []
  ).filter((employee) => {
    if (!searchQuery.trim()) return true;

    const fullName = `${get(employee, "firstName", "")} ${get(
      employee,
      "lastName",
      ""
    )}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const options = get(allSchedules, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  // Привязывает существующее расписание к точке входа и синхронизирует с камерами

  const { mutate: connectScheduleToEntryPoint } = usePostQuery({
    listKeyId: "connectScheduleToEntryPoint",
  });

  const SubmitCreateConnnection = () => {
    connectScheduleToEntryPoint(
      {
        url: `${
          URLS.scheduleOfEntrypoints
        }/${selectScheduleId}/bind-to-entry-point/${id}?priority=${
          isPriority ? 1 : 0
        }`,
        attributes: {
          scheduleId: +selectScheduleId,
          entryPointId: +id,
          priority: isPriority ? 1 : 0,
        },

        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Расписание успешно привязано", {
            position: "top-center",
          });
          setCreateModal(false);
          setIsPriority(false);
          setSelectScheduleId(null);
          queryClient.invalidateQueries(KEYS.entrypoint);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
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
        className="bg-white p-6 my-[20px] rounded-md border border-gray-200"
      >
        <div className="bg-white rounded-xl   mx-auto ">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-800  border-b border-b-gray-200 pb-3">
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
              <p className="text-sm text-gray-500">Полное название</p>
              <p className="text-lg font-medium text-gray-900">
                {get(entrypoint, "data.entryPointName", [])}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Короткое название</p>
              <p className="text-lg font-medium text-gray-900">
                {get(entrypoint, "data.entryPointShortName", [])}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Описание здания</p>
              <p className="text-lg font-medium text-gray-900">
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
          className="bg-white my-[20px] rounded-md border border-gray-200"
        >
          <div className=" rounded-md  grid grid-cols-12">
            {/* Sidebar (vertical tabs) */}
            <div className="col-span-3 self-start flex flex-col border-r border-gray-200 bg-gray-50">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative text-left px-4 py-3 text-[15px] font-medium transition-colors ${
                    tab === t.key
                      ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}

                  {tab === t.key && (
                    <motion.span
                      layoutId="underline"
                      className="absolute right-0 top-0 h-full w-[4px] bg-blue-600 rounded-l-full"
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
                    <h2 className="text-xl font-semibold text-gray-800">
                      Подразделения точки доступа
                    </h2>

                    <Link
                      className="bg-[#4182F9] px-4 py-2 rounded-md text-white text-sm"
                      href={
                        "/dashboard/structure-organizations/management-organizations"
                      }
                    >
                      Все подразделения
                    </Link>
                  </div>

                  {isEmpty(get(entrypoint, "data.unitCodes", [])) ? (
                    <p className="text-gray-400 italic text-sm">
                      Подразделения не привязаны
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {get(entrypoint, "data.unitCodes", []).map(
                        (unitCode, index) => (
                          <li
                            key={index}
                            className="border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition p-4"
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

              {/* {tab === "schedule" && (
                <div>
                  <div className="flex border-b border-b-gray-200 p-3 justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Расписания точки доступа
                    </h2>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCreateModal(true)}
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
                        <ShareIcon sx={{ width: "20px", height: "20px" }} />
                        <p>Привязать</p>
                      </Button>
                    </div>
                  </div>

                  <CustomTable
                    data={get(schedulesOfEntrypoints, "data.schedules", [])}
                    columns={columns}
                  />
                </div>
              )} */}

              {tab === "employees" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-[10px]  rounded-md"
                >
                  <div className="flex justify-between items-center">
                    <Typography variant="h6">
                      Сотрудники в точке доступа
                    </Typography>
                    <PrimaryButton onClick={() => setCreateConnectModal(true)}>
                      {" "}
                      <ShareIcon sx={{ width: "20px", height: "20px" }} />
                      <p>Привязать</p>
                    </PrimaryButton>
                  </div>

                  <div className="space-y-[10px] my-[10px]">
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
                            className="flex justify-between text-sm items-center"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner bg-blue-600 border-blue-600 text-white`}
                              >
                                {employee.firstName?.[0] || "?"}
                                {employee.lastName?.[0] || "?"}
                              </div>
                              <div>
                                <p>
                                  {get(employee, "firstName", "")}{" "}
                                  {get(employee, "lastName", "")}
                                </p>
                                <p className="text-sm text-gray-400">
                                  привязан к расписанию:{" "}
                                  <span className="text-blue-600 border border-blue-600 bg-blue-100 px-2 py-1 rounded-md text-xs">
                                    {get(employee, "scheduleName", "")}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <a
                              href={`/dashboard/employees/${get(
                                employee,
                                "employeeUuid"
                              )}`}
                              target="_blank"
                              className="bg-gray-300 px-4 py-2
                          rounded-md"
                            >
                              {" "}
                              Страница сотрудника{" "}
                            </a>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-gray-400 text-center py-4">
                        Сотрудники не найдены
                      </p>
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
