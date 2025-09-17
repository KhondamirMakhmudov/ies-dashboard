import NoData from "@/components/no-data";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { get, isEmpty } from "lodash";
import { motion } from "framer-motion";
import { useState } from "react";
import useGetQuery from "@/hooks/java/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { useSession } from "next-auth/react";
import { Button } from "@mui/material";
import usePostQuery from "@/hooks/java/usePostQuery";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import CustomTable from "@/components/table";
import ScheduleDayCard from "@/components/schedule-format/schedule-card";
import ScheduleInterval from "@/components/schedule-format/schedule-interval";
import HalfModal from "@/components/modal/half-modal";
import ContentLoader from "@/components/loader";

const Index = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = useSession();
  const [createModal, setCreateModal] = useState(false);
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

  const { mutate: createSchedule } = usePostQuery({
    listKeyId: "create-schedule",
  });

  const handleChangeTime = (dayIdx, intervalIdx, field, value) => {
    const updated = [...times];
    updated[dayIdx].timeList[intervalIdx][field] = value;
    setTimes(updated);
  };
  // create schedule
  const onSubmitCreateSchedule = () => {
    const jsonDailySchedule = {
      days: times.map((t) => ({
        weekDay: t.weekDay,
        timeList: t.timeList, // bu yerda har doim 4 ta bo'ladi
      })),
    };

    createSchedule(
      {
        url: URLS.allSchedules,
        attributes: {
          name,
          shortName,
          jsonDailySchedule: JSON.stringify(jsonDailySchedule),
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
          toast.success("Расписание успешно создано", {
            position: "top-center",
          });
          setCreateModal(false);
          setName("");
          setShortName("");
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error}`, { position: "top-right" });
        },
      }
    );
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "name", header: "Имя расписания" },
    { accessorKey: "shortName", header: "Краткое название расписании" },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() =>
              router.push(`/dashboard/schedule/${row.original.id}`)
            }
            sx={{
              textTransform: "initial",
              fontFamily: "DM Sans, sans-serif",
              backgroundColor: "#A3CBFB",
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
        </div>
      ),
      enableSorting: false,
    },
  ];

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
      {isEmpty(get(allSchedules, "data", [])) ? (
        <NoData
          onCreate={() => setCreateModal(true)}
          title="Расписание не найдено"
          description="Чтобы добавить новое расписание для сотрудников, нажмите кнопку ниже"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[50px] rounded-md border border-gray-200"
        >
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
            <p>Создать расписание</p>
          </Button>

          <div className="my-[30px]">
            <CustomTable
              data={get(allSchedules, "data", [])}
              columns={columns}
            />
          </div>
        </motion.div>
      )}
      {/* create schedule */}

      {createModal && (
        <HalfModal
          width="w-1/2"
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Добавить новое расписание
          </h2>

          <Input
            inputClass="border !border-gray-300 p-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
            label="Название расписание"
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            inputClass="border !border-gray-300 p-3 rounded-lg w-full mb-6 focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Краткое название"
            label="Краткое название расписание"
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
              onClick={() => setCreateModal(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Отмена
            </button>
            <button
              onClick={onSubmitCreateSchedule}
              disabled={!name.trim() || !shortName.trim()}
              className={`px-5 py-2 rounded-lg shadow transition ${
                !name.trim() || !shortName.trim()
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
              }`}
            >
              Сохранить
            </button>
          </div>
        </HalfModal>
      )}
    </DashboardLayout>
  );
};

export default Index;
