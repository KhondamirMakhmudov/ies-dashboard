import OrganizationalCard from "@/components/card/organizationType";
import WorkPlaceCard from "@/components/card/workPlace";
import ContentLoader from "@/components/loader";
import MethodModal from "@/components/modal/method-modal";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import usePostPythonQuery from "@/hooks/python/usePostQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { Typography, Button, TextField, InputAdornment } from "@mui/material";
import { motion } from "framer-motion";
import { get } from "lodash";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DeleteModal from "@/components/modal/delete-modal";
import { config } from "@/config";
import CustomSelect from "@/components/select";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const Index = () => {
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectUnitCode, setSelectUnitCode] = useState(null);
  const [select, setSelect] = useState(null);
  const [positionId, setPositionId] = useState(null);
  const [orgUnitsId, setOrgUnitsId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedParentCode, setSelectedParentCode] = useState(null);

  // Filter states
  const [filterPosition, setFilterPosition] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);

  const {
    data: orgUnits,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true, limit: 150 },
  });

  const { data: childUnits, isLoading: isChildLoading } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, selectedParentCode],
    url: URLS.organizationalUnits,
    params: {
      unit_code: selectedParentCode,
      limit: 150,
    },
    enabled: !!selectedParentCode,
  });

  const {
    data: positions,
    isLoading: isLoadingPosition,
    isFetching: isFetchingPosition,
  } = useGetPythonQuery({
    key: KEYS.positions,
    url: URLS.positions,
    params: {
      is_active: true,
      limit: 150,
    },
  });

  const optionsPosition = get(positions, "data", []).map((entry) => ({
    value: entry.id,
    label: entry.name,
  }));

  const {
    data: workplace,
    isLoading: isLoadingWorkplace,
    isFetching: isFetchingWorkplace,
  } = useGetPythonQuery({
    key: [KEYS.workplace, selectUnitCode],
    url: URLS.workplace,
    params: {
      limit: 150,
      unit_code: +selectUnitCode,
    },
  });

  const optionsWorkplace = get(workplace, "data", []).map((item) => ({
    value: item.id,
    label: item.organizational_unit.name,
  }));

  // Status filter options
  const statusOptions = [
    { value: "all", label: "Все" },
    { value: "active", label: "Активный" },
    { value: "vacant", label: "Вакантный" },
    { value: "inactive", label: "Неактивный" },
  ];

  // Filtered and searched workplace data
  const filteredWorkplaceData = useMemo(() => {
    let filtered = get(workplace, "data", []);

    // Search filter (by organizational unit name and position name)
    if (search) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const orgName = get(item, "organizational_unit.name", "").toLowerCase();
        const positionName = get(item, "position.name", "").toLowerCase();
        return (
          orgName.includes(searchLower) || positionName.includes(searchLower)
        );
      });
    }

    // Position filter
    if (filterPosition) {
      filtered = filtered.filter(
        (item) => get(item, "position.id") === filterPosition
      );
    }

    // Status filter
    if (filterStatus && filterStatus !== "all") {
      filtered = filtered.filter((item) => {
        if (filterStatus === "active") {
          return get(item, "is_active") && !get(item, "is_vacant");
        }
        if (filterStatus === "vacant") {
          return get(item, "is_vacant");
        }
        if (filterStatus === "inactive") {
          return !get(item, "is_active");
        }
        return true;
      });
    }

    return filtered;
  }, [workplace, search, filterPosition, filterStatus]);

  const { mutate: createWorkplace } = usePostPythonQuery({
    listKeyId: "create-workplace",
  });

  const onSubmitCreateWorkplace = () => {
    if (!positionId || !orgUnitsId) {
      toast.error("Пожалуйста, заполните все поля", { position: "top-center" });
      return;
    }
    createWorkplace(
      {
        url: URLS.workplace,
        attributes: {
          position_id: positionId,
          organizational_unit_id: orgUnitsId,
        },
      },
      {
        onSuccess: () => {
          toast.success("Рабочее место успешно создано", {
            position: "top-center",
          });
          setCreateModal(false);
          setOrgUnitsId(null);
          setPositionId(null);
          setSelectedParentCode(null);
          queryClient.invalidateQueries(KEYS.workplace);
        },
        onError: (error) => {
          toast.error(`Ошибка: ${error}`, { position: "top-right" });
        },
      }
    );
  };

  const onSubmitDeletePosition = async (id) => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.workplace}${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workplace_id: id }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.workplace);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilterPosition(null);
    setFilterStatus(null);
  };

  if (isLoadingWorkplace || isFetchingWorkplace) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle="Место работы">
      {!selectUnitCode ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-4 my-10 rounded-md space-y-2 shadow"
        >
          {isLoading || isFetching ? (
            <ContentLoader />
          ) : (
            <div className="grid grid-cols-12 gap-4">
              {get(orgUnits, "data", []).map((item, index) => (
                <div
                  key={index}
                  onClick={() => setSelectUnitCode(get(item, "unit_code"))}
                  className="col-span-6 relative min-h-[150px] border p-2 border-gray-200 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="absolute bottom-2 right-2">
                    <Image
                      src={"/images/factory-3.png"}
                      alt="folder"
                      width={90}
                      height={140}
                    />
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="space-y-[5px]">
                      <Typography variant="h6">{get(item, "name")}</Typography>
                      <Typography variant="h7" sx={{ color: "#C9C9C9" }}>
                        Тип организационные единицы: {get(item, "unit_code")}
                      </Typography>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          get(item, "is_active")
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {get(item, "is_active") ? "Активный" : "Неактивный"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-4 my-10 rounded-md space-y-2 shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSelectUnitCode(null)}
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition-all duration-200 cursor-pointer"
            >
              Назад
            </button>
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
          </div>

          {/* Search and Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="col-span-12 md:col-span-6">
                <TextField
                  fullWidth
                  size="small"
                  sx={{ height: "55px" }}
                  placeholder="Поиск по отделу или должности..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                    endAdornment: search && (
                      <InputAdornment position="end">
                        <ClearIcon
                          sx={{ color: "#9CA3AF", cursor: "pointer" }}
                          onClick={() => setSearch("")}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      borderRadius: "8px",
                    },
                  }}
                />
              </div>

              {/* Status Filter */}
              <div className="col-span-12 md:col-span-3">
                <CustomSelect
                  options={statusOptions}
                  value={filterStatus}
                  placeholder="Фильтр по статусу"
                  onChange={(val) => setFilterStatus(val)}
                  returnObject={false}
                  isClearable
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(search || filterPosition || filterStatus) && (
              <div className="flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Очистить все фильтры
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Найдено: {filteredWorkplaceData.length} из{" "}
              {get(workplace, "data", []).length}
            </div>
          </div>

          {/* Workplace List */}
          <div className="my-[30px] space-y-[10px]">
            {filteredWorkplaceData.length > 0 ? (
              filteredWorkplaceData.map((item, index) => (
                <WorkPlaceCard
                  key={index}
                  workplace={get(item, "organizational_unit.name")}
                  unitCode={get(item, "organizational_unit.unit_code")}
                  unitType={get(item, "organizational_unit.unit_type.name")}
                  position={get(item, "position.name")}
                  is_active={get(item, "is_active")}
                  is_vacant={get(item, "is_vacant")}
                  employee={get(item, "employee")}
                  employeeURL={`/dashboard/employees/${get(
                    item,
                    "employee.id"
                  )}`}
                  deleteWorkplace={() => {
                    setDeleteModal(true);
                    setSelect(get(item, "id"));
                  }}
                  id={get(item, "id")}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <Typography variant="body1" sx={{ color: "#9CA3AF" }}>
                  Рабочие места не найдены
                </Typography>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* create workplace */}
      {createModal && (
        <MethodModal
          open={createModal}
          onClose={() => {
            setCreateModal(false);
            setSelect(null);
          }}
        >
          <Typography variant="h6">Создать рабочие место</Typography>

          <div className="my-[30px] space-y-[15px]">
            <CustomSelect
              options={optionsPosition}
              value={positionId}
              placeholder="Выберите позицию"
              onChange={(val) => setPositionId(val)}
              required
              label="Выберите позицию"
              returnObject={false}
            />

            <CustomSelect
              options={get(orgUnits, "data", []).map((unit) => ({
                label: unit.name,
                value: unit.unit_code,
              }))}
              value={selectedParentCode}
              onChange={(val) => {
                setSelectedParentCode(val);
                setOrgUnitsId(null);
              }}
              placeholder="Выберите филиал"
              returnObject={false}
            />

            <CustomSelect
              options={childUnits?.data?.map((unit) => ({
                label: unit.name,
                value: unit.id,
              }))}
              value={orgUnitsId}
              isLoading={isChildLoading}
              onChange={(val) => setOrgUnitsId(val)}
              placeholder="Выберите тип позицию"
              isDisabled={!selectedParentCode}
            />

            <Button
              onClick={onSubmitCreateWorkplace}
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
          </div>
        </MethodModal>
      )}

      {/* delete workplace */}
      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          title="Вы точно хотите удалить это рабочее место?"
          deleting={() => {
            setDeleteModal(false);
            onSubmitDeletePosition(select);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Index;
