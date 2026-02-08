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
import useAppTheme from "@/hooks/useAppTheme";

const PositionType = () => {
  const { bg, isDark, text, border } = useAppTheme();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [originalUnitType, setOriginalUnitType] = useState(null);
  const limit = 150;
  const offset = (currentPage - 1) * limit;
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [selectStatus, setSelectStatus] = useState(true);
  const {
    data: positionType,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.positionTypes,
    url: URLS.positionTypes,
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
    setName("");
    setSelectedUnitType();
    setOriginalUnitType(null);
  };

  // create unit type
  const { mutate: createPositionType } = usePostPythonQuery({
    listKeyId: "create-position-type",
  });

  const onSubmitCreatePositionType = () => {
    createPositionType(
      {
        url: URLS.positionTypes,
        attributes: {
          name: name,
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          setCreateModal(false);
          handleRemoveAll();
          toast.success("Тип позиции успешно создан", {
            position: "top-center",
          });

          queryClient.invalidateQueries(KEYS.positionTypes);
        },
        onError: (error) => {
          toast.error(`${error.response?.data?.detail}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  const onSubmitEditPositionType = async (id) => {
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
        `${config.PYTHON_API_URL}${URLS.positionTypes}${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.detail || "Ошибка");
      }

      toast.success("Тип позиции успешно отредактирован");
      setEditModal(false);
      handleRemoveAll();
      queryClient.invalidateQueries([KEYS.positionTypes]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // delete unit type
  const onSubmitDeletePositionType = async (id) => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.positionTypes}${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ position_type_id: id }),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.unitTypes);
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
            className={`font-medium p-1 rounded-md border ${
              isActive
                ? isDark
                  ? "text-green-400 bg-green-900/30 border-green-600"
                  : "text-green-600 bg-[#E8F6F0] border-green-600"
                : isDark
                  ? "text-red-400 bg-red-900/30 border-red-600"
                  : "text-red-600 bg-[#FAE7E7] border-red-600"
            }`}
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
              setSelectedUnitType(row.original.id);
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

  const totalCount =
    get(positionType, "data", [])?.length < limit
      ? offset + get(positionType, "data", []).length
      : offset + limit + 1;
  return (
    <>
      <div
        className="flex justify-between items-center bg-white p-[12px] mt-[20px]  rounded-t-md"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <PrimaryButton onClick={() => setCreateModal(true)} variant="contained">
          <p>Создать</p>
        </PrimaryButton>

        <div
          className={`inline-flex items-center ${
            !isDark ? "bg-gray-100" : "bg-gray-500"
          } rounded-lg p-1 gap-1 cursor-auto`}
        >
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
              selectStatus === true
                ? isDark
                  ? "bg-gray-700 text-green-400 shadow-sm"
                  : "bg-white text-green-600 shadow-sm"
                : isDark
                  ? "bg-gray-500 text-gray-300 hover:text-gray-100"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setSelectStatus(true)}
          >
            Активные
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
              selectStatus === false
                ? isDark
                  ? "bg-gray-700 text-red-400 shadow-sm"
                  : "bg-white text-red-600 shadow-sm"
                : isDark
                  ? "bg-gray-500 text-gray-300 hover:text-gray-100"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setSelectStatus(false)}
          >
            Неактивные
          </button>
        </div>
      </div>
      {isEmpty(get(positionType, "data", [])) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, translateY: "20px" }}
          animate={{ opacity: 1, translateY: "0" }}
          className="bg-white p-[12px] mb-[50px] rounded-b-md"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          <div className="space-y-[15px]">
            {isLoading || isFetching ? (
              <ContentLoader />
            ) : (
              <CustomTable
                columns={columns}
                data={get(positionType, "data", [])}
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
        showCloseIcon={true}
        title={"Создать тип позиции"}
        closeClick={() => {
          setCreateModal(false);
          setName("");
          setIsActive();
        }}
      >
        <div
          onSubmit={onSubmitCreatePositionType}
          className="space-y-[15px] my-[30px]"
        >
          <Input
            label="Имя"
            type="text"
            // name="ipAddress"
            placeholder="Введите имя"
            classNames="col-span-4"
            inputClass={"!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"}
            value={name}
            labelClass={"text-sm"}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="isActive"
                value="true"
                checked={isActive === true}
                onChange={() => setIsActive(true)}
              />
              <span>Активный</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="isActive"
                value="false"
                checked={isActive === false}
                onChange={() => setIsActive(false)}
              />
              <span>Неактивный</span>
            </label>
          </div>
          <button
            onClick={onSubmitCreatePositionType}
            type="submit"
            className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 w-1/4 rounded-xl transition-all duration-200"
          >
            Создать
          </button>
        </div>
      </MethodModal>

      {/* edit modal */}
      <MethodModal
        open={editModal}
        showCloseIcon={true}
        closeClick={() => {
          setEditModal(false);
          setName("");
          setIsActive();
        }}
        title={"Изменить тип позиции"}
      >
        <div className="space-y-[15px] my-[30px]">
          <Input
            label="Имя"
            type="text"
            // name="ipAddress"
            placeholder="Введите имя"
            classNames="col-span-4"
            inputClass={"!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"}
            value={name}
            labelClass={"text-sm"}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="isActive"
                value="true"
                checked={isActive === true}
                onChange={() => setIsActive(true)}
              />
              <span>Активный</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="isActive"
                value="false"
                checked={isActive === false}
                onChange={() => setIsActive(false)}
              />
              <span>Неактивный</span>
            </label>
          </div>
          <button
            onClick={() => onSubmitEditPositionType(selectedUnitType)}
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
          onSubmitDeletePositionType(selectedUnitType); // 👈 DELETE so‘rov
          setDeleteModal(false);
          setSelectedUnitType(null);
        }}
        title="Вы уверены, что хотите удалить этот тип?"
      />
    </>
  );
};

export default PositionType;
