import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Typography, Button, Switch } from "@mui/material";
import ScheduleFormat from "@/components/schedule-format";
import { get, isEmpty } from "lodash";

import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import ContentLoader from "@/components/loader";
import { config } from "@/config";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Input from "@/components/input";
import DeleteModal from "@/components/modal/delete-modal";
import ScheduleDayCard from "@/components/schedule-format/schedule-card";
import HalfModal from "@/components/modal/half-modal";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [times, setTimes] = useState([
    {
      weekDay: 1,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
    {
      weekDay: 2,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
    {
      weekDay: 3,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
    {
      weekDay: 4,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
    {
      weekDay: 5,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
    {
      weekDay: 6,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
    {
      weekDay: 7,
      timeList: Array(4)
        .fill(null)
        .map((_, i) => ({
          index: i,
          startTime: "00:00:00",
          endTime: "00:00:00",
          enabled: 0,
        })),
    },
  ]);

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

  useEffect(() => {
    if (get(schedule, "data")) {
      setName(get(schedule, "data.name", ""));
      setShortName(get(schedule, "data.shortName", ""));

      try {
        const parsed = JSON.parse(
          get(schedule, "data.jsonDailySchedule", "{}")
        );
        if (parsed?.days) {
          setTimes(parsed.days);
        }
      } catch (e) {
        console.error("Ошибка парсинга jsonDailySchedule:", e);
      }
    }
  }, [get(schedule, "data")]);

  // edit schedule
  const onSubmitEditSchedule = async () => {
    const jsonDailySchedule = {
      days: times.map((t) => ({
        weekDay: t.weekDay,
        timeList: t.timeList, // bu yerda har doim 4 ta bo'ladi
      })),
    };
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.allSchedules}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            name,
            shortName,
            jsonDailySchedule: JSON.stringify(jsonDailySchedule),
          }),
        }
      );

      if (!response.ok) throw new Error("Ошибка при редактировании");

      toast.success("Изменения сохранены");
      queryClient.invalidateQueries(KEYS.schedule);
      setEditModal(false);
    } catch (err) {
      toast.error("Не удалось сохранить");
      console.error(err);
    }
  };

  const handleChangeTime = (dayIdx, intervalIdx, field, value) => {
    const updated = [...times];
    updated[dayIdx].timeList[intervalIdx][field] = value;
    setTimes(updated);
  };
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
        }
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

  const weekDaysRu = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout headerTitle={"Расписание"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-[12px] my-[50px] rounded-md border border-gray-200"
      >
        <div className="flex justify-between">
          <Typography variant="h6">
            Подробная информация о расписании
          </Typography>

          <div className="flex gap-2 pr-4">
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
          </div>
        </div>

        <div className="my-8">
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
          <div className="border border-blue-500 border-t-0 rounded-b-md p-4 bg-white shadow-md">
            <ScheduleFormat schedule={get(schedule, "data")} />
          </div>
        </div>
        <div className="my-[30px]"></div>
      </motion.div>

      {/* edit schedule */}
      {editModal && (
        <HalfModal
          width="w-1/2"
          isOpen={editModal}
          onClose={() => setEditModal(false)}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Редактировать расписание
          </h2>

          <Input
            inputClass="border !border-gray-300 p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
            label={"Название расписание"}
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            inputClass="border !border-gray-300 p-3 rounded-lg w-full mb-6 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Краткое название"
            label={"Краткое название расписание"}
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            required
          />

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
            {times.map((day, dayIdx) => (
              <ScheduleDayCard
                key={day.weekDay}
                day={day}
                dayIdx={dayIdx}
                weekDaysRu={weekDaysRu}
                onChange={handleChangeTime}
              />
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setEditModal(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Отмена
            </button>
            <button
              onClick={onSubmitEditSchedule}
              disabled={!name.trim() || !shortName.trim()}
              className={`px-5 py-2 rounded-lg shadow transition 
                ${
                  !name.trim() || !shortName.trim()
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800"
                }`}
            >
              Сохранить изменения
            </button>
          </div>
        </HalfModal>
      )}

      {/* delete schedule */}
      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          deleting={() => onSubmitDeleteSchedule(id)}
        >
          <div className="">
            <h2 className="text-lg font-semibold text-gray-800">
              Удаление расписания
            </h2>
            <p className="mt-3 text-sm text-gray-600">
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
