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
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";
import { useSession } from "next-auth/react";

const Index = () => {
  const { data: session } = useSession();
  const { bg, isDark, text, border } = useAppTheme();
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
  // permissions
  const canCreateWorkplace = canUserDo(session?.user, "workplace", "create");
  const canReadWorkplace = canUserDo(session?.user, "workplace", "all-read");
  const canDeleteWorkplace = canUserDo(session?.user, "workplace", "delete");

  const {
    data: orgUnits,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { is_root: true, limit: 150 },
    enabled: !!session?.accessToken,
  });

  const { data: childUnits, isLoading: isChildLoading } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, selectedParentCode],
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      unit_code: selectedParentCode,
      limit: 150,
    },
    enabled: !!selectedParentCode && !!session?.accessToken,
  });

  const {
    data: positions,
    isLoading: isLoadingPosition,
    isFetching: isFetchingPosition,
  } = useGetPythonQuery({
    key: [KEYS.positions, createModal],
    url: URLS.positions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      is_active: true,
      limit: 150,
    },
    enabled: !!session?.accessToken,
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
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      limit: 1000,
      unit_code: +selectUnitCode,
    },
    enabled: !!session?.accessToken,
  });

  // Status filter options
  const statusOptions = [
    { value: "all", label: "Все" },
    { value: "vacant", label: "Вакантный" },
    { value: "no_vacant", label: "Невакантный" },
    { value: "active", label: "Активный" },
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
        (item) => get(item, "position.id") === filterPosition,
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
        if (filterStatus === "novacant") {
          return !get(item, "is_vacant");
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
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
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
      },
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
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ workplace_id: id }),
        },
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
      {canReadWorkplace && (
        <div>
          {" "}
          {!selectUnitCode ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white p-4 my-10 rounded-md space-y-2 shadow"
              style={{
                backgroundColor: bg("#ffffff", "#1e1e1e"),
                borderColor: border("#e5e7eb", "#333333"),
              }}
            >
              {isLoading || isFetching ? (
                <ContentLoader />
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  {get(orgUnits, "data", []).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectUnitCode(get(item, "unit_code"))}
                      className="col-span-6 relative min-h-[150px] border p-2  rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      style={{
                        borderColor: border("#e5e7eb", "#333333"),
                      }}
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
                          <Typography variant="h6">
                            {get(item, "name")}
                          </Typography>
                          <Typography variant="h7" sx={{ color: "#C9C9C9" }}>
                            Тип организационные единицы:{" "}
                            {get(item, "unit_code")}
                          </Typography>
                        </div>
                        <div>
                          <span
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: get(item, "is_active")
                                ? isDark
                                  ? "rgba(16, 185, 129, 0.2)"
                                  : "#D1FAE5"
                                : isDark
                                  ? "rgba(239, 68, 68, 0.2)"
                                  : "#FEE2E2",
                              color: get(item, "is_active")
                                ? isDark
                                  ? "#6EE7B7"
                                  : "#065F46"
                                : isDark
                                  ? "#FCA5A5"
                                  : "#991B1B",
                            }}
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
              style={{
                backgroundColor: bg("#ffffff", "#1e1e1e"),
                borderColor: border("#e5e7eb", "#333333"),
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setSelectUnitCode(null)}
                  className={`${
                    isDark
                      ? "bg-gray-600 hover:bg-gray-700"
                      : "bg-gray-200 hover:bg-gray-300"
                  } px-4 py-2 rounded-md  transition-all duration-200 cursor-pointer`}
                >
                  Назад
                </button>
                {canCreateWorkplace && (
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
                )}
              </div>

              {/* Search and Filter Section */}
              <div
                className="bg-gray-50 p-4 rounded-lg space-y-3"
                style={{
                  backgroundColor: bg("#ffffff", "#1e1e1e"),
                  borderColor: border("#e5e7eb", "#333333"),
                }}
              >
                <div className="grid grid-cols-12 gap-3">
                  {/* Search Input */}
                  <div className="col-span-12 md:col-span-6">
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Поиск по отделу или должности..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              sx={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: search && (
                          <InputAdornment position="end">
                            <ClearIcon
                              sx={{
                                color: isDark ? "#9CA3AF" : "#6B7280",
                                cursor: "pointer",
                              }}
                              onClick={() => setSearch("")}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: bg("#ffffff", "#2d2d2d"),
                          borderRadius: "8px",
                          color: text("#1f2937", "#f3f4f6"),
                          "& fieldset": {
                            borderColor: border("#e5e7eb", "#444444"),
                          },
                          "&:hover fieldset": {
                            borderColor: border("#d1d5db", "#555555"),
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#4182F9",
                          },
                        },
                        "& .MuiInputBase-input::placeholder": {
                          color: isDark ? "#9CA3AF" : "#6B7280",
                          opacity: 1,
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
                      sortOptions={false}
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
                        "employee.id",
                      )}`}
                      deleteWorkplace={() => {
                        setDeleteModal(true);
                        setSelect(get(item, "id"));
                      }}
                      id={get(item, "id")}
                      showByRole={canDeleteWorkplace}
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
        </div>
      )}

      {/* create workplace */}
      {createModal && (
        <MethodModal
          open={createModal}
          closeClick={() => {
            setCreateModal(false);
            setSelect(null);
            setSelectedParentCode(null);
            setPositionId(null);
            setOrgUnitsId(null);
          }}
          showCloseIcon={true}
          title={"Создать рабочие место"}
        >
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
              label={"Подразделение"}
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
              required
              returnObject={false}
            />

            {selectedParentCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <CustomSelect
                  label={"Тип позиции"}
                  options={childUnits?.data?.map((unit) => ({
                    label: unit.name,
                    value: unit.id,
                  }))}
                  value={orgUnitsId}
                  isLoading={isChildLoading}
                  onChange={(val) => setOrgUnitsId(val)}
                  placeholder="Выберите тип позицию"
                  isDisabled={!selectedParentCode}
                  required
                />
              </motion.div>
            )}

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
