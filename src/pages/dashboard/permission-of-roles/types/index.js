import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty, get } from "lodash";
import NoData from "@/components/no-data";
import { motion } from "framer-motion";
import useAppTheme from "@/hooks/useAppTheme";
import PrimaryButton from "@/components/button/primary-button";
import CustomTable from "@/components/table";
import { Button, Chip, Stack, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentLoader from "@/components/loader";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import toast from "react-hot-toast";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import { config } from "@/config";
import DeleteModal from "@/components/modal/delete-modal";

const Index = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { bg, text, border, isDark } = useAppTheme();
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState("");

  // get permissionType
  const {
    data: typeOfPermissions,
    isLoading,
    isFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.typeOfPermissions,
    url: URLS.typeOfPermissions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // create permissionType
  const { mutate: createPermissionType } = usePostGeneralAuthQuery({
    listKeyId: "create-permission",
  });

  const submitCreatePermissionType = () => {
    createPermissionType(
      {
        url: URLS.typeOfPermissions,
        attributes: {
          name: name,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Тип разрешения успешно создан", {
            position: "top-center",
          });
          setCreateModal(false);
          setName("");
          queryClient.invalidateQueries(KEYS.typeOfPermissions);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // edit permissionType
  const submitEditPermissionType = async () => {
    if (!selectedId) {
      toast.error("Пожалуйста, введите имя", {
        position: "top-center",
      });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.typeOfPermissions}/${selectedId}`,
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

      toast.success("Тип разрешения успешно обновлен", {
        position: "top-center",
      });
      setEditModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.typeOfPermissions);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  //   delete permissionType
  const submitDeletePermissionType = async () => {
    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.typeOfPermissions}/${selectedId}`,
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

      toast.success("Тип разрешения успешно удален", {
        position: "top-center",
      });
      setDeleteModal(false);
      setSelectedId(null);
      queryClient.invalidateQueries(KEYS.permissions);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Helper function to get color for permission types
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
      colors[typeName.toLowerCase()] || {
        bg: isDark ? "#374151" : "#f3f4f6",
        text: isDark ? "#9ca3af" : "#6b7280",
      }
    );
  };

  // Column definitions
  const columns = [
    {
      header: "№",
      accessorKey: "index",
      cell: ({ row }) => {
        return (
          <span style={{ color: text("#111827", "#f9fafb") }}>
            {row.index + 1}
          </span>
        );
      },
      size: 60,
    },
    {
      accessorKey: "name",
      header: "Тип разрешения",
      cell: ({ row }) => {
        const typePermission = row.original;
        const colors = getTypeColor(typePermission.name);

        return (
          <div className="flex items-center gap-2">
            <Chip
              label={typePermission.name}
              size="medium"
              sx={{
                backgroundColor: colors.bg,
                color: colors.text,
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                minWidth: "80px",
              }}
            />
            {typePermission.name === "*" && (
              <Chip
                label="Все действия"
                size="small"
                sx={{
                  backgroundColor: isDark ? "#7c2d12" : "#ffedd5",
                  color: isDark ? "#fb923c" : "#c2410c",
                  fontWeight: 500,
                  fontSize: "11px",
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: "Связанные разрешения",
      cell: ({ row }) => {
        const permissions = row.original.permissions || [];
        if (permissions.length === 0) {
          return (
            <span style={{ color: text("#9ca3af", "#6b7280") }}>
              Нет разрешений
            </span>
          );
        }
        return (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {permissions.map((permission) => (
              <Tooltip
                key={permission.id}
                title={`ID: ${permission.id}`}
                placement="top"
                arrow
              >
                <Chip
                  label={permission.name}
                  size="small"
                  sx={{
                    backgroundColor: isDark ? "#1e3a8a" : "#dbeafe",
                    color: isDark ? "#93c5fd" : "#1e40af",
                    fontWeight: 500,
                    fontSize: "12px",
                    cursor: "help",
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Дата создания",
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span style={{ color: text("#6b7280", "#9ca3af") }}>
            {date.toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => {
        const typePermission = row.original;
        const isWildcard = typePermission.name === "*";

        return (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditModal(true);
                setName(typePermission.name);
                setSelectedId(typePermission.id);
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
                "&:disabled": {
                  background: isDark ? "#374151" : "#e5e7eb",
                  color: isDark ? "#6b7280" : "#9ca3af",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </Button>
            <Button
              onClick={() => {
                setDeleteModal(true);
                setSelectedId(typePermission.id);
              }}
              disabled={isWildcard || typePermission.permissions.length > 0}
              sx={{
                width: "32px",
                height: "32px",
                minWidth: "32px",
                background: isDark ? "#7f1d1d" : "#FCD8D3",
                color: isDark ? "#fca5a5" : "#FF1E00",
                "&:hover": {
                  background: isDark ? "#991b1b" : "#FCA89D",
                },
                "&:disabled": {
                  background: isDark ? "#374151" : "#e5e7eb",
                  color: isDark ? "#6b7280" : "#9ca3af",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      size: 120,
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
    <DashboardLayout headerTitle={"Типы разрешений"}>
      {isEmpty(get(typeOfPermissions, "data.data", [])) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[20px] rounded-md border border-gray-100"
          style={{
            background: bg("white", "#1E1E1E"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
        >
          <div className="space-y-[15px]">
            <div className="flex items-center justify-between">
              <div className="max-w-[100px]">
                <PrimaryButton
                  onClick={() => setCreateModal(true)}
                  variant={"contained"}
                >
                  Создать
                </PrimaryButton>
              </div>

              {/* Statistics */}
              <div className="flex gap-4">
                <div
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: bg("#f9fafb", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#374151"),
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: text("#6b7280", "#9ca3af") }}
                  >
                    Всего типов
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: text("#111827", "#f9fafb") }}
                  >
                    {get(typeOfPermissions, "data.count", 0)}
                  </p>
                </div>
                <div
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: bg("#f9fafb", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#374151"),
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: text("#6b7280", "#9ca3af") }}
                  >
                    С разрешениями
                  </p>
                  <p
                    className="text-xl font-bold"
                    style={{ color: text("#111827", "#f9fafb") }}
                  >
                    {
                      get(typeOfPermissions, "data.data", []).filter(
                        (t) => t.permissions?.length > 0
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <CustomTable
              data={get(typeOfPermissions, "data.data", [])}
              columns={columns}
            />
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
          title="Создать тип разрешения"
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
              placeholder="Введите имя"
            />

            <PrimaryButton onClick={submitCreatePermissionType}>
              Создать
            </PrimaryButton>
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

            <PrimaryButton
              backgroundColor="#fb923c"
              onClick={submitEditPermissionType}
            >
              Изменить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        deleting={() => {
          submitDeletePermissionType();
          setDeleteModal(false);
          setSelectedId(null);
        }}
        title="Вы уверены, что хотите удалить этот тип?"
      />
    </DashboardLayout>
  );
};

export default Index;
