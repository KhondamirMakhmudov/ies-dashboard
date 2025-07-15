import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/store/globalStore";
import { motion } from "framer-motion";
import AccessScheduleChart from "@/components/charts/ScheduleAccessController";
import { get } from "lodash";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const selectedCamera = useGlobalStore((state) => state.selectedCamera);

  if (!selectedCamera) {
    return (
      <div>Ma'lumot topilmadi yoki sahifa to'g'ridan-to'g'ri ochildi.</div>
    );
  }

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
                <td className="px-4 py-3">{selectedCamera.id}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Здание</td>
                <td className="px-4 py-3">{selectedCamera.building}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">IP-адрес</td>
                <td className="px-4 py-3">{selectedCamera.ipAddress}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Логин</td>
                <td className="px-4 py-3">{selectedCamera.login}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Пароль</td>
                <td className="px-4 py-3">{selectedCamera.password}</td>
              </tr>
              <tr className="border-t border-t-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">Тип двери</td>
                <td className="px-4 py-3">{selectedCamera.doorType}</td>
              </tr>
              <tr className="border-t border-b border-t-[#C9C9C9] border-b-[#C9C9C9]">
                <td className="bg-gray-100 px-4 py-3 font-medium">
                  Название отдела
                </td>
                <td className="px-4 py-3">{selectedCamera.depName}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className=" p-[12px] my-[50px] rounded-md"
      >
        {/* <AccessScheduleChart scheduleData={get(scheduleCamera, "data")} /> */}
      </motion.div>
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
