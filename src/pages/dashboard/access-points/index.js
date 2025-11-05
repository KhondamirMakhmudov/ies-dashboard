import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { config } from "@/config";
import { Button, Typography } from "@mui/material";
import CustomTable from "@/components/table";
import { get, isEmpty, isEqual } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import usePostQuery from "@/hooks/java/usePostQuery";
import CustomSelect from "@/components/select";
import ContentLoader from "@/components/loader";
import toast from "react-hot-toast";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import NoData from "@/components/no-data";
import { useRouter } from "next/router";
import ReportIcon from "@mui/icons-material/Report";
import PrimaryButton from "@/components/button/primary-button";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Link from "next/link";
const Index = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [createAccessPoint, setCreateAccessPoint] = useState(false);
  const [editEntryPoint, setEditEntryPoint] = useState(false);
  const [deleteAccessPoint, setDeleteAccessPoint] = useState(false);

  const [entryPointName, setEntryPointName] = useState("");
  const [entryPointShortName, setEntryPointShortName] = useState("");
  const [buildingDescription, setBuildingDescription] = useState("");
  const [unitCodes, setUnitCodes] = useState([]); // Now contains schedules inside each unit

  const [selectedEntryPointId, setSelectedEntryPointId] = useState(null);
  const [selectedEntryPoint, setselectedEntryPoint] = useState(null);
  const queryClient = useQueryClient();

  // org units
  const { data: enterprises } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true, limit: 150 },
  });

  const optionsEnterprises = get(enterprises, "data", []).map((item) => ({
    value: item.unit_code,
    label: item.name,
  }));

  // schedules
  const { data: allSchedules } = useGetQuery({
    key: KEYS.allSchedules,
    url: URLS.allSchedules,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const optionsSchedules = get(allSchedules, "data", []).map((schedule) => ({
    value: schedule.id,
    label: schedule.name,
  }));

  // get entrypoints
  const {
    data: entrypoints,
    isLoading: isLoadingEntryPoints,
    isFetching: isFetchingEntryPoints,
  } = useGetQuery({
    key: KEYS.entrypoints,
    url: URLS.newEntryPoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // create entrypoints
  const { mutate: createEntryPoint } = usePostQuery({
    key: "create-EntryPoint",
  });

  const handleRemoveAll = () => {
    setEntryPointName("");
    setEntryPointShortName("");
    setBuildingDescription("");
    setUnitCodes([]);
    setselectedEntryPoint(null);
  };

  const submitCreateEntryPoint = () => {
    if (
      !entryPointName ||
      !entryPointShortName ||
      !buildingDescription ||
      unitCodes.length === 0
    ) {
      toast.error("Пожалуйста, заполните все поля", { position: "top-center" });
      return;
    }

    // Validate that each unit has at least one schedule
    const invalidUnit = unitCodes.find(
      (unit) => !unit.schedules || unit.schedules.length === 0
    );
    if (invalidUnit) {
      toast.error("Каждое подразделение должно иметь хотя бы одно расписание", {
        position: "top-center",
      });
      return;
    }

    createEntryPoint(
      {
        url: URLS.newEntryPoints,
        attributes: {
          entryPointName,
          entryPointShortName,
          buildingDescription,
          unitCodes,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Checkpoint muvaffaqiyatli joylandi", {
            position: "top-center",
          });
          setCreateAccessPoint(false);
          handleRemoveAll();
          queryClient.invalidateQueries(KEYS.entrypoints);
        },
        onError: (error) => {
          const message =
            error?.response?.data?.message || "Непредвиденная ошибка";
          toast.error(message, { position: "top-right" });
        },
      }
    );
  };

  const submitEditEntryPoint = async () => {
    if (!selectedEntryPoint) return;

    const original = selectedEntryPoint.original;

    // Helper function to normalize unitCodes with nested schedules
    const normalizeUnitCodes = (arr = []) =>
      arr.map((u) => ({
        code: String(u.code),
        isMain: Number(u.isMain), // Convert to number for consistent comparison
        schedules: (u.schedules || []).map((s) => ({
          scheduleId: Number(s.scheduleId),
          isMain: Number(s.isMain), // Convert to number for consistent comparison
        })),
      }));

    const updatedData = {};

    if (entryPointName !== original.entryPointName) {
      updatedData.entryPointName = entryPointName;
    }
    if (entryPointShortName !== original.entryPointShortName) {
      updatedData.entryPointShortName = entryPointShortName;
    }
    if (buildingDescription !== original.buildingDescription) {
      updatedData.buildingDescription = buildingDescription;
    }

    // Normalize both current and original before comparison
    const normUnitCodes = normalizeUnitCodes(unitCodes);
    const origUnitCodes = normalizeUnitCodes(original.unitCodes || []);

    // Deep comparison that handles arrays properly
    const hasUnitCodesChanged =
      JSON.stringify(normUnitCodes) !== JSON.stringify(origUnitCodes);

    if (hasUnitCodesChanged) {
      updatedData.unitCodes = normUnitCodes;
    }

    if (Object.keys(updatedData).length === 0) {
      toast.error("Изменений нет", { position: "top-center" });
      return;
    }

    try {
      const res = await fetch(
        `${config.JAVA_API_URL}${URLS.newEntryPoints}/${selectedEntryPointId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || "Ошибка при обновлении");
      }

      toast.success("Точка доступа успешно обновлена", {
        position: "top-center",
      });

      // Reset states
      setEditEntryPoint(false);
      handleRemoveAll();

      queryClient.invalidateQueries(KEYS.entrypoints);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Произошла ошибка при обновлении";

      toast.error(errorMessage, { position: "top-right" });
    }
  };

  const handleDeleteCheckPoint = async (id) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.newEntryPoints}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.entrypoints);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  // Helper function to get unit name by code
  const getUnitNameByCode = (code) => {
    const unit = get(enterprises, "data", []).find(
      (item) => item.unit_code === code
    );
    return unit?.name || code;
  };

  // Helper function to get schedule name by id
  const getScheduleNameById = (id) => {
    const schedule = get(allSchedules, "data", []).find(
      (item) => item.id === id
    );
    return schedule?.name || `Schedule ${id}`;
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "entryPointName",
      header: "Имя точки входа",
    },
    {
      accessorKey: "entryPointShortName",
      header: "Краткое название точки входа",
    },
    {
      accessorKey: "unitCodes",
      header: "Подразделения и расписания",
      cell: ({ row }) => {
        const units = row.original.unitCodes || [];
        if (units.length === 0) return "—";

        return (
          <div className="space-y-2">
            {units.map((unit, idx) => (
              <div key={idx} className="border-l-2 border-blue-300 pl-2">
                <div className="text-sm font-medium">
                  {getUnitNameByCode(unit.code)}
                  {unit.isMain === 1 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      Основной
                    </span>
                  )}
                </div>
                {unit.schedules && unit.schedules.length > 0 && (
                  <div className="ml-2 mt-1 space-y-1">
                    {unit.schedules.map((sch, schIdx) => (
                      <div key={schIdx} className="text-xs text-gray-600">
                        • {getScheduleNameById(sch.scheduleId)}
                        {sch.isMain === 1 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded">
                            Осн.
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2 items-center ">
          <Link
            href={`/dashboard/access-points/${row.original.id}`}
            className="text-sm px-3 py-1.5 bg-[#4182F9] text-white hover:bg-blue-600 rounded-md transition-all"
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
            <p>Подробнее</p>
          </Link>
          <Button
            onClick={() => {
              setselectedEntryPoint(row);
              setSelectedEntryPointId(row.original.id);
              setEntryPointName(row.original.entryPointName);
              setEntryPointShortName(row.original.entryPointShortName);
              setBuildingDescription(row.original.buildingDescription);
              setUnitCodes(row.original.unitCodes || []);
              setEditEntryPoint(true);
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
              setSelectedEntryPointId(row.original.id);
              setDeleteAccessPoint(true);
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

  const handleUnitCodeChange = (index, field, value) => {
    setUnitCodes((prev) =>
      prev.map((u, i) => (i === index ? { ...u, [field]: value } : u))
    );
  };

  const handleScheduleChange = (unitIndex, scheduleIndex, field, value) => {
    setUnitCodes((prev) =>
      prev.map((u, i) =>
        i === unitIndex
          ? {
              ...u,
              schedules: u.schedules.map((s, si) =>
                si === scheduleIndex ? { ...s, [field]: value } : s
              ),
            }
          : u
      )
    );
  };

  const addScheduleToUnit = (unitIndex) => {
    const updated = [...unitCodes];
    if (!updated[unitIndex].schedules) {
      updated[unitIndex].schedules = [];
    }
    updated[unitIndex].schedules.push({ scheduleId: "", isMain: 0 });
    setUnitCodes(updated);
  };

  const removeScheduleFromUnit = (unitIndex, scheduleIndex) => {
    const updated = [...unitCodes];
    updated[unitIndex].schedules = updated[unitIndex].schedules.filter(
      (_, i) => i !== scheduleIndex
    );
    setUnitCodes(updated);
  };

  if (isFetchingEntryPoints || isLoadingEntryPoints) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Точки доступа"}>
      {isEmpty(get(entrypoints, "data", [])) ? (
        <NoData onCreate={() => setCreateAccessPoint(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[20px] rounded-md border border-gray-200"
        >
          <PrimaryButton
            onClick={() => setCreateAccessPoint(true)}
            variant="contained"
          >
            Создать
          </PrimaryButton>

          <CustomTable
            data={get(entrypoints, "data", [])}
            columns={columns}
            tableClassName={"mt-[10px]"}
          />
        </motion.div>
      )}

      {/* CREATE MODAL */}
      {createAccessPoint && (
        <MethodModal
          open={createAccessPoint}
          showCloseIcon={true}
          width={"50%"}
          closeClick={() => {
            setCreateAccessPoint(false);
            handleRemoveAll();
          }}
        >
          {/* Header Section */}
          <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
            <Typography variant="h5">Добавить точку доступа</Typography>
            <Typography variant="body2" className="text-gray-500 mt-1 ml-12">
              Заполните информацию о новой точке доступа
            </Typography>
          </div>

          <div className="my-6 space-y-6 max-h-[60vh] overflow-y-auto px-1">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <Typography
                  variant="subtitle1"
                  className="font-semibold text-gray-700"
                >
                  Основная информация
                </Typography>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                {/* Entry Point Name */}
                <div>
                  <Input
                    value={entryPointName}
                    onChange={(e) => setEntryPointName(e.target.value)}
                    label={"Имя точки входа"}
                    placeholder="Например: Главный вход"
                    inputClass="!h-[48px] rounded-[10px] !border-gray-300 text-[15px] bg-white"
                    labelClass="text-sm font-medium text-gray-700 mb-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Полное название точки входа в здание
                  </p>
                </div>

                {/* Short Name */}
                <div>
                  <Input
                    value={entryPointShortName}
                    onChange={(e) => setEntryPointShortName(e.target.value)}
                    label={"Краткое название"}
                    placeholder="Например: Вход 1"
                    inputClass="!h-[48px] rounded-[10px] !border-gray-300 text-[15px] bg-white"
                    labelClass="text-sm font-medium text-gray-700 mb-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Короткое название для быстрого поиска
                  </p>
                </div>

                {/* Building Description */}
                <div>
                  <Input
                    value={buildingDescription}
                    onChange={(e) => setBuildingDescription(e.target.value)}
                    label={"Описание"}
                    placeholder="Например: Главный вход в административное здание"
                    inputClass="!h-[48px] rounded-[10px] !border-gray-300 text-[15px] bg-white"
                    labelClass="text-sm font-medium text-gray-700 mb-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Дополнительная информация о расположении
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Codes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500  rounded-full"></div>
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-700"
                  >
                    Привязка подразделений
                  </Typography>
                </div>
                {unitCodes.length > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    {unitCodes.length}{" "}
                    {unitCodes.length === 1 ? "подразделение" : "подразделений"}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <ReportIcon /> Привяжите точку доступа к подразделениям и их
                расписаниям работы
              </p>

              {unitCodes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Подразделения не добавлены
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Нажмите кнопку ниже, чтобы добавить подразделение
                  </Typography>
                </div>
              ) : (
                <AnimatePresence>
                  {unitCodes.map((unit, unitIndex) => (
                    <motion.div
                      key={unitIndex}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border-2 border-gray-200 rounded-xl  hover:border-indigo-300 transition-all shadow-sm"
                    >
                      {/* Unit Header */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-200  rounded-t-xl ">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#4182F9] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                            {unitIndex + 1}
                          </div>
                          <div className="flex-1">
                            <CustomSelect
                              options={optionsEnterprises}
                              value={unit.code}
                              placeholder="Выберите подразделение"
                              onChange={(val) =>
                                handleUnitCodeChange(unitIndex, "code", val)
                              }
                              className="flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition">
                              <input
                                type="checkbox"
                                checked={unit.isMain === 1}
                                onChange={(e) =>
                                  handleUnitCodeChange(
                                    unitIndex,
                                    "isMain",
                                    e.target.checked ? 1 : 0
                                  )
                                }
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Основной
                              </span>
                            </label>
                            <button
                              onClick={() =>
                                setUnitCodes(
                                  unitCodes.filter((_, i) => i !== unitIndex)
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                              title="   "
                            >
                              <ClearIcon />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Schedules Section */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AccessTimeIcon />
                          <Typography
                            variant="body2"
                            className="font-semibold text-gray-700"
                          >
                            Расписания доступа
                          </Typography>
                          {unit.schedules && unit.schedules.length > 0 && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                              {unit.schedules.length}
                            </span>
                          )}
                        </div>

                        {unit.schedules && unit.schedules.length > 0 ? (
                          <div className="space-y-2">
                            {unit.schedules.map((sch, scheduleIndex) => (
                              <motion.div
                                key={scheduleIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
                              >
                                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                  {scheduleIndex + 1}
                                </span>
                                <CustomSelect
                                  options={optionsSchedules}
                                  value={sch.scheduleId}
                                  placeholder="Выберите расписание"
                                  onChange={(val) =>
                                    handleScheduleChange(
                                      unitIndex,
                                      scheduleIndex,
                                      "scheduleId",
                                      val
                                    )
                                  }
                                  className="flex-1"
                                />
                                <label className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-gray-200 cursor-pointer hover:bg-green-50 transition">
                                  <input
                                    type="checkbox"
                                    checked={sch.isMain === 1}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        unitIndex,
                                        scheduleIndex,
                                        "isMain",
                                        e.target.checked ? 1 : 0
                                      )
                                    }
                                    className="w-3.5 h-3.5"
                                  />
                                  <span className="text-xs font-medium text-gray-700">
                                    Осн.
                                  </span>
                                </label>
                                <button
                                  onClick={() =>
                                    removeScheduleFromUnit(
                                      unitIndex,
                                      scheduleIndex
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition"
                                  title="Удалить расписание"
                                >
                                  <ClearIcon />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <AccessTimeIcon className="text-gray-500" /> <br />
                            <Typography
                              variant="caption"
                              className="text-gray-500"
                            >
                              Расписания не добавлены
                            </Typography>
                          </div>
                        )}

                        <button
                          onClick={() => addScheduleToUnit(unitIndex)}
                          className="w-full mt-3 px-4 py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-all flex items-center justify-center gap-2 border border-indigo-200"
                        >
                          <AddIcon />
                          Добавить расписание
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <motion.button
                onClick={() =>
                  setUnitCodes([
                    ...unitCodes,
                    { code: "", isMain: 0, schedules: [] },
                  ])
                }
                className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Добавить подразделение
              </motion.button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky top-0 bg-white border-t-2 border-gray-200 pt-4 mt-6 flex justify-end gap-3">
            <PrimaryButton
              variant="contained"
              onClick={() => {
                setCreateAccessPoint(false);
                handleRemoveAll();
              }}
              backgroundColor="#e5e7eb"
              color="black"
            >
              Отмена
            </PrimaryButton>
            <PrimaryButton variant="contained" onClick={submitCreateEntryPoint}>
              Создать
            </PrimaryButton>
          </div>
        </MethodModal>
      )}
      {/* EDIT MODAL */}
      {editEntryPoint && selectedEntryPoint && (
        <MethodModal
          open={editEntryPoint}
          showCloseIcon={true}
          width={"50%"}
          closeClick={() => {
            setEditEntryPoint(false);
            handleRemoveAll();
          }}
        >
          {/* Header Section */}
          <div className="sticky top-0 bg-white z-10 pb-4 border-b border-gray-200">
            <Typography
              variant="h5"
              className="font-bold text-gray-800 flex items-center gap-2"
            >
              Редактировать точку доступа
            </Typography>
            <Typography variant="body2" className="text-gray-500 mt-1 ml-12">
              Внесите необходимые изменения в точку доступа
            </Typography>
          </div>

          <div className="my-6 space-y-6 max-h-[60vh] overflow-y-auto px-1">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <Typography
                  variant="subtitle1"
                  className="font-semibold text-gray-700"
                >
                  Основная информация
                </Typography>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                {/* Entry Point Name */}
                <div>
                  <Input
                    value={entryPointName}
                    onChange={(e) => setEntryPointName(e.target.value)}
                    label={"Имя точки входа"}
                    placeholder="Например: Главный вход"
                    inputClass="!h-[48px] rounded-[10px] !border-gray-300 text-[15px] bg-white"
                    labelClass="text-sm font-medium text-gray-700 mb-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Полное название точки входа в здание
                  </p>
                </div>

                {/* Short Name */}
                <div>
                  <Input
                    value={entryPointShortName}
                    onChange={(e) => setEntryPointShortName(e.target.value)}
                    label={"Краткое название"}
                    placeholder="Например: Вход 1"
                    inputClass="!h-[48px] rounded-[10px] !border-gray-300 text-[15px] bg-white"
                    labelClass="text-sm font-medium text-gray-700 mb-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Короткое название для быстрого поиска
                  </p>
                </div>

                {/* Building Description */}
                <div>
                  <Input
                    value={buildingDescription}
                    onChange={(e) => setBuildingDescription(e.target.value)}
                    label={"Описание"}
                    placeholder="Например: Главный вход в административное здание"
                    inputClass="!h-[48px] rounded-[10px] !border-gray-300 text-[15px] bg-white"
                    labelClass="text-sm font-medium text-gray-700 mb-1"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1 ml-1">
                    Дополнительная информация о расположении
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Codes Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <Typography
                    variant="subtitle1"
                    className="font-semibold text-gray-700"
                  >
                    Привязка подразделений
                  </Typography>
                </div>
                {unitCodes.length > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                    {unitCodes.length}{" "}
                    {unitCodes.length === 1 ? "подразделение" : "подразделений"}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <ReportIcon /> Привяжите точку доступа к подразделениям и их
                расписаниям работы
              </p>

              {unitCodes.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Подразделения не добавлены
                  </Typography>
                  <Typography variant="caption" className="text-gray-400">
                    Нажмите кнопку ниже, чтобы добавить подразделение
                  </Typography>
                </div>
              ) : (
                <AnimatePresence>
                  {unitCodes.map((unit, unitIndex) => (
                    <motion.div
                      key={unitIndex}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border-2 border-gray-200 rounded-xl  hover:border-indigo-300 transition-all shadow-sm"
                    >
                      {/* Unit Header */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                            {unitIndex + 1}
                          </div>
                          <div className="flex-1">
                            <CustomSelect
                              options={optionsEnterprises}
                              value={unit.code}
                              placeholder="Выберите подразделение"
                              onChange={(val) =>
                                handleUnitCodeChange(unitIndex, "code", val)
                              }
                              className="flex-1"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-green-50 transition">
                              <input
                                type="checkbox"
                                checked={unit.isMain === 1}
                                onChange={(e) =>
                                  handleUnitCodeChange(
                                    unitIndex,
                                    "isMain",
                                    e.target.checked ? 1 : 0
                                  )
                                }
                                className="w-4 h-4 bg-[#4182F9]"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Основной
                              </span>
                            </label>
                            <button
                              onClick={() =>
                                setUnitCodes(
                                  unitCodes.filter((_, i) => i !== unitIndex)
                                )
                              }
                              className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                              title="   "
                            >
                              <ClearIcon />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Schedules Section */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AccessTimeIcon />
                          <Typography
                            variant="body2"
                            className="font-semibold text-gray-700"
                          >
                            Расписания доступа
                          </Typography>
                          {unit.schedules && unit.schedules.length > 0 && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                              {unit.schedules.length}
                            </span>
                          )}
                        </div>

                        {unit.schedules && unit.schedules.length > 0 ? (
                          <div className="space-y-2">
                            {unit.schedules.map((sch, scheduleIndex) => (
                              <motion.div
                                key={scheduleIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
                              >
                                <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                  {scheduleIndex + 1}
                                </span>
                                <CustomSelect
                                  options={optionsSchedules}
                                  value={sch.scheduleId}
                                  placeholder="Выберите расписание"
                                  onChange={(val) =>
                                    handleScheduleChange(
                                      unitIndex,
                                      scheduleIndex,
                                      "scheduleId",
                                      val
                                    )
                                  }
                                  className="flex-1"
                                />
                                <label className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-gray-200 cursor-pointer hover:bg-green-50 transition">
                                  <input
                                    type="checkbox"
                                    checked={sch.isMain === 1}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        unitIndex,
                                        scheduleIndex,
                                        "isMain",
                                        e.target.checked ? 1 : 0
                                      )
                                    }
                                    className="w-3.5 h-3.5 bg-[#4182F9]"
                                  />
                                  <span className="text-xs font-medium text-gray-700">
                                    Осн.
                                  </span>
                                </label>
                                <button
                                  onClick={() =>
                                    removeScheduleFromUnit(
                                      unitIndex,
                                      scheduleIndex
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition"
                                  title="Удалить расписание"
                                >
                                  <ClearIcon />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <AccessTimeIcon className="text-gray-500" /> <br />
                            <Typography
                              variant="caption"
                              className="text-gray-500"
                            >
                              Расписания не добавлены
                            </Typography>
                          </div>
                        )}

                        <button
                          onClick={() => addScheduleToUnit(unitIndex)}
                          className="w-full mt-3 px-4 py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium transition-all flex items-center justify-center gap-2 border border-indigo-200"
                        >
                          <AddIcon />
                          Добавить расписание
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              <motion.button
                onClick={() =>
                  setUnitCodes([
                    ...unitCodes,
                    { code: "", isMain: 0, schedules: [] },
                  ])
                }
                className="w-full px-5 py-3 rounded-xl bg-blue-400 hover:bg-blue-500 cursor-pointer   text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Добавить подразделение
              </motion.button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky top-0 bg-white border-t-2 border-gray-200 pt-4 mt-6 flex justify-end gap-3">
            <PrimaryButton
              backgroundColor="#e5e7eb"
              color="black"
              onClick={() => {
                setEditEntryPoint(false);
                handleRemoveAll();
              }}
            >
              Отмена
            </PrimaryButton>

            <PrimaryButton
              backgroundColor="#d97706"
              color="white"
              variant="contained"
              onClick={submitEditEntryPoint}
            >
              Сохранить изменения
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* DELETE MODAL */}
      {deleteAccessPoint && (
        <DeleteModal
          open={deleteAccessPoint}
          onClose={() => {
            setDeleteAccessPoint(false);
            setSelectedEntryPointId(null);
          }}
          deleting={() => {
            handleDeleteCheckPoint(selectedEntryPointId);
            setDeleteAccessPoint(false);
            setSelectedEntryPointId(null);
          }}
          title="  Вы уверены, что хотите удалить эту точку доступа?  Это действие необратимо и приведет к удалению всех связанных данных.  Пожалуйста, подтвердите своё решение."
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
