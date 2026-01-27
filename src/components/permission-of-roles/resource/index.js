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

const ResourceSection = () => {
  const queryClient = useQueryClient();
  const { isDark, bg, text, border } = useAppTheme();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectResourceId, setSelectResourceId] = useState(null);

  const {
    data: resources,
    isLoading: resourceLoading,
    isFetching: resourceFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.resources,
    url: URLS.resources,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const { mutate: createResource } = usePostGeneralAuthQuery({
    listKeyId: "create-resource",
  });

  // create resource
  const submitCreateResource = () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }
    createResource(
      {
        url: URLS.resources,
        attributes: { name: name },
        config: {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      },
      {
        onSuccess: () => {
          toast.success("Ресурс успешно создан", { position: "top-center" });
          setCreateModal(false);
          setName("");
          queryClient.invalidateQueries(KEYS.resources);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error?.message || error}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // edit resource
  const submitEditResouce = async () => {
    if (!name.trim()) {
      toast.error("Пожалуйста, введите имя", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}${URLS.resources}/${selectResourceId}`,
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

      toast.success("Ресурс успешно обновлен", { position: "top-center" });
      setEditModal(false);
      setSelectResourceId(null);
      setName("");
      queryClient.invalidateQueries(KEYS.resources);
    } catch (error) {
      toast.error(`Ошибка: ${error?.message || error}`, {
        position: "top-right",
      });
    }
  };

  // Delete resource
  const submitDeleteResource = async () => {
    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}${URLS.resources}/${selectResourceId}`,
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
      setSelectResourceId(null);
      queryClient.invalidateQueries(KEYS.resources);
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
    { accessorKey: "name", header: "Название ресурса" },
    {
      accessorKey: "created_at",
      header: "Дата создания",
      cell: ({ row }) => {
        return (
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
              setSelectResourceId(row.original.id);
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
              setSelectResourceId(row.original.id);
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

  if (resourceLoading || resourceFetching) {
    return <ContentLoader />;
  }

  return (
    <div
      className={`my-2 border ${isDark ? "border-gray-700" : "border-gray-200"} rounded-md`}
    >
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
          Создать ресурс
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
        <CustomTable columns={columns} data={get(resources, "data.data", [])} />
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
          title="Создать ресурс"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя ресурса"
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
              placeholder="Введите имя ресурса"
            />
            <PrimaryButton onClick={submitCreateResource} className="w-full">
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
            setSelectResourceId(null);
          }}
          title="Изменить ресурс"
        >
          <div className="my-[15px] space-y-[10px]">
            <Input
              label="Имя ресурса"
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
              placeholder="Введите имя ресурса"
            />
            <PrimaryButton
              backgroundColor="#fb923c"
              onClick={submitEditResouce}
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
          setSelectResourceId(null);
        }}
        deleting={submitDeleteResource}
        title="Вы уверены, что хотите удалить этот ресурс?"
      />
    </div>
  );
};

export default ResourceSection;
