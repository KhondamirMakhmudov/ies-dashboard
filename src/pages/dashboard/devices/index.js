import React, { useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import ActiveStatusRadio from "@/components/activeStatusRadio";
import NoData from "@/components/no-data";
import PrimaryButton from "@/components/button/primary-button";
import Link from "next/link";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";

const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const Index = () => {
  const { bg, border, isDark } = useAppTheme();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [createCameraModal, setCreateCameraModal] = useState(false);
  const [editCameraModal, setEditCameraModal] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);
  const [ipAddress, setIpAddress] = useState("");
  const [building, setBuilding] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [doorType, setDoorType] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectCameraType, setSelectCameraType] = useState(null);
  const [selectedEntryPoint, setSelectedEntryPoint] = useState("");
  const [selectedCheckPoint, setSelectedCheckPoint] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [editingCameraId, setEditingCameraId] = useState(null);

  const canReadCameras = canUserDo(
    session?.user,
    "устройства и точки доступа",
    "read",
  );
  const canCreateCameras = canUserDo(
    session?.user,
    "устройства и точки доступа",
    "create",
  );
  const canUpdateCameras = canUserDo(
    session?.user,
    "устройства и точки доступа",
    "update",
  );

  const canDeleteCameras = canUserDo(
    session?.user,
    "устройства и точки доступа",
    "delete",
  );

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
    setEditCameraModal(false);
    setIpAddress("");
    setBuilding("");
    setLogin("");
    setPassword("");
    setSelectedEntryPoint(null);
    setSelectedCheckPoint(null);
    setDoorType("");
    setIsActive(true);
    setEditingCameraId(null);
    setSelectCameraType(null);
  };

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
          ipAddress,
          building,
          login,
          password,
          checkPointId: selectedCheckPoint,
          vendor: selectCameraType,
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
      },
    );
  };

  const onSubmitEditCamera = async (id) => {
    try {
      const currentCamera = get(allCameras, "data", []).find(
        (cam) => cam.id === id,
      );

      if (!currentCamera) {
        toast.error("Камера не найдена");
        return;
      }

      const patchData = {};

      if (ipAddress !== currentCamera.ipAddress) {
        patchData.ipAddress = ipAddress;
      }

      if (selectCameraType !== currentCamera.vendor) {
        patchData.vendor = selectCameraType;
      }

      if (building !== currentCamera.building) {
        patchData.building = building;
      }

      if (login !== currentCamera.login) {
        patchData.login = login;
      }

      if (password !== currentCamera.password) {
        patchData.password = password;
      }

      if (selectedCheckPoint !== currentCamera.checkPointId) {
        patchData.checkPointId = selectedCheckPoint;
      }

      const currentDoorTypeValue =
        currentCamera.doorType === "Выход" ? "out" : "in";
      if (doorType !== currentDoorTypeValue) {
        patchData.doorTypeId = doorType === "in" ? 1 : 2;
      }

      if (isActive !== currentCamera.isActive) {
        patchData.isActive = isActive === true ? 1 : 0;
      }

      if (Object.keys(patchData).length === 0) {
        toast.info("Нет изменений для сохранения");
        return;
      }

      console.log("PATCH data to send:", patchData); // Debug log

      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.allCameras}/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(patchData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при редактировании");
      }

      toast.success("Данные камеры успешно отредактированы.", {
        position: "top-center",
      });
      setEditCameraModal(false);
      handleRemoveAll();
      queryClient.invalidateQueries(KEYS.allCameras);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Ошибка при редактировании", {
        position: "top-right",
      });
    }
  };

  // delete modal - using fetch (simplified)
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
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.allCameras);
      setDeleteCameraModal(false);
      setSelectedCamera(null);
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
      accessorKey: "vendor",
      header: "Тип камеры",
    },
    {
      accessorKey: "ipAddress",
      header: "IP-адрес",
      cell: ({ row }) => {
        return (
          <Link
            href={`/dashboard/devices/${row.original.id}`}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            {row.original.ipAddress}
          </Link>
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
            className={`font-medium p-1 rounded-md border ${
              isActive
                ? isDark
                  ? "text-green-400 bg-green-900/30 border-green-600"
                  : "text-green-600 bg-[#E8F6F0] border-green-600"
                : isDark
                  ? "text-red-400 bg-red-900/30 border-red-600"
                  : "text-red-600 bg-[#FAE7E7] border-red-600"
            }`}
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
          {canUpdateCameras && (
            <Button
              onClick={() => {
                const camera = row.original;
                setEditingCameraId(camera.id);
                setEditCameraModal(true);
                setLogin(camera.login);
                setBuilding(camera.building);
                setPassword(camera.password);
                setIpAddress(camera.ipAddress);
                setSelectCameraType(camera.vendor);
                setSelectedCheckPoint(camera.checkPointId);
                setSelectedEntryPoint(camera.entryPointId);
                setDoorType(camera.doorType === "Выход" ? "out" : "in");
                setIsActive(camera.isActive);
              }}
              sx={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                background: isDark ? "#7c2d12" : "#F0D8C8",
                color: isDark ? "#fb923c" : "#FF6200",
                "&:hover": {
                  background: isDark ? "#9a3412" : "#F0B28B",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </Button>
          )}
          {canDeleteCameras && (
            <Button
              onClick={() => {
                setSelectedCamera(row.original.id);
                setDeleteCameraModal(true);
              }}
              sx={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                background: isDark ? "#7f1d1d" : "#FCD8D3",
                color: isDark ? "#fca5a5" : "#FF1E00",
                "&:hover": {
                  background: isDark ? "#991b1b" : "#FCA89D",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          )}
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
          className="p-[12px] my-[50px] rounded-md border border-gray-200"
          style={{
            background: bg("white", "#1E1E1E"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
        >
          <div className="col-span-12 space-y-[15px]">
            <div className="flex justify-between items-center">
              {canCreateCameras && (
                <PrimaryButton onClick={() => setCreateCameraModal(true)}>
                  <p>Создать</p>
                </PrimaryButton>
              )}
            </div>
            {canReadCameras && (
              <CustomTable
                data={get(allCameras, "data", [])}
                columns={columns}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* create camera modal */}
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
              <CustomSelect
                label={"Тип камеры"}
                options={[
                  { label: "DAHUA", value: "DAHUA" },
                  { label: "HIKVISION", value: "HIKVISION" },
                ]}
                value={selectCameraType}
                onChange={(val) => setSelectCameraType(val)}
                placeholder="Выберите тип камеры"
                className="col-span-4"
                required
              />
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
                  isActive={isActive == 1 ? true : false}
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

      {/* edit camera modal */}
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
            Изменить камеру
          </Typography>

          <div className="my-[15px]">
            <form className="grid grid-cols-4 my-[30px] gap-[15px]">
              <CustomSelect
                label={"Тип камеры"}
                options={[
                  { label: "DAHUA", value: "DAHUA" },
                  { label: "HIKVISION", value: "HIKVISION" },
                ]}
                value={selectCameraType}
                onChange={(val) => setSelectCameraType(val)}
                placeholder="Выберите тип камеры"
                className="col-span-4"
                required
              />
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
                  onClick={() => onSubmitEditCamera(editingCameraId)}
                >
                  Сохранить изменения
                </PrimaryButton>
              </div>
            </form>
          </div>
        </MethodModal>
      )}

      {/* delete camera modal */}
      {deleteCameraModal && (
        <DeleteModal
          open={deleteCameraModal}
          onClose={() => {
            setDeleteCameraModal(false);
            setSelectedCamera(null);
          }}
          deleting={() => {
            onSubmitDeleteCamera(selectedCamera);
          }}
          title="Вы уверены, что хотите удалить эту камеру?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
