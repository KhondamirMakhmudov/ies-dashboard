import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { config } from "@/config";
import { motion } from "framer-motion";
import { Button, Typography } from "@mui/material";
import CustomTable from "@/components/table";
import { get, isEmpty } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import usePostQuery from "@/hooks/java/usePostQuery";
import CustomSelect from "@/components/select";
import ContentLoader from "@/components/loader";
import toast from "react-hot-toast";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import usePutQuery from "@/hooks/java/usePutQuery";
import NoData from "@/components/no-data";
import Link from "next/link";
const Index = () => {
  const { data: session } = useSession();
  const [createAccessPoint, setCreateAccessPoint] = useState(false);

  const [editEntryPoint, setEditEntryPoint] = useState(false);
  const [deleteAccessPoint, setDeleteAccessPoint] = useState(false);
  const [entryPointName, setEntryPointName] = useState("");
  const [entryPointShortName, setEntryPointShortName] = useState("");
  const [selectedStructureOfOrg, setSelectedStructureOfOrg] = useState(null);
  const [selectedEntryPointId, setSelectedEntryPointId] = useState(null);
  const queryClient = useQueryClient();
  // get structure of organization
  const { data: structureOfOrganizations } = useGetQuery({
    key: [KEYS.structureOfOrganizations, createAccessPoint || editEntryPoint],
    url: URLS.structureOfOrganizations,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken && (createAccessPoint || editEntryPoint),
  });

  const options = get(structureOfOrganizations, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.nameDep,
  }));

  // get entrypoints
  const {
    data: entrypoints,
    isLoading: isLoadingEntryPoints,
    isFetching: isFetchingEntryPoints,
  } = useGetQuery({
    key: KEYS.entrypoints,
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });
  // create entrypoints

  const { mutate: createEntryPoint } = usePostQuery({
    key: "create-EntryPoint",
  });

  const submitCreateEntryPoint = () => {
    if (!entryPointName || !entryPointShortName || !selectedStructureOfOrg) {
      toast.error("Пожалуйста, заполните все поля", { position: "top-center" });
      return;
    }

    createEntryPoint(
      {
        url: URLS.entrypoints,
        attributes: {
          entryPointName,
          entryPointShortName,
          structureId: selectedStructureOfOrg,
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
          setCreateAccessPoint(false);
          setSelectedStructureOfOrg(null);
          queryClient.invalidateQueries(KEYS.entrypoints);
        },
        onError: (error) => {
          const message =
            error?.response?.data?.message || "Непредвиденная ошибка";
          toast.error(message, { position: "top-right" });
        },
      }
    );
  };

  // edit entrypoints
  const { mutate: editEntrypoint } = usePutQuery({
    listKeyId: "edit-checkpoint",
  });

  const submitEditEntrypoint = (id) => {
    editEntrypoint(
      {
        url: `${URLS.entrypoints}/${id}`,
        attributes: {
          entryPointName: entryPointName,
          entryPointShortName: entryPointShortName,
          structureId: selectedStructureOfOrg,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Entrypoint muvaffaqiyatli tahrirlandi", {
            position: "top-center",
          });
          setEditEntryPoint(false);
          queryClient.invalidateQueries(KEYS.entrypoints);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // delete accesspoint

  const handleDeleteCheckPoint = async (id) => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.entrypoints}/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ id }),
        }
      );
      console.log(response);

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      if (response.status !== 204) {
        await response.json();
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.entrypoints);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "entryPointName",
      header: "Имя точки входа",
      cell: ({ row }) => (
        <Link href={`/dashboard/access-points/${row.original.id}`}>
          <p className="text-blue-500 hover:underline underline-0">
            {row.original.entryPointName}
          </p>
        </Link>
      ),
    },
    {
      accessorKey: "entryPointShortName",
      header: "Краткое название точки входа.",
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedEntryPointId(row.original.id);
              setEntryPointName(row.original.entryPointName);
              setEntryPointShortName(row.original.entryPointShortName);
              setEditEntryPoint(true);
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
              setSelectedEntryPointId(row.original.id);
              setDeleteAccessPoint(true);
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

  if (isFetchingEntryPoints || isLoadingEntryPoints) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout headerTitle={"Точки доступа"}>
      {isEmpty(entrypoints, "data", []) ? (
        <NoData onCreate={() => setCreateAccessPoint(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] my-[50px] rounded-md border border-gray-200"
        >
          <div className="col-span-12 space-y-[15px]">
            <div className="max-w-[100px]">
              <Button
                onClick={() => setCreateAccessPoint(true)}
                sx={{
                  textTransform: "initial",
                  fontFamily: "DM Sans, sans-serif",
                  backgroundColor: "#4182F9",
                  boxShadow: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "14px",
                  minWidth: "100px",
                  borderRadius: "8px",
                }}
                variant="contained"
              >
                Создать
              </Button>
            </div>
            <CustomTable data={get(entrypoints, "data")} columns={columns} />
          </div>
          {/* create modal */}
        </motion.div>
      )}

      {createAccessPoint && (
        <MethodModal
          open={createAccessPoint}
          onClose={() => {
            setCreateAccessPoint(false);
            setEntryPointName("");
            setEntryPointShortName("");
            setSelectedStructureOfOrg(null);
          }}
        >
          <Typography variant="h6" className="mb-2">
            Добавить точку доступа
          </Typography>

          <div className="my-[30px] space-y-[15px]">
            <Input
              name="login"
              onChange={(e) => {
                setEntryPointName(e.target.value);
              }}
              label={"Имя точки входа"}
              placeholder="введите имя точки входа"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />
            <Input
              name="login"
              onChange={(e) => {
                setEntryPointShortName(e.target.value);
              }}
              label={"Краткое название точки входа."}
              placeholder="Введите краткое название точки входа."
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />
            <CustomSelect
              options={options}
              value={selectedStructureOfOrg}
              placeholder="Выберите структурное подразделение"
              onChange={(val) => setSelectedStructureOfOrg(val)}
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
              onClick={submitCreateEntryPoint}
              type="submit"
            >
              Создать
            </Button>
          </div>
        </MethodModal>
      )}

      {/* edit modal */}
      {editEntryPoint && (
        <MethodModal
          open={editEntryPoint}
          onClose={() => setEditEntryPoint(false)}
        >
          <Typography variant="h6" className="mb-2">
            Добавить точку доступа
          </Typography>

          <div className="my-[30px] space-y-[15px]">
            <Input
              name="login"
              value={entryPointName}
              onChange={(e) => {
                setEntryPointName(e.target.value);
              }}
              label={"Имя точки входа"}
              placeholder="введите имя точки входа"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />
            <Input
              name="login"
              value={entryPointShortName}
              onChange={(e) => {
                setEntryPointShortName(e.target.value);
              }}
              label={"Краткое название точки входа."}
              placeholder="Введите краткое название точки входа."
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              required
            />
            <CustomSelect
              options={options}
              value={selectedStructureOfOrg}
              placeholder="Выберите структурное подразделение"
              onChange={(val) => setSelectedStructureOfOrg(val)}
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
              onClick={() => submitEditEntrypoint(selectedEntryPointId)}
              type="submit"
            >
              Изменить
            </Button>
          </div>
        </MethodModal>
      )}

      {/* delete modal */}

      {deleteAccessPoint && (
        <DeleteModal
          open={deleteAccessPoint}
          onClose={() => {
            setDeleteAccessPoint(false);
            setSelectedEntryPointId(null);
          }}
          deleting={() => {
            handleDeleteCheckPoint(selectedEntryPointId); // 👈 DELETE so‘rov
            setDeleteAccessPoint(false);
            setSelectedEntryPointId(null);
          }}
          title="Вы уверены, что хотите удалить эту чекпоинт?"
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
