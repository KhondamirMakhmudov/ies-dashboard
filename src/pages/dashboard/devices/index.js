import React, { useState, useMemo } from "react";
import CustomTable from "@/components/table";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { motion } from "framer-motion";
import { get, isEmpty } from "lodash";
import ContentLoader from "@/components/loader";
import { Typography, Button } from "@mui/material";
import Input from "@/components/input";
import toast from "react-hot-toast";
import MethodModal from "@/components/modal/method-modal";
import usePostQuery from "@/hooks/java/usePostQuery";
import { config } from "@/config";
import { useSession } from "next-auth/react";
import CustomSelect from "@/components/select";
import usePutQuery from "@/hooks/java/usePutQuery";
import { useQueryClient } from "@tanstack/react-query";
import ActiveStatusRadio from "@/components/activeStatusRadio";
import { useGlobalStore } from "@/store/globalStore";
import { useRouter } from "next/router";
import NoData from "@/components/no-data";
import PrimaryButton from "@/components/button/primary-button";
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

  const [selectedEntryPoint, setSelectedEntryPoint] = useState("");
  const [selectedCheckPoint, setSelectedCheckPoint] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);

  // all cameras get
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

  // entrypoint get

  const { data: entrypoints } = useGetQuery({
    key: [KEYS.entrypoints, createCameraModal || editCameraModal],
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && (createCameraModal || editCameraModal),
  });

  const options = get(entrypoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.entryPointName,
  }));

  // checkpoint get
  const { data: checkpoints } = useGetQuery({
    key: [KEYS.checkpoints, createCameraModal || editCameraModal],
    url: URLS.checkpoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && (createCameraModal || editCameraModal),
  });

  const optionsCheckpoints = get(checkpoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.checkPointName,
  }));

  const handleRemoveAll = () => {
    setCreateCameraModal(false);
    setIpAddress("");
    setBuilding("");
    setLogin("");
    setPassword("");
    setSelectedEntryPoint(null);
    setSelectedCheckPoint(null);
    setDoorType("");
  };

  // create camera
  const { mutate: createCamera } = usePostQuery({
    listKeyId: "create-camera",
  });

  const onSubmitCreateCamera = (e) => {
    e.preventDefault();

    // Ma'lumotlar to‘g‘ri bo‘lsa, serverga yuboriladi
    createCamera(
      {
        url: URLS.createCamera,
        attributes: {
          ipAddress,
          building,
          login,
          password,
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
          toast.success("Камера успешно установлена", {
            position: "top-center",
          });
          handleRemoveAll();
          queryClient.invalidateQueries(KEYS.allCameras);
        },
        onError: (error) => {
          const resData = error?.response?.data;
          const message =
            resData?.message && resData?.details
              ? `${resData.message}: ${resData.details}`
              : resData?.message || resData?.details || "Непредвиденная ошибка";

          toast.error(message, { position: "top-right" });
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
          toast.success("Данные камеры успешно отредактированы.", {
            position: "top-center",
          });
          setEditCameraModal(false);
          handleRemoveAll();
          queryClient.invalidateQueries(KEYS.allCameras);
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
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
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

              // ✅ CheckPoint obyektini set qilamiz
              setSelectedCheckPoint(row.original.checkPointId);
              setSelectedEntryPoint(row.original.entryPointId);

              setDoorType(row.original.doorType === "Выход" ? "out" : "in");
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

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Устройства"}>
      {isEmpty(get(allCameras, "data", [])) ? (
        <NoData onCreate={() => setCreateCameraModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[50px] rounded-md border border-gray-200"
        >
          <div className="col-span-12 space-y-[15px]">
            <div className="flex justify-between items-center">
              <PrimaryButton onClick={() => setCreateCameraModal(true)}>
                <p>Создать</p>
              </PrimaryButton>
            </div>
            <CustomTable data={get(allCameras, "data", [])} columns={columns} />
          </div>
          {/* delete camera */}
          <DeleteModal
            open={deleteCameraModal}
            onClose={() => setDeleteCameraModal(false)}
            title="Вы уверены, что хотите удалить эту камеру?"
          />
        </motion.div>
      )}
      {/* create camera */}
      {createCameraModal && (
        <MethodModal
          open={createCameraModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateCameraModal(false);
            handleRemoveAll();
          }}
        >
          <Typography variant="h6" className="mb-2">
            Добавить камеру
          </Typography>

          <div className="my-[15px]">
            <div
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
                options={options}
                value={selectedEntryPoint}
                onChange={(val) => setSelectedEntryPoint(val)}
                placeholder="Выберите точки входа"
                className="col-span-4"
              />

              <CustomSelect
                options={optionsCheckpoints}
                value={selectedCheckPoint}
                onChange={(val) => setSelectedCheckPoint(val)}
                className="col-span-4"
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

              <div className="col-span-2 flex items-center">
                <ActiveStatusRadio
                  isActive={isActive}
                  setIsActive={setIsActive}
                />
              </div>
              <PrimaryButton
                onClick={onSubmitCreateCamera}
                disabled={
                  !ipAddress?.trim() ||
                  !building?.trim() ||
                  !login?.trim() ||
                  !password?.trim() ||
                  !selectedCheckPoint ||
                  !doorType
                }
              >
                Создать
              </PrimaryButton>
            </div>
          </div>
        </MethodModal>
      )}

      {editCameraModal && (
        <MethodModal
          open={editCameraModal}
          showCloseIcon={true}
          closeClick={() => {
            setEditCameraModal(false);
            handleRemoveAll();
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
                options={options}
                value={selectedEntryPoint}
                onChange={(val) => setSelectedEntryPoint(val)}
                placeholder="Выберите точки входа"
                className="col-span-4"
              />

              <CustomSelect
                options={optionsCheckpoints}
                value={selectedCheckPoint}
                onChange={(val) => setSelectedCheckPoint(val)}
                className="col-span-4"
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

              <div className="col-span-2 flex items-center">
                <ActiveStatusRadio
                  isActive={isActive}
                  setIsActive={setIsActive}
                />
              </div>

              <div className="col-span-4">
                <PrimaryButton
                  backgroundColor="#F07427"
                  color="white"
                  variant="contained"
                  onClick={() => onSubmitEditCamera(selectedCamera)}
                >
                  {" "}
                  Изменить
                </PrimaryButton>
              </div>
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
          title="Вы уверены, что хотите удалить эту камеру?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
