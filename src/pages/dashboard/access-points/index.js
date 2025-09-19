import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { config } from "@/config";
import { Button, Typography } from "@mui/material";
import CustomTable from "@/components/table";
import { get, isEmpty } from "lodash";
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
import usePutQuery from "@/hooks/java/usePutQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import NoData from "@/components/no-data";
import Link from "next/link";
import { useRouter } from "next/router";

const Index = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [createAccessPoint, setCreateAccessPoint] = useState(false);
  const [editEntryPoint, setEditEntryPoint] = useState(false);
  const [deleteAccessPoint, setDeleteAccessPoint] = useState(false);
  //
  const [entryPointName, setEntryPointName] = useState("");
  const [entryPointShortName, setEntryPointShortName] = useState("");
  const [buildingDescription, setBuildingDescription] = useState("");
  const [unitCodes, setUnitCodes] = useState([]);
  const [schedules, setSchedules] = useState([]);

  //
  const [selectedStructureOfOrg, setSelectedStructureOfOrg] = useState(null);
  const [selectedEntryPointId, setSelectedEntryPointId] = useState(null);
  const [selectUnitCode, setSelectUnitCode] = useState(null);
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
  const {
    data: allSchedules,
    isLoading,
    isFetching,
  } = useGetQuery({
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

  // get structure of organization
  const { data: structureOfOrganizations } = useGetQuery({
    key: [KEYS.structureOfOrganizations, createAccessPoint || editEntryPoint],
    url: URLS.structureOfOrganizations,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && (createAccessPoint || editEntryPoint),
  });

  const options = get(structureOfOrganizations, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.nameDep,
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

  useEffect(() => {
    if (createAccessPoint) {
      setUnitCodes([{ scheduleId: 10, isMain: 1 }]);
    }
  }, []);

  const submitCreateEntryPoint = () => {
    if (
      !entryPointName ||
      !entryPointShortName ||
      !buildingDescription ||
      unitCodes.length === 0 ||
      schedules.length === 0
    ) {
      toast.error("Пожалуйста, заполните все поля", { position: "top-center" });
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
          schedules,
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
          setSchedules([]);
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

  // edit entrypoints
  const { mutate: editEntrypoint } = usePutQuery({
    listKeyId: "edit-checkpoint",
  });

  const submitEditEntrypoint = (id) => {
    editEntrypoint(
      {
        url: `${URLS.entrypoints}/${id}`,
        attributes: {
          entryPointName: entryPointName,
          entryPointShortName: entryPointShortName,
          structureId: selectedStructureOfOrg,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Entrypoint muvaffaqiyatli tahrirlandi", {
            position: "top-center",
          });
          setEditEntryPoint(false);
          queryClient.invalidateQueries(KEYS.entrypoints);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // delete accesspoint

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
          body: JSON.stringify({ id }),
        }
      );
      console.log(response);

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      if (response.status !== 204) {
        await response.json();
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.entrypoints);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
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
      header: "Краткое название точки входа.",
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
              setSelectedEntryPointId(row.original.id);
              setEntryPointName(row.original.entryPointName);
              setEntryPointShortName(row.original.entryPointShortName);
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
            // onClick={() => handleDeleteCheckPoint(row.id)}
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
    const updated = [...unitCodes];
    updated[index][field] = value;
    setUnitCodes(updated);
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
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
      {isEmpty(entrypoints, "data", []) ? (
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
          {/* create modal */}
        </motion.div>
      )}

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
            setSchedules([]);
          }}
        >
          <Typography variant="h6" className="mb-2">
            Добавить точку доступа
          </Typography>

          {/* Scroll + height fix */}
          <div className="my-[20px] space-y-[15px] max-h-[60vh] overflow-y-auto ">
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

            {/* Unit Codes */}
            <div className="space-y-3">
              <Typography
                variant="subtitle1"
                className="font-semibold text-gray-700"
              >
                Привязать точки доступа к подразделениям
              </Typography>

              <AnimatePresence>
                {unitCodes.map((unit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200"
                  >
                    <CustomSelect
                      options={optionsEnterprises}
                      value={unit.code}
                      placeholder="Выберите подразделение"
                      onChange={(val) =>
                        handleUnitCodeChange(index, "code", val)
                      }
                      className="flex-1"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={unit.isMain === 1}
                        onChange={(e) =>
                          handleUnitCodeChange(
                            index,
                            "isMain",
                            e.target.checked ? 1 : 0
                          )
                        }
                        className="w-4 h-4 accent-blue-500"
                      />
                      Основной
                    </label>

                    {/* Delete button */}
                    <button
                      onClick={() =>
                        setUnitCodes(unitCodes.filter((_, i) => i !== index))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setUnitCodes([...unitCodes, { code: "", isMain: 0 }])
                }
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition"
              >
                Добавить
              </motion.button>
            </div>

            {/* Schedules */}
            <div className="space-y-3 mt-6">
              <Typography
                variant="subtitle1"
                className="font-semibold text-gray-700"
              >
                Привязать точки доступа к расписаниям
              </Typography>

              <AnimatePresence>
                {schedules.map((sch, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200"
                  >
                    <CustomSelect
                      options={optionsSchedules}
                      value={sch.scheduleId}
                      placeholder="Выберите расписание"
                      onChange={(val) =>
                        handleScheduleChange(index, "scheduleId", val)
                      }
                      className="flex-1"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={sch.isMain === 1}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "isMain",
                            e.target.checked ? 1 : 0
                          )
                        }
                        className="w-4 h-4 accent-indigo-500"
                      />
                      Основной
                    </label>

                    {/* Delete button */}
                    <button
                      onClick={() =>
                        setSchedules(schedules.filter((_, i) => i !== index))
                      }
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSchedules([...schedules, { scheduleId: "", isMain: 0 }])
                }
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition"
              >
                Добавить
              </motion.button>
            </div>

            {/* Submit Button */}
          </div>

          <div className="sticky  bg-white border-t border-gray-200 pt-3 flex justify-end gap-3">
            <Button
              sx={{
                textTransform: "initial",
                backgroundColor: "#e5e7eb", // gray
                color: "black",
                borderRadius: "8px",
              }}
              variant="contained"
              onClick={() => setCreateAccessPoint(false)}
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
              onClick={submitCreateEntryPoint}
            >
              Создать
            </Button>
          </div>
        </MethodModal>
      )}

      {/* edit modal */}
      {editEntryPoint && (
        <MethodModal
          open={editEntryPoint}
          onClose={() => setEditEntryPoint(false)}
        >
          <Typography variant="h6" className="mb-2">
            Добавить точку доступа
          </Typography>

          <div className="my-[30px] space-y-[15px]">
            <Input
              name="login"
              value={entryPointName}
              onChange={(e) => {
                setEntryPointName(e.target.value);
              }}
              label={"Имя точки входа"}
              placeholder="введите имя точки входа"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />
            <Input
              name="login"
              value={entryPointShortName}
              onChange={(e) => {
                setEntryPointShortName(e.target.value);
              }}
              label={"Краткое название точки входа."}
              placeholder="Введите краткое название точки входа."
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />
            <CustomSelect
              options={options}
              value={selectedStructureOfOrg}
              placeholder="Выберите структурное подразделение"
              onChange={(val) => setSelectedStructureOfOrg(val)}
            />

            <Button
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#F07427",
                boxShadow: "none",
                color: "white",
                display: "flex", // inline-block emas
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontSize: "14px",
                minWidth: "100px", // yoki widthni kengroq bering
                borderRadius: "8px",
                marginTop: "15px",
              }}
              variant="contained"
              onClick={() => submitEditEntrypoint(selectedEntryPointId)}
              type="submit"
            >
              Изменить
            </Button>
          </div>
        </MethodModal>
      )}

      {/* delete modal */}

      {deleteAccessPoint && (
        <DeleteModal
          open={deleteAccessPoint}
          onClose={() => {
            setDeleteAccessPoint(false);
            setSelectedEntryPointId(null);
          }}
          deleting={() => {
            handleDeleteCheckPoint(selectedEntryPointId); // 👈 DELETE so‘rov
            setDeleteAccessPoint(false);
            setSelectedEntryPointId(null);
          }}
          title="Вы уверены, что хотите удалить эту чекпоинт?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
