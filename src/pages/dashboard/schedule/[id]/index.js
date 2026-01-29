import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Typography, Button } from "@mui/material";
import ScheduleFormat from "@/components/schedule-format";
import { get } from "lodash";
import { useState } from "react";
import toast from "react-hot-toast";
import ContentLoader from "@/components/loader";
import { config } from "@/config";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";
import ScheduleModal from "@/components/modal/schedule-modal";
import { useQueryClient } from "@tanstack/react-query";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";
const Index = () => {
  const { bg, text, border, isDark } = useAppTheme();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const canUpdateSchedule = canUserDo(session?.user, "расписания", "update");
  const canReadSchedule = canUserDo(session?.user, "расписания", "read");
  const canDeleteSchedule = canUserDo(session?.user, "расписания", "delete");

  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const {
    data: schedule,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.schedule,
    url: `${URLS.allSchedules}/${id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!id && !!session?.accessToken,
  });

  // delete schedule
  const onSubmitDeleteSchedule = async () => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.allSchedules}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ id }),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      // Agar 204 bo'lsa, JSON parse qilmaymiz
      if (response.status !== 204) {
        await response.json();
      }
      setDeleteModal(false);
      toast.success("Успешно удалено");
      router.push("/dashboard/schedule");
      queryClient.invalidateQueries(KEYS.entrypoints);
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
  return (
    <DashboardLayout headerTitle={"Расписание"}>
      {canReadSchedule && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white py-[12px] px-[24px] my-[20px] rounded-md border border-gray-200"
          style={{
            background: bg("white", "#1E1E1E"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
        >
          <div className="flex justify-between">
            <Typography variant="h6">
              Подробная информация о расписании
            </Typography>

            <div className="flex gap-2 pr-4">
              {canUpdateSchedule && (
                <Button
                  onClick={() => setEditModal(true)}
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
              )}
              {canDeleteSchedule && (
                <Button
                  onClick={() => setDeleteModal(true)}
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
              )}
            </div>
          </div>

          <div className="my-2">
            {/* Folder shaklidagi title */}
            <div className="flex items-end">
              {/* Chap baland qismi */}
              <div className="bg-blue-500 text-white px-4 py-2 rounded-tr-lg rounded-tl-lg shadow-md">
                {get(schedule, "data.name")}
              </div>
              {/* Qolgan tekis chiziq */}
              <div className="flex-1 h-[27px] bg-blue-500 rounded-tr-lg"></div>
            </div>

            {/* Folderning “ichidagi” kontent */}
            <div
              className="border border-blue-500 border-t-0 rounded-b-md p-4 bg-white shadow-md"
              style={{
                background: bg("white", "#1E1E1E"),
                borderColor: border("#d1d5db", "#4b5563"),
              }}
            >
              <ScheduleFormat schedule={get(schedule, "data")} />
            </div>
          </div>
          <div className="my-[30px]"></div>
        </motion.div>
      )}

      {/* edit schedule */}
      {editModal && (
        <ScheduleModal
          isOpen={editModal}
          mode="edit"
          onClose={() => setEditModal(false)}
          defaultValues={get(schedule, "data", [])}
          onSave={async (data) => {
            try {
              const response = await fetch(
                `${config.JAVA_API_URL}${URLS.allSchedules}/${id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.accessToken}`,
                  },
                  body: JSON.stringify(data),
                },
              );

              if (!response.ok) throw new Error("Ошибка при обновлении");

              toast.success("Расписание успешно обновлено");
              queryClient.invalidateQueries(KEYS.schedule); // agar React Query ishlatyapsan
              setEditModal(false);
            } catch (err) {
              console.error("Ошибка:", err);
              toast.error("Не удалось сохранить изменения");
            }
          }}
        />
      )}

      {/* delete schedule */}
      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          deleting={() => onSubmitDeleteSchedule(id)}
        >
          <div className="">
            <h2
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              } `}
            >
              Удаление расписания
            </h2>
            <p
              className={`mt-3 text-sm  ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Вы собираетесь удалить расписание для выбранных дней и времени.
              После удаления восстановить его будет невозможно.
            </p>
            <p className="mt-2 text-sm font-medium text-red-500">
              Вы уверены, что хотите продолжить?
            </p>
          </div>
        </DeleteModal>
      )}
    </DashboardLayout>
  );
};

export default Index;
