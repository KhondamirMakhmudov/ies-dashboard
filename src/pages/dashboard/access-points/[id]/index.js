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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Link from "next/link";
import ContentLoader from "@/components/loader";
import NoData from "@/components/no-data";
import usePostQuery from "@/hooks/java/usePostQuery";
import { useState } from "react";
import MethodModal from "@/components/modal/method-modal";
import { Typography, Button, Modal, Switch } from "@mui/material";
import CustomSelect from "@/components/select";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ShareIcon from "@mui/icons-material/Share";

import DeleteModal from "@/components/modal/delete-modal";

import { config } from "@/config";
import CustomTable from "@/components/table";
import usePutQuery from "@/hooks/java/usePutQuery";

const Index = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [selectScheduleId, setSelectScheduleId] = useState(null);
  const [entryPointScheduleId, setEntryPointScheduleId] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isPriority, setIsPriority] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const {
    data: entrypoint,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.entrypoint,
    url: `${URLS.entrypoints}/${id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!id && !!session?.accessToken,
  });

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

  const { data: allSchedules } = useGetQuery({
    key: KEYS.allSchedules,
    url: URLS.allSchedules,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
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

  // edit priority of schedule for entrypoint

  const { mutate: editPriorityOfConnection } = usePutQuery({
    listKeyId: "edit-priority",
  });

  const onSubmitEditPriorityOfConnection = () => {
    editPriorityOfConnection(
      {
        url: `${
          URLS.scheduleOfEntrypoints
        }/${selectScheduleId}/entry-point/${id}/priority?priority=${
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
          toast.success("Приоритет успешно изменен", {
            position: "top-center",
          });
          setEditModal(false);
          queryClient.invalidateQueries(KEYS.entrypoint);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // remove connection
  const onSubmitDisconnectSchedule = async () => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.allSchedules}/entry-point-schedule/${entryPointScheduleId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ entryPointScheduleId: entryPointScheduleId }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      setDeleteModal(false);
      queryClient.invalidateQueries(KEYS.unitTypes);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "scheduleName",
      header: "Имя расписания",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.scheduleName}
          {row.original.isMain === 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
              <StarIcon fontSize="small" /> Основное
            </span>
          )}
        </div>
      ),
    },

    {
      accessorKey: "camerasCount",
      header: "Камеры",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <PhotoCameraIcon fontSize="small" className="text-gray-500" />
          {row.original.camerasCount}
        </div>
      ),
    },
    {
      accessorKey: "syncStatus",
      header: "Синхронизация",
      cell: ({ row }) =>
        row.original.syncStatus === "OK" ? (
          <div className="flex items-center gap-1 text-green-600 font-medium">
            <CheckCircleIcon fontSize="small" className="text-green-500" />
            Синхронизировано
          </div>
        ) : (
          <div className="flex items-center gap-1 text-red-600 font-medium">
            <CancelIcon fontSize="small" className="text-red-500" />
            Не синхронизировано
          </div>
        ),
    },
    {
      accessorKey: "priority",
      header: "Приоритет",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isMain === 1}
          color="warning"
          onChange={() => {
            setSelectScheduleId(row.original.scheduleId);

            setIsPriority(row.original.isMain === 1 ? false : true);
            setEditModal(true); // modal ochiladi
          }}
        />
      ),
    },
    {
      accessorKey: "actions",
      header: "Действия",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link href={`/dashboard/schedule/${row.original.scheduleId}`}>
            <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-1 px-2 rounded-lg shadow-sm cursor-pointer">
              {/* <ArrowForwardIcon fontSize="14px" /> */}
              Перейти
            </button>
          </Link>

          <button
            onClick={() => {
              setDeleteModal(true);
              setEntryPointScheduleId(row.original.entryPointScheduleId);
            }}
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-600 text-xs sm:text-sm py-1 px-2 rounded-lg shadow-sm cursor-pointer"
          >
            {/* <ReplyIcon fontSize="14px" /> */}
            Отвязать
          </button>
        </div>
      ),
    },
  ];
  return (
    <DashboardLayout headerTitle={"Точки доступа"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-6 my-[50px] rounded-md border border-gray-200"
      >
        <div className="bg-white rounded-xl   mx-auto ">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b border-b-gray-200 pb-3">
            Точка доступа №{id}
          </h1>

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
              <p className="text-sm text-gray-500">Структура</p>
              <p className="text-lg font-medium text-gray-900">
                {get(entrypoint, "data.structure.structureName", [])}
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
          className="bg-white p-6 my-[50px] rounded-md border border-gray-200"
        >
          <div className=" border border-gray-200 rounded-md mt-[20px]">
            <div className="flex border-b border-b-gray-200 p-3 justify-between items-center mb-6">
              <h2 className="text-xl font-semibold  text-gray-800 ">
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
        </motion.div>
      )}
      {/* Attach an existing schedule to an entry point */}
      {createModal && (
        <MethodModal
          open={createModal}
          onClose={() => {
            setCreateModal(false);
            setIsPriority(false);
            setSelectScheduleId(null);
          }}
        >
          <Typography variant="h6">
            Привязать существующее расписание к точке входа
          </Typography>

          <div className="my-[30px]">
            <CustomSelect
              label={"Выберите расписание"}
              options={options}
              value={selectScheduleId}
              onChange={(val) => setSelectScheduleId(val)}
            />

            {/* Toggle switch */}
            <div className="flex items-center gap-3 mt-[10px]">
              <button
                type="button"
                onClick={() => setIsPriority(!isPriority)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none 
          ${isPriority ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out
            ${isPriority ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
              <span className="text-gray-700 font-medium">
                Сделать основным
              </span>
            </div>

            <Button
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#4182F9",
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
              onClick={SubmitCreateConnnection}
              type="submit"
            >
              Создать
            </Button>
          </div>
        </MethodModal>
      )}

      {editModal && (
        <MethodModal open={editModal} onClose={() => setEditModal(false)}>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {isPriority ? "Сделать основным?" : "Убрать из основных?"}
            </h2>
            <p className="text-gray-600">
              Вы уверены, что хотите{" "}
              {isPriority
                ? "сделать это расписание основным"
                : "убрать из основных"}
              ?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Отмена
              </button>
              <button
                onClick={onSubmitEditPriorityOfConnection}
                className="px-4 py-2 bg-orange-500 text-white rounded"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </MethodModal>
      )}

      {/* disconnect schedule from entry point */}

      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          deleting={onSubmitDisconnectSchedule}
          title={
            "Вы уверены, что хотите удалить привязку расписания к точке входа и отключить его в камерах?"
          }
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
