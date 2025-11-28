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
import CustomSelect from "@/components/select";
import NoData from "@/components/no-data";
import PrimaryButton from "@/components/button/primary-button";
import ActiveStatusRadio from "@/components/activeStatusRadio";
import useAppTheme from "@/hooks/useAppTheme";

const Position = () => {
  const queryClient = useQueryClient();
  const { isDark, bg, text, border } = useAppTheme();

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
  const [positionTypeId, setPositionTypeId] = useState(null);
  const [positionParentId, setPositionParentId] = useState(null);
  const [originalUnitType, setOriginalUnitType] = useState(null);

  const {
    data: positions,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.positions,
    url: URLS.positions,
    params: {
      is_active: selectStatus,
      limit: limit,
      offset: offset,
    },
  });

  const {
    data: positionTypes,
    isLoading: isLoadingPositionType,
    isFetching: isFetchingPositionType,
  } = useGetPythonQuery({
    key: KEYS.positionTypes,
    url: URLS.positionTypes,
    params: {
      is_active: true,
    },
  });

  const optionsPositionType = get(positionTypes, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  const optionsPosition = get(positions, "data", []).map((entry) => ({
    value: entry.parent_id,
    label: entry.name,
  }));

  const handlePaginationChange = ({ page, offset, limit }) => {
    setCurrentPage(page);
  };

  const handleRemoveAll = () => {
    setOriginalUnitType(null);
    setPositionTypeId(null);
    setIsActive();
    setName("");
  };

  // create unit type
  const { mutate: createUnitType } = usePostPythonQuery({
    listKeyId: "create-position",
  });

  const onSubmitCreatePosition = (e) => {
    e.preventDefault();
    createUnitType(
      {
        url: URLS.positions,
        attributes: {
          name: name,
          position_type_id: positionTypeId,
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          setCreateModal(false);
          handleRemoveAll();
          toast.success("Позиция успешно создана.", {
            position: "top-center",
          });

          queryClient.invalidateQueries(KEYS.positions);
        },
        onError: (error) => {
          toast.error(`${error.response?.data.detail}`, {
            position: "top-right",
          });
        },
      }
    );
  };

  // edit position
  const onSubmitEditPosition = async (id) => {
    try {
      // Build update object with only changed fields
      const updates = {};

      if (name !== originalUnitType.name) {
        updates.name = name;
      }

      if (isActive !== originalUnitType.is_active) {
        updates.is_active = isActive;
      }

      if (positionTypeId !== originalUnitType.position_type_id) {
        updates.position_type_id = positionTypeId;
      }

      // If nothing changed, just close modal
      if (Object.keys(updates).length === 0) {
        toast.info("Изменений не обнаружено");
        setEditModal(false);
        return;
      }

      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.positions}${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.detail || "Xatolik yuz berdi");
      }

      toast.success("Позиция успешно отредактирован");
      setEditModal(false);
      handleRemoveAll();
      queryClient.invalidateQueries([KEYS.positions]);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // delete unit type
  const onSubmitDeletePosition = async (id) => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.positions}${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ position_id: id }),
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
              setPositionTypeId(row.original.position_type_id);
              setOriginalUnitType({
                name: row.original.name,
                position_type_id: row.original.position_type_id,
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
    get(positions, "data", [])?.length < limit
      ? offset + get(positions, "data", []).length
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
      {isEmpty(get(positions, "data", [])) ? (
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
                data={get(positions, "data", [])}
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
          handleRemoveAll();
        }}
      >
        <Typography variant="h6">Создать позицию</Typography>

        <div className="space-y-[15px] my-[30px]">
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

          <CustomSelect
            label={"Тип единицы"}
            options={optionsPositionType}
            value={positionTypeId}
            onChange={(val) => setPositionTypeId(val)}
            placeholder="Выберите тип позиции"
            returnObject={false}
          />

          <div className="col-span-2">
            <ActiveStatusRadio isActive={isActive} setIsActive={setIsActive} />
          </div>
          <button
            onClick={onSubmitCreatePosition}
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
        onClose={() => {
          setEditModal(false);
          handleRemoveAll();
        }}
      >
        <Typography variant="h6">Изменить</Typography>

        <div className="space-y-[15px] my-[30px] ">
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

          <CustomSelect
            label={"Тип единицы"}
            options={optionsPositionType}
            value={positionTypeId}
            placeholder="Выберите тип позиции"
            onChange={(val) => setPositionTypeId(val)}
          />

          <div className="col-span-2">
            <ActiveStatusRadio isActive={isActive} setIsActive={setIsActive} />
          </div>
          <button
            onClick={() => onSubmitEditPosition(selectedUnitType)}
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
          onSubmitDeletePosition(selectedUnitType);
          setDeleteModal(false);
          setSelectedUnitType(null);
        }}
        title="Вы уверены, что хотите удалить эту позицию?"
      />
    </>
  );
};

export default Position;
