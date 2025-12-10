import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import { useSession } from "next-auth/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { isEmpty, get } from "lodash";
import NoData from "@/components/no-data";
import { motion } from "framer-motion";
import useAppTheme from "@/hooks/useAppTheme";
import PrimaryButton from "@/components/button/primary-button";
import {
  Button,
  Chip,
  Stack,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useState } from "react";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import toast from "react-hot-toast";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "@/config";
import DeleteModal from "@/components/modal/delete-modal";
import Link from "next/link";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import ContentLoader from "@/components/loader";
import CustomSelect from "@/components/select";

const Index = () => {
  const queryClient = useQueryClient();
  const { bg, text, border, isDark } = useAppTheme();

  // State for modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [addPermissionTypeModal, setAddPermissionTypeModal] = useState(false);
  const [removePermissionTypeModal, setRemovePermissionTypeModal] =
    useState(false);
  const [selectedPermissionTypeId, setSelectedPermissionTypeId] = useState("");
  const [selectedTypeToRemove, setSelectedTypeToRemove] = useState(null);
  const [name, setName] = useState("");

  const { data: session } = useSession();

  // Get permissions
  const {
    data: permissions,
    isLoading,
    isFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.permissions,
    url: URLS.permissions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });
  // get type permissions
  const {
    data: typeOfPermissions,
    isLoading: isLoadingTypeOfPermission,
    isFetching: isFetchingTypeOfPermission,
  } = useGetGeneralAuthQuery({
    key: KEYS.typeOfPermissions,
    url: URLS.typeOfPermissions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const optionsTypeOfPermissions = get(typeOfPermissions, "data.data", []).map(
    (entry) => ({
      value: entry.id,
      label: entry.name,
    })
  );

  // Create permission
  const { mutate: createPermission } = usePostGeneralAuthQuery({
    listKeyId: "create-permission",
  });

  const submitCreatePermission = () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }
    createPermission(
      {
        url: URLS.permissions,
        attributes: { name: name },
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Права успешно созданы", { position: "top-center" });
          setCreateModal(false);
          setName("");
          queryClient.invalidateQueries(KEYS.permissions);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // Edit permission
  const submitEditPermission = async () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.permissions}/${selectedId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name: name }),
        }
      );

      if (!response.ok) throw new Error("Ошибка при обновлении");

      toast.success("Права успешно обновлены", { position: "top-center" });
      setEditModal(false);
      setSelectedId(null);
      setName("");
      queryClient.invalidateQueries(KEYS.permissions);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Delete permission
  const submitDeletePermission = async () => {
    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.permissions}/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Ошибка при удалении");

      toast.success("Права успешно удалены", { position: "top-center" });
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.permissions);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Add permission type
  const { mutate: addPermissionType } = usePostGeneralAuthQuery({
    listKeyId: "add-permission-type",
  });

  const submitAddPermissionType = () => {
    if (!selectedPermissionTypeId) {
      toast.error("Выберите тип разрешения", { position: "top-center" });
      return;
    }

    addPermissionType(
      {
        url: `${URLS.permissions}/add_permission_type?permission_id=${selectedId}&permission_type_id=${selectedPermissionTypeId}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Тип разрешения успешно добавлен", {
            position: "top-center",
          });
          setAddPermissionTypeModal(false);
          setSelectedId(null);
          setSelectedPermissionTypeId("");
          queryClient.invalidateQueries(KEYS.permissions);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // Remove permission type
  const { mutate: removePermissionType } = usePostGeneralAuthQuery({
    listKeyId: "remove-permission-type",
  });

  const submitRemovePermissionType = () => {
    removePermissionType(
      {
        url: `${URLS.permissions}/remove_permission_type?permission_id=${selectedId}&permission_type_id=${selectedTypeToRemove}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Тип разрешения успешно удален", {
            position: "top-center",
          });
          setRemovePermissionTypeModal(false);
          setSelectedId(null);
          setSelectedTypeToRemove(null);
          queryClient.invalidateQueries(KEYS.permissions);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // Helper function for type colors
  const getTypeColor = (typeName) => {
    const colors = {
      "*": {
        bg: isDark ? "#7c2d12" : "#fed7aa",
        text: isDark ? "#fb923c" : "#c2410c",
      },
      create: {
        bg: isDark ? "#065f46" : "#d1fae5",
        text: isDark ? "#6ee7b7" : "#047857",
      },
      read: {
        bg: isDark ? "#1e3a8a" : "#dbeafe",
        text: isDark ? "#93c5fd" : "#1e40af",
      },
      update: {
        bg: isDark ? "#7c2d12" : "#fed7aa",
        text: isDark ? "#fb923c" : "#c2410c",
      },
      delete: {
        bg: isDark ? "#7f1d1d" : "#fecaca",
        text: isDark ? "#fca5a5" : "#dc2626",
      },
    };
    return (
      colors[typeName?.toLowerCase()] || {
        bg: isDark ? "#374151" : "#f3f4f6",
        text: isDark ? "#9ca3af" : "#6b7280",
      }
    );
  };

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Доступ и права"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  const permissionsData = get(permissions, "data.data", []);

  return (
    <DashboardLayout headerTitle={"Доступ и права"}>
      {isEmpty(permissionsData) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 my-5"
        >
          {/* Header Actions */}
          <div
            className="flex justify-between items-center p-4 rounded-lg border"
            style={{
              background: bg("white", "#1E1E1E"),
              borderColor: border("#d1d5db", "#4b5563"),
            }}
          >
            <PrimaryButton
              onClick={() => setCreateModal(true)}
              variant="contained"
            >
              Создать разрешение
            </PrimaryButton>

            <Link
              href="/dashboard/permission-of-roles/types"
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md px-4 py-2"
            >
              <span>Все типы разрешений</span>
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className="p-4 rounded-lg border"
              style={{
                background: bg("white", "#1E1E1E"),
                borderColor: border("#d1d5db", "#4b5563"),
              }}
            >
              <Typography
                variant="body2"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                Всего разрешений
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {permissionsData.length}
              </Typography>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: bg("white", "#1E1E1E"),
                borderColor: border("#d1d5db", "#4b5563"),
              }}
            >
              <Typography
                variant="body2"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                С типами
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {permissionsData.filter((p) => p.types?.length > 0).length}
              </Typography>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: bg("white", "#1E1E1E"),
                borderColor: border("#d1d5db", "#4b5563"),
              }}
            >
              <Typography
                variant="body2"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                С ролями
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {permissionsData.filter((p) => p.roles?.length > 0).length}
              </Typography>
            </div>
            <div
              className="p-4 rounded-lg border"
              style={{
                background: bg("white", "#1E1E1E"),
                borderColor: border("#d1d5db", "#4b5563"),
              }}
            >
              <Typography
                variant="body2"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                Доступных типов
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {get(typeOfPermissions, "data.data", []).length}
              </Typography>
            </div>
          </div>

          {/* Permissions Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {permissionsData.map((permission, index) => {
              const isWildcard = permission.name === "*";
              return (
                <motion.div
                  key={permission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      background: bg("#ffffff", "#1e1e1e"),
                      borderColor: border("#e5e7eb", "#374151"),
                      border: "1px solid #C9C9C9",
                      borderRadius: "12px",
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: isDark
                          ? "0 4px 12px rgba(0,0,0,0.3)"
                          : "0 4px 12px rgba(0,0,0,0.1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <CardContent>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Typography
                            variant="h6"
                            style={{
                              color: text("#111827", "#f9fafb"),
                              fontWeight: 600,
                            }}
                          >
                            {permission.name}
                          </Typography>
                          {isWildcard && (
                            <Chip
                              label="Все права"
                              size="small"
                              sx={{
                                backgroundColor: isDark ? "#1e3a8a" : "#dbeafe",
                                color: isDark ? "#93c5fd" : "#1e40af",
                                fontWeight: 600,
                                fontSize: "11px",
                              }}
                            />
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="small"
                            onClick={() => {
                              setEditModal(true);
                              setName(permission.name);
                              setSelectedId(permission.id);
                            }}
                            disabled={isWildcard}
                            sx={{
                              width: "32px",
                              height: "32px",
                              minWidth: "32px",
                              background: isDark ? "#7c2d12" : "#F0D8C8",
                              color: isDark ? "#fb923c" : "#FF6200",
                              "&:hover": {
                                background: isDark ? "#9a3412" : "#F0B28B",
                              },
                              "&:disabled": { color: "#9ca3af" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setDeleteModal(true);
                              setSelectedId(permission.id);
                            }}
                            disabled={isWildcard}
                            sx={{
                              width: "32px",
                              height: "32px",
                              minWidth: "32px",
                              background: isDark ? "#7f1d1d" : "#FCD8D3",
                              color: isDark ? "#fca5a5" : "#FF1E00",
                              "&:hover": {
                                background: isDark ? "#991b1b" : "#FCA89D",
                              },
                              "&:disabled": { color: "#9ca3af" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </Button>
                        </div>
                      </div>

                      <Divider sx={{ my: 2 }} />

                      {/* Roles Section */}
                      <Box className="mb-3">
                        <Typography
                          variant="caption"
                          style={{
                            color: text("#6b7280", "#9ca3af"),
                            fontWeight: 600,
                            textTransform: "uppercase",
                            fontSize: "11px",
                          }}
                        >
                          Роли
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          className="mt-2"
                        >
                          {permission.roles?.length > 0 ? (
                            permission.roles.map((role) => (
                              <Chip
                                key={role.id}
                                label={role.name}
                                size="small"
                                sx={{
                                  backgroundColor: isDark
                                    ? "#065f46"
                                    : "#d1fae5",
                                  color: isDark ? "#6ee7b7" : "#047857",
                                  fontWeight: 500,
                                }}
                              />
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              style={{ color: text("#9ca3af", "#6b7280") }}
                            >
                              Нет ролей
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Types Section with Actions */}
                      <Box>
                        <div className="flex items-center justify-between mb-2">
                          <Typography
                            variant="caption"
                            style={{
                              color: text("#6b7280", "#9ca3af"),
                              fontWeight: 600,
                              textTransform: "uppercase",
                              fontSize: "11px",
                            }}
                          >
                            Типы разрешений
                          </Typography>
                          <div className="flex gap-1">
                            {/* ADD BUTTON (Green-ish but fits your orange/red theme) */}
                            <IconButton
                              size="small"
                              onClick={() => {
                                setAddPermissionTypeModal(true);
                                setSelectedId(permission.id);
                              }}
                              sx={{
                                width: "32px",
                                height: "32px",
                                background: isDark ? "#064e3b" : "#D0F3E0",
                                color: isDark ? "#6ee7b7" : "#047857",
                                "&:hover": {
                                  background: isDark ? "#065f46" : "#B8EBD1",
                                },
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>

                            {/* REMOVE BUTTON */}
                            {permission.types?.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setRemovePermissionTypeModal(true);
                                  setSelectedId(permission.id);
                                }}
                                sx={{
                                  width: "32px",
                                  height: "32px",
                                  background: isDark ? "#7f1d1d" : "#FCD8D3",
                                  color: isDark ? "#fca5a5" : "#FF1E00",
                                  "&:hover": {
                                    background: isDark ? "#991b1b" : "#FCA89D",
                                  },
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            )}
                          </div>
                        </div>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {permission.types?.length > 0 ? (
                            permission.types.map((type) => {
                              const colors = getTypeColor(type.name);
                              return (
                                <Chip
                                  key={type.id}
                                  label={type.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: colors.bg,
                                    color: colors.text,
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Typography
                              variant="body2"
                              style={{ color: text("#9ca3af", "#6b7280") }}
                            >
                              Нет типов
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Create Modal */}
      {createModal && (
        <MethodModal
          open={createModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateModal(false);
            setName("");
          }}
          title="Создать разрешение"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя разрешения"
              type="text"
              value={name}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя разрешения"
            />
            <PrimaryButton onClick={submitCreatePermission}>
              Создать
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Edit Modal */}
      {editModal && (
        <MethodModal
          open={editModal}
          showCloseIcon={true}
          closeClick={() => {
            setEditModal(false);
            setName("");
            setSelectedId(null);
          }}
          title="Изменить разрешение"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя разрешения"
              type="text"
              value={name}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя разрешения"
            />
            <PrimaryButton
              backgroundColor="#fb923c"
              onClick={submitEditPermission}
            >
              Изменить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Add Permission Type Modal */}
      {addPermissionTypeModal && (
        <MethodModal
          open={addPermissionTypeModal}
          showCloseIcon={true}
          closeClick={() => {
            setAddPermissionTypeModal(false);
            setSelectedId(null);
            setSelectedPermissionTypeId("");
          }}
          title="Добавить тип разрешения"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label={"Тип разрешения"}
              options={optionsTypeOfPermissions}
              value={selectedPermissionTypeId}
              onChange={(val) => setSelectedPermissionTypeId(val)}
              placeholder="Выберите тип разрешения"
              returnObject={false}
            />
            <PrimaryButton onClick={submitAddPermissionType}>
              Добавить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Remove Permission Type Modal */}
      {removePermissionTypeModal && (
        <MethodModal
          open={removePermissionTypeModal}
          showCloseIcon={true}
          closeClick={() => {
            setRemovePermissionTypeModal(false);
            setSelectedId(null);
            setSelectedTypeToRemove(null);
          }}
          title="Удалить тип разрешения"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label="Выберите тип для удаления"
              value={selectedTypeToRemove}
              onChange={(value) => setSelectedTypeToRemove(value)}
              options={
                permissionsData
                  .find((p) => p.id === selectedId)
                  ?.types?.map((type) => ({
                    value: type.id,
                    label: type.name,
                  })) || []
              }
              placeholder="Выберите тип"
            />
            <PrimaryButton
              backgroundColor="#dc2626"
              onClick={submitRemovePermissionType}
            >
              Удалить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedId(null);
        }}
        deleting={submitDeletePermission}
        title="Вы уверены, что хотите удалить это разрешение?"
      />
    </DashboardLayout>
  );
};

export default Index;
