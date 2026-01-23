import useAppTheme from "@/hooks/useAppTheme";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import { useSession } from "next-auth/react";
import PrimaryButton from "@/components/button/primary-button";
import usePostGeneralAuthQuery from "@/hooks/general-auth/usePostQuery";
import toast from "react-hot-toast";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import ContentLoader from "@/components/loader";
import DeleteModal from "@/components/modal/delete-modal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { config } from "@/config";
import CustomTable from "@/components/table";
import { get } from "lodash";
import { Button } from "@mui/material";
import dayjs from "dayjs";

const ActionSection = () => {
  const queryClient = useQueryClient();
  const { isDark, bg, text, border } = useAppTheme();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectActionId, setSelectActionId] = useState(null);

  const {
    data: actions,
    isLoading: actionsLoading,
    isFetching: actionsFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.actions,
    url: URLS.actions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const { mutate: createAction } = usePostGeneralAuthQuery({
    listKeyId: "create-action",
  });

  // create action
  const submitCreateAction = () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }
    createAction(
      {
        url: URLS.actions,
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
          queryClient.invalidateQueries(KEYS.actions);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // edit action
  const submitEditAction = async () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.actions}/${selectActionId}`,
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
      setSelectActionId(null);
      setName("");
      queryClient.invalidateQueries(KEYS.actions);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Delete action
  const submitDeleteAction = async () => {
    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/${URLS.actions}/${selectActionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Ошибка при удалении");

      toast.success("Действие успешно удалено", { position: "top-center" });
      setDeleteModal(false);
      setSelectActionId(null);
      queryClient.invalidateQueries(KEYS.actions);
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
    { accessorKey: "name", header: "Название действия" },
    {
      accessorKey: "created_at",
      header: "Дата создания",
      cell: ({ getValue, row }) => {
        const isActive = getValue();
        return (
          <span
            className={`font-medium p-1 rounded-md border ${
              isDark
                ? "text-blue-400 bg-blue-900/30 border-blue-600"
                : "text-blue-600 bg-blue-50 border-blue-600"
            }`}
          >
            {dayjs(row.original.created_at).format("DD.MM.YYYY")}
          </span>
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
              setSelectActionId(row.original.id);
              setName(row.original.name);
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
              setSelectActionId(row.original.id);
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

  if (actionsLoading || actionsFetching) {
    return (
      <DashboardLayout headerTitle={"Доступ и права"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <div className="my-2 border border-gray-200 rounded-md">
      {/* Header Section */}
      <div
        className="flex justify-between items-center p-[16px] rounded-t-lg "
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <PrimaryButton
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2"
        >
          Создать действие
        </PrimaryButton>
      </div>

      {/* Table Section */}
      <div
        className="overflow-x-auto rounded-b-lg p-4"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <CustomTable columns={columns} data={get(actions, "data.data", [])} />
      </div>

      {/* Create Modal */}
      {createModal && (
        <MethodModal
          open={createModal}
          showCloseIcon={true}
          closeClick={() => {
            setCreateModal(false);
            setName("");
          }}
          title="Создать действие"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя действия"
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
              placeholder="Введите имя действия"
            />
            <PrimaryButton onClick={submitCreateAction} className="w-full">
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
            setSelectActionId(null);
          }}
          title="Изменить действие"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя действия"
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
              placeholder="Введите имя действия"
            />
            <PrimaryButton
              backgroundColor="#fb923c"
              onClick={submitEditAction}
              className="w-full"
            >
              Изменить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectActionId(null);
        }}
        deleting={submitDeleteAction}
        title="Вы уверены, что хотите удалить это действие?"
      />
    </div>
  );
};

export default ActionSection;
