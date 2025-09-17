import CustomTable from "@/components/table";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
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
import usePatchPythonQuery from "@/hooks/python/usePatchQuery";
import CustomSelect from "@/components/select";
import NoData from "@/components/no-data";

const Position = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;
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
          // parent_id: positionParentId,
          position_type_id: positionTypeId,
          is_active: isActive,
        },
      },
      {
        onSuccess: () => {
          setCreateModal(false);
          toast.success("position muvaffaqiyatli yaratildi", {
            position: "top-center",
          });

          queryClient.invalidateQueries(KEYS.positions);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // edit unit type
  const { mutate: editUnitType } = usePatchPythonQuery({
    listKeyId: "edit-unit-type",
  });

  const onSubmitEditPosition = (id) => {
    editUnitType(
      {
        url: `${URLS.positions}${id}`,
        attributes: {
          name: name,
          position_type_id: positionTypeId,
          is_active: isActive,
        },
      },

      {
        onSuccess: () => {
          // setEditModal(false);
          toast.success("unitType muvaffaqiyatli tahrirlandi", {
            position: "top-center",
          });

          queryClient.invalidateQueries(KEYS.unitTypes);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
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
      {isEmpty(get(positions, "data", [])) ? (
        <NoData onCreate={() => setCreateModal(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-[12px] mt-[20px] mb-[50px] rounded-md"
        >
          <div className="space-y-[15px]">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setCreateModal(true)}
                sx={{
                  textTransform: "initial",
                  fontFamily: "DM Sans, sans-serif",
                  backgroundColor: "#4182F9",
                  boxShadow: "none",
                  color: "white",
                  display: "flex",
                  gap: "4px",
                  fontSize: "14px",
                  borderRadius: "8px",
                }}
                variant="contained"
              >
                <p>Создать</p>
              </Button>

              <div className="flex justify-between items-center gap-2">
                <button
                  className={` font-medium cursor-pointer p-1 text-sm rounded-md border  ${
                    selectStatus === true
                      ? "text-green-600 border-green-600 bg-[#E8F6F0]"
                      : "text-gray-400 border-gray-400 bg-white"
                  } scale-100 active:scale-95 transition-all duration-200`}
                  onClick={() => setSelectStatus(true)}
                >
                  Активные
                </button>
                <div className="w-[1px] h-[20px] bg-gray-200"></div>
                <button
                  className={` font-medium cursor-pointer p-1 text-sm rounded-md border ${
                    selectStatus === false
                      ? "text-red-600 border-red-600  bg-[#FAE7E7]"
                      : "text-gray-400 border-gray-400 bg-white"
                  } scale-100 active:scale-95 transition-all duration-200`}
                  onClick={() => setSelectStatus(false)}
                >
                  Неактивные
                </button>
              </div>
            </div>

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
          setPositionParentId(null);
          setPositionTypeId(null);
          setName("");
        }}
      >
        <Typography variant="h6">Создать позицию</Typography>

        <form
          onSubmit={onSubmitCreatePosition}
          className="space-y-[15px] my-[30px]"
        >
          <Input
            label="Имя"
            type="text"
            placeholder="Введите имя"
            classNames="col-span-4"
            inputClass={"!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"}
            value={name}
            labelClass={"text-sm"}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {/* <CustomSelect
            options={optionsPosition}
            value={positionParentId}
            placeholder="Выберите позицию"
            onChange={(val) => setPositionParentId(val)}
          /> */}

          <CustomSelect
            options={optionsPositionType}
            value={positionTypeId} // faqat value (id) ni beramiz
            onChange={(val) => setPositionTypeId(val)} // object emas
            placeholder="Выберите тип позиции"
            returnObject={false} // (ixtiyoriy, default ham false)
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
            type="submit"
            className=" bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 w-1/4 rounded-xl transition-all duration-200"
          >
            Создать
          </button>
        </form>
      </MethodModal>

      {/* edit modal */}

      <MethodModal
        open={editModal}
        onClose={() => {
          setEditModal(false);
          setName("");
          setPositionParentId(null);
          setPositionTypeId(null);
          setIsActive();
        }}
      >
        <Typography variant="h6">Изменить</Typography>

        <form
          className="space-y-[15px] my-[30px] "
          onSubmit={(e) => {
            e.preventDefault(); // sahifa reload bo‘lmasligi uchun
            onSubmitEditPosition(selectedUnitType);
          }}
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

          <CustomSelect
            options={optionsPositionType}
            value={positionTypeId}
            placeholder="Выберите тип позиции"
            onChange={(val) => setPositionTypeId(val)}
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
            type="submit"
            className=" bg-orange-400 hover:bg-orange-500 text-white font-semibold py-2 w-1/4 rounded-xl transition-all duration-200"
          >
            Изменить
          </button>
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
        title="Вы уверены, что хотите удалить эту ...?"
      />
    </>
  );
};

export default Position;
