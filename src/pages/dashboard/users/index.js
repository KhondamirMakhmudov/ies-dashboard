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
  Tooltip,
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
import StatCard from "@/components/card/statisticCard";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import LinkIcon from "@mui/icons-material/Link";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TheaterComedyOutlinedIcon from "@mui/icons-material/TheaterComedyOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import StarIcon from "@mui/icons-material/Star";
import SecurityIcon from "@mui/icons-material/Security";
import Link from "next/link";

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
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      limit: 1000,
    },
    enabled: (createModal || editModal) && !!session?.accessToken,
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
        option.employeeData?.employee_id?.toLowerCase().includes(searchTerm),
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
        option.employeeData?.employee_id?.toLowerCase().includes(searchTerm),
    );
  }, [employeeOptions, editEmployeeSearch]);

  // Create user - note: role_id changed to role_ids array
  const { mutate: createUser, isLoading: isCreating } = usePostGeneralAuthQuery(
    {
      listKeyId: "create-user",
    },
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
      },
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
    if (editFormData.username !== selectedUser.username) {
      updateData.username = editFormData.username || null;
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
        },
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
        { position: "top-right" },
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
        },
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
        { position: "top-right" },
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
      },
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
      },
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
      username: user.username || "",
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
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              value={usersData.length}
              title={"Всего пользователей"}
              icon={PeopleIcon}
              iconColor={"black"}
            />
            <StatCard
              value={usersData.filter((u) => u.roles?.length > 0).length}
              title={"С ролями"}
              icon={BadgeIcon}
              iconColor={"black"}
            />
            <StatCard
              value={usersData.filter((u) => u.employee_id).length}
              title={"С привязанным сотрудником"}
              icon={LinkIcon}
              iconColor={"black"}
            />
            <StatCard
              value={usersData.filter((u) => hasAdminRole(u)).length}
              title={"Администраторы"}
              icon={AdminPanelSettingsIcon}
              iconColor={"black"}
            />
          </div>

          {/* Users Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {usersData.map((user, index) => {
              const isSuperAdmin = user.username === "admin";
              const adminUser = hasAdminRole(user);
              const userPermissions = getUserPermissions(user);
              const hasAllPermissions = userPermissions.some(
                (p) => p.name === "*",
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
                      background: bg(
                        "linear-gradient(to bottom, #ffffff, #fafbfc)",
                        "linear-gradient(to bottom, #1e1e1e, #1a1a1a)",
                      ),

                      borderRadius: "16px",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "hidden",
                      "&:hover": {
                        boxShadow: isDark
                          ? "0 8px 24px rgba(0,0,0,0.4)"
                          : "0 8px 24px rgba(0,0,0,0.12)",
                        transform: "translateY(-4px)",
                        borderColor: isDark ? "#4b5563" : "#d1d5db",
                      },
                    }}
                  >
                    <CardContent sx={{ padding: "24px !important" }}>
                      {/* Header Section with Enhanced Avatar */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative">
                            <Badge
                              color={adminUser ? "warning" : "success"}
                              badgeContent={
                                adminUser ? (
                                  <StarIcon sx={{ fontSize: 12 }} />
                                ) : (
                                  ""
                                )
                              }
                              overlap="circular"
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              sx={{
                                "& .MuiBadge-badge": {
                                  width: 24,
                                  height: 24,
                                  borderRadius: "50%",
                                  border: `2px solid ${bg("#ffffff", "#1e1e1e")}`,
                                },
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: adminUser
                                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                    : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                                  width: 56,
                                  height: 56,
                                  fontSize: 20,
                                  fontWeight: 700,
                                  boxShadow: isDark
                                    ? "0 4px 12px rgba(0,0,0,0.3)"
                                    : "0 4px 12px rgba(0,0,0,0.15)",
                                }}
                              >
                                {user.name?.charAt(0).toUpperCase() ||
                                  user.username?.charAt(0).toUpperCase() ||
                                  "U"}
                              </Avatar>
                            </Badge>
                            {/* Online Status Indicator */}
                            <div
                              style={{
                                position: "absolute",
                                bottom: 2,
                                right: 2,
                                width: 14,
                                height: 14,
                                borderRadius: "50%",
                                background: "#10b981",
                                border: `3px solid ${bg("#ffffff", "#1e1e1e")}`,
                                boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Typography
                                variant="h6"
                                style={{
                                  color: text("#111827", "#f9fafb"),
                                  fontWeight: 700,
                                  fontSize: "18px",
                                  lineHeight: 1.2,
                                }}
                              >
                                {user.name || user.username}
                              </Typography>
                              {isSuperAdmin && (
                                <Chip
                                  icon={
                                    <AdminPanelSettingsIcon
                                      sx={{ fontSize: 14 }}
                                    />
                                  }
                                  label="SUPER ADMIN"
                                  size="small"
                                  sx={{
                                    background:
                                      "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                                    color: "#ffffff",
                                    fontWeight: 700,
                                    fontSize: "10px",
                                    height: 22,
                                    letterSpacing: "0.5px",
                                    boxShadow:
                                      "0 2px 8px rgba(220, 38, 38, 0.3)",
                                  }}
                                />
                              )}
                            </div>
                            <Typography
                              variant="body2"
                              style={{
                                color: text("#6b7280", "#9ca3af"),
                                fontSize: "14px",
                                fontWeight: 500,
                              }}
                            >
                              @{user.username}
                            </Typography>
                          </div>
                        </div>

                        {/* Action Buttons with Better Styling */}
                        <div className="flex gap-2">
                          <Tooltip title="Редактировать" placement="top">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleEditClick(user)}
                                disabled={isSuperAdmin}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  background: isDark
                                    ? "linear-gradient(135deg, #7c2d12 0%, #92400e 100%)"
                                    : "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                                  color: isDark ? "#fbbf24" : "#d97706",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    background: isDark
                                      ? "linear-gradient(135deg, #92400e 0%, #78350f 100%)"
                                      : "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
                                    transform: "scale(1.1)",
                                  },
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
                                  setSelectedId(user.id);
                                }}
                                disabled={isSuperAdmin}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  background: isDark
                                    ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                                    : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                                  color: isDark ? "#fca5a5" : "#dc2626",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    background: isDark
                                      ? "linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)"
                                      : "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
                                    transform: "scale(1.1)",
                                  },
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
                      </div>

                      <Divider sx={{ my: 2.5, opacity: 0.6 }} />

                      {/* Info Grid with Better Layout */}
                      <Box className="mb-4">
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div>
                            <DescriptionOutlinedIcon
                              sx={{
                                fontSize: 16,
                                color: text("#6b7280", "#9ca3af"),
                              }}
                            />
                            <Typography
                              variant="caption"
                              style={{
                                color: text("#6b7280", "#9ca3af"),
                                fontWeight: 700,
                                textTransform: "uppercase",
                                fontSize: "11px",
                                letterSpacing: "1px",
                              }}
                            >
                              Основная информация
                            </Typography>
                          </div>

                          <div className="flex justify-between items-center">
                            <Link
                              href={
                                user.employee_id
                                  ? `/dashboard/employees/${user.employee_id}`
                                  : "#"
                              }
                            >
                              <Chip
                                label={
                                  user.employee_id
                                    ? "Страница сотрудника"
                                    : "Не указан"
                                }
                                size="small"
                                sx={{
                                  backgroundColor: user.employee_id
                                    ? bg("#dbeafe", "#1e3a8a")
                                    : bg("#f3f4f6", "#374151"),
                                  color: user.employee_id
                                    ? text("#1e40af", "#93c5fd")
                                    : text("#6b7280", "#9ca3af"),
                                  fontWeight: 600,
                                  fontSize: "12px",
                                }}
                              />
                            </Link>
                          </div>
                        </div>
                        <Box
                          className="mt-2"
                          sx={{
                            display: "grid",
                            gap: 1.5,
                            padding: 2,
                            borderRadius: 2,
                            background: bg(
                              "rgba(243, 244, 246, 0.5)",
                              "rgba(55, 65, 81, 0.2)",
                            ),
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <BusinessOutlinedIcon
                                sx={{
                                  fontSize: 14,
                                  color: text("#6b7280", "#9ca3af"),
                                }}
                              />
                              <Typography
                                variant="body2"
                                style={{
                                  color: text("#6b7280", "#9ca3af"),
                                  fontWeight: 500,
                                }}
                              >
                                Код подразделения:
                              </Typography>
                            </div>
                            <Chip
                              label={user.unit_code || "Не указан"}
                              size="small"
                              sx={{
                                backgroundColor: user.unit_code
                                  ? bg("#dcfce7", "#14532d")
                                  : bg("#f3f4f6", "#374151"),
                                color: user.unit_code
                                  ? text("#15803d", "#86efac")
                                  : text("#6b7280", "#9ca3af"),
                                fontWeight: 600,
                                fontSize: "12px",
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <CalendarTodayOutlinedIcon
                                sx={{
                                  fontSize: 14,
                                  color: text("#6b7280", "#9ca3af"),
                                }}
                              />
                              <Typography
                                variant="body2"
                                style={{
                                  color: text("#6b7280", "#9ca3af"),
                                  fontWeight: 500,
                                }}
                              >
                                Дата создания:
                              </Typography>
                            </div>
                            <Typography
                              variant="body2"
                              style={{
                                color: text("#111827", "#f9fafb"),
                                fontWeight: 600,
                              }}
                            >
                              {new Date(user.created_at).toLocaleDateString(
                                "ru-RU",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </Typography>
                          </div>
                        </Box>
                      </Box>

                      {/* Roles Section with Enhanced Design */}
                      <Box className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Typography
                            variant="caption"
                            style={{
                              color: text("#6b7280", "#9ca3af"),
                              fontWeight: 700,
                              textTransform: "uppercase",
                              fontSize: "11px",
                              letterSpacing: "1px",
                            }}
                          >
                            Роли ({user.roles?.length || 0})
                          </Typography>
                          <div className="flex gap-1.5">
                            <Tooltip title="Добавить роль" placement="top">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setAddRoleModal(true);
                                  setSelectedId(user.id);
                                }}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  background: isDark
                                    ? "linear-gradient(135deg, #064e3b 0%, #065f46 100%)"
                                    : "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                                  color: isDark ? "#6ee7b7" : "#047857",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    background: isDark
                                      ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                                      : "linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {user.roles?.length > 0 && (
                              <Tooltip title="Удалить роль" placement="top">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setRemoveRoleModal(true);
                                    setSelectedId(user.id);
                                  }}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    background: isDark
                                      ? "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)"
                                      : "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                                    color: isDark ? "#fca5a5" : "#dc2626",
                                    transition: "all 0.2s",
                                    "&:hover": {
                                      background: isDark
                                        ? "linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)"
                                        : "linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)",
                                      transform: "scale(1.1)",
                                    },
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
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
                                  background: `linear-gradient(135deg, ${getRoleColor(role.name).bg} 0%, ${getRoleColor(role.name).bg}dd 100%)`,
                                  color: getRoleColor(role.name).text,
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.8px",
                                  fontSize: "11px",
                                  height: 26,
                                  boxShadow: `0 2px 8px ${getRoleColor(role.name).bg}40`,
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: `0 4px 12px ${getRoleColor(role.name).bg}60`,
                                  },
                                }}
                              />
                            ))
                          ) : (
                            <Typography
                              variant="body2"
                              style={{
                                color: text("#9ca3af", "#6b7280"),
                                fontStyle: "italic",
                                padding: "8px 0",
                              }}
                            >
                              Нет назначенных ролей
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Permissions Section */}
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
                Сотрудник
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
                    (opt) => opt.value === selected,
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
              username: "",
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

            <Input
              label="Имя пользователя"
              type="text"
              value={editFormData.username}
              inputClass={
                bg("bg-white", "bg-[#262626]") +
                " " +
                text("text-black", "text-white") +
                " " +
                border("!border-gray-300", "!border-gray-600") +
                " !h-[48px] rounded-[8px] text-[15px]"
              }
              onChange={(e) =>
                setEditFormData({ ...editFormData, username: e.target.value })
              }
              placeholder="Введите имя пользователя"
              required
            />

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
                    (opt) => opt.value === selected,
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
                    value: role.id,
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
