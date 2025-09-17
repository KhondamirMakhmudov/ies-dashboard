import ContentLoader from "@/components/loader";
import { useState } from "react";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import CustomTable from "@/components/table";
import { Button, Select, MenuItem, Typography } from "@mui/material";
import { get, isEmpty } from "lodash";
import DeleteModal from "@/components/modal/delete-modal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MethodModal from "@/components/modal/method-modal";
import usePostQuery from "@/hooks/java/usePostQuery";
import Input from "@/components/input";
import useDeleteQuery from "@/hooks/java/useDeleteQuery";
import { config } from "@/config";
import toast from "react-hot-toast";
import usePutQuery from "@/hooks/java/usePutQuery";
import CustomSelect from "@/components/select";
import { set } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import NoData from "@/components/no-data";
const Index = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [createCheckpoints, setCreateCheckpoints] = useState(false);
  const [editCheckpoints, setEditCheckpoints] = useState(false);
  const [selectedEntryPoint, setSelectedEntryPoint] = useState("");
  const [nameOfCheckpointName, setNameOfCheckpointName] = useState("");
  const [deleteCheckpoints, setDeleteCheckpoints] = useState(false);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(null);
  const {
    data: checkpoints,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.checkpoints,
    url: URLS.checkpoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  // entrypoint get

  const { data: entrypoints } = useGetQuery({
    key: [KEYS.entrypoints, createCheckpoints || editCheckpoints],
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && (createCheckpoints || editCheckpoints),
  });

  const options = get(entrypoints, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.entryPointName,
  }));

  const { mutate: createCheckpoint } = usePostQuery({
    listKeyId: "create-checkpoint",
  });
  // checkpoint yaratish
  const submitCreateCheckPoint = () => {
    if (!selectedCheckpointId || !nameOfCheckpointName) {
      toast.error("Пожалуйста, заполните все поля", { position: "top-center" });
      return;
    }
    createCheckpoint(
      {
        url: URLS.createCheckpoint,
        attributes: {
          checkPointName: nameOfCheckpointName,
          entryPointId: selectedEntryPoint,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Checkpoint muvaffaqiyatli joylandi", {
            position: "top-center",
          });
          setNameOfCheckpointName("");
          setCreateCheckpoints(false);
          setSelectedEntryPoint([]);
          queryClient.invalidateQueries(KEYS.checkpoints);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // checkpoint edit qilish

  const { mutate: editCheckpoint } = usePutQuery({
    listKeyId: "edit-checkpoint",
  });

  const submitEditCheckPoint = (id) => {
    editCheckpoint(
      {
        url: `${URLS.editOrDeleteCheckpoint}${id}`,
        attributes: {
          checkPointName: nameOfCheckpointName,
          entryPointId: selectedEntryPoint,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Checkpoint muvaffaqiyatli tahrirlandi", {
            position: "top-center",
          });
          setEditCheckpoints(false);
          setNameOfCheckpointName("");
          setSelectedEntryPoint(null);
          setCreateCheckpoints(false);
          queryClient.invalidateQueries(KEYS.checkpoints);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // checkpoint o'chirish
  const handleDeleteCheckPoint = async (id) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.editOrDeleteCheckpoint}${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ id }), // faqat agar backend body kutsa
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      let result = null;

      // Faqat agar javob body mavjud bo‘lsa
      if (response.status !== 204) {
        result = await response.json();
        console.log("Deleted:", result);
      }
      queryClient.invalidateQueries(KEYS.checkpoints);
      toast.success("Успешно удалено");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "checkPointName", header: "Тип двери" },
    { accessorKey: "entryPoint.entryPointName", header: "Точки входа" },
    {
      accessorKey: "entryPoint.entryPointShortName",
      header: "Краткое имя точки входа",
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedCheckpointId(row?.original.id);
              setEditCheckpoints(true);
              setNameOfCheckpointName(row.original.checkPointName);
              setSelectedEntryPoint(
                options.find((opt) => opt.label === row.original.entryPointName)
              );
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
              setSelectedCheckpointId(row?.original.id);
              setDeleteCheckpoints(true);
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
    <DashboardLayout headerTitle={"Контрольные точки"}>
      {isEmpty(get(checkpoints, "data", [])) ? (
        <NoData onCreate={() => setCreateCheckpoints(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[50px] rounded-md border border-gray-200"
        >
          <div className="col-span-12 space-y-[15px]">
            <div className="max-w-[100px]">
              <Button
                onClick={() => setCreateCheckpoints(true)}
                sx={{
                  textTransform: "initial",
                  fontFamily: "DM Sans, sans-serif",
                  backgroundColor: "#4182F9",
                  boxShadow: "none",
                  color: "white",
                  display: "flex", // inline-block emas
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "14px",
                  minWidth: "100px", // yoki widthni kengroq bering
                  borderRadius: "8px",
                }}
                variant="contained"
              >
                Создать
              </Button>
            </div>
            <CustomTable data={get(checkpoints, "data")} columns={columns} />
          </div>
        </motion.div>
      )}
      {/* create checkpoint */}
      {createCheckpoints && (
        <MethodModal
          open={createCheckpoints}
          onClose={() => {
            setCreateCheckpoints(false);
            setNameOfCheckpointName("");
            setSelectedEntryPoint(null);
          }}
        >
          <Typography variant="h6" className="mb-2">
            Добавить контрольно-пропускной пункт
          </Typography>

          <div className="my-[30px] space-y-[20px]">
            <Input
              name="login"
              onChange={(e) => {
                setNameOfCheckpointName(e.target.value);
              }}
              placeholder="Введите имя чекпоинта"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />

            <CustomSelect
              options={options}
              value={selectedEntryPoint}
              onChange={(val) => setSelectedEntryPoint(val)}
            />

            <Button
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#4182F9",
                boxShadow: "none",
                color: "white",
                display: "flex", // inline-block emas
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontSize: "14px",
                minWidth: "100px", // yoki widthni kengroq bering
                borderRadius: "8px",
                marginTop: "15px",
              }}
              variant="contained"
              onClick={submitCreateCheckPoint}
              type="submit"
            >
              Создать
            </Button>
          </div>
        </MethodModal>
      )}
      {/* edit checkpoint */}
      {editCheckpoints && (
        <MethodModal
          open={editCheckpoints}
          onClose={() => setEditCheckpoints(false)}
        >
          <Typography variant="h6" className="mb-2">
            Изменить контрольно-пропускной пункт
          </Typography>

          <div className="my-[30px] space-y-[15px]">
            <Input
              name="login"
              onChange={(e) => {
                setNameOfCheckpointName(e.target.value);
              }}
              placeholder="Введите имя чекпоинта"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              value={nameOfCheckpointName}
              required
            />

            <CustomSelect
              options={options}
              value={selectedEntryPoint}
              onChange={(val) => setSelectedEntryPoint(val)}
            />

            <Button
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#F07427",
                boxShadow: "none",
                color: "white",
                display: "flex", // inline-block emas
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                fontSize: "14px",
                minWidth: "100px", // yoki widthni kengroq bering
                borderRadius: "8px",
                marginTop: "15px",
              }}
              variant="contained"
              onClick={() => submitEditCheckPoint(selectedCheckpointId)}
              type="submit"
            >
              Изменить
            </Button>
          </div>
        </MethodModal>
      )}
      {/* delete checkpoint */}
      {deleteCheckpoints && (
        <DeleteModal
          open={deleteCheckpoints}
          onClose={() => {
            setDeleteCheckpoints(false);
            setSelectedCheckpointId(null);
          }}
          deleting={() => {
            handleDeleteCheckPoint(selectedCheckpointId); // 👈 DELETE so‘rov
            setDeleteCheckpoints(false);
            setSelectedCheckpointId(null);
          }}
          title="Вы уверены, что хотите удалить эту чекпоинт?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
