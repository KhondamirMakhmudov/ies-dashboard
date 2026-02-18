import NoData from "@/components/no-data";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { get, isEmpty } from "lodash";
import { motion } from "framer-motion";
import { useState } from "react";
import useGetQuery from "@/hooks/java/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { useSession } from "next-auth/react";
import usePostQuery from "@/hooks/java/usePostQuery";
import toast from "react-hot-toast";
import CustomTable from "@/components/table";
import ContentLoader from "@/components/loader";
import ScheduleModal from "@/components/modal/schedule-modal";
import PrimaryButton from "@/components/button/primary-button";
import Link from "next/link";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";

const Index = () => {
  const { bg, text, border, isDark } = useAppTheme();
  const { data: session } = useSession();
  const [createModal, setCreateModal] = useState(false);

  const canCreateSchedule = canUserDo(session?.user, "расписания", "create");
  const canUpdateSchedule = canUserDo(session?.user, "расписания", "update");
  const canReadSchedule = canUserDo(session?.user, "расписания", "read");
  const canDeleteSchedule = canUserDo(session?.user, "расписания", "delete");

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
          <Link
            href={`/dashboard/schedule/${row.original.id}`}
            className="px-4 py-2 bg-[#4182F9] text-white rounded-md transition-all text-sm"
          >
            <p>Подробнее</p>
          </Link>
        </div>
      ),
      enableSorting: false,
    },
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
      {isEmpty(get(allSchedules, "data", [])) && canReadSchedule ? (
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
          style={{
            background: bg("white", "#1E1E1E"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
        >
          {canCreateSchedule && (
            <PrimaryButton
              onClick={() => setCreateModal(true)}
              variant={"contained"}
            >
              <p>Создать расписание</p>
            </PrimaryButton>
          )}

          <div className="my-[30px]">
            <CustomTable
              data={get(allSchedules, "data.data", [])}
              columns={columns}
            />
          </div>
        </motion.div>
      )}
      {/* create schedule */}

      {createModal && (
        <ScheduleModal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          onSave={(data) => {
            createSchedule(
              {
                url: URLS.allSchedules,
                attributes: data, // bunda allaqachon formatlangan (jsonDailySchedule bilan)
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
                },
                onError: (error) => {
                  toast.error(`Ошибка: ${error}`, { position: "top-right" });
                },
              },
            );
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
