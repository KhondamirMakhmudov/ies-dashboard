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
import { Drawer, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import usePostQuery from "@/hooks/java/usePostQuery";
import { config } from "@/config";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import NoData from "@/components/no-data";
import PrimaryButton from "@/components/button/primary-button";
import Link from "next/link";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";
import Input from "@/components/input";
import CustomSelect from "@/components/select";
import ActiveStatusRadio from "@/components/activeStatusRadio";

const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const FormSection = ({ title, description, isDark, children }) => (
  <div
    className="rounded-2xl p-5 space-y-4"
    style={{
      background: isDark ? "rgba(17, 24, 39, 0.55)" : "#FFFFFF",
      border: `1px solid ${
        isDark ? "rgba(75, 85, 99, 0.45)" : "rgba(226, 232, 240, 1)"
      }`,
      boxShadow: isDark
        ? "0 10px 30px rgba(0, 0, 0, 0.18)"
        : "0 10px 30px rgba(15, 23, 42, 0.06)",
    }}
  >
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <div
          className="h-[2px] w-8 rounded-full"
          style={{ background: isDark ? "#60A5FA" : "#2563EB" }}
        />
        <Typography
          variant="subtitle2"
          className="text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: isDark ? "#D1D5DB" : "#64748B" }}
        >
          {title}
        </Typography>
      </div>

      {description && (
        <Typography
          variant="body2"
          className="text-sm leading-5"
          style={{ color: isDark ? "#9CA3AF" : "#94A3B8" }}
        >
          {description}
        </Typography>
      )}
    </div>

    <div className="space-y-4">{children}</div>
  </div>
);

const FormGroup = ({ children, cols = 1 }) => (
  <div
    className={`grid gap-4 [&>*]:min-w-0 ${
      cols === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
    }`}
  >
    {children}
  </div>
);

const Index = () => {
  const { bg, border, isDark } = useAppTheme();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Drawer & form state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [editingCameraId, setEditingCameraId] = useState(null);

  const [formData, setFormData] = useState({
    ipAddress: "",
    building: "",
    login: "",
    password: "",
    doorType: "",
    isActive: true,
    selectCameraType: null,
    selectedEntryPoint: "",
    selectedCheckPoint: null,
    subnetMask: "",
    defaultGateway: "",
    dns: "",
  });

  const permissions = {
    read: canUserDo(session?.user, "devices and entrypoints", "read"),
    create: canUserDo(session?.user, "devices and entrypoints", "create"),
    update: canUserDo(session?.user, "devices and entrypoints", "update"),
    delete: canUserDo(session?.user, "devices and entrypoints", "delete"),
  };

  // Fetch cameras
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

  // Fetch entrypoints
  const { data: entrypoints } = useGetQuery({
    key: [KEYS.entrypoints, drawerOpen],
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && drawerOpen,
  });

  // Fetch checkpoints
  const { data: checkpoints } = useGetQuery({
    key: [KEYS.checkpoints, drawerOpen],
    url: URLS.checkpoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && drawerOpen,
  });

  const entryPointOptions = get(entrypoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.entryPointName,
  }));

  const checkpointOptions = get(checkpoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.checkPointName,
  }));

  // Reset form
  const resetForm = () => {
    setFormData({
      ipAddress: "",
      building: "",
      login: "",
      password: "",
      doorType: "",
      isActive: true,
      selectCameraType: null,
      selectedEntryPoint: "",
      selectedCheckPoint: null,
      subnetMask: "",
      defaultGateway: "",
      dns: "",
    });
    setEditingCameraId(null);
    setIsEditMode(false);
    setDrawerOpen(false);
  };

  // Open drawer for create
  const handleOpenCreateDrawer = () => {
    resetForm();
    setIsEditMode(false);
    setDrawerOpen(true);
  };

  // Open drawer for edit
  const handleOpenEditDrawer = (camera) => {
    setEditingCameraId(camera.id);
    setIsEditMode(true);
    setFormData({
      ipAddress: camera.ipAddress,
      building: camera.building,
      login: camera.login,
      password: camera.password,
      doorType: camera.doorType === "Выход" ? "out" : "in",
      isActive: camera.isActive,
      selectCameraType: camera.vendor,
      selectedEntryPoint: camera.entryPointId,
      selectedCheckPoint: camera.checkPointId,
      subnetMask: camera.subnetMask || "",
      defaultGateway: camera.defaultGateway || "",
      dns: camera.dns || "",
    });
    setDrawerOpen(true);
  };

  // Create mutation
  const { mutate: createCamera } = usePostQuery({
    listKeyId: "create-camera",
  });

  // Submit create
  const handleSubmitCreate = () => {
    createCamera(
      {
        url: URLS.createCamera,
        attributes: {
          ipAddress: formData.ipAddress,
          building: formData.building,
          login: formData.login,
          password: formData.password,
          checkPointId: formData.selectedCheckPoint,
          vendor: formData.selectCameraType,
          doorTypeId: formData.doorType === "in" ? 1 : 2,
          isActive: formData.isActive === true ? 1 : 0,
          subnetMask: formData.subnetMask,
          defaultGateway: formData.defaultGateway,
          dns: formData.dns,
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
          resetForm();
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

  // Submit edit
  const handleSubmitEdit = async () => {
    try {
      const currentCamera = get(allCameras, "data", []).find(
        (cam) => cam.id === editingCameraId,
      );

      if (!currentCamera) {
        toast.error("Камера не найдена");
        return;
      }

      const patchData = {};

      if (formData.ipAddress !== currentCamera.ipAddress)
        patchData.ipAddress = formData.ipAddress;
      if (formData.selectCameraType !== currentCamera.vendor)
        patchData.vendor = formData.selectCameraType;
      if (formData.building !== currentCamera.building)
        patchData.building = formData.building;
      if (formData.login !== currentCamera.login)
        patchData.login = formData.login;
      if (formData.password !== currentCamera.password)
        patchData.password = formData.password;
      if (formData.selectedCheckPoint !== currentCamera.checkPointId)
        patchData.checkPointId = formData.selectedCheckPoint;
      if (formData.subnetMask !== currentCamera.subnetMask)
        patchData.subnetMask = formData.subnetMask;
      if (formData.defaultGateway !== currentCamera.defaultGateway)
        patchData.defaultGateway = formData.defaultGateway;
      if (formData.dns !== currentCamera.dns) patchData.dns = formData.dns;

      const currentDoorTypeValue =
        currentCamera.doorType === "Выход" ? "out" : "in";
      if (formData.doorType !== currentDoorTypeValue)
        patchData.doorTypeId = formData.doorType === "in" ? 1 : 2;

      if (formData.isActive !== currentCamera.isActive)
        patchData.isActive = formData.isActive === true ? 1 : 0;

      if (Object.keys(patchData).length === 0) {
        toast.info("Нет изменений для сохранения");
        return;
      }

      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.allCameras}/${editingCameraId}`,
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
      resetForm();
      queryClient.invalidateQueries(KEYS.allCameras);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Ошибка при редактировании", {
        position: "top-right",
      });
    }
  };

  // Delete camera
  const handleSubmitDeleteCamera = async (id) => {
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

  // Form validation
  const isFormValid = () => {
    const requiredFields = [
      "ipAddress",
      "building",
      "login",
      "password",
      "subnetMask",
      "defaultGateway",
      "dns",
      "selectedCheckPoint",
      "doorType",
      "selectCameraType",
    ];
    return requiredFields.every((field) => {
      const value = formData[field];
      return value !== null && value !== undefined && value !== "";
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Form Section Component
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
      cell: ({ row }) => (
        <Link
          href={`/dashboard/devices/${row.original.id}`}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          {row.original.ipAddress}
        </Link>
      ),
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
          {permissions.update && (
            <button
              onClick={() => handleOpenEditDrawer(row.original)}
              className="p-2 rounded-md transition-colors"
              style={{
                background: isDark ? "#7c2d12" : "#F0D8C8",
                color: isDark ? "#fb923c" : "#FF6200",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "#9a3412"
                  : "#F0B28B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark
                  ? "#7c2d12"
                  : "#F0D8C8";
              }}
            >
              <EditIcon fontSize="small" />
            </button>
          )}
          {permissions.delete && (
            <button
              onClick={() => {
                setSelectedCamera(row.original.id);
                setDeleteCameraModal(true);
              }}
              className="p-2 rounded-md transition-colors"
              style={{
                background: isDark ? "#7f1d1d" : "#FCD8D3",
                color: isDark ? "#fca5a5" : "#FF1E00",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark
                  ? "#991b1b"
                  : "#FCA89D";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark
                  ? "#7f1d1d"
                  : "#FCD8D3";
              }}
            >
              <DeleteIcon fontSize="small" />
            </button>
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
        <NoData onCreate={handleOpenCreateDrawer} />
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
              {permissions.create && (
                <PrimaryButton onClick={handleOpenCreateDrawer}>
                  <p>Создать</p>
                </PrimaryButton>
              )}
            </div>
            {permissions.read && (
              <CustomTable
                data={get(allCameras, "data", [])}
                columns={columns}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Form Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => resetForm()}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 560 },
            background: isDark ? "#0f172a" : "#F8FAFC",
            borderLeft: `1px solid ${
              isDark ? "rgba(75, 85, 99, 0.5)" : "rgba(226, 232, 240, 1)"
            }`,
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2.5,
            borderBottom: `1px solid ${
              isDark ? "rgba(75, 85, 99, 0.5)" : "rgba(226, 232, 240, 1)"
            }`,
            background: isDark
              ? "rgba(15, 23, 42, 0.94)"
              : "rgba(248, 250, 252, 0.96)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div>
            <Typography
              variant="h6"
              className="font-semibold"
              style={{ color: isDark ? "#F8FAFC" : "#0F172A" }}
            >
              {isEditMode ? "Редактировать камеру" : "Новая камера"}
            </Typography>
            <Typography
              variant="body2"
              style={{ color: isDark ? "#94A3B8" : "#64748B" }}
            >
              Заполните основные и сетевые параметры устройства.
            </Typography>
          </div>
          <IconButton
            onClick={() => resetForm()}
            size="small"
            sx={{
              color: isDark ? "#9CA3AF" : "#6B7280",
              "&:hover": {
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <Box sx={{ p: 3, overflow: "auto", height: "calc(100% - 81px)" }}>
          <div
            className="space-y-4"
            style={{
              minWidth: 0,
            }}
          >
            {/* Camera Identification */}
            <FormSection
              title="Идентификация камеры"
              description="Основные сведения для распознавания и отображения устройства."
              isDark={isDark}
            >
              <FormGroup cols={2}>
                <CustomSelect
                  label="Тип камеры"
                  options={[
                    { label: "DAHUA", value: "DAHUA" },
                    { label: "HIKVISION", value: "HIKVISION" },
                  ]}
                  value={formData.selectCameraType}
                  onChange={(val) => handleFormChange("selectCameraType", val)}
                  placeholder="Выберите тип"
                  required
                />
                <Input
                  label="Здание"
                  placeholder="Название здания"
                  value={formData.building}
                  onChange={(e) => handleFormChange("building", e.target.value)}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                />
              </FormGroup>
            </FormSection>

            {/* Network Configuration */}
            <FormSection
              title="Сетевые параметры"
              description="Параметры подключения устройства к локальной сети."
              isDark={isDark}
            >
              <FormGroup cols={2}>
                <Input
                  label="IP-адрес"
                  type="text"
                  placeholder="192.168.1.100"
                  value={formData.ipAddress}
                  onChange={(e) =>
                    handleFormChange("ipAddress", e.target.value)
                  }
                  pattern={ipRegex.source}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                  required
                />
                <Input
                  label="Маска подсети"
                  type="text"
                  placeholder="255.255.255.0"
                  value={formData.subnetMask}
                  onChange={(e) =>
                    handleFormChange("subnetMask", e.target.value)
                  }
                  pattern={ipRegex.source}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                  required
                />
                <Input
                  label="Основной шлюз"
                  type="text"
                  placeholder="192.168.1.1"
                  value={formData.defaultGateway}
                  onChange={(e) =>
                    handleFormChange("defaultGateway", e.target.value)
                  }
                  pattern={ipRegex.source}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                  required
                />
                <Input
                  label="DNS сервер"
                  type="text"
                  placeholder="8.8.8.8"
                  value={formData.dns}
                  onChange={(e) => handleFormChange("dns", e.target.value)}
                  pattern={ipRegex.source}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                  required
                />
              </FormGroup>
            </FormSection>

            {/* Credentials */}
            <FormSection
              title="Учетные данные"
              description="Данные для авторизации на устройстве."
              isDark={isDark}
            >
              <FormGroup cols={2}>
                <Input
                  label="Имя пользователя"
                  placeholder="admin"
                  value={formData.login}
                  onChange={(e) => handleFormChange("login", e.target.value)}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                  required
                />
                <Input
                  label="Пароль"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  inputClass="!h-[40px] rounded-[6px] !border-gray-300 text-[14px]"
                  labelClass="text-xs"
                  required
                />
              </FormGroup>
            </FormSection>

            {/* Location & Access Points */}
            <FormSection
              title="Местоположение и точки доступа"
              description="Связь камеры с точками входа и контрольными точками."
              isDark={isDark}
            >
              <FormGroup cols={2}>
                <CustomSelect
                  label="Входная точка"
                  options={entryPointOptions}
                  value={formData.selectedEntryPoint}
                  onChange={(val) =>
                    handleFormChange("selectedEntryPoint", val)
                  }
                  placeholder="Выберите точку входа"
                />
                <CustomSelect
                  label="Контрольная точка"
                  options={checkpointOptions}
                  value={formData.selectedCheckPoint}
                  onChange={(val) =>
                    handleFormChange("selectedCheckPoint", val)
                  }
                  placeholder="Выберите контрольную точку"
                  required
                />
              </FormGroup>
            </FormSection>

            {/* Door Settings & Status */}
            <FormSection
              title="Параметры двери"
              description="Тип двери и текущий статус активности устройства."
              isDark={isDark}
            >
              <FormGroup cols={2}>
                <CustomSelect
                  label="Тип двери"
                  options={[
                    { label: "Вход", value: "in" },
                    { label: "Выход", value: "out" },
                  ]}
                  value={formData.doorType}
                  onChange={(val) => handleFormChange("doorType", val)}
                  placeholder="Выберите тип"
                  required
                />
                <div className="flex items-center">
                  <ActiveStatusRadio
                    isActive={formData.isActive}
                    setIsActive={(val) => handleFormChange("isActive", val)}
                  />
                </div>
              </FormGroup>
            </FormSection>

            {/* Submit Button */}
            <div
              className="sticky bottom-0 pt-4"
              style={{
                background: isDark
                  ? "linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(15, 23, 42, 0.98) 35%)"
                  : "linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.98) 35%)",
              }}
            >
              <div
                className="rounded-2xl p-4"
                style={{
                  background: isDark
                    ? "rgba(15, 23, 42, 0.96)"
                    : "rgba(255, 255, 255, 0.92)",
                  border: `1px solid ${
                    isDark ? "rgba(75, 85, 99, 0.45)" : "rgba(226, 232, 240, 1)"
                  }`,
                  boxShadow: isDark
                    ? "0 10px 25px rgba(0, 0, 0, 0.2)"
                    : "0 10px 25px rgba(15, 23, 42, 0.08)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Typography
                      variant="body2"
                      style={{ color: isDark ? "#CBD5E1" : "#475569" }}
                    >
                      {isEditMode
                        ? "Изменения будут применены только к обновленным полям."
                        : "Проверьте параметры перед созданием устройства."}
                    </Typography>
                  </div>
                  <PrimaryButton
                    onClick={isEditMode ? handleSubmitEdit : handleSubmitCreate}
                    disabled={!isFormValid()}
                    className="!py-3 !px-6 font-medium whitespace-nowrap"
                  >
                    {isEditMode ? "Сохранить" : "Создать"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Drawer>

      {/* Delete Modal */}
      {deleteCameraModal && (
        <DeleteModal
          open={deleteCameraModal}
          onClose={() => {
            setDeleteCameraModal(false);
            setSelectedCamera(null);
          }}
          deleting={() => handleSubmitDeleteCamera(selectedCamera)}
          title="Вы уверены, что хотите удалить эту камеру?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
