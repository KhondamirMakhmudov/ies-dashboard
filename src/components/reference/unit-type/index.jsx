import CustomTable from "@/components/table";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { motion } from "framer-motion";
import { get, isEmpty } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Typography } from "@mui/material";
import ContentLoader from "@/components/loader";
import usePostPythonQuery from "@/hooks/python/usePostQuery";
import MethodModal from "@/components/modal/method-modal";
import { useState } from "react";
import Input from "@/components/input";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { config } from "@/config";
import DeleteModal from "@/components/modal/delete-modal";
import NoData from "@/components/no-data";
import PrimaryButton from "@/components/button/primary-button";
import ActiveStatusRadio from "@/components/activeStatusRadio";
const UnitType = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 150;
  const offset = (currentPage - 1) * limit;
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [selectStatus, setSelectStatus] = useState(true);
  const [originalUnitType, setOriginalUnitType] = useState(null);
  const {
    data: unitType,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.unitTypes,
    url: URLS.unitTypes,
    params: {
      is_active: selectStatus,
      limit: limit,
      offset: offset,
    },
  });

  const handlePaginationChange = ({ page }) => {
    setCurrentPage(page);
  };

  const handleRemoveAll = () => {
    setIsActive();
    setSelectedUnitType(null);
    setName("");
    setOriginalUnitType(null);
  };

  // create unit type
  const { mutate: createUnitType } = usePostPythonQuery({
    listKeyId: "create-unit-type",
  });

  const onSubmitCreateUnitType = () => {
    createUnitType(
      {
        url: URLS.unitTypes,
        attributes: {
          name: name,
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          setCreateModal(false);
          handleRemoveAll();
          toast.success("Тип единицы успешно создан", {
            position: "top-center",
          });

          queryClient.invalidateQueries(KEYS.unitTypes);
        },
        onError: (error) => {
          console.log(error, "error");

          toast.error(`${error?.response?.data?.detail}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // edit unit type
  const onSubmitEditUnitType = async (id) => {
    try {
      // Build update object with only changed fields
      const updates = {};

      if (name !== originalUnitType.name) {
        updates.name = name;
      }

      if (isActive !== originalUnitType.is_active) {
        updates.is_active = isActive;
      }

      // If nothing changed, just close modal
      if (Object.keys(updates).length === 0) {
        toast("Изменений не обнаружено", {
          icon: "⚠",
        });
        setEditModal(false);
        return;
      }

      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.unitTypes}${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.detail || "Ошибка");
      }

      toast.success("Тип единицы успешно отредактирован");
      setEditModal(false);
      handleRemoveAll();
      queryClient.invalidateQueries([KEYS.unitTypes]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // delete unit type
  const onSubmitDeleteUnitType = async (id) => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.unitTypes}${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ unit_type_id: id }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.unitTypes);
      console.log("Deleted successfully");
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
    { accessorKey: "name", header: "Имя точки входа" },
    {
      accessorKey: "is_active",
      header: "Статус",
      cell: ({ getValue }) => {
        const isActive = getValue();
        return (
          <span
            className={
              isActive
                ? "text-green-600 font-medium bg-[#E8F6F0] p-1 rounded-md border border-green-600"
                : "text-red-600 font-medium bg-[#FAE7E7] p-1 rounded-md border border-red-600"
            }
          >
            {isActive ? "Активный" : "Неактивный"}
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
              setSelectedUnitType(row.original.id);
              setName(row.original.name);
              setIsActive(row.original.is_active);
              setOriginalUnitType({
                name: row.original.name,
                is_active: row.original.is_active,
              });
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
              setSelectedUnitType(row.original.id);
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

  const totalCount =
    get(unitType, "data")?.length < limit
      ? offset + unitType.length
      : offset + limit + 1;
  return (
    <>
      <div className="flex justify-between items-center bg-white p-[12px] mt-[20px]  rounded-md">
        <PrimaryButton onClick={() => setCreateModal(true)} variant="contained">
          <p>Создать</p>
        </PrimaryButton>

        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 gap-1 cursor-auto">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
              selectStatus === true
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setSelectStatus(true)}
          >
            Активные
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
              selectStatus === false
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setSelectStatus(false)}
          >
            Неактивные
          </button>
        </div>
      </div>
      {isEmpty(get(unitType, "data", [])) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, translateY: "20px" }}
          animate={{ opacity: 1, translateY: "0" }}
          className="bg-white p-[12px] mb-[50px] rounded-md "
        >
          <div className="space-y-[15px]">
            {isLoading || isFetching ? (
              <ContentLoader />
            ) : (
              <CustomTable
                columns={columns}
                data={get(unitType, "data", [])}
                pagination={{
                  currentPage,
                  totalCount,
                  pageSize: limit,
                  onPaginationChange: handlePaginationChange,
                }}
              />
            )}
          </div>
        </motion.div>
      )}

      {/* create modal */}
      <MethodModal
        open={createModal}
        onClose={() => {
          setCreateModal(false);
          setName("");
          setIsActive();
        }}
      >
        <Typography variant="h6">Создать</Typography>

        <div className="space-y-[10px] my-[10px]">
          <Input
            label="Имя"
            type="text"
            placeholder="Введите имя"
            classNames="col-span-4"
            inputClass={"!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"}
            labelClass={"text-sm"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="col-span-2">
            <ActiveStatusRadio isActive={isActive} setIsActive={setIsActive} />
          </div>
          <PrimaryButton
            variant="contained"
            type={"submit"}
            onClick={onSubmitCreateUnitType}
          >
            Создать
          </PrimaryButton>
        </div>
      </MethodModal>

      {/* edit modal */}

      <MethodModal
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setName("");
          setIsActive();
          setOriginalUnitType(null);
        }}
      >
        <Typography variant="h6">Изменить</Typography>

        <div className="space-y-[10px] my-[10px]">
          <Input
            label="Имя"
            type="text"
            placeholder="Введите имя"
            classNames="col-span-4"
            inputClass={"!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"}
            labelClass={"text-sm"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="col-span-2">
            <ActiveStatusRadio isActive={isActive} setIsActive={setIsActive} />
          </div>
          <button
            onClick={() => onSubmitEditUnitType(selectedUnitType)}
            type="submit"
            className=" bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 w-1/4 rounded-xl transition-all duration-200"
          >
            Изменить
          </button>
        </div>
      </MethodModal>

      {/* Delete modal */}
      <DeleteModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        deleting={() => {
          onSubmitDeleteUnitType(selectedUnitType); // 👈 DELETE so‘rov
          setDeleteModal(false);
          setSelectedUnitType(null);
        }}
        title="Вы уверены, что хотите удалить этот тип?"
      />
    </>
  );
};

export default UnitType;
