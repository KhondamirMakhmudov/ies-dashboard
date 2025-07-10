import ContentLoader from "@/components/loader";
import { useState } from "react";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import CustomTable from "@/components/table";
import { Button, Select, MenuItem, Typography } from "@mui/material";
import { get } from "lodash";
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

const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MjA4NTk1MSwiZXhwIjoxNzUyMTcyMzUxfQ.0nST-uDSUASCSBCpkU10_PCLTzwR6XEKYlmJd9TsD5o";
const Index = () => {
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
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  });

  // entrypoint get

  const { data: entrypoints } = useGetQuery({
    key: KEYS.entrypoints,
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
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
    createCheckpoint(
      {
        url: URLS.createCheckpoint,
        attributes: {
          checkPointName: nameOfCheckpointName,
          entryPointId: selectedEntryPoint,
        },
        config: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Checkpoint muvaffaqiyatli joylandi", {
            position: "top-center",
          });
          setCreateCheckpoints(false);
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
    editCheckpoint({
      url: `${URLS.editOrDeleteCheckpoint}${id}`,
      attributes: {
        checkPointName: nameOfCheckpointName,
        entryPointId: selectedEntryPoint,
      },
      config: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }), // agar server bodyda kutsa
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      const result = await response.json();
      console.log("Deleted:", result);
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
    { accessorKey: "id", header: "№" },
    { accessorKey: "checkPointName", header: "Тип двери" },
    { accessorKey: "entryPoint.entryPointName", header: "Подразделение" },
    { accessorKey: "checkPointName", header: "Контрольная точка" },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedCheckpointId(row);
              setEditCheckpoints(true);
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
            // onClick={() => handleDeleteCheckPoint(row.id)}
            onClick={() => {
              setSelectedCheckpointId(row.original.id);
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
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-[12px] my-[50px] rounded-md"
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
        {/* delete modal */}
      </motion.div>

      {createCheckpoints && (
        <MethodModal
          open={createCheckpoints}
          onClose={() => setCreateCheckpoints(false)}
        >
          <Typography variant="h6" className="mb-2">
            Добавить контрольно-пропускной пункт
          </Typography>

          <div className="my-[30px]">
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

      {editCheckpoints && (
        <MethodModal
          open={editCheckpoints}
          onClose={() => setEditCheckpoints(false)}
        >
          <Typography variant="h6" className="mb-2">
            Изменить контрольно-пропускной пункт
          </Typography>

          <div className="my-[30px]">
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
              onClick={submitEditCheckPoint}
              type="submit"
            >
              Изменить
            </Button>
          </div>
        </MethodModal>
      )}

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
