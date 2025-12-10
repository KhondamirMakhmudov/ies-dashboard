import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { useSession } from "next-auth/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import BadgeIcon from "@mui/icons-material/Badge";
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
  Avatar,
  Badge,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
} from "@mui/material";
import { useState, useMemo } from "react";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import CustomSelect from "@/components/select";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { config } from "@/config";
import DeleteModal from "@/components/modal/delete-modal";
import ContentLoader from "@/components/loader";

const Index = () => {
  const queryClient = useQueryClient();
  const { bg, text, border, isDark } = useAppTheme();

  // State for modals
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addRoleModal, setAddRoleModal] = useState(false);
  const [removeRoleModal, setRemoveRoleModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedRoleToRemove, setSelectedRoleToRemove] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    employee_id: "",
    role_id: "",
    unit_code: "",
    name: "",
    username: "",
    password: "",
  });
  const [editFormData, setEditFormData] = useState({
    employee_id: "",
    role_ids: [],
    unit_code: "",
    name: "",
    password: "",
  });
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [editEmployeeSearch, setEditEmployeeSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: session } = useSession();

  // Get users
  const {
    data: users,
    isLoading,
    isFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.users,
    url: URLS.users,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // Get all roles
  const { data: roles } = useGetGeneralAuthQuery({
    key: KEYS.roles,
    url: URLS.roles,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // Get employees for dropdown
  const {
    data: employees,
    isLoading: isLoadingEmployees,
    isFetching: isFetchingEmployees,
  } = useGetPythonQuery({
    key: KEYS.employees,
    url: URLS.employees,
    params: {
      limit: 1000,
    },
    enabled: createModal || editModal,
  });

  // Options for role select
  const roleOptions = get(roles, "data.data", []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  // Options for employee select
  const employeeOptions = useMemo(() => {
    return get(employees, "data.data", []).map((employee) => ({
      value: employee.id,
      label:
        `${employee.last_name || ""} ${employee.first_name || ""} ${
          employee.middle_name || ""
        }`.trim() || employee.id,
      employeeData: employee,
    }));
  }, [employees]);

  // Filtered employee options based on search
  const filteredEmployeeOptions = useMemo(() => {
    if (!employeeSearch.trim()) return employeeOptions;

    const searchTerm = employeeSearch.toLowerCase();
    return employeeOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.employeeData?.id?.toString().includes(searchTerm) ||
        option.employeeData?.employee_id?.toLowerCase().includes(searchTerm)
    );
  }, [employeeOptions, employeeSearch]);

  // Filtered employee options for edit modal
  const filteredEditEmployeeOptions = useMemo(() => {
    if (!editEmployeeSearch.trim()) return employeeOptions;

    const searchTerm = editEmployeeSearch.toLowerCase();
    return employeeOptions.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.employeeData?.id?.toString().includes(searchTerm) ||
        option.employeeData?.employee_id?.toLowerCase().includes(searchTerm)
    );
  }, [employeeOptions, editEmployeeSearch]);

  // Create user - note: role_id changed to role_ids array
  const { mutate: createUser, isLoading: isCreating } = usePostGeneralAuthQuery(
    {
      listKeyId: "create-user",
    }
  );

  const submitCreateUser = () => {
    if (
      !formData.name ||
      !formData.username ||
      !formData.password ||
      !formData.role_id
    ) {
      toast.error("Пожалуйста, заполните все обязательные поля", {
        position: "top-center",
      });
      return;
    }

    createUser(
      {
        url: URLS.register,
        attributes: {
          ...formData,
          role_ids: [formData.role_id], // Send as array
        },
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Пользователь успешно создан", {
            position: "top-center",
          });
          setCreateModal(false);
          setFormData({
            employee_id: "",
            role_id: "",
            unit_code: "",
            name: "",
            username: "",
            password: "",
          });
          setEmployeeSearch("");
          queryClient.invalidateQueries(KEYS.users);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // Update user with multiple roles
  const submitUpdateUser = async () => {
    if (!selectedUser) return;

    const updateData = {};
    if (editFormData.name && editFormData.name !== selectedUser.name) {
      updateData.name = editFormData.name;
    }
    if (editFormData.employee_id !== selectedUser.employee_id) {
      updateData.employee_id = editFormData.employee_id || null;
    }
    if (editFormData.role_ids && editFormData.role_ids.length > 0) {
      // Compare with existing roles
      const existingRoleIds = selectedUser.roles?.map((r) => r.id) || [];
      if (
        JSON.stringify(editFormData.role_ids.sort()) !==
        JSON.stringify(existingRoleIds.sort())
      ) {
        updateData.role_ids = editFormData.role_ids;
      }
    }
    if (editFormData.unit_code !== selectedUser.unit_code) {
      updateData.unit_code = editFormData.unit_code || null;
    }
    if (editFormData.password) {
      updateData.password = editFormData.password;
    }

    if (Object.keys(updateData).length === 0) {
      toast.error("Нет изменений для сохранения", {
        position: "top-center",
      });
      return;
    }

    setIsUpdating(true);
    try {
      await axios.patch(
        `${config.GENERAL_AUTH_URL}${URLS.users}/${selectedUser.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Пользователь успешно обновлен", {
        position: "top-center",
      });
      setEditModal(false);
      setSelectedUser(null);
      setEditFormData({
        employee_id: "",
        role_ids: [],
        unit_code: "",
        name: "",
        password: "",
      });
      setEditEmployeeSearch("");
      queryClient.invalidateQueries(KEYS.users);
    } catch (error) {
      toast.error(
        `Ошибка: ${
          error.response?.data?.message || error.message || "Неизвестная ошибка"
        }`,
        { position: "top-right" }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete user
  const submitDeleteUser = async () => {
    try {
      await axios.delete(
        `${config.GENERAL_AUTH_URL}${URLS.users}/${selectedId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      toast.success("Пользователь успешно удален", {
        position: "top-center",
      });
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.users);
    } catch (error) {
      toast.error(
        `Ошибка: ${
          error.response?.data?.message || error.message || "Неизвестная ошибка"
        }`,
        { position: "top-right" }
      );
    }
  };

  // Add role to user
  const { mutate: addRoleToUser } = usePostGeneralAuthQuery({
    listKeyId: "add-role-to-user",
  });

  const submitAddRoleToUser = () => {
    if (!selectedRoleId) {
      toast.error("Выберите роль", { position: "top-center" });
      return;
    }

    addRoleToUser(
      {
        url: `${URLS.users}/add_role?user_id=${selectedId}&role_id=${selectedRoleId}`,
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Роль успешно добавлена пользователю", {
            position: "top-center",
          });
          setAddRoleModal(false);
          setSelectedId(null);
          setSelectedRoleId("");
          queryClient.invalidateQueries(KEYS.users);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // Remove role from user
  const { mutate: removeRoleFromUser } = usePostGeneralAuthQuery({
    listKeyId: "remove-role-from-user",
  });

  // Remove role from user - TO'G'RI VERSIYA
  const submitRemoveRoleFromUser = () => {
    if (!selectedRoleToRemove) {
      toast.error("Выберите роль для удаления", { position: "top-center" });
      return;
    }

    removeRoleFromUser(
      {
        // URL tekshiring - query parameter format
        url: `${URLS.users}/remove_role?user_id=${selectedId}&role_id=${selectedRoleToRemove}`,
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Роль успешно удалена у пользователя", {
            position: "top-center",
          });
          setRemoveRoleModal(false);
          setSelectedId(null);
          setSelectedRoleToRemove(null);
          queryClient.invalidateQueries(KEYS.users);
        },
        onError: (error) => {
          console.error("Remove role error:", error);
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // Helper function for role colors
  const getRoleColor = (roleName) => {
    const colors = {
      admin: {
        bg: isDark ? "#1e3a8a" : "#dbeafe",
        text: isDark ? "#93c5fd" : "#1e40af",
      },
      superadmin: {
        bg: isDark ? "#7c2d12" : "#fed7aa",
        text: isDark ? "#fb923c" : "#c2410c",
      },
      moderator: {
        bg: isDark ? "#065f46" : "#d1fae5",
        text: isDark ? "#6ee7b7" : "#047857",
      },
      user: {
        bg: isDark ? "#374151" : "#f3f4f6",
        text: isDark ? "#9ca3af" : "#6b7280",
      },
      manager: {
        bg: isDark ? "#7c2d12" : "#fed7aa",
        text: isDark ? "#fb923c" : "#c2410c",
      },
    };

    const lowerName = roleName?.toLowerCase();
    for (const [key, value] of Object.entries(colors)) {
      if (lowerName.includes(key)) {
        return value;
      }
    }

    return {
      bg: isDark ? "#4b5563" : "#e5e7eb",
      text: isDark ? "#d1d5db" : "#374151",
    };
  };

  // Check if user has admin role
  const hasAdminRole = (user) => {
    return user.roles?.some((role) => role.name?.toLowerCase() === "admin");
  };

  // Get unique permissions from all roles
  const getUserPermissions = (user) => {
    if (!user.roles) return [];
    const allPermissions = [];
    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((permission) => {
          if (!allPermissions.some((p) => p.name === permission.name)) {
            allPermissions.push(permission);
          }
        });
      }
    });
    return allPermissions;
  };

  // Handle edit user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setSelectedId(user.id);
    setEditFormData({
      employee_id: user.employee_id || "",
      role_ids: user.roles?.map((role) => role.id) || [],
      unit_code: user.unit_code || "",
      name: user.name || "",
      password: "",
    });
    setEditModal(true);
  };

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Пользователи"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  const usersData = get(users, "data.data", []);

  return (
    <DashboardLayout headerTitle={"Пользователи"}>
      {isEmpty(usersData) ? (
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
              Создать пользователя
            </PrimaryButton>

            <div
              className="text-sm"
              style={{ color: text("#6b7280", "#9ca3af") }}
            >
              Всего пользователей: <strong>{usersData.length}</strong>
            </div>
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
                Всего пользователей
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {usersData.length}
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
                {usersData.filter((u) => u.roles?.length > 0).length}
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
                С привязанным сотрудником
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {usersData.filter((u) => u.employee_id).length}
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
                Администраторы
              </Typography>
              <Typography
                variant="h4"
                style={{ color: text("#111827", "#f9fafb") }}
                className="font-bold"
              >
                {usersData.filter((u) => hasAdminRole(u)).length}
              </Typography>
            </div>
          </div>

          {/* Users Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {usersData.map((user, index) => {
              const isSuperAdmin = user.username === "admin";
              const adminUser = hasAdminRole(user);
              const userPermissions = getUserPermissions(user);
              const hasAllPermissions = userPermissions.some(
                (p) => p.name === "*"
              );

              return (
                <motion.div
                  key={user.id}
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
                        <div className="flex items-center gap-3 flex-1">
                          <Badge
                            color={adminUser ? "warning" : "success"}
                            badgeContent={adminUser ? "A" : ""}
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: adminUser
                                  ? isDark
                                    ? "#f59e0b"
                                    : "#fbbf24"
                                  : isDark
                                  ? "#4b5563"
                                  : "#e5e7eb",
                                color: adminUser
                                  ? isDark
                                    ? "#1f2937"
                                    : "#374151"
                                  : text("#111827", "#f9fafb"),
                                width: 48,
                                height: 48,
                              }}
                            >
                              {user.name?.charAt(0).toUpperCase() ||
                                user.username?.charAt(0).toUpperCase() ||
                                "U"}
                            </Avatar>
                          </Badge>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Typography
                                variant="h6"
                                style={{
                                  color: text("#111827", "#f9fafb"),
                                  fontWeight: 600,
                                }}
                              >
                                {user.name || user.username}
                              </Typography>
                              {isSuperAdmin && (
                                <Chip
                                  label="Супер-админ"
                                  size="small"
                                  sx={{
                                    backgroundColor: isDark
                                      ? "#7c2d12"
                                      : "#fed7aa",
                                    color: isDark ? "#fb923c" : "#c2410c",
                                    fontWeight: 600,
                                    fontSize: "10px",
                                  }}
                                />
                              )}
                            </div>
                            <Typography
                              variant="body2"
                              style={{
                                color: text("#6b7280", "#9ca3af"),
                                fontSize: "13px",
                              }}
                            >
                              @{user.username}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="small"
                            onClick={() => handleEditClick(user)}
                            disabled={isSuperAdmin}
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
                              setSelectedId(user.id);
                            }}
                            disabled={isSuperAdmin}
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

                      {/* Basic Info */}
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
                          Основная информация
                        </Typography>
                        <Stack spacing={1} className="mt-2">
                          <div className="flex justify-between">
                            <Typography
                              variant="body2"
                              style={{ color: text("#6b7280", "#9ca3af") }}
                            >
                              ID сотрудника:
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{ color: text("#111827", "#f9fafb") }}
                            >
                              {user.employee_id || "Не указан"}
                            </Typography>
                          </div>
                          <div className="flex justify-between">
                            <Typography
                              variant="body2"
                              style={{ color: text("#6b7280", "#9ca3af") }}
                            >
                              Код подразделения:
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{ color: text("#111827", "#f9fafb") }}
                            >
                              {user.unit_code || "Не указан"}
                            </Typography>
                          </div>
                          <div className="flex justify-between">
                            <Typography
                              variant="body2"
                              style={{ color: text("#6b7280", "#9ca3af") }}
                            >
                              Дата создания:
                            </Typography>
                            <Typography
                              variant="body2"
                              style={{ color: text("#111827", "#f9fafb") }}
                            >
                              {new Date(user.created_at).toLocaleDateString()}
                            </Typography>
                          </div>
                        </Stack>
                      </Box>

                      {/* Roles Section */}
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
                            Роли пользователя ({user.roles?.length || 0})
                          </Typography>
                          <div className="flex gap-1">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setAddRoleModal(true);
                                setSelectedId(user.id);
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

                            {user.roles?.length > 0 && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setRemoveRoleModal(true);
                                  setSelectedId(user.id);
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
                          {user.roles?.length > 0 ? (
                            user.roles.map((role) => (
                              <Chip
                                key={role.id || role.name}
                                label={role.name}
                                size="small"
                                sx={{
                                  backgroundColor: getRoleColor(role.name).bg,
                                  color: getRoleColor(role.name).text,
                                  fontWeight: 500,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
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

                      {/* Permissions Section */}
                      {userPermissions.length > 0 && (
                        <Box>
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
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            className="mt-2"
                          >
                            {hasAllPermissions ? (
                              <Chip
                                label="Все права (*)"
                                size="small"
                                sx={{
                                  backgroundColor: isDark
                                    ? "#7c2d12"
                                    : "#fed7aa",
                                  color: isDark ? "#fb923c" : "#c2410c",
                                  fontWeight: 500,
                                }}
                              />
                            ) : (
                              userPermissions.map((permission, idx) => (
                                <Chip
                                  key={idx}
                                  label={permission.name}
                                  size="small"
                                  sx={{
                                    backgroundColor: isDark
                                      ? "#374151"
                                      : "#f3f4f6",
                                    color: text("#111827", "#f9fafb"),
                                    fontWeight: 500,
                                  }}
                                />
                              ))
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Create User Modal */}
      {createModal && (
        <MethodModal
          open={createModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateModal(false);
            setFormData({
              employee_id: "",
              role_id: "",
              unit_code: "",
              name: "",
              username: "",
              password: "",
            });
            setEmployeeSearch("");
          }}
          title="Создать пользователя"
          isLoading={isCreating}
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя"
              type="text"
              value={formData.name}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Введите имя"
              required
            />

            <Input
              label="Имя пользователя"
              type="text"
              value={formData.username}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="Введите имя пользователя"
              required
            />

            <Input
              label="Пароль"
              type="password"
              value={formData.password}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Введите пароль"
              required
            />

            <CustomSelect
              label="Основная роль"
              options={roleOptions}
              value={formData.role_id}
              onChange={(val) => setFormData({ ...formData, role_id: val })}
              placeholder="Выберите роль"
              required
            />

            {/* Employee select with search */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: text("#374151", "#d1d5db") }}
              >
                Сотрудник (необязательно)
              </label>
              <Select
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                displayEmpty
                fullWidth
                sx={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: bg("white", "#262626"),
                  color: text("black", "white"),
                  borderColor: border("#d1d5db", "#4b5563"),
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: text("#9ca3af", "#6b7280") }}>
                        Выберите сотрудника
                      </span>
                    );
                  }
                  const option = employeeOptions.find(
                    (opt) => opt.value === selected
                  );
                  return option?.label || selected;
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      backgroundColor: bg("white", "#262626"),
                    },
                  },
                }}
              >
                {/* Search input inside dropdown */}
                <div
                  className="px-3 py-2 border-b sticky top-0"
                  style={{
                    backgroundColor: bg("white", "#262626"),
                    borderColor: border("#d1d5db", "#4b5563"),
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск сотрудника..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: bg("white", "#262626"),
                        color: text("black", "white"),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: border("#d1d5db", "#4b5563"),
                      },
                    }}
                  />
                </div>

                {isLoadingEmployees || isFetchingEmployees ? (
                  <MenuItem disabled>
                    <div className="flex justify-center w-full">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  </MenuItem>
                ) : filteredEmployeeOptions.length === 0 ? (
                  <MenuItem disabled>
                    <div
                      className="text-center py-2 w-full"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      {employeeSearch
                        ? "Сотрудники не найдены"
                        : "Нет доступных сотрудников"}
                    </div>
                  </MenuItem>
                ) : (
                  filteredEmployeeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </div>

            <Input
              label="Код подразделения"
              type="text"
              value={formData.unit_code}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setFormData({ ...formData, unit_code: e.target.value })
              }
              placeholder="Введите код подразделения"
            />

            <PrimaryButton onClick={submitCreateUser} disabled={isCreating}>
              {isCreating ? "Создание..." : "Создать"}
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Edit User Modal */}
      {editModal && selectedUser && (
        <MethodModal
          open={editModal}
          showCloseIcon={true}
          closeClick={() => {
            setEditModal(false);
            setSelectedUser(null);
            setSelectedId(null);
            setEditFormData({
              employee_id: "",
              role_ids: [],
              unit_code: "",
              name: "",
              password: "",
            });
            setEditEmployeeSearch("");
          }}
          title="Редактировать пользователя"
          isLoading={isUpdating}
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя"
              type="text"
              value={editFormData.name}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="Введите имя"
              required
            />

            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: text("#374151", "#d1d5db") }}
              >
                Имя пользователя
              </label>
              <div
                className="h-[48px] px-3 rounded-[8px] border flex items-center"
                style={{
                  backgroundColor: bg("white", "#262626"),
                  borderColor: border("#d1d5db", "#4b5563"),
                  color: text("black", "white"),
                }}
              >
                <span className="text-[15px]">{selectedUser.username}</span>
              </div>
              <p
                className="text-xs"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                Имя пользователя нельзя изменить
              </p>
            </div>

            <Input
              label="Новый пароль"
              type="password"
              value={editFormData.password}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setEditFormData({ ...editFormData, password: e.target.value })
              }
              placeholder="Введите новый пароль (оставьте пустым, чтобы не менять)"
            />

            <CustomSelect
              label="Роли"
              options={roleOptions}
              value={editFormData.role_ids}
              onChange={(val) =>
                setEditFormData({ ...editFormData, role_ids: val })
              }
              placeholder="Выберите роли"
              multiple
              required
            />

            {/* Employee select with search for edit */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: text("#374151", "#d1d5db") }}
              >
                Сотрудник (необязательно)
              </label>
              <Select
                value={editFormData.employee_id}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    employee_id: e.target.value,
                  })
                }
                displayEmpty
                fullWidth
                sx={{
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: bg("white", "#262626"),
                  color: text("black", "white"),
                  borderColor: border("#d1d5db", "#4b5563"),
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span style={{ color: text("#9ca3af", "#6b7280") }}>
                        Выберите сотрудника
                      </span>
                    );
                  }
                  const option = employeeOptions.find(
                    (opt) => opt.value === selected
                  );
                  return option?.label || selected;
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      backgroundColor: bg("white", "#262626"),
                    },
                  },
                }}
              >
                {/* Search input inside dropdown */}
                <div
                  className="px-3 py-2 border-b sticky top-0"
                  style={{
                    backgroundColor: bg("white", "#262626"),
                    borderColor: border("#d1d5db", "#4b5563"),
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск сотрудника..."
                    value={editEmployeeSearch}
                    onChange={(e) => setEditEmployeeSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                      sx: {
                        backgroundColor: bg("white", "#262626"),
                        color: text("black", "white"),
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: border("#d1d5db", "#4b5563"),
                      },
                    }}
                  />
                </div>

                {isLoadingEmployees || isFetchingEmployees ? (
                  <MenuItem disabled>
                    <div className="flex justify-center w-full">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  </MenuItem>
                ) : filteredEditEmployeeOptions.length === 0 ? (
                  <MenuItem disabled>
                    <div
                      className="text-center py-2 w-full"
                      style={{ color: text("#6b7280", "#9ca3af") }}
                    >
                      {editEmployeeSearch
                        ? "Сотрудники не найдены"
                        : "Нет доступных сотрудников"}
                    </div>
                  </MenuItem>
                ) : (
                  filteredEditEmployeeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </div>

            <Input
              label="Код подразделения"
              type="text"
              value={editFormData.unit_code}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setEditFormData({ ...editFormData, unit_code: e.target.value })
              }
              placeholder="Введите код подразделения"
            />

            <PrimaryButton
              backgroundColor="#fb923c"
              onClick={submitUpdateUser}
              disabled={isUpdating}
            >
              {isUpdating ? "Сохранение..." : "Сохранить"}
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Add Role Modal */}
      {addRoleModal && (
        <MethodModal
          open={addRoleModal}
          showCloseIcon={true}
          closeClick={() => {
            setAddRoleModal(false);
            setSelectedId(null);
            setSelectedRoleId("");
          }}
          title="Добавить роль пользователю"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label={"Роль"}
              options={roleOptions}
              value={selectedRoleId}
              onChange={(val) => setSelectedRoleId(val)}
              placeholder="Выберите роль"
              returnObject={false}
            />
            <PrimaryButton onClick={submitAddRoleToUser}>
              Добавить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Remove Role Modal */}
      {removeRoleModal && (
        <MethodModal
          open={removeRoleModal}
          showCloseIcon={true}
          closeClick={() => {
            setRemoveRoleModal(false);
            setSelectedId(null);
            setSelectedRoleToRemove(null);
          }}
          title="Удалить роль у пользователя"
        >
          <div className="my-[15px] space-y-[10px]">
            <CustomSelect
              label="Выберите роль для удаления"
              value={selectedRoleToRemove}
              onChange={(value) => setSelectedRoleToRemove(value)}
              options={
                usersData
                  .find((u) => u.id === selectedId)
                  ?.roles?.map((role) => ({
                    value: role.id, // <-- id mavjud bo'lsa, bo'lmasa name
                    label: role.name,
                  })) || []
              }
              placeholder="Выберите роль"
            />
            <PrimaryButton
              backgroundColor="#dc2626"
              onClick={submitRemoveRoleFromUser}
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
        deleting={submitDeleteUser}
        title="Вы уверены, что хотите удалить этого пользователя?"
      />
    </DashboardLayout>
  );
};

export default Index;
