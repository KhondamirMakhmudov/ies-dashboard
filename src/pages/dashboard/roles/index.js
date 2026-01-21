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
import { useState, useEffect } from "react";
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
  const [addPermissionModal, setAddPermissionModal] = useState(false);
  const [removePermissionModal, setRemovePermissionModal] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [removeUserModal, setRemoveUserModal] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState("");
  const [selectedPermissionToRemove, setSelectedPermissionToRemove] =
    useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserToRemove, setSelectedUserToRemove] = useState(null);
  const [name, setName] = useState("");
  const [employeeDataMap, setEmployeeDataMap] = useState({});

  const { data: session } = useSession();

  // Get roles
  const {
    data: roles,
    isLoading,
    isFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.roles,
    url: URLS.roles,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // Get permissions for add/remove
  const { data: permissions, isLoading: isLoadingPermissions } =
    useGetGeneralAuthQuery({
      key: KEYS.permissions,
      url: URLS.permissions,
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        Accept: "application/json",
      },
      enabled: !!session?.accessToken,
    });

  // Get users for add/remove
  const { data: users, isLoading: isLoadingUsers } = useGetGeneralAuthQuery({
    key: KEYS.users,
    url: URLS.users,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // Get employee data for users
  useEffect(() => {
    if (roles?.data?.data) {
      const employeeIds = [];
      roles.data.data.forEach((role) => {
        role.users?.forEach((user) => {
          if (user.employee_id && !employeeIds.includes(user.employee_id)) {
            employeeIds.push(user.employee_id);
          }
        });
      });

      // Bu yerda employee ma'lumotlarini olish uchun API chaqirish kerak
      // Hozircha demo ma'lumotlar bilan ishlaymiz
      if (employeeIds.length > 0) {
        const mockEmployeeData = {};
        employeeIds.forEach((id) => {
          mockEmployeeData[id] = {
            first_name: "Ism",
            last_name: "Familiya",
            middle_name: "Sharif",
            position: "Lavozim",
          };
        });
        setEmployeeDataMap(mockEmployeeData);
      }
    }
  }, [roles]);

  const optionsPermissions = get(permissions, "data.data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  const optionsUsers = get(users, "data.data", []).map((entry) => ({
    value: entry.id,
    label: entry.username,
  }));

  // Create role
  const { mutate: createRole } = usePostGeneralAuthQuery({
    listKeyId: "create-role",
  });

  const submitCreateRole = () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }
    createRole(
      {
        url: URLS.roles,
        attributes: { name: name },
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Роль успешно создана", { position: "top-center" });
          setCreateModal(false);
          setName("");
          queryClient.invalidateQueries(KEYS.roles);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // Edit role
  const submitEditRole = async () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.roles}/${selectedId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name: name }),
        },
      );

      if (!response.ok) throw new Error("Ошибка при обновлении");

      toast.success("Роль успешно обновлена", { position: "top-center" });
      setEditModal(false);
      setSelectedId(null);
      setName("");
      queryClient.invalidateQueries(KEYS.roles);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Delete role
  const submitDeleteRole = async () => {
    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.roles}/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Ошибка при удалении");

      toast.success("Роль успешно удалена", { position: "top-center" });
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.roles);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Add permission to role
  const { mutate: addPermission } = usePostGeneralAuthQuery({
    listKeyId: "add-permission-to-role",
  });

  const submitAddPermission = () => {
    if (!selectedPermissionId) {
      toast.error("Выберите разрешение", { position: "top-center" });
      return;
    }

    addPermission(
      {
        url: `${URLS.roles}/add_permission?role_id=${selectedId}&permission_id=${selectedPermissionId}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Разрешение успешно добавлено", {
            position: "top-center",
          });
          setAddPermissionModal(false);
          setSelectedId(null);
          setSelectedPermissionId("");
          queryClient.invalidateQueries(KEYS.roles);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // Remove permission from role
  const { mutate: removePermission } = usePostGeneralAuthQuery({
    listKeyId: "remove-permission-from-role",
  });

  const submitRemovePermission = () => {
    removePermission(
      {
        url: `${URLS.roles}/remove_permission?role_id=${selectedId}&permission_id=${selectedPermissionToRemove}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Разрешение успешно удалено", {
            position: "top-center",
          });
          setRemovePermissionModal(false);
          setSelectedId(null);
          setSelectedPermissionToRemove(null);
          queryClient.invalidateQueries(KEYS.roles);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // Add user to role
  const { mutate: addUser } = usePostGeneralAuthQuery({
    listKeyId: "add-user-to-role",
  });

  const submitAddUser = () => {
    if (!selectedUserId) {
      toast.error("Выберите пользователя", { position: "top-center" });
      return;
    }

    addUser(
      {
        url: `${URLS.roles}/add_user?role_id=${selectedId}&user_id=${selectedUserId}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Пользователь успешно добавлен", {
            position: "top-center",
          });
          setAddUserModal(false);
          setSelectedId(null);
          setSelectedUserId("");
          queryClient.invalidateQueries(KEYS.roles);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // Remove user from role
  const { mutate: removeUser } = usePostGeneralAuthQuery({
    listKeyId: "remove-user-from-role",
  });

  const submitRemoveUser = () => {
    removeUser(
      {
        url: `${URLS.roles}/remove_user?role_id=${selectedId}&user_id=${selectedUserToRemove}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Пользователь успешно удален", {
            position: "top-center",
          });
          setRemoveUserModal(false);
          setSelectedId(null);
          setSelectedUserToRemove(null);
          queryClient.invalidateQueries(KEYS.roles);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // Helper function for permission colors
  // const getPermissionColor = (permissionName) => {
  //   const colors = {
  //     "*": {
  //       bg: isDark ? "#7c2d12" : "#fed7aa",
  //       text: isDark ? "#fb923c" : "#c2410c",
  //     },
  //     create: {
  //       bg: isDark ? "#065f46" : "#d1fae5",
  //       text: isDark ? "#6ee7b7" : "#047857",
  //     },
  //     read: {
  //       bg: isDark ? "#1e3a8a" : "#dbeafe",
  //       text: isDark ? "#93c5fd" : "#1e40af",
  //     },
  //     update: {
  //       bg: isDark ? "#7c2d12" : "#fed7aa",
  //       text: isDark ? "#fb923c" : "#c2410c",
  //     },
  //     delete: {
  //       bg: isDark ? "#7f1d1d" : "#fecaca",
  //       text: isDark ? "#fca5a5" : "#dc2626",
  //     },
  //   };

  //   const lowerName = permissionName?.toLowerCase();
  //   for (const [key, value] of Object.entries(colors)) {
  //     if (lowerName.includes(key)) {
  //       return value;
  //     }
  //   }

  //   return {
  //     bg: isDark ? "#374151" : "#f3f4f6",
  //     text: isDark ? "#9ca3af" : "#6b7280",
  //   };
  // };

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Роли и доступы"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  const rolesData = get(roles, "data.data", []);

  return (
    <DashboardLayout headerTitle={"Роли и доступы"}>
      {isEmpty(rolesData) ? (
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
              Создать роль
            </PrimaryButton>

            <Link
              href="/dashboard/permissions"
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md px-4 py-2"
            >
              <span>Все разрешения</span>
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
                Всего ролей
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {rolesData.length}
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
                С разрешениями
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {rolesData.filter((r) => r.permissions?.length > 0).length}
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
                С пользователями
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {rolesData.filter((r) => r.users?.length > 0).length}
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
                Всего пользователей
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {rolesData.reduce(
                  (sum, role) => sum + (role.users?.length || 0),
                  0,
                )}
              </Typography>
            </div>
          </div>

          {/* Roles Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rolesData.map((role, index) => {
              const isAdmin = role.name.toLowerCase() === "admin";
              return (
                <motion.div
                  key={role.id}
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
                            {role.name}
                          </Typography>
                          {isAdmin && (
                            <Chip
                              label="Администратор"
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
                              setName(role.name);
                              setSelectedId(role.id);
                            }}
                            disabled={isAdmin}
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
                              setSelectedId(role.id);
                            }}
                            disabled={isAdmin}
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

                      {/* Users Section */}
                      <Box className="mb-3">
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
                            Пользователи
                          </Typography>
                        </div>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                          className="mt-2"
                        >
                          {role.users?.length > 0 ? (
                            <>
                              <Stack
                                direction="column"
                                spacing={1}
                                className="mt-2"
                              >
                                {role.users.map((user) => {
                                  const employeeData = user.employee_id
                                    ? employeeDataMap[user.employee_id]
                                    : null;
                                  let displayName = user.username;

                                  if (employeeData) {
                                    const parts = [
                                      employeeData.last_name,
                                      employeeData.first_name,
                                      employeeData.middle_name,
                                    ].filter(Boolean);
                                    if (parts.length > 0) {
                                      displayName = parts.join(" ");
                                    }
                                  }

                                  return (
                                    <Chip
                                      key={user.id}
                                      label={displayName}
                                      size="small"
                                      sx={{
                                        backgroundColor: isDark
                                          ? "#374151"
                                          : "#f3f4f6",
                                        color: text("#111827", "#f9fafb"),
                                        fontWeight: 500,
                                      }}
                                    />
                                  );
                                })}
                              </Stack>
                            </>
                          ) : (
                            <Typography
                              variant="body2"
                              style={{ color: text("#9ca3af", "#6b7280") }}
                            >
                              Нет пользователей
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Permissions Section */}
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
                            Разрешения
                          </Typography>
                          <div className="flex gap-1">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setAddPermissionModal(true);
                                setSelectedId(role.id);
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

                            {role.permissions?.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setRemovePermissionModal(true);
                                  setSelectedId(role.id);
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
                          {role.permissions?.length > 0 ? (
                            role.permissions.map((permission) => {
                              const colors = getPermissionColor(
                                permission.name,
                              );
                              return (
                                <Chip
                                  key={permission.id}
                                  label={permission.name}
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
                              Нет разрешений
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

      {/* Create Role Modal */}
      {createModal && (
        <MethodModal
          open={createModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateModal(false);
            setName("");
          }}
          title="Создать роль"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя роли"
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
              placeholder="Введите имя роли"
            />
            <PrimaryButton onClick={submitCreateRole}>Создать</PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Edit Role Modal */}
      {editModal && (
        <MethodModal
          open={editModal}
          showCloseIcon={true}
          closeClick={() => {
            setEditModal(false);
            setName("");
            setSelectedId(null);
          }}
          title="Изменить роль"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя роли"
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
              placeholder="Введите имя роли"
            />
            <PrimaryButton backgroundColor="#fb923c" onClick={submitEditRole}>
              Изменить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Add Permission Modal */}
      {addPermissionModal && (
        <MethodModal
          open={addPermissionModal}
          showCloseIcon={true}
          closeClick={() => {
            setAddPermissionModal(false);
            setSelectedId(null);
            setSelectedPermissionId("");
          }}
          title="Добавить разрешение"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label={"Разрешение"}
              options={optionsPermissions}
              value={selectedPermissionId}
              onChange={(val) => setSelectedPermissionId(val)}
              placeholder="Выберите разрешение"
              returnObject={false}
            />
            <PrimaryButton onClick={submitAddPermission}>
              Добавить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Remove Permission Modal */}
      {removePermissionModal && (
        <MethodModal
          open={removePermissionModal}
          showCloseIcon={true}
          closeClick={() => {
            setRemovePermissionModal(false);
            setSelectedId(null);
            setSelectedPermissionToRemove(null);
          }}
          title="Удалить разрешение"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label="Выберите разрешение для удаления"
              value={selectedPermissionToRemove}
              onChange={(value) => setSelectedPermissionToRemove(value)}
              options={
                rolesData
                  .find((r) => r.id === selectedId)
                  ?.permissions?.map((permission) => ({
                    value: permission.id,
                    label: permission.name,
                  })) || []
              }
              placeholder="Выберите разрешение"
            />
            <PrimaryButton
              backgroundColor="#dc2626"
              onClick={submitRemovePermission}
            >
              Удалить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Add User Modal */}
      {addUserModal && (
        <MethodModal
          open={addUserModal}
          showCloseIcon={true}
          closeClick={() => {
            setAddUserModal(false);
            setSelectedId(null);
            setSelectedUserId("");
          }}
          title="Добавить пользователя"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label={"Пользователь"}
              options={optionsUsers}
              value={selectedUserId}
              onChange={(val) => setSelectedUserId(val)}
              placeholder="Выберите пользователя"
              returnObject={false}
            />
            <PrimaryButton onClick={submitAddUser}>Добавить</PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Remove User Modal */}
      {removeUserModal && (
        <MethodModal
          open={removeUserModal}
          showCloseIcon={true}
          closeClick={() => {
            setRemoveUserModal(false);
            setSelectedId(null);
            setSelectedUserToRemove(null);
          }}
          title="Удалить пользователя"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label="Выберите пользователя для удаления"
              value={selectedUserToRemove}
              onChange={(value) => setSelectedUserToRemove(value)}
              options={
                rolesData
                  .find((r) => r.id === selectedId)
                  ?.users?.map((user) => ({
                    value: user.id,
                    label: user.username,
                  })) || []
              }
              placeholder="Выберите пользователя"
            />
            <PrimaryButton backgroundColor="#dc2626" onClick={submitRemoveUser}>
              Удалить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Delete Role Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedId(null);
        }}
        deleting={submitDeleteRole}
        title="Вы уверены, что хотите удалить эту роль?"
      />
    </DashboardLayout>
  );
};

export default Index;
