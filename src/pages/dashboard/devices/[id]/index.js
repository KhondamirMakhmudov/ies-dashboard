import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/store/globalStore";
import { motion } from "framer-motion";
import ContentLoader from "@/components/loader";
import AccessCustomTimeline from "@/components/charts/AccessTimeLineSchedule";
import { get } from "lodash";
import usePutQuery from "@/hooks/java/usePutQuery";
import { config } from "@/config";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import { Button } from "@mui/material";
import MethodModal from "@/components/modal/method-modal";
import EditScheduleForm from "@/components/schedule-edit";
import toast from "react-hot-toast";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  // const selectedCamera = useGlobalStore((state) => state.selectedCamera);

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

  const {
    data: scheduleCamera,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.scheduleCameras,
    url: `${URLS.scheduleCameras}${id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && !!id,
  });

  const updateSchedule = async (updatedData) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.scheduleCameras}${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("PUT request failed");
      }

      const result = await response.json();
      toast.success("Jadval muvaffaqiyatli saqlandi");
      return result;
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Jadvalni saqlashda xatolik yuz berdi");
      return null;
    }
  };

  return (
    <DashboardLayout headerTitle={"Список расписаний доступа"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-12 p-[12px] my-[50px] rounded-md"
      >
        <div className="col-span-12 w-full  mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Детали камеры
          </h2>

          <table className="w-full table-auto border-collapse">
            <tbody className="text-gray-700">
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium w-1/3">ID</td>
                <td className="px-4 py-3">{get(allCameras, "data.id")}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Здание</td>
                <td className="px-4 py-3">
                  {get(allCameras, "data.building")}
                </td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">IP-адрес</td>
                <td className="px-4 py-3">
                  {get(allCameras, "data.ipAddress")}
                </td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Логин</td>
                <td className="px-4 py-3">{get(allCameras, "data.login")}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Пароль</td>
                <td className="px-4 py-3">
                  {get(allCameras, "data.password")}
                </td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Тип двери</td>
                <td className="px-4 py-3">
                  {get(allCameras, "data.doorType")}
                </td>
              </tr>
              <tr className="border-t border-b border-t-[#C9C9C9] border-b-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">
                  Название отдела
                </td>
                <td className="px-4 py-3">{get(allCameras, "data.depName")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {isLoading || isFetching ? (
        <ContentLoader />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className=" p-[12px] my-[50px] rounded-md space-y-[10px] bg-white"
        >
          <div className="flex items-start justify-end">
            <Button
              onClick={() => {
                setShowModal(true);
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
          </div>
          <div className="my-[10px] space-y-[20px]">
            {get(scheduleCamera, "data", []).map((item, index) => (
              <AccessCustomTimeline
                schedule={get(scheduleCamera, "data", [])[index]}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* edit schedule */}
      {showModal && (
        <MethodModal open={showModal} onClose={() => setShowModal(false)}>
          <EditScheduleForm
            initialData={get(scheduleCamera, "data", [])}
            onClose={() => setShowModal(false)}
            onSubmit={(updatedData) => {
              updateSchedule(updatedData); // <-- bu yerda updatedData bu schedules
            }}
          />
        </MethodModal>
      )}
    </DashboardLayout>
  );
};

export default Index;

// <div>
//   <h1>Camera Details</h1>
//   <p>
//     <strong>IP:</strong> {selectedCamera.ipAddress}
//   </p>
//   <p>
//     <strong>Login:</strong> {selectedCamera.login}
//   </p>
//   <p>
//     <strong>Password:</strong> {selectedCamera.password}
//   </p>
//   <p>
//     <strong>Building:</strong> {selectedCamera.building}
//   </p>

//   <p>
//     <strong>Тип двери:</strong> {selectedCamera.doorType}
//   </p>

// </div>
