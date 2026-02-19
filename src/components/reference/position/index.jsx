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
import useAppTheme from "@/hooks/useAppTheme";
import { useSession } from "next-auth/react";

const Position = () => {
  const { data: session } = useSession();
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
  const [isChief, setIsChief] = useState(false);
  const [isUniquePerUnit, setIsUniquePerUnit] = useState(false);
  const [hierarchyLevel, setHierarchyLevel] = useState(0);

  const {
    data: positions,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.positions,
    url: URLS.positions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      is_active: selectStatus,
      limit: limit,
      offset: offset,
    },
    enabled: !!session?.accessToken,
  });

  const {
    data: positionTypes,
    isLoading: isLoadingPositionType,
    isFetching: isFetchingPositionType,
  } = useGetPythonQuery({
    key: KEYS.positionTypes,
    url: URLS.positionTypes,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      is_active: true,
    },
    enabled: !!session?.accessToken,
  });

  const optionsPositionType = get(positionTypes, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  const handlePaginationChange = ({ page, offset, limit }) => {
    setCurrentPage(page);
  };

  const handleRemoveAll = () => {
    setOriginalUnitType(null);
    setPositionTypeId(null);
    setIsActive(true);
    setName("");
    setIsChief(false);
    setIsUniquePerUnit(false);
    setHierarchyLevel(0);
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
          is_unique_per_unit: isUniquePerUnit,
          is_active: isActive,
          is_chief: isChief,
          hierarchy_level: hierarchyLevel,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
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
      },
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

      if (isChief !== originalUnitType.is_chief) {
        updates.is_chief = isChief;
      }

      if (isUniquePerUnit !== originalUnitType.is_unique_per_unit) {
        updates.is_unique_per_unit = isUniquePerUnit;
      }

      if (hierarchyLevel !== originalUnitType.hierarchy_level) {
        updates.hierarchy_level = hierarchyLevel;
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(updates),
        },
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
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ position_id: id }),
        },
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
    {
      accessorKey: "name",
      header: "Название должности",
    },
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
      accessorKey: "is_chief",
      header: "Руководитель",
      cell: ({ getValue }) => {
        const isChief = getValue();
        return (
          <span
            className={`font-medium p-1 rounded-md border ${
              isChief
                ? isDark
                  ? "text-blue-400 bg-blue-900/30 border-blue-600"
                  : "text-blue-600 bg-[#E3F2FD] border-blue-600"
                : isDark
                  ? "text-gray-400 bg-gray-900/30 border-gray-600"
                  : "text-gray-600 bg-gray-100 border-gray-400"
            }`}
          >
            {isChief ? "Да" : "Нет"}
          </span>
        );
      },
    },
    {
      accessorKey: "is_unique_per_unit",
      header: "Уникальность",
      cell: ({ getValue }) => {
        const isUnique = getValue();
        if (isUnique === null) {
          return (
            <span
              className={`font-medium p-1 rounded-md border ${
                isDark
                  ? "text-gray-400 bg-gray-900/30 border-gray-600"
                  : "text-gray-500 bg-gray-100 border-gray-300"
              }`}
            >
              —
            </span>
          );
        }
        return (
          <span
            className={`font-medium p-1 rounded-md border ${
              isUnique
                ? isDark
                  ? "text-purple-400 bg-purple-900/30 border-purple-600"
                  : "text-purple-600 bg-[#F3E5F5] border-purple-600"
                : isDark
                  ? "text-gray-400 bg-gray-900/30 border-gray-600"
                  : "text-gray-600 bg-gray-100 border-gray-400"
            }`}
          >
            {isUnique ? "Да" : "Нет"}
          </span>
        );
      },
    },
    {
      accessorKey: "hierarchy_level",
      header: "Уровень иерархии",
      cell: ({ getValue }) => {
        const level = getValue();
        return level !== null ? level : "—";
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
              setIsChief(row.original.is_chief);
              setIsUniquePerUnit(row.original.is_unique_per_unit);
              setHierarchyLevel(row.original.hierarchy_level);
              setPositionTypeId(row.original.position_type_id);
              setOriginalUnitType({
                name: row.original.name,
                is_active: row.original.is_active,
                is_chief: row.original.is_chief,
                is_unique_per_unit: row.original.is_unique_per_unit,
                hierarchy_level: row.original.hierarchy_level,
                position_type_id: row.original.position_type_id,
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
        title={"Создать позицию"}
        showCloseIcon={true}
        closeClick={() => {
          setCreateModal(false);
          handleRemoveAll();
        }}
      >
        <form onSubmit={onSubmitCreatePosition} className="space-y-5 my-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <Input
              label="Название позиции"
              type="text"
              placeholder="Введите название позиции"
              inputClass={"!h-[45px] rounded-lg !border-gray-300 text-[15px]"}
              labelClass={"text-sm font-medium text-gray-700"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <CustomSelect
              label={"Тип позиции"}
              options={optionsPositionType}
              value={positionTypeId}
              onChange={(val) => setPositionTypeId(val)}
              placeholder="Выберите тип позиции"
              returnObject={false}
            />

            <Input
              label="Уровень иерархии"
              type="number"
              placeholder="0"
              inputClass={"!h-[45px] rounded-lg !border-gray-300 text-[15px]"}
              labelClass={"text-sm font-medium text-gray-700"}
              value={hierarchyLevel}
              onChange={(e) => setHierarchyLevel(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {/* Настройки статуса и свойств */}
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Настройки
            </h3>

            <div className="space-y-4">
              {/* Статус активности */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Статус
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      isActive
                        ? isDark
                          ? "bg-green-900/30 border-green-600 text-green-400"
                          : "bg-green-50 border-green-600 text-green-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Активный
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      !isActive
                        ? isDark
                          ? "bg-red-900/30 border-red-600 text-red-400"
                          : "bg-red-50 border-red-600 text-red-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Неактивный
                  </button>
                </div>
              </div>

              {/* Руководитель */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Руководящая должность
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsChief(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      isChief
                        ? isDark
                          ? "bg-blue-900/30 border-blue-600 text-blue-400"
                          : "bg-blue-50 border-blue-600 text-blue-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Да
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChief(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      !isChief
                        ? isDark
                          ? "bg-gray-700 border-gray-500 text-gray-300"
                          : "bg-gray-100 border-gray-500 text-gray-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Нет
                  </button>
                </div>
              </div>

              {/* Уникальность */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Уникальная позиция для единицы
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUniquePerUnit(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      isUniquePerUnit
                        ? isDark
                          ? "bg-purple-900/30 border-purple-600 text-purple-400"
                          : "bg-purple-50 border-purple-600 text-purple-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Да
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUniquePerUnit(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      !isUniquePerUnit
                        ? isDark
                          ? "bg-gray-700 border-gray-500 text-gray-300"
                          : "bg-gray-100 border-gray-500 text-gray-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Нет
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCreateModal(false);
                handleRemoveAll();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Создать позицию
            </button>
          </div>
        </form>
      </MethodModal>

      {/* edit modal */}

      <MethodModal
        open={editModal}
        showCloseIcon={true}
        closeClick={() => {
          setEditModal(false);
          handleRemoveAll();
        }}
        title={"Изменить позицию"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitEditPosition(selectedUnitType);
          }}
          className="space-y-5 my-6"
        >
          {/* Основная информация */}
          <div className="space-y-4">
            <Input
              label="Название позиции"
              type="text"
              placeholder="Введите название позиции"
              inputClass={"!h-[45px] rounded-lg !border-gray-300 text-[15px]"}
              labelClass={"text-sm font-medium text-gray-700"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <CustomSelect
              label={"Тип позиции"}
              options={optionsPositionType}
              value={positionTypeId}
              onChange={(val) => setPositionTypeId(val)}
              placeholder="Выберите тип позиции"
              returnObject={false}
            />

            <Input
              label="Уровень иерархии"
              type="number"
              placeholder="0"
              inputClass={"!h-[45px] rounded-lg !border-gray-300 text-[15px]"}
              labelClass={"text-sm font-medium text-gray-700"}
              value={hierarchyLevel}
              onChange={(e) => setHierarchyLevel(parseInt(e.target.value) || 0)}
              min={0}
            />
          </div>

          {/* Настройки статуса и свойств */}
          <div
            className={`p-4 rounded-lg border ${
              isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">
              Настройки
            </h3>

            <div className="space-y-4">
              {/* Статус активности */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Статус
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      isActive
                        ? isDark
                          ? "bg-green-900/30 border-green-600 text-green-400"
                          : "bg-green-50 border-green-600 text-green-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Активный
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      !isActive
                        ? isDark
                          ? "bg-red-900/30 border-red-600 text-red-400"
                          : "bg-red-50 border-red-600 text-red-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Неактивный
                  </button>
                </div>
              </div>

              {/* Руководитель */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Руководящая должность
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsChief(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      isChief
                        ? isDark
                          ? "bg-blue-900/30 border-blue-600 text-blue-400"
                          : "bg-blue-50 border-blue-600 text-blue-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Да
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChief(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      !isChief
                        ? isDark
                          ? "bg-gray-700 border-gray-500 text-gray-300"
                          : "bg-gray-100 border-gray-500 text-gray-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Нет
                  </button>
                </div>
              </div>

              {/* Уникальность */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Уникальная позиция для единицы
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUniquePerUnit(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      isUniquePerUnit
                        ? isDark
                          ? "bg-purple-900/30 border-purple-600 text-purple-400"
                          : "bg-purple-50 border-purple-600 text-purple-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Да
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUniquePerUnit(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all ${
                      !isUniquePerUnit
                        ? isDark
                          ? "bg-gray-700 border-gray-500 text-gray-300"
                          : "bg-gray-100 border-gray-500 text-gray-700"
                        : isDark
                          ? "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    Нет
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setEditModal(false);
                handleRemoveAll();
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${
                isDark
                  ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Изменить позицию
            </button>
          </div>
        </form>
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
