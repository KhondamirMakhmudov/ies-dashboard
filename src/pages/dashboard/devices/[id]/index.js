import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { get } from "lodash";
import { useState } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LanguageIcon from "@mui/icons-material/Language";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BusinessIcon from "@mui/icons-material/Business";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

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
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: LanguageIcon,
      label: "IP-адрес",
      value: get(allCameras, "data.ipAddress"),
      color: "bg-green-50 text-green-600",
    },
    {
      icon: PersonIcon,
      label: "Логин",
      value: get(allCameras, "data.login"),
      color: "bg-orange-50 text-orange-600",
    },
    {
      icon: LockIcon,
      label: "Пароль",
      value: get(allCameras, "data.password"),
      color: "bg-red-50 text-red-600",
    },
    {
      icon: MeetingRoomIcon,
      label: "Тип двери",
      value: get(allCameras, "data.doorType"),
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: BusinessIcon,
      label: "Название контрольной точки",
      value: get(allCameras, "data.checkPointName"),
      color: "bg-teal-50 text-teal-600",
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
        className="grid grid-cols-12 p-[12px] bg-white border border-gray-200 my-[20px] rounded-md"
      >
        <div className="col-span-12 w-full ">
          <div className="mb-4 p-[12px]">
            <h2 className="text-3xl font-bold text-gray-800">Детали камеры</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.map((detail, index) => {
              const Icon = detail.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`${detail.color} p-3 rounded-lg flex-shrink-0`}
                    >
                      <Icon sx={{ fontSize: 20 }} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        {detail.label}
                      </p>
                      <p className="text-lg font-semibold text-gray-800 break-words">
                        {detail.value || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              Редактировать
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
            >
              Назад
            </button>
          </div> */}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
