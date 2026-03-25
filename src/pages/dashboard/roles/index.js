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
import StatCard from "@/components/card/statisticCard";
import GamesIcon from "@mui/icons-material/Games";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import CustomTable from "@/components/table";
import { Tooltip } from "@mui/material";
const Index = () => {
  const queryClient = useQueryClient();
  const { bg, text, border, isDark } = useAppTheme();

  // Mapping for user-friendly resource and action names
  const resourceNameMap = {
    "*": "Все ресурсы",
    users: "Пользователи",
    roles: "Роли",
    permissions: "Разрешения",
    employees: "Сотрудники",
    departments: "Отделы",
    projects: "Проекты",
    // Add more mappings as needed
  };

  const actionNameMap = {
    "*": "Все действия",
    create: "Создание",
    read: "Чтение",
    update: "Обновление",
    delete: "Удаление",
    list: "Просмотр списка",
    view: "Просмотр",
    edit: "Редактирование",
    // Add more mappings as needed
  };

  // Helper function to get readable names
  const getReadableName = (name, mapping) => {
    return mapping[name?.toLowerCase()] || name || "Unknown";
  };

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
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'table'

  // Load view preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedViewMode = localStorage.getItem("rolesViewMode") || "card";
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("rolesViewMode", mode);
    }
  };

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

  const { data: permissions, isLoading: isLoadingPermissions } =
    useGetGeneralAuthQuery({
      key: KEYS.permissions,
      url: URLS.permissions,
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        Accept: "application/json",
      },
      params: {
        limit: 1000,
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
    label: `Ресурс(${entry.resource?.name}) - Действие(${entry.action?.name})`,
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
            className={`flex justify-between items-center p-4 rounded-lg border ${!isDark ? "border-gray-200" : "border-gray-400"}`}
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

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Tooltip title="Таблица" placement="top">
                <IconButton
                  onClick={() => handleViewModeChange("table")}
                  sx={{
                    borderRadius: "8px",
                    width: 40,
                    height: 40,
                    background:
                      viewMode === "table"
                        ? bg(
                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                          )
                        : bg(
                            "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
                          ),
                    color:
                      viewMode === "table"
                        ? "white"
                        : text("#6b7280", "#d1d5db"),
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <ViewWeekIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Карточки" placement="top">
                <IconButton
                  onClick={() => handleViewModeChange("card")}
                  sx={{
                    borderRadius: "8px",
                    width: 40,
                    height: 40,
                    background:
                      viewMode === "card"
                        ? bg(
                            "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                            "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                          )
                        : bg(
                            "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                            "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
                          ),
                    color:
                      viewMode === "card"
                        ? "white"
                        : text("#6b7280", "#d1d5db"),
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <ViewAgendaIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4">
            <StatCard
              value={rolesData.length}
              title={"Всего ролей"}
              icon={GamesIcon}
              iconColor={"black"}
            />
            <StatCard
              value={rolesData.filter((r) => r.permissions?.length > 0).length}
              title={"С разрешениями"}
              icon={VpnKeyIcon}
              iconColor={"black"}
            />
          </div>

          {/* Roles Cards Grid - Card View */}
          {viewMode === "card" && (
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
                    <div
                      className={`rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                        isDark
                          ? "bg-gray-800 border-gray-700 hover:shadow-black/30"
                          : "bg-white border-gray-300 hover:shadow-gray-200"
                      }`}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1">
                            <h3
                              className={`text-lg font-semibold ${
                                isDark ? "text-gray-50" : "text-gray-900"
                              }`}
                            >
                              {role.name}
                            </h3>
                            {isAdmin && (
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  isDark
                                    ? "bg-blue-900 text-blue-300"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                Администратор
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditModal(true);
                                setName(role.name);
                                setSelectedId(role.id);
                              }}
                              disabled={isAdmin}
                              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                                isAdmin
                                  ? "opacity-40 cursor-not-allowed"
                                  : isDark
                                    ? "bg-orange-900 text-orange-400 hover:bg-orange-800"
                                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModal(true);
                                setSelectedId(role.id);
                              }}
                              disabled={isAdmin}
                              className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                                isAdmin
                                  ? "opacity-40 cursor-not-allowed"
                                  : isDark
                                    ? "bg-red-900 text-red-400 hover:bg-red-800"
                                    : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div
                          className={`my-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
                        />

                        {/* Permissions Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-xs font-semibold uppercase tracking-wide ${
                                isDark ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              Разрешения
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setAddPermissionModal(true);
                                  setSelectedId(role.id);
                                }}
                                className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                                  isDark
                                    ? "bg-green-900 text-green-400 hover:bg-green-800"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>

                              {role.permissions?.length > 0 && (
                                <button
                                  onClick={() => {
                                    setRemovePermissionModal(true);
                                    setSelectedId(role.id);
                                  }}
                                  className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                                    isDark
                                      ? "bg-red-900 text-red-400 hover:bg-red-800"
                                      : "bg-red-100 text-red-600 hover:bg-red-200"
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 12H4"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {role.permissions?.length > 0 ? (
                              role.permissions.map((permission) => {
                                const resourceName =
                                  permission.resource?.name || "Unknown";
                                const actionName =
                                  permission.action?.name || "Unknown";

                                // Format for better readability
                                const formatPermission = (resource, action) => {
                                  if (resource === "*" && action === "*") {
                                    return {
                                      display: "Полный доступ ко всем ресурсам",
                                      color: isDark
                                        ? "bg-green-900 text-green-300"
                                        : "bg-green-100 text-green-800",
                                    };
                                  }
                                  if (resource === "*") {
                                    return {
                                      display: `Все ресурсы: ${action}`,
                                      color: isDark
                                        ? "bg-blue-900 text-blue-300"
                                        : "bg-blue-100 text-blue-800",
                                    };
                                  }
                                  if (action === "*") {
                                    return {
                                      display: `${resource}: Все действия`,
                                      color: isDark
                                        ? "bg-purple-900 text-purple-300"
                                        : "bg-purple-100 text-purple-800",
                                    };
                                  }
                                  return {
                                    display: `${resource}: ${action}`,
                                    color: isDark
                                      ? "bg-indigo-900 text-indigo-300"
                                      : "bg-indigo-100 text-indigo-800",
                                  };
                                };

                                const formatted = formatPermission(
                                  resourceName,
                                  actionName,
                                );

                                return (
                                  <span
                                    key={permission.id}
                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${formatted.color}`}
                                  >
                                    <svg
                                      className="w-3.5 h-3.5 mr-1.5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                                      />
                                    </svg>
                                    {formatted.display}
                                  </span>
                                );
                              })
                            ) : (
                              <p
                                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}
                              >
                                Нет разрешений
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Roles Table - Table View */}
          {viewMode === "table" && (
            <>
              {(() => {
                const columns = [
                  {
                    header: "Роль",
                    cell: ({ row }) => {
                      const role = row.original;
                      const isAdmin = role.name.toLowerCase() === "admin";
                      return (
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isAdmin ? "bg-red-500" : "bg-blue-500"
                            }`}
                          />
                          <span className="font-semibold">{role.name}</span>
                        </div>
                      );
                    },
                  },
                  {
                    header: "Разрешений",
                    cell: ({ row }) => row.original.permissions?.length || 0,
                  },
                  {
                    header: "Разрешения",
                    cell: ({ row }) => {
                      const role = row.original;
                      return (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {role.permissions?.length > 0 ? (
                            role.permissions.map((permission) => {
                              const resourceName = getReadableName(
                                permission.resource?.name,
                                resourceNameMap,
                              );
                              const actionName = getReadableName(
                                permission.action?.name,
                                actionNameMap,
                              );
                              return (
                                <Chip
                                  key={permission.id}
                                  label={`${resourceName.split(" ")[0]}: ${actionName.split(" ")[0]}`}
                                  size="small"
                                  sx={{
                                    background: isDark
                                      ? "linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)"
                                      : "linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)",
                                    color: isDark ? "#d8b4fe" : "#6b21a8",
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    height: 24,
                                  }}
                                />
                              );
                            })
                          ) : (
                            <Typography
                              variant="body2"
                              style={{
                                color: text("#9ca3af", "#6b7280"),
                                fontStyle: "italic",
                                fontSize: "12px",
                              }}
                            >
                              Нет разрешений
                            </Typography>
                          )}
                        </Stack>
                      );
                    },
                  },
                  {
                    header: "Управление",
                    cell: ({ row }) => {
                      const role = row.original;
                      const isAdmin = role.name.toLowerCase() === "admin";

                      return (
                        <div className="flex gap-1">
                          <Tooltip title="Добавить разрешение" placement="top">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setAddPermissionModal(true);
                                setSelectedId(role.id);
                              }}
                              disabled={isAdmin}
                              sx={{
                                width: 32,
                                height: 32,
                                background: isAdmin
                                  ? "#ccc"
                                  : isDark
                                    ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
                                    : "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                                color: isAdmin
                                  ? "#999"
                                  : isDark
                                    ? "#6ee7b7"
                                    : "#047857",
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {role.permissions?.length > 0 && (
                            <Tooltip title="Удалить разрешение" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setRemovePermissionModal(true);
                                  setSelectedId(role.id);
                                }}
                                disabled={isAdmin}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  background: isAdmin
                                    ? "#ccc"
                                    : isDark
                                      ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                                      : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                                  color: isAdmin
                                    ? "#999"
                                    : isDark
                                      ? "#fca5a5"
                                      : "#dc2626",
                                }}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      );
                    },
                  },
                  {
                    header: "Действия",
                    cell: ({ row }) => {
                      const role = row.original;
                      const isAdmin = role.name.toLowerCase() === "admin";

                      return (
                        <div className="flex gap-1">
                          <Tooltip title="Редактировать" placement="top">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedId(role.id);
                                  setName(role.name);
                                  setEditModal(true);
                                }}
                                disabled={isAdmin}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  background: isDark
                                    ? "linear-gradient(135deg, #7c2d12 0%, #92400e 100%)"
                                    : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                  color: isDark ? "#fbbf24" : "#d97706",
                                  "&:disabled": {
                                    background: isDark ? "#374151" : "#f3f4f6",
                                    color: "#9ca3af",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Удалить" placement="top">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteModal(true);
                                  setSelectedId(role.id);
                                }}
                                disabled={isAdmin}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  background: isDark
                                    ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                                    : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                                  color: isDark ? "#fca5a5" : "#dc2626",
                                  "&:disabled": {
                                    background: isDark ? "#374151" : "#f3f4f6",
                                    color: "#9ca3af",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </div>
                      );
                    },
                  },
                ];

                return (
                  <CustomTable
                    data={rolesData}
                    columns={columns}
                    tableClassName="w-full"
                  />
                );
              })()}
            </>
          )}
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
                    label: `${permission.resource?.name || "Unknown"} - ${permission.action?.name || "Unknown"}`,
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
