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
import { Button, Chip, Stack } from "@mui/material";
import ContentLoader from "@/components/loader";
import { useState, useEffect } from "react";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import MethodModal from "@/components/modal/method-modal";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Input from "@/components/input";
import { config } from "@/config";
import DeleteModal from "@/components/modal/delete-modal";

const Index = () => {
  const { bg, text, border, isDark } = useAppTheme();
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [employeeIds, setEmployeeIds] = useState([]);
  const [employeeDataMap, setEmployeeDataMap] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState("");

  const { data: session } = useSession();
  const queryClient = useQueryClient();

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

  // Extract all unique employee IDs from roles data
  useEffect(() => {
    if (roles?.data?.data) {
      const ids = [];
      roles.data.data.forEach((role) => {
        role.users?.forEach((user) => {
          if (user.employee_id && !ids.includes(user.employee_id)) {
            ids.push(user.employee_id);
          }
        });
      });
      setEmployeeIds(ids);
    }
  }, [roles]);

  // create employee
  const { mutate: createUser, isLoading: isCreating } = usePostGeneralAuthQuery(
    {
      listKeyId: "create-user",
    }
  );

  const submitCreateUser = () => {
    if (!name) {
      toast.error("Пожалуйста, введите имя", {
        position: "top-center",
      });
      return;
    }

    createUser(
      {
        url: URLS.roles,
        attributes: { name },
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
          setName("");
          queryClient.invalidateQueries(KEYS.roles);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // edit employee

  const submitEditUser = async () => {
    if (!selectedId) {
      toast.error("Пожалуйста, введите имя", {
        position: "top-center",
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}${URLS.roles}/${selectedId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name: name }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении");
      }

      toast.success("Пользователь успешно обновлен", {
        position: "top-center",
      });
      setEditModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.roles);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // delete employee
  const submitDeleteUser = async () => {
    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}${URLS.roles}/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ id: selectedId }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при обновлении");
      }

      toast.success("Пользователь успешно удален", {
        position: "top-center",
      });
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.roles);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };
  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "name", header: "Имя" },
    {
      accessorKey: "users",
      header: "Пользователи по этой роли",
      cell: ({ row }) => {
        const users = row.original.users || [];
        if (users.length === 0) return "—";

        return (
          <Stack direction="column" spacing={1}>
            {users.map((user) => {
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
                    backgroundColor: isDark ? "#374151" : "#f3f4f6",
                    color: text("#111827", "#f9fafb"),
                    maxWidth: "fit-content",
                  }}
                />
              );
            })}
          </Stack>
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
              setEditModal(true);
              setName(row.original.name);
              setSelectedId(row.original.id);
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
          <Button
            onClick={() => {
              setDeleteModal(true);
              setSelectedId(row.original.id);
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
      {isEmpty(get(roles, "data.data", [])) ? (
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
            <CustomTable data={get(roles, "data.data")} columns={columns} />
          </div>
        </motion.div>
      )}

      {createModal && (
        <MethodModal
          open={createModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateModal(false);
            setName(null);
          }}
          title="Создать пользователя"
          isLoading={isCreating}
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя пользователя"
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
              placeholder="Введите имя пользователя"
            />

            <PrimaryButton onClick={submitCreateUser}>Создать</PrimaryButton>
          </div>
        </MethodModal>
      )}

      {editModal && (
        <MethodModal
          open={editModal}
          showCloseIcon={true}
          closeClick={() => {
            setEditModal(false);
            setName(null);
            setSelectedId(null);
          }}
          title="Изменить пользователя"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя пользователя"
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
              placeholder="Введите имя пользователя"
            />

            <PrimaryButton backgroundColor="#fb923c" onClick={submitEditUser}>
              Изменить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}
      {/* Delete Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        deleting={() => {
          submitDeleteUser();
          setDeleteModal(false);
          setSelectedId(null);
        }}
        title="Вы уверены, что хотите удалить эту роль?"
      />
    </DashboardLayout>
  );
};

export default Index;
