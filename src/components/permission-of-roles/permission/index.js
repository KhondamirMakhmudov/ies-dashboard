import useAppTheme from "@/hooks/useAppTheme";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import PrimaryButton from "@/components/button/primary-button";
import { get, isEmpty } from "lodash";
import NoData from "@/components/no-data";
import MethodModal from "@/components/modal/method-modal";
import { useQueryClient } from "@tanstack/react-query";
import ContentLoader from "@/components/loader";
import CustomSelect from "@/components/select";
import DeleteModal from "@/components/modal/delete-modal";
import { config } from "@/config";
import dayjs from "dayjs";
import CustomTable from "@/components/table";
import { Button } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SearchIcon from "@mui/icons-material/Search";

const PermissionSection = () => {
  const { data: session } = useSession();
  const { isDark, bg, text, border } = useAppTheme();
  const queryClient = useQueryClient();

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState("");
  const [selectedActionId, setSelectedActionId] = useState("");
  const [name, setName] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [searchQuery, setSearchQuery] = useState("");

  // Get permissions
  const { data: permissions, isLoading: permissionsLoading } =
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

  // Get resources
  const { data: resources, isLoading: resourcesLoading } =
    useGetGeneralAuthQuery({
      key: KEYS.resources,
      url: URLS.resources,
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        Accept: "application/json",
      },
      enabled: !!session?.accessToken,
    });

  // Get actions
  const { data: actions, isLoading: actionsLoading } = useGetGeneralAuthQuery({
    key: KEYS.actions,
    url: URLS.actions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // Create permission
  const { mutate: createPermission, isLoading: createLoading } =
    usePostGeneralAuthQuery({
      listKeyId: KEYS.permissions,
    });

  const permissionsData = get(permissions, "data.data", []);
  const resourcesData = get(resources, "data.data", []);
  const actionsData = get(actions, "data.data", []);

  // Filter permissions based on search query
  const filteredPermissions = permissionsData.filter((permission) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const resourceName = permission.resource?.name?.toLowerCase() || "";
    const actionName = permission.action?.name?.toLowerCase() || "";
    return resourceName.includes(query) || actionName.includes(query);
  });

  const optionsResources = get(resources, "data.data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  const optionsActions = get(actions, "data.data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  const submitCreatePermission = () => {
    if (!selectedResourceId || !selectedActionId) {
      toast.error("Пожалуйста, выберите ресурс и действие", {
        position: "top-center",
      });
      return;
    }

    createPermission(
      {
        url: URLS.permissions,
        attributes: {
          resource_id: selectedResourceId,
          action_id: selectedActionId,
        },
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Разрешение успешно создано", {
            position: "top-center",
          });
          setCreateModal(false);
          setSelectedResourceId("");
          setSelectedActionId("");
          queryClient.invalidateQueries(KEYS.permissions);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-center",
          });
        },
      },
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
        },
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
        },
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

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "resource",
      header: "Ресурс",
      cell: ({ row }) => row.original.resource?.name || "N/A",
    },
    {
      accessorKey: "action",
      header: "Действие",
      cell: ({ row }) => row.original.action?.name || "N/A",
    },
    {
      accessorKey: "created_at",
      header: "Дата создания",
      cell: ({ row }) => (
        <p
          className={`font-medium p-1 rounded-md  ${
            isDark ? "text-blue-400 " : "text-blue-600"
          }`}
        >
          {dayjs(row.original.created_at).format("DD.MM.YYYY")}{" "}
          <span className="text-sm">
            {dayjs(row.original.created_at).format("HH:mm")}
          </span>
        </p>
      ),
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditModal(true);
              setSelectedId(row.original.id);
              setSelectedResourceId(row.original.resource_id);
              setSelectedActionId(row.original.action_id);
            }}
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: "#F0D8C8",
              color: "#FF6200",
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
              background: "#FCD8D3",
              color: "#FF1E00",
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 rounded-lg my-2 border border-gray-200"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <PrimaryButton onClick={() => setCreateModal(true)}>
            Создать разрешение
          </PrimaryButton>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fontSize="small"
              style={{ color: text("#9ca3af", "#6b7280") }}
            />
            <input
              type="text"
              placeholder="Поиск по ресурсу или действию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: bg("#ffffff", "#1e1e1e"),
                borderColor: border("#d1d5db", "#4b5563"),
                color: text("#111827", "#f9fafb"),
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("card")}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              viewMode === "card"
                ? "bg-blue-600 text-white"
                : "bg-transparent"
            }`}
            style={{
              borderColor: border("#e5e7eb", "#333333"),
              color:
                viewMode === "card"
                  ? "#ffffff"
                  : text("#374151", "#d1d5db"),
            }}
            aria-label="Карточки"
            title="Карточки"
          >
            <ViewModuleIcon fontSize="small" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-transparent"
            }`}
            style={{
              borderColor: border("#e5e7eb", "#333333"),
              color:
                viewMode === "table"
                  ? "#ffffff"
                  : text("#374151", "#d1d5db"),
            }}
            aria-label="Таблица"
            title="Таблица"
          >
            <TableRowsIcon fontSize="small" />
          </button>
        </div>
      </div>
      {permissionsLoading ? (
        <ContentLoader />
      ) : isEmpty(permissionsData) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : isEmpty(filteredPermissions) ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          <SearchIcon
            fontSize="large"
            style={{ color: text("#d1d5db", "#4b5563") }}
          />
          <p
            className="mt-2 text-lg font-medium"
            style={{ color: text("#6b7280", "#9ca3af") }}
          >
            Ничего не найдено
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: text("#9ca3af", "#6b7280") }}
          >
            Попробуйте изменить запрос поиска
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div
          className="overflow-x-auto rounded-lg p-4 border"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          <CustomTable columns={columns} data={filteredPermissions} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPermissions.map((permission, index) => (
            <motion.div
              key={permission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              style={{
                backgroundColor: bg("#ffffff", "#1e1e1e"),
                borderColor: border("#e5e7eb", "#374151"),
              }}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h3
                        className="text-sm font-semibold uppercase tracking-wide"
                        style={{ color: text("#6b7280", "#9ca3af") }}
                      >
                        Разрешение
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditModal(true);
                        setSelectedId(permission.id);
                        setSelectedResourceId(permission.resource_id);
                        setSelectedActionId(permission.action_id);
                      }}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        isDark
                          ? "bg-orange-900 text-orange-400 hover:bg-orange-800"
                          : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      }`}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteModal(true);
                        setSelectedId(permission.id);
                      }}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
                        isDark
                          ? "bg-red-900 text-red-400 hover:bg-red-800"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: text("#9ca3af", "#6b7280") }}
                    >
                      Ресурс
                    </p>
                    <div
                      className="px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: text("#111827", "#f9fafb") }}
                      >
                        {permission.resource?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      className="text-xs font-medium mb-1"
                      style={{ color: text("#9ca3af", "#6b7280") }}
                    >
                      Действие
                    </p>
                    <div
                      className="px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: isDark ? "#374151" : "#f3f4f6",
                      }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: text("#111827", "#f9fafb") }}
                      >
                        {permission.action?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="mt-4 pt-3 border-t"
                  style={{ borderColor: border("#e5e7eb", "#374151") }}
                >
                  <p
                    className="text-xs"
                    style={{ color: text("#9ca3af", "#6b7280") }}
                  >
                    Создано: {dayjs(permission.created_at).format("DD.MM.YYYY")} {" "}
                    <span>{dayjs(permission.created_at).format("HH:mm")}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <MethodModal
          open={createModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateModal(false);
            setSelectedResourceId("");
            setSelectedActionId("");
          }}
          title="Создать разрешение"
        >
          <div className="my-4 space-y-4">
            {/* Resource Select */}
            <div>
              <CustomSelect
                options={optionsResources}
                label={"Ресурс"}
                value={selectedResourceId}
                onChange={(val) => setSelectedResourceId(val)}
                returnObject={false}
                placeholder="Выберите ресурс"
              />
            </div>

            {/* Action Select */}
            <div>
              <CustomSelect
                options={optionsActions}
                label={"Действие"}
                value={selectedActionId}
                onChange={(val) => setSelectedActionId(val)}
                returnObject={false}
                placeholder="Выберите действие"
              />
            </div>

            <PrimaryButton
              onClick={submitCreatePermission}
              disabled={createLoading}
              className="w-full"
            >
              {createLoading ? "Создание..." : "Создать"}
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
            setSelectedId(null);
            setSelectedResourceId("");
            setSelectedActionId("");
          }}
          title="Редактировать разрешение"
        >
          <div className="my-4 space-y-4">
            {/* Resource Select */}
            <div>
              <CustomSelect
                options={optionsResources}
                label={"Ресурс"}
                value={selectedResourceId}
                onChange={(val) => setSelectedResourceId(val)}
                returnObject={false}
                placeholder="Выберите ресурс"
              />
            </div>

            {/* Action Select */}
            <div>
              <CustomSelect
                options={optionsActions}
                label={"Действие"}
                value={selectedActionId}
                onChange={(val) => setSelectedActionId(val)}
                returnObject={false}
                placeholder="Выберите действие"
              />
            </div>

            <PrimaryButton
              onClick={submitEditPermission}
              className="w-full"
            ></PrimaryButton>
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
        title="Вы уверены, что хотите удалить данные права?"
      />
    </div>
  );
};

export default PermissionSection;
