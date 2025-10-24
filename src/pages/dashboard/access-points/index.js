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
          setEntryPointName("");
          setEntryPointShortName("");
          setBuildingDescription("");
          setUnitCodes([]);
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
        isMain: u.isMain !== undefined ? u.isMain : 0,
        schedules: (u.schedules || []).map((s) => ({
          scheduleId: Number(s.scheduleId),
          isMain: s.isMain !== undefined ? s.isMain : 0,
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

    if (!isEqual(normUnitCodes, origUnitCodes)) {
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

      toast.success("Checkpoint muvaffaqиятно обновлен", {
        position: "top-center",
      });

      // Reset states
      setEditEntryPoint(false);
      setEntryPointName("");
      setEntryPointShortName("");
      setBuildingDescription("");
      setUnitCodes([]);
      setselectedEntryPoint(null);

      queryClient.invalidateQueries(KEYS.entrypoints);
    } catch (err) {
      toast.error(err.message, { position: "top-right" });
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
        <div className="flex gap-2">
          <Button
            onClick={() =>
              router.push(`/dashboard/access-points/${row.original.id}`)
            }
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
          </Button>
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

  const handleUnitCodeChange = (unitIndex, field, value) => {
    const updated = [...unitCodes];
    updated[unitIndex][field] = value;
    setUnitCodes(updated);
  };

  const handleScheduleChange = (unitIndex, scheduleIndex, field, value) => {
    const updated = [...unitCodes];
    updated[unitIndex].schedules[scheduleIndex][field] = value;
    setUnitCodes(updated);
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
          className="bg-white p-[12px] my-[50px] rounded-md border border-gray-200"
        >
          <div className="col-span-12 space-y-[15px]">
            <div className="max-w-[100px]">
              <Button
                onClick={() => setCreateAccessPoint(true)}
                sx={{
                  textTransform: "initial",
                  fontFamily: "DM Sans, sans-serif",
                  backgroundColor: "#4182F9",
                  boxShadow: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "14px",
                  minWidth: "100px",
                  borderRadius: "8px",
                }}
                variant="contained"
              >
                Создать
              </Button>
            </div>
            <CustomTable data={get(entrypoints, "data")} columns={columns} />
          </div>
        </motion.div>
      )}

      {/* CREATE MODAL */}
      {createAccessPoint && (
        <MethodModal
          open={createAccessPoint}
          showCloseIcon={true}
          closeClick={() => {
            setCreateAccessPoint(false);
            setEntryPointName("");
            setEntryPointShortName("");
            setBuildingDescription("");
            setUnitCodes([]);
          }}
        >
          <Typography variant="h6" className="mb-2">
            Добавить точку доступа
          </Typography>

          <div className="my-[20px] space-y-[15px] max-h-[60vh] overflow-y-auto">
            {/* Entry Point Name */}
            <Input
              onChange={(e) => setEntryPointName(e.target.value)}
              label={"Имя точки входа"}
              placeholder="Введите имя точки входа"
              inputClass="!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              labelClass="text-sm"
              required
            />

            {/* Short Name */}
            <Input
              onChange={(e) => setEntryPointShortName(e.target.value)}
              label={"Краткое название точки входа"}
              placeholder="Введите краткое название"
              inputClass="!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              labelClass="text-sm"
              required
            />

            {/* Building Description */}
            <Input
              onChange={(e) => setBuildingDescription(e.target.value)}
              label={"Описание здания"}
              placeholder="например: Главный вход в административное здание"
              inputClass="!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              labelClass="text-sm"
              required
            />

            {/* Unit Codes with nested schedules */}
            <div className="space-y-3">
              <Typography
                variant="subtitle1"
                className="font-semibold text-gray-700"
              >
                Привязать точки доступа к подразделениям и расписаниям
              </Typography>

              <AnimatePresence>
                {unitCodes.map((unit, unitIndex) => (
                  <motion.div
                    key={unitIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200"
                  >
                    {/* Unit Selection */}
                    <div className="flex items-center gap-3 mb-3">
                      <CustomSelect
                        options={optionsEnterprises}
                        value={unit.code}
                        placeholder="Выберите подразделение"
                        onChange={(val) =>
                          handleUnitCodeChange(unitIndex, "code", val)
                        }
                        className="flex-1"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
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
                          className="w-4 h-4 accent-blue-500"
                        />
                        Основной
                      </label>
                      <button
                        onClick={() =>
                          setUnitCodes(
                            unitCodes.filter((_, i) => i !== unitIndex)
                          )
                        }
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Nested Schedules */}
                    <div className="ml-4 space-y-2">
                      <Typography
                        variant="body2"
                        className="font-medium text-gray-600 mb-2"
                      >
                        Расписания для этого подразделения:
                      </Typography>

                      {unit.schedules &&
                        unit.schedules.map((sch, scheduleIndex) => (
                          <motion.div
                            key={scheduleIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200"
                          >
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
                            <label className="flex items-center gap-1 text-xs text-gray-600">
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
                                className="w-3 h-3 accent-indigo-500"
                              />
                              Осн.
                            </label>
                            <button
                              onClick={() =>
                                removeScheduleFromUnit(unitIndex, scheduleIndex)
                              }
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}

                      <button
                        onClick={() => addScheduleToUnit(unitIndex)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 transition"
                      >
                        + Добавить расписание
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setUnitCodes([
                    ...unitCodes,
                    { code: "", isMain: 0, schedules: [] },
                  ])
                }
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition"
              >
                Добавить подразделение
              </motion.button>
            </div>
          </div>

          <div className="sticky bg-white border-t border-gray-200 pt-3 flex justify-end gap-3">
            <Button
              sx={{
                textTransform: "initial",
                backgroundColor: "#4182F9",
                color: "white",
                borderRadius: "8px",
              }}
              variant="contained"
              onClick={submitCreateEntryPoint}
            >
              Создать
            </Button>
          </div>
        </MethodModal>
      )}

      {/* EDIT MODAL */}
      {editEntryPoint && selectedEntryPoint && (
        <MethodModal
          open={editEntryPoint}
          showCloseIcon={true}
          closeClick={() => {
            setEditEntryPoint(false);
            setEntryPointName("");
            setEntryPointShortName("");
            setBuildingDescription("");
            setUnitCodes([]);
            setselectedEntryPoint(null);
          }}
        >
          <Typography variant="h6" className="mb-2">
            Редактировать точку доступа
          </Typography>

          <div className="my-[20px] space-y-[15px] max-h-[60vh] overflow-y-auto">
            <Input
              value={entryPointName}
              onChange={(e) => setEntryPointName(e.target.value)}
              label={"Имя точки входа"}
              placeholder="Введите имя точки входа"
              inputClass="!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              labelClass="text-sm"
              required
            />

            <Input
              value={entryPointShortName}
              onChange={(e) => setEntryPointShortName(e.target.value)}
              label={"Краткое название точки входа"}
              placeholder="Введите краткое название"
              inputClass="!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              labelClass="text-sm"
              required
            />

            <Input
              value={buildingDescription}
              onChange={(e) => setBuildingDescription(e.target.value)}
              label={"Описание здания"}
              placeholder="например: Главный вход в административное здание"
              inputClass="!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              labelClass="text-sm"
              required
            />

            {/* Unit Codes with nested schedules */}
            <div className="space-y-3">
              <Typography
                variant="subtitle1"
                className="font-semibold text-gray-700"
              >
                Привязать точки доступа к подразделениям и расписаниям
              </Typography>

              <AnimatePresence>
                {unitCodes.map((unit, unitIndex) => (
                  <motion.div
                    key={unitIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200"
                  >
                    {/* Unit Selection */}
                    <div className="flex items-center gap-3 mb-3">
                      <CustomSelect
                        options={optionsEnterprises}
                        value={unit.code}
                        placeholder="Выберите подразделение"
                        onChange={(val) =>
                          handleUnitCodeChange(unitIndex, "code", val)
                        }
                        className="flex-1"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
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
                          className="w-4 h-4 accent-blue-500"
                        />
                        Основной
                      </label>
                      <button
                        onClick={() =>
                          setUnitCodes(
                            unitCodes.filter((_, i) => i !== unitIndex)
                          )
                        }
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Nested Schedules */}
                    <div className="ml-4 space-y-2">
                      <Typography
                        variant="body2"
                        className="font-medium text-gray-600 mb-2"
                      >
                        Расписания для этого подразделения:
                      </Typography>

                      {unit.schedules &&
                        unit.schedules.map((sch, scheduleIndex) => (
                          <motion.div
                            key={scheduleIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200"
                          >
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
                            <label className="flex items-center gap-1 text-xs text-gray-600">
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
                                className="w-3 h-3 accent-indigo-500"
                              />
                              Осн.
                            </label>
                            <button
                              onClick={() =>
                                removeScheduleFromUnit(unitIndex, scheduleIndex)
                              }
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </motion.div>
                        ))}

                      <button
                        onClick={() => addScheduleToUnit(unitIndex)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-medium hover:bg-indigo-200 transition"
                      >
                        + Добавить расписание
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setUnitCodes([
                    ...unitCodes,
                    { code: "", isMain: 0, schedules: [] },
                  ])
                }
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition"
              >
                Добавить подразделение
              </motion.button>
            </div>
          </div>

          <div className="sticky bg-white border-t border-gray-200 pt-3 flex justify-end gap-3">
            <Button
              sx={{
                textTransform: "initial",
                backgroundColor: "#e5e7eb",
                color: "black",
                borderRadius: "8px",
              }}
              variant="contained"
              onClick={() => {
                setEditEntryPoint(false);
                setselectedEntryPoint(null);
              }}
            >
              Отмена
            </Button>
            <Button
              sx={{
                textTransform: "initial",
                backgroundColor: "#4182F9",
                color: "white",
                borderRadius: "8px",
              }}
              variant="contained"
              onClick={submitEditEntryPoint}
            >
              Сохранить изменения
            </Button>
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
