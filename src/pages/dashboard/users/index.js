import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { isEmpty, get } from "lodash";
import NoData from "@/components/no-data";
import { motion } from "framer-motion";
import useAppTheme from "@/hooks/useAppTheme";
import PrimaryButton from "@/components/button/primary-button";
import CustomTable from "@/components/table";
import {
  Button,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
} from "@mui/material";
import ContentLoader from "@/components/loader";
import { useState, useMemo } from "react";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import CustomSelect from "@/components/select";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import { config } from "@/config";
import DeleteModal from "@/components/modal/delete-modal";

const Index = () => {
  const { bg, text, border, isDark } = useAppTheme();
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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
    role_id: "",
    unit_code: "",
    name: "",
    password: "",
  });
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [editEmployeeSearch, setEditEmployeeSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: session } = useSession();
  const queryClient = useQueryClient();

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

  const { data: roles } = useGetGeneralAuthQuery({
    key: KEYS.roles,
    url: URLS.roles,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && (createModal || editModal),
  });

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

  const { mutate: createUser, isLoading: isCreating } = usePostGeneralAuthQuery(
    {
      listKeyId: "create-user",
    }
  );

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

  // Options for role select
  const roleOptions = get(roles, "data.data", []).map((role) => ({
    value: role.id,
    label: role.name,
  }));

  // Handle edit user
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      employee_id: user.employee_id || "",
      role_id: user.role?.id || user.role_id || "",
      unit_code: user.unit_code || "",
      name: user.name || "",
      password: "", // Empty password by default
    });
    setEditModal(true);
  };

  // Handle delete user
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  const submitCreateUser = () => {
    // Validation
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
        attributes: formData,
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
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

  // PATCH user using axios
  const submitUpdateUser = async () => {
    if (!selectedUser) return;

    // Prepare update data - only include fields that have values
    const updateData = {};

    if (editFormData.name && editFormData.name !== selectedUser.name) {
      updateData.name = editFormData.name;
    }

    if (editFormData.employee_id !== selectedUser.employee_id) {
      updateData.employee_id = editFormData.employee_id || null;
    }

    if (editFormData.role_id && editFormData.role_id !== selectedUser.role_id) {
      updateData.role_id = editFormData.role_id;
    }

    if (editFormData.unit_code !== selectedUser.unit_code) {
      updateData.unit_code = editFormData.unit_code || null;
    }

    if (editFormData.password) {
      updateData.password = editFormData.password;
    }

    // If no changes, show message
    if (Object.keys(updateData).length === 0) {
      toast.error("Нет изменений для сохранения", {
        position: "top-center",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `${config.GENERAL_AUTH_URL}${URLS.users}/${selectedUser.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
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
        role_id: "",
        unit_code: "",
        name: "",
        password: "",
      });
      setEditEmployeeSearch("");
      queryClient.invalidateQueries(KEYS.users);
    } catch (error) {
      console.error("Update error:", error);
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

  // DELETE user using axios
  const submitDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.delete(
        `${config.GENERAL_AUTH_URL}${URLS.users}/${selectedUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/json",
          },
        }
      );

      toast.success("Пользователь успешно удален", {
        position: "top-center",
      });
      setDeleteModal(false);
      setSelectedUser(null);
      queryClient.invalidateQueries(KEYS.users);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        `Ошибка: ${
          error.response?.data?.message || error.message || "Неизвестная ошибка"
        }`,
        { position: "top-right" }
      );
    }
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "name", header: "Имя" },
    { accessorKey: "username", header: "Имя пользователя" },
    {
      accessorKey: "role.name",
      header: "Роль",
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEditClick(row.original)}
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
          <Button
            onClick={() => handleDeleteClick(row.original)}
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
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Пользователи"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Пользователи"}>
      {isEmpty(get(users, "data.data", [])) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[20px] rounded-md border border-gray-200"
          style={{
            background: bg("white", "#1E1E1E"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
        >
          <div className="col-span-12 space-y-[15px]">
            <div className="max-w-[100px]">
              <PrimaryButton
                onClick={() => setCreateModal(true)}
                variant={"contained"}
              >
                Создать
              </PrimaryButton>
            </div>
            <CustomTable data={get(users, "data.data")} columns={columns} />
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
          title={"Создать пользователя"}
        >
          <div className="space-y-[10px] my-[15px]">
            <Input
              label="Имя"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
              placeholder="Введите имя"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />

            <Input
              label="Имя пользователя"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
              }}
              placeholder="Введите имя пользователя"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />

            <Input
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
              }}
              placeholder="Введите пароль"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />

            <CustomSelect
              options={roleOptions}
              value={formData.role_id}
              onChange={(val) => setFormData({ ...formData, role_id: val })}
              label={"Роль"}
              required
              placeholder="Выберите роль"
            />

            {/* Employee select with search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Сотрудник</label>
              <Select
                value={formData.employee_id}
                onChange={(e) =>
                  setFormData({ ...formData, employee_id: e.target.value })
                }
                displayEmpty
                fullWidth
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span className="text-gray-400">Выберите сотрудника</span>
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
                    },
                  },
                }}
              >
                {/* Search input inside dropdown */}
                <div className="px-3 py-2 border-b sticky top-0 bg-white z-10">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск сотрудника..."
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
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
                    <div className="text-center text-gray-500 py-2 w-full">
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
              value={formData.unit_code}
              onChange={(e) => {
                setFormData({ ...formData, unit_code: e.target.value });
              }}
              placeholder="Введите код подразделения"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
            />

            <div className="flex justify-end gap-2 mt-[20px]">
              <PrimaryButton
                onClick={submitCreateUser}
                variant="contained"
                disabled={isCreating}
              >
                {isCreating ? "Создание..." : "Создать"}
              </PrimaryButton>
            </div>
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
            setEditFormData({
              employee_id: "",
              role_id: "",
              unit_code: "",
              name: "",
              password: "",
            });
            setEditEmployeeSearch("");
          }}
          title={"Редактировать пользователя"}
        >
          <div className="space-y-[10px] my-[15px]">
            <Input
              label="Имя"
              value={editFormData.name}
              onChange={(e) => {
                setEditFormData({ ...editFormData, name: e.target.value });
              }}
              placeholder="Введите имя"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-500">
                Имя пользователя
              </label>
              <div className="h-[45px] px-3 rounded-[8px] border border-gray-300 flex items-center">
                <span className="text-[15px]">{selectedUser.username}</span>
              </div>
              <p className="text-xs text-gray-500">
                Имя пользователя нельзя изменить
              </p>
            </div>

            <Input
              label="Новый пароль"
              type="password"
              value={editFormData.password}
              onChange={(e) => {
                setEditFormData({ ...editFormData, password: e.target.value });
              }}
              placeholder="Введите новый пароль (оставьте пустым, чтобы не менять)"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
            />

            <CustomSelect
              options={roleOptions}
              value={editFormData.role_id}
              onChange={(val) =>
                setEditFormData({ ...editFormData, role_id: val })
              }
              label={"Роль"}
              required
              placeholder="Выберите роль"
            />

            {/* Employee select with search for edit */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Сотрудник</label>
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
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <span className="text-gray-400">
                        Выберите сотрудника (необязательно)
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
                    },
                  },
                }}
              >
                {/* Search input inside dropdown */}
                <div className="px-3 py-2 border-b sticky top-0 bg-white z-10">
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Поиск сотрудника..."
                    value={editEmployeeSearch}
                    onChange={(e) => {
                      setEditEmployeeSearch(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
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
                    <div className="text-center text-gray-500 py-2 w-full">
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
              value={editFormData.unit_code}
              onChange={(e) => {
                setEditFormData({ ...editFormData, unit_code: e.target.value });
              }}
              placeholder="Введите код подразделения (необязательно)"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
            />

            <div className="flex justify-end gap-2 mt-[20px]">
              <PrimaryButton
                onClick={submitUpdateUser}
                variant="contained"
                disabled={isUpdating}
              >
                {isUpdating ? "Сохранение..." : "Сохранить"}
              </PrimaryButton>
            </div>
          </div>
        </MethodModal>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        deleting={() => {
          submitDeleteUser();
          setDeleteModal(false);
          setSelectedUser(null);
        }}
        title="Вы уверены, что хотите удалить эту роль?"
      />
    </DashboardLayout>
  );
};

export default Index;
