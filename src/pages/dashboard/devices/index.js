import React, { useState, useMemo } from "react";
import CustomTable from "@/components/table";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { motion } from "framer-motion";
import { get } from "lodash";
import ContentLoader from "@/components/loader";
import { Typography, Select, MenuItem } from "@mui/material";
import Input from "@/components/input";
import toast from "react-hot-toast";
import Image from "next/image";
import MethodModal from "@/components/modal/method-modal";
import usePostQuery from "@/hooks/java/usePostQuery";
import { config } from "@/config";
import { useSession } from "next-auth/react";
import CustomSelect from "@/components/select";
import usePutQuery from "@/hooks/java/usePutQuery";
import { useQueryClient } from "@tanstack/react-query";
import CustomSearch from "@/components/search";
import ExcelButton from "@/components/button/excel-button";
import Link from "next/link";
import { useGlobalStore } from "@/store/globalStore";
import { useRouter } from "next/router";
const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const Index = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [createCameraModal, setCreateCameraModal] = useState(false);
  const [editCameraModal, setEditCameraModal] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [building, setBuilding] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [doorType, setDoorType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEntryPoint, setSelectedEntryPoint] = useState("");
  const [selectedCheckPoint, setSelectedCheckPoint] = useState("");
  const [selectedCamera, setSelectedCamera] = useState(null);

  const {
    data: allCameras,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.allCameras,
    url: URLS.allCameras,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // department get
  const { data: departments } = useGetQuery({
    key: KEYS.departments,
    url: URLS.departments,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const optionsDepartments = get(departments, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.nameDep,
  }));

  // entrypoint get

  const { data: entrypoints } = useGetQuery({
    key: KEYS.entrypoints,
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const options = get(entrypoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.entryPointName,
  }));

  // checkpoint get
  const { data: checkpoints } = useGetQuery({
    key: KEYS.checkpoints,
    url: URLS.checkpoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const optionsCheckpoints = get(checkpoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.checkPointName,
  }));
  // create camera
  const { mutate: createCamera } = usePostQuery({
    listKeyId: "create-camera",
  });

  const onSubmitCreateCamera = (e) => {
    e.preventDefault();
    createCamera(
      {
        url: URLS.createCamera,
        attributes: {
          ipAddress: ipAddress,
          building: building,
          login: login,
          departmentId: selectedDepartment,
          password: password,
          checkPointId: selectedCheckPoint,
          doorTypeId: doorType === "in" ? 1 : 2,
          isActive: isActive === true ? 1 : 0,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Kamera muvaffaqiyatli joylandi", {
            position: "top-center",
          });
          setCreateCameraModal(false);
          setIpAddress("");
          setBuilding("");
          setLogin("");
          setPassword("");
          setSelectedDepartment(null);
          setSelectedEntryPoint(null);
          setSelectedCheckPoint(null);
          setDoorType("");
          queryClient.invalidateQueries(KEYS.checkpoints);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // edit camera

  const { mutate: editCamera } = usePutQuery({
    listKeyId: "edit-camera",
  });

  const onSubmitEditCamera = (id) => {
    editCamera(
      {
        url: `${URLS.allCameras}/${id}`,
        attributes: {
          ipAddress: ipAddress,
          building: building,
          login: login,
          departmentId: selectedDepartment,
          password: password,
          checkPointId: selectedCheckPoint,
          doorTypeId: doorType === "in" ? 1 : 2,
          isActive: isActive === true ? 1 : 0,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Kamera muvaffaqiyatli tahrirlandi", {
            position: "top-center",
          });
          setEditCameraModal(false);
          setIpAddress("");
          setBuilding("");
          setLogin("");
          setPassword("");
          setSelectedDepartment("");
          setSelectedEntryPoint("");
          setSelectedCheckPoint("");
          setDoorType("");
          queryClient.invalidateQueries(KEYS.checkpoints);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // delete modal

  const onSubmitDeleteCamera = async (id) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.allCameras}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          // body yubormaymiz, chunki DELETE 204 qaytaradi
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      // 204 No Content bo'lsa, .json() chaqirilmaydi
      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.checkpoints);
      console.log("Deleted successfully"); // agar kerak bo'lsa
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  const columns = [
    { accessorKey: "id", header: "№" },
    {
      accessorKey: "ipAddress",
      header: "IP-адрес",
      cell: ({ row }) => {
        const setSelectedCamera = useGlobalStore(
          (state) => state.setSelectedCamera
        );
        const router = useRouter();

        return (
          <span
            onClick={() => {
              setSelectedCamera(row.original);
              router.push(`/dashboard/devices/${row.original.id}`);
            }}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {row.original.ipAddress}
          </span>
        );
      },
    },
    { accessorKey: "doorType", header: "Тип двери" },
    { accessorKey: "depName", header: "Подразделение" },
    { accessorKey: "checkPointName", header: "Контрольная точка" },
    { accessorKey: "entryPointName", header: "Входная точка" },
    {
      accessorKey: "isActive",
      header: "Статус",
      cell: ({ getValue }) => {
        const isActive = getValue();
        return (
          <span
            className={
              isActive
                ? "text-green-600 font-medium bg-[#E8F6F0] p-1 rounded-md border border-green-600"
                : "text-red-600 font-medium bg-[#FAE7E7] p-1 rounded-md border border-red-600"
            }
          >
            {isActive ? "Активный" : "Неактивный"}
          </span>
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedCamera(row.original.id);
              setEditCameraModal(true);
              setLogin(row.original.login);
              setBuilding(row.original.building);
              setPassword(row.original.password);
              setIpAddress(row.original.ipAddress);
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
            onClick={() => {
              setSelectedCamera(row.original.id);
              setDeleteCameraModal(true);
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

  const filteredCameras = useMemo(() => {
    if (!searchTerm) return get(allCameras, "data");

    return get(allCameras, "data").filter(
      (cam) =>
        cam.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cam.login?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allCameras]);

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  // if (!departments) {
  //   return (
  //     <DashboardLayout>
  //       <ContentLoader />
  //     </DashboardLayout>
  //   );
  // }
  return (
    <DashboardLayout headerTitle={"Устройства"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-[12px] my-[50px] rounded-md"
      >
        <div className="col-span-12 space-y-[15px]">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCreateCameraModal(true)}
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
              <p>Создать</p>
            </Button>
            {/* search camera data */}
            <div className="flex gap-2 items-center">
              <CustomSearch onSearch={setSearchTerm} />
            </div>
          </div>
          <CustomTable data={filteredCameras} columns={columns} />
        </div>
        {/* delete camera */}
        <DeleteModal
          open={deleteCameraModal}
          onClose={() => setDeleteCameraModal(false)}
          title="Вы уверены, что хотите удалить эту камеру?"
        />
      </motion.div>
      {/* create camera */}
      {createCameraModal && (
        <MethodModal
          open={createCameraModal}
          onClose={() => setCreateCameraModal(false)}
        >
          <Typography variant="h6" className="mb-2">
            Добавить камеру
          </Typography>

          <div className="my-[15px]">
            <form
              onSubmit={onSubmitCreateCamera}
              className="grid grid-cols-4 my-[30px] gap-[15px]"
            >
              <Input
                label="IP адрес"
                type="text"
                name="ipAddress"
                placeholder="Введите IP адрес"
                classNames="col-span-4"
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                value={ipAddress}
                labelClass={"text-sm"}
                onChange={(e) => setIpAddress(e.target.value)}
                pattern={ipRegex.source}
                required
              />

              <Input
                label="Здание"
                name="building"
                placeholder="Введите название здания"
                classNames="col-span-4"
                labelClass={"text-sm"}
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />

              <Input
                label="Имя пользователя"
                name="login"
                placeholder="Введите имя пользователя"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                classNames="col-span-2"
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                labelClass={"text-sm"}
                required
              />

              <Input
                label="Пароль"
                name="password"
                type="text"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                labelClass={"text-sm"}
                classNames="col-span-2"
                required
              />

              <CustomSelect
                options={optionsDepartments}
                value={selectedDepartment}
                onChange={(val) => setSelectedDepartment(val)}
                placeholder="Выберите департамент"
              />

              <CustomSelect
                options={options}
                value={selectedEntryPoint}
                onChange={(val) => setSelectedEntryPoint(val)}
                placeholder="Выберите точки входа"
              />

              <CustomSelect
                options={optionsCheckpoints}
                value={selectedCheckPoint}
                onChange={(val) => setSelectedCheckPoint(val)}
              />

              <CustomSelect
                options={[
                  { label: "Вход", value: "in" },
                  { label: "Выход", value: "out" },
                ]}
                value={doorType}
                onChange={(val) => setDoorType(val)}
                placeholder="Выберите тип двери"
                className="col-span-2"
              />

              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                  />
                  <span>Активный</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                  />
                  <span>Неактивный</span>
                </label>
              </div>

              <button
                type="submit"
                className="col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-all duration-200"
              >
                Создать
              </button>

              {/* <div className="col-span-4 flex justify-center mt-4">
                <Image
                  src="/images/secure-img.png"
                  alt="secure"
                  width={400}
                  height={300}
                  className="w-full max-w-[350px] h-auto object-cover"
                />
              </div> */}
            </form>
          </div>
        </MethodModal>
      )}

      {editCameraModal && (
        <MethodModal
          open={editCameraModal}
          onClose={() => {
            setCreateCameraModal(false);
            setIpAddress("");
            setBuilding("");
            setLogin("");
            setPassword("");
            setSelectedDepartment(null);
            setSelectedEntryPoint(null);
            setSelectedCheckPoint(null);
            setDoorType("");
            setEditCameraModal(false);
          }}
        >
          <Typography variant="h6" className="mb-2">
            Изменить
          </Typography>

          <div className="my-[15px]">
            <form className="grid grid-cols-4 my-[30px] gap-[15px]">
              <Input
                label="IP адрес"
                type="text"
                name="ipAddress"
                placeholder="Введите IP адрес"
                classNames="col-span-4"
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                value={ipAddress}
                labelClass={"text-sm"}
                onChange={(e) => setIpAddress(e.target.value)}
                pattern={ipRegex.source}
                required
              />

              <Input
                label="Здание"
                name="building"
                placeholder="Введите название здания"
                classNames="col-span-4"
                labelClass={"text-sm"}
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />

              <Input
                label="Имя пользователя"
                name="login"
                placeholder="Введите имя пользователя"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                classNames="col-span-2"
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                labelClass={"text-sm"}
                required
              />

              <Input
                label="Пароль"
                name="password"
                type="text"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                inputClass={
                  "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
                }
                labelClass={"text-sm"}
                classNames="col-span-2"
                required
              />

              <CustomSelect
                options={optionsDepartments}
                value={selectedDepartment}
                onChange={(val) => setSelectedDepartment(val)}
                placeholder="Выберите департамент"
              />

              <CustomSelect
                options={options}
                value={selectedEntryPoint}
                onChange={(val) => setSelectedEntryPoint(val)}
                placeholder="Выберите точки входа"
              />

              <CustomSelect
                options={optionsCheckpoints}
                value={selectedCheckPoint}
                onChange={(val) => setSelectedCheckPoint(val)}
              />

              <CustomSelect
                options={[
                  { label: "Вход", value: "in" },
                  { label: "Выход", value: "out" },
                ]}
                value={doorType}
                onChange={(val) => setDoorType(val)}
                placeholder="Выберите тип двери"
                className="col-span-2"
              />

              <div className="col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="isActive"
                    value="true"
                    checked={isActive === true}
                    onChange={() => setIsActive(true)}
                  />
                  <span>Активный</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="isActive"
                    value="false"
                    checked={isActive === false}
                    onChange={() => setIsActive(false)}
                  />
                  <span>Неактивный</span>
                </label>
              </div>

              <div className="col-span-4">
                <Button
                  sx={{
                    textTransform: "initial",
                    fontFamily: "DM Sans, sans-serif",
                    backgroundColor: "#F07427",
                    boxShadow: "none",
                    color: "white",
                    display: "block", // inline-block emas
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    fontSize: "14px",
                    minWidth: "100px",
                    width: "100%", // yoki widthni kengroq bering
                    borderRadius: "8px",
                    marginTop: "15px",
                  }}
                  variant="contained"
                  onClick={() => onSubmitEditCamera(selectedCamera)}
                  type="submit"
                >
                  Изменить
                </Button>
              </div>

              {/* <div className="col-span-4 flex justify-center mt-4">
                <Image
                  src="/images/secure-img.png"
                  alt="secure"
                  width={400}
                  height={300}
                  className="w-full max-w-[350px] h-auto object-cover"
                />
              </div> */}
            </form>
          </div>
        </MethodModal>
      )}

      {deleteCameraModal && (
        <DeleteModal
          open={deleteCameraModal}
          onClose={() => {
            setDeleteCameraModal(false);
            setSelectedCamera(null);
          }}
          deleting={() => {
            onSubmitDeleteCamera(selectedCamera); // 👈 DELETE so‘rov
            setDeleteCameraModal(false);
            setSelectedCamera(null);
          }}
          title="Вы уверены, что хотите удалить эту чекпоинт?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
