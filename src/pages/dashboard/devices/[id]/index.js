import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { get } from "lodash";

import ApartmentIcon from "@mui/icons-material/Apartment";
import LanguageIcon from "@mui/icons-material/Language";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BusinessIcon from "@mui/icons-material/Business";

// 💡 CustomSelect bilan bir xil rang tizimi shu hookda
import useAppTheme from "@/hooks/useAppTheme";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const { isDark, bg, text, border } = useAppTheme();

  const {
    data: allCameras,
    isLoading: isLoadingCamera,
    isFetching: isFetchingCamera,
  } = useGetQuery({
    key: KEYS.allCameras,
    url: `${URLS.allCameras}/${id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const details = [
    {
      icon: ApartmentIcon,
      label: "Здание",
      value: get(allCameras, "data.building"),
    },
    {
      icon: LanguageIcon,
      label: "IP-адрес",
      value: get(allCameras, "data.ipAddress"),
    },
    {
      icon: PersonIcon,
      label: "Логин",
      value: get(allCameras, "data.login"),
    },
    {
      icon: LockIcon,
      label: "Пароль",
      value: get(allCameras, "data.password"),
    },
    {
      icon: MeetingRoomIcon,
      label: "Тип двери",
      value: get(allCameras, "data.doorType"),
    },
    {
      icon: BusinessIcon,
      label: "Название контрольной точки",
      value: get(allCameras, "data.checkPointName"),
    },
  ];

  if (isLoadingCamera || isFetchingCamera) {
    return (
      <DashboardLayout headerTitle={"Список расписаний доступа"}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Список расписаний доступа"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-12 p-[12px] my-[20px] rounded-md"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          border: `1px solid ${border("#d1d5db", "#4b5563")}`,
        }}
      >
        <div className="col-span-12 w-full">
          <div className="mb-4 p-[12px]">
            <h2
              className="text-3xl font-bold"
              style={{ color: text("#1f2937", "#f3f4f6") }}
            >
              Детали камеры
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.map((detail, index) => {
              const Icon = detail.icon;

              return (
                <div
                  key={index}
                  className="rounded-xl p-5 shadow-sm transition duration-300 border"
                  style={{
                    backgroundColor: bg("#ffffff", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#4b5563"),
                  }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Ikonka fonini ham CustomSelect stiliga moslaymiz */}
                    <div
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{
                        backgroundColor: bg("#f3f4f6", "#374151"),
                        color: text("#111827", "#f3f4f6"),
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </div>

                    <div className="flex-grow min-w-0">
                      <p
                        className="text-sm font-medium mb-1"
                        style={{ color: text("#6b7280", "#d1d5db") }}
                      >
                        {detail.label}
                      </p>

                      <p
                        className="text-lg font-semibold break-words"
                        style={{
                          color: text("#1f2937", "#f9fafb"),
                        }}
                      >
                        {detail.value || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
