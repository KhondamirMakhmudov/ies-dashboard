import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "lodash";
import HiveIcon from "@mui/icons-material/Hive";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DetailsIcon from "@mui/icons-material/Details";
import HexagonIcon from "@mui/icons-material/Hexagon";
import StarIcon from "@mui/icons-material/Star";
import WorkIcon from "@mui/icons-material/Work";
import { Button, IconButton, Checkbox } from "@mui/material";
import { useState } from "react";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import usePostPythonQuery from "@/hooks/python/usePostQuery";
import CustomSelect from "@/components/select";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import usePatchPythonQuery from "@/hooks/python/usePatchQuery";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";
import { config } from "@/config";
import PrimaryButton from "@/components/button/primary-button";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";
import { useSession } from "next-auth/react";
import WorkplaceEmployeeSection from "@/components/card/workPlaceOrgUnit";
import { useRouter } from "next/router";
import SendIcon from "@mui/icons-material/Send";
import TransferWorkplacesModal from "@/components/modal/transfer-workplaces-modal";

const Index = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { bg, isDark, border, text } = useAppTheme();
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [createModalParentId, setCreateModalParentId] = useState(null);
  const [selectEditId, setSelectEditId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [name, setName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitTypeId, setUnitTypeId] = useState(null);
  const [isActive, setIsActive] = useState();
  const [openLevel1Id, setOpenLevel1Id] = useState(null);
  const [openLevel2Id, setOpenLevel2Id] = useState(null);
  const [openLevel3Id, setOpenLevel3Id] = useState(null);
  const [openLevel4Id, setOpenLevel4Id] = useState(null);
  const [openLevel5Id, setOpenLevel5Id] = useState(null);
  const [selectedWorkplaces, setSelectedWorkplaces] = useState([]);
  const [destinationUnitId, setDestinationUnitId] = useState(null);
  const [sourceUnitId, setSourceUnitId] = useState(null);

  const canCreateOrgUnit = canUserDo(
    session?.user,
    "organizational-unit",
    "create",
  );

  const canUpdateOrgUnit = canUserDo(
    session?.user,
    "organizational-unit",
    "update",
  );

  const canReadOrgUnit = canUserDo(
    session?.user,
    "organizational-unit",
    "all-read",
  );

  const canDeleteOrgUnit = canUserDo(
    session?.user,
    "organizational-unit",
    "delete",
  );

  // LEVEL 1 - Asosiy bo'limlar
  const { data: level1List } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { is_root: true, limit: 150 },
    enabled: !!session?.accessToken && canReadOrgUnit,
  });

  // LEVEL 2 - Level 1 child
  const { data: level2List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel1Id],
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { parent_id: openLevel1Id, limit: 150 },
    enabled: !!openLevel1Id && !!session?.accessToken,
  });

  // LEVEL 3 - Level 2 child
  const { data: level3List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel2Id],
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    enabled: !!openLevel2Id && !!session?.accessToken,
    params: { parent_id: openLevel2Id, limit: 150 },
  });

  // LEVEL 4 - Level 3 child
  const { data: level4List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel3Id],
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    enabled: !!openLevel3Id && !!session?.accessToken,
    params: { parent_id: openLevel3Id, limit: 150 },
  });

  const { data: level5List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel4Id],
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    enabled: !!openLevel4Id && !!session?.accessToken,
    params: { parent_id: openLevel4Id, limit: 150 },
  });

  const {
    data: unitType,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.unitTypes,
    url: URLS.unitTypes,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: {
      is_active: true,
      limit: 100,
    },
    enabled: !!session?.accessToken,
  });

  const optionsUnitType = get(unitType, "data", []).map((unit) => ({
    value: unit.id,
    label: unit.name,
  }));

  // create organization
  const { mutate: createOrg } = usePostPythonQuery({
    listKeyId: "create-org",
  });

  const onSubmitCreateOrg = () => {
    createOrg(
      {
        url: URLS.organizationalUnits,
        attributes: {
          name: name,
          unit_code: createModalParentId === null ? unitCode : null,
          is_active: isActive,
          unit_type_id: unitTypeId,
          parent_id: createModalParentId,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Раздел успешно создан.", {
            position: "top-center",
          });
          setCreateModal(false);
          setUnitTypeId(null);
          setUnitCode("");
          setName("");
          setCreateModalParentId(null);
          queryClient.invalidateQueries(KEYS.organizationalUnits);
        },
        onError: (error) => {
          toast.error(`Xatolik: ${error}`, { position: "top-right" });
        },
      },
    );
  };

  // edit organization
  const { mutate: editOrg } = usePatchPythonQuery({
    listKeyId: "edit-org",
    hideSuccessToast: true,
  });

  const onSubmitEditOrg = (id) => {
    editOrg(
      {
        url: `${URLS.organizationalUnits}${id}`,
        attributes: {
          name: name,
          // unit_code: unitCode,
          // is_active: isActive,
          // unit_type_id: unitTypeId,
          // parent_id: createModalParentId,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Раздел успешно отредактирован.", {
            position: "top-center",
          });
          setEditModal(false);
          setUnitTypeId(null);
          setUnitCode("");
          setName("");
          setCreateModalParentId(null);
          queryClient.invalidateQueries(KEYS.organizationalUnits);
        },
        onError: (error) => {
          toast.error(`Xatolik: ${error}`, { position: "top-right" });
        },
      },
    );
  };

  // delete organization

  const onSubmitDeleteOrg = async (id) => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.organizationalUnits}${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ organizational_unit_id: id }),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      queryClient.invalidateQueries(KEYS.organizationalUnits);
      setDeleteModal(false);
      console.log("Deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  // Transfer workplaces between units
  const onToggleWorkplaceSelection = (workplaceId) => {
    setSelectedWorkplaces((prev) =>
      prev.includes(workplaceId)
        ? prev.filter((id) => id !== workplaceId)
        : [...prev, workplaceId],
    );
  };

  const onOpenTransferModal = (unitId) => {
    setSourceUnitId(unitId);
    setDestinationUnitId(null);
    setSelectedWorkplaces([]);
    setTransferModal(true);
  };

  const onSubmitTransferWorkplaces = async () => {
    if (!destinationUnitId) {
      toast.error("Выберите целевую единицу", { position: "top-center" });
      return;
    }

    if (selectedWorkplaces.length === 0) {
      toast.error("Выберите рабочие места", { position: "top-center" });
      return;
    }

    try {
      const response = await fetch(
        `${config.GENERAL_AUTH_URL}/staffio/api/v2/workplaces:bulk-update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            workplaceIds: selectedWorkplaces,
            organizationalUnitId: destinationUnitId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при переводе рабочих мест");
      }

      toast.success(
        `${selectedWorkplaces.length} рабочих мест успешно перемещено`,
        {
          position: "top-center",
        },
      );
      setTransferModal(false);
      setSelectedWorkplaces([]);
      setSourceUnitId(null);
      setDestinationUnitId(null);
      queryClient.invalidateQueries(KEYS.organizationalUnits);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка при перемещении рабочих мест");
    }
  };

  // Helper function to collect all org units for destination select
  const collectAllUnits = (units, collected = []) => {
    if (!units) return collected;
    units.forEach((unit) => {
      if (unit.id !== sourceUnitId) {
        collected.push(unit);
      }
      if (unit.children && unit.children.length > 0) {
        collectAllUnits(unit.children, collected);
      }
    });
    return collected;
  };

  // Helper to get source unit name for display
  const getSourceUnitName = () => {
    if (!sourceUnitId) return "";
    const allUnits = collectAllUnits(get(level1List, "data", []), []);
    const sourceUnit = allUnits.find((u) => u.id === sourceUnitId);
    return sourceUnit?.name || "";
  };

  return (
    <DashboardLayout headerTitle="Руководства управлении">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="p-4 my-10 rounded-md space-y-2 shadow"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <div className="mb-[20px] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {canCreateOrgUnit && (
            <PrimaryButton
              onClick={() => {
                setCreateModal(true);
                setCreateModalParentId(null);
              }}
            >
              Создать
            </PrimaryButton>
          )}
          {selectedWorkplaces.length > 0 && sourceUnitId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full sm:w-auto ml-0 sm:ml-auto"
            >
              <div
                className="flex flex-col sm:flex-row gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-4 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg"
                style={{
                  borderColor: border("#bfdbfe", "#1e40af"),
                  backgroundColor: bg(
                    "linear-gradient(to right, rgb(239, 246, 255), rgb(239, 245, 254))",
                    "linear-gradient(to right, rgba(30, 58, 138, 0.2), rgba(49, 46, 129, 0.2))",
                  ),
                }}
              >
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex-shrink-0"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#1E5EFF" }}
                      ></div>
                    </motion.div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                      Готово к переводу
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Источник:
                      </span>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-200 bg-white dark:bg-blue-900/50 px-3 py-1 rounded-full border border-blue-300 dark:border-blue-600">
                        {getSourceUnitName()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Выбрано рабочих мест:
                      </span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-200 bg-blue-200 dark:bg-blue-700 px-3 py-1 rounded-full">
                        {selectedWorkplaces.length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SendIcon />}
                    onClick={() => onOpenTransferModal(sourceUnitId)}
                    sx={{
                      backgroundColor: "#10b981",
                      textTransform: "none",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      "&:hover": {
                        backgroundColor: "#059669",
                      },
                    }}
                  >
                    Переместить
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedWorkplaces([]);
                      setSourceUnitId(null);
                    }}
                    sx={{
                      textTransform: "none",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 600,
                      fontSize: "14px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      borderColor: border("#d1d5db", "#4b5563"),
                      color: text("#374151", "#d1d5db"),
                      "&:hover": {
                        backgroundColor: bg("#f3f4f6", "#374151"),
                      },
                    }}
                  >
                    Отменить
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {canReadOrgUnit &&
          get(level1List, "data", []).map((level1) => {
            const isLevel1Open = openLevel1Id === level1.id;

            return (
              <div key={level1.id}>
                {/* LEVEL 1 */}
                <div
                  onClick={() => {
                    setOpenLevel1Id(isLevel1Open ? null : level1.id);
                    setOpenLevel2Id(null);
                    setOpenLevel3Id(null);
                  }}
                  className={`p-4 border rounded ${isLevel1Open ? "bg-blue-50" : ""} ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} cursor-pointer flex justify-between items-center transition-colors duration-100`}
                  style={{
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
                >
                  <div className="flex gap-3 items-center">
                    <AccountTreeIcon
                      sx={{
                        background: "#ECF2FF",
                        color: "#1E5EFF",
                        padding: "8px",
                        width: "35px",
                        height: "35px",
                        borderRadius: "100%",
                      }}
                    />
                    <div>
                      <h4 className="text-lg font-semibold">{level1.name}</h4>
                      {level1.workplace && level1.workplace.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <WorkIcon sx={{ fontSize: 14, color: "#1E5EFF" }} />
                          <span className="text-xs text-gray-600">
                            {level1.workplace.length} рабочих мест
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {canCreateOrgUnit && (
                      <IconButton
                        onClick={() => {
                          setCreateModal(true);
                          setCreateModalParentId(level1.id);
                        }}
                        className="text-blue-600 text-sm hover:underline normal-case"
                      >
                        <AddCircleIcon
                          sx={{
                            background: "#ECF2FF",
                            color: "#1E5EFF",
                            padding: "4px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "100%",
                          }}
                        />
                      </IconButton>
                    )}

                    {canUpdateOrgUnit && (
                      <IconButton
                        onClick={() => {
                          setEditModal(true);
                          setSelectEditId(level1.id);
                          setName(level1.name);
                          setUnitCode(level1.unit_code);
                        }}
                        className="text-blue-600 text-sm hover:underline normal-case"
                      >
                        <EditIcon
                          sx={{
                            background: "#ECF2FF",
                            color: "#1E5EFF",
                            padding: "4px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "100%",
                          }}
                        />
                      </IconButton>
                    )}

                    {canDeleteOrgUnit && (
                      <IconButton
                        onClick={() => {
                          setDeleteModal(true);
                          setSelectEditId(level1.id);
                        }}
                        className="text-blue-600 text-sm hover:underline normal-case"
                      >
                        <DeleteIcon
                          sx={{
                            background: "#ECF2FF",
                            color: "#1E5EFF",
                            padding: "4px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "100%",
                          }}
                        />
                      </IconButton>
                    )}
                    {canReadOrgUnit && level1.unit_code && (
                      <IconButton
                        title="Открыть иерархию"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/dashboard/structure-organizations/management-organizations/${encodeURIComponent(level1.unit_code)}`,
                          );
                        }}
                      >
                        <VisibilityIcon
                          sx={{
                            background: "#E6F4EA",
                            color: "#2e7d32",
                            padding: "4px",
                            width: "30px",
                            height: "30px",
                            borderRadius: "100%",
                          }}
                        />
                      </IconButton>
                    )}
                    {isLevel1Open ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </div>
                </div>

                {/* LEVEL 1 WORKPLACE/EMPLOYEE */}
                <AnimatePresence>
                  {isLevel1Open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6"
                    >
                      <WorkplaceEmployeeSection
                        workplace={level1.workplace}
                        levelColor="#1E5EFF"
                        selectedWorkplaces={selectedWorkplaces}
                        onToggleWorkplace={(id) => {
                          setSourceUnitId(level1.id);
                          onToggleWorkplaceSelection(id);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* LEVEL 2 */}
                <AnimatePresence>
                  {isLevel1Open && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-2 space-y-2 rounded"
                    >
                      {get(level2List, "data", []).length > 0 ? (
                        get(level2List, "data", []).map((level2) => {
                          const isLevel2Open = openLevel2Id === level2.id;

                          return (
                            <div key={level2.id}>
                              <div
                                onClick={() => {
                                  setOpenLevel2Id(
                                    isLevel2Open ? null : level2.id,
                                  );
                                  setOpenLevel3Id(null);
                                }}
                                className="p-3 bg-white rounded hover:bg-gray-50 flex border border-gray-200 justify-between items-center cursor-pointer"
                                style={{
                                  backgroundColor: bg("#ffffff", "#1e1e1e"),
                                  borderColor: border("#e5e7eb", "#333333"),
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <HiveIcon
                                    sx={{
                                      background: "#FFF4C9",
                                      color: "#FFC700",
                                      padding: "4px",
                                      width: "30px",
                                      height: "30px",
                                      borderRadius: "100%",
                                    }}
                                  />
                                  <div>
                                    <span>{level2.name}</span>
                                    {level2.workplace &&
                                      level2.workplace.length > 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <WorkIcon
                                            sx={{
                                              fontSize: 12,
                                              color: "#FFC700",
                                            }}
                                          />
                                          <span className="text-xs text-gray-600">
                                            {level2.workplace.length} рабочих
                                            мест
                                          </span>
                                        </div>
                                      )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {canCreateOrgUnit && (
                                    <IconButton
                                      onClick={() => {
                                        setCreateModal(true);
                                        setCreateModalParentId(level2.id);
                                      }}
                                      className="text-blue-600 text-sm hover:underline normal-case"
                                    >
                                      <AddCircleIcon
                                        sx={{
                                          background: "#FFF4C9",
                                          color: "#FFC700",
                                          padding: "4px",
                                          width: "30px",
                                          height: "30px",
                                          borderRadius: "100%",
                                        }}
                                      />
                                    </IconButton>
                                  )}
                                  {canUpdateOrgUnit && (
                                    <IconButton
                                      onClick={() => {
                                        setEditModal(true);
                                        setSelectEditId(level2.id);
                                        setName(level2.name);
                                        setUnitCode(level2.unit_code);
                                      }}
                                      className="text-blue-600 text-sm hover:underline normal-case"
                                    >
                                      <EditIcon
                                        sx={{
                                          background: "#FFF4C9",
                                          color: "#FFC700",
                                          padding: "4px",
                                          width: "30px",
                                          height: "30px",
                                          borderRadius: "100%",
                                        }}
                                      />
                                    </IconButton>
                                  )}
                                  {canDeleteOrgUnit && (
                                    <IconButton
                                      onClick={() => {
                                        setDeleteModal(true);
                                        setSelectEditId(level2.id);
                                      }}
                                      className="text-blue-600 text-sm hover:underline normal-case"
                                    >
                                      <DeleteIcon
                                        sx={{
                                          background: "#FFF4C9",
                                          color: "#FFC700",
                                          padding: "4px",
                                          width: "30px",
                                          height: "30px",
                                          borderRadius: "100%",
                                        }}
                                      />
                                    </IconButton>
                                  )}
                                  {canReadOrgUnit && level2.unit_code && (
                                    <IconButton
                                      title="Открыть иерархию"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/dashboard/structure-organizations/management-organizations/${encodeURIComponent(level2.unit_code)}`,
                                        );
                                      }}
                                    >
                                      <VisibilityIcon
                                        sx={{
                                          background: "#E6F4EA",
                                          color: "#2e7d32",
                                          padding: "4px",
                                          width: "30px",
                                          height: "30px",
                                          borderRadius: "100%",
                                        }}
                                      />
                                    </IconButton>
                                  )}
                                  {isLevel2Open ? (
                                    <KeyboardArrowUpIcon />
                                  ) : (
                                    <KeyboardArrowDownIcon />
                                  )}
                                </div>
                              </div>

                              {/* LEVEL 2 WORKPLACE/EMPLOYEE */}
                              <AnimatePresence>
                                {isLevel2Open && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-6"
                                  >
                                    <WorkplaceEmployeeSection
                                      workplace={level2.workplace}
                                      levelColor="#FFC700"
                                      selectedWorkplaces={selectedWorkplaces}
                                      onToggleWorkplace={(id) => {
                                        setSourceUnitId(level2.id);
                                        onToggleWorkplaceSelection(id);
                                      }}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* LEVEL 3 */}
                              <AnimatePresence>
                                {isLevel2Open && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-6 my-2 space-y-2 mr-3"
                                  >
                                    {get(level3List, "data", []).length > 0 ? (
                                      get(level3List, "data", []).map(
                                        (level3) => {
                                          const isLevel3Open =
                                            openLevel3Id === level3.id;

                                          return (
                                            <div key={level3.id}>
                                              <div
                                                onClick={() =>
                                                  setOpenLevel3Id(
                                                    isLevel3Open
                                                      ? null
                                                      : level3.id,
                                                  )
                                                }
                                                className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded flex justify-between items-center cursor-pointer"
                                                style={{
                                                  backgroundColor: bg(
                                                    "#ffffff",
                                                    "#1e1e1e",
                                                  ),
                                                  borderColor: border(
                                                    "#e5e7eb",
                                                    "#333333",
                                                  ),
                                                }}
                                              >
                                                <div className="flex items-center gap-3">
                                                  <DetailsIcon
                                                    sx={{
                                                      background: "#C4F8E2",
                                                      color: "#1FD286",
                                                      padding: "4px",
                                                      width: "30px",
                                                      height: "30px",
                                                      borderRadius: "100%",
                                                    }}
                                                  />
                                                  <div>
                                                    <span>{level3.name}</span>
                                                    {level3.workplace &&
                                                      level3.workplace.length >
                                                        0 && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                          <WorkIcon
                                                            sx={{
                                                              fontSize: 12,
                                                              color: "#1FD286",
                                                            }}
                                                          />
                                                          <span className="text-xs text-gray-600">
                                                            {
                                                              level3.workplace
                                                                .length
                                                            }{" "}
                                                            рабочих мест
                                                          </span>
                                                        </div>
                                                      )}
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  {/* Action buttons for Level 3 */}
                                                  {canCreateOrgUnit && (
                                                    <IconButton
                                                      onClick={() => {
                                                        setCreateModal(true);
                                                        setCreateModalParentId(
                                                          level3.id,
                                                        );
                                                      }}
                                                    >
                                                      <AddCircleIcon
                                                        sx={{
                                                          background: "#C4F8E2",
                                                          color: "#1FD286",
                                                          padding: "4px",
                                                          width: "30px",
                                                          height: "30px",
                                                          borderRadius: "100%",
                                                        }}
                                                      />
                                                    </IconButton>
                                                  )}
                                                  {canUpdateOrgUnit && (
                                                    <IconButton
                                                      onClick={() => {
                                                        setEditModal(true);
                                                        setSelectEditId(
                                                          level3.id,
                                                        );
                                                        setName(level3.name);
                                                        setUnitCode(
                                                          level3.unit_code,
                                                        );
                                                      }}
                                                    >
                                                      <EditIcon
                                                        sx={{
                                                          background: "#C4F8E2",
                                                          color: "#1FD286",
                                                          padding: "4px",
                                                          width: "30px",
                                                          height: "30px",
                                                          borderRadius: "100%",
                                                        }}
                                                      />
                                                    </IconButton>
                                                  )}
                                                  {canDeleteOrgUnit && (
                                                    <IconButton
                                                      onClick={() => {
                                                        setDeleteModal(true);
                                                        setSelectEditId(
                                                          level3.id,
                                                        );
                                                      }}
                                                    >
                                                      <DeleteIcon
                                                        sx={{
                                                          background: "#C4F8E2",
                                                          color: "#1FD286",
                                                          padding: "4px",
                                                          width: "30px",
                                                          height: "30px",
                                                          borderRadius: "100%",
                                                        }}
                                                      />
                                                    </IconButton>
                                                  )}
                                                  {isLevel3Open ? (
                                                    <KeyboardArrowUpIcon />
                                                  ) : (
                                                    <KeyboardArrowDownIcon />
                                                  )}
                                                </div>
                                              </div>

                                              {/* LEVEL 3 WORKPLACE/EMPLOYEE */}
                                              <AnimatePresence>
                                                {isLevel3Open && (
                                                  <motion.div
                                                    initial={{
                                                      opacity: 0,
                                                      height: 0,
                                                    }}
                                                    animate={{
                                                      opacity: 1,
                                                      height: "auto",
                                                    }}
                                                    exit={{
                                                      opacity: 0,
                                                      height: 0,
                                                    }}
                                                    className="ml-6"
                                                  >
                                                    <WorkplaceEmployeeSection
                                                      workplace={
                                                        level3.workplace
                                                      }
                                                      levelColor="#1FD286"
                                                      selectedWorkplaces={
                                                        selectedWorkplaces
                                                      }
                                                      onToggleWorkplace={(
                                                        id,
                                                      ) => {
                                                        setSourceUnitId(
                                                          level3.id,
                                                        );
                                                        onToggleWorkplaceSelection(
                                                          id,
                                                        );
                                                      }}
                                                    />
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>

                                              {/* LEVEL 4 */}
                                              <AnimatePresence>
                                                {isLevel3Open && (
                                                  <motion.div
                                                    initial={{
                                                      opacity: 0,
                                                      height: 0,
                                                    }}
                                                    animate={{
                                                      opacity: 1,
                                                      height: "auto",
                                                    }}
                                                    exit={{
                                                      opacity: 0,
                                                      height: 0,
                                                    }}
                                                    className="ml-6 my-2 space-y-2"
                                                  >
                                                    {get(level4List, "data", [])
                                                      .length > 0 ? (
                                                      get(
                                                        level4List,
                                                        "data",
                                                        [],
                                                      ).map((level4) => {
                                                        const isLevel4Open =
                                                          openLevel4Id ===
                                                          level4.id;

                                                        return (
                                                          <div key={level4.id}>
                                                            <div
                                                              onClick={() =>
                                                                setOpenLevel4Id(
                                                                  isLevel4Open
                                                                    ? null
                                                                    : level4.id,
                                                                )
                                                              }
                                                              className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded flex justify-between items-center cursor-pointer"
                                                              style={{
                                                                backgroundColor:
                                                                  bg(
                                                                    "#ffffff",
                                                                    "#1e1e1e",
                                                                  ),
                                                                borderColor:
                                                                  border(
                                                                    "#e5e7eb",
                                                                    "#333333",
                                                                  ),
                                                              }}
                                                            >
                                                              <div className="flex items-center gap-3">
                                                                <HexagonIcon
                                                                  sx={{
                                                                    background:
                                                                      "#E0C8FF",
                                                                    color:
                                                                      "#8A2BE2",
                                                                    padding:
                                                                      "4px",
                                                                    width:
                                                                      "30px",
                                                                    height:
                                                                      "30px",
                                                                    borderRadius:
                                                                      "100%",
                                                                  }}
                                                                />
                                                                <div>
                                                                  <span>
                                                                    {
                                                                      level4.name
                                                                    }
                                                                  </span>
                                                                  {level4.workplace &&
                                                                    level4
                                                                      .workplace
                                                                      .length >
                                                                      0 && (
                                                                      <div className="flex items-center gap-2 mt-1">
                                                                        <WorkIcon
                                                                          sx={{
                                                                            fontSize: 12,
                                                                            color:
                                                                              "#8A2BE2",
                                                                          }}
                                                                        />
                                                                        <span className="text-xs text-gray-600">
                                                                          {
                                                                            level4
                                                                              .workplace
                                                                              .length
                                                                          }{" "}
                                                                          рабочих
                                                                          мест
                                                                        </span>
                                                                      </div>
                                                                    )}
                                                                </div>
                                                              </div>
                                                              <div className="flex items-center gap-1">
                                                                {canCreateOrgUnit && (
                                                                  <IconButton
                                                                    onClick={() => {
                                                                      setCreateModal(
                                                                        true,
                                                                      );
                                                                      setCreateModalParentId(
                                                                        level4.id,
                                                                      );
                                                                    }}
                                                                  >
                                                                    <AddCircleIcon
                                                                      sx={{
                                                                        background:
                                                                          "#E0C8FF",
                                                                        color:
                                                                          "#8A2BE2",
                                                                        padding:
                                                                          "4px",
                                                                        width:
                                                                          "30px",
                                                                        height:
                                                                          "30px",
                                                                        borderRadius:
                                                                          "100%",
                                                                      }}
                                                                    />
                                                                  </IconButton>
                                                                )}
                                                                {canUpdateOrgUnit && (
                                                                  <IconButton
                                                                    onClick={() => {
                                                                      setEditModal(
                                                                        true,
                                                                      );
                                                                      setSelectEditId(
                                                                        level4.id,
                                                                      );
                                                                      setName(
                                                                        level4.name,
                                                                      );
                                                                      setUnitCode(
                                                                        level4.unit_code,
                                                                      );
                                                                    }}
                                                                  >
                                                                    <EditIcon
                                                                      sx={{
                                                                        background:
                                                                          "#E0C8FF",
                                                                        color:
                                                                          "#8A2BE2",
                                                                        padding:
                                                                          "4px",
                                                                        width:
                                                                          "30px",
                                                                        height:
                                                                          "30px",
                                                                        borderRadius:
                                                                          "100%",
                                                                      }}
                                                                    />
                                                                  </IconButton>
                                                                )}
                                                                {canDeleteOrgUnit && (
                                                                  <IconButton
                                                                    onClick={() => {
                                                                      setDeleteModal(
                                                                        true,
                                                                      );
                                                                      setSelectEditId(
                                                                        level4.id,
                                                                      );
                                                                    }}
                                                                  >
                                                                    <DeleteIcon
                                                                      sx={{
                                                                        background:
                                                                          "#E0C8FF",
                                                                        color:
                                                                          "#8A2BE2",
                                                                        padding:
                                                                          "4px",
                                                                        width:
                                                                          "30px",
                                                                        height:
                                                                          "30px",
                                                                        borderRadius:
                                                                          "100%",
                                                                      }}
                                                                    />
                                                                  </IconButton>
                                                                )}
                                                                {isLevel4Open ? (
                                                                  <KeyboardArrowUpIcon />
                                                                ) : (
                                                                  <KeyboardArrowDownIcon />
                                                                )}
                                                              </div>
                                                            </div>

                                                            {/* LEVEL 4 WORKPLACE/EMPLOYEE */}
                                                            <AnimatePresence>
                                                              {isLevel4Open && (
                                                                <motion.div
                                                                  initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                  }}
                                                                  animate={{
                                                                    opacity: 1,
                                                                    height:
                                                                      "auto",
                                                                  }}
                                                                  exit={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                  }}
                                                                  className="ml-6"
                                                                >
                                                                  <WorkplaceEmployeeSection
                                                                    workplace={
                                                                      level4.workplace
                                                                    }
                                                                    levelColor="#8A2BE2"
                                                                    selectedWorkplaces={
                                                                      selectedWorkplaces
                                                                    }
                                                                    onToggleWorkplace={(
                                                                      id,
                                                                    ) => {
                                                                      setSourceUnitId(
                                                                        level4.id,
                                                                      );
                                                                      onToggleWorkplaceSelection(
                                                                        id,
                                                                      );
                                                                    }}
                                                                  />
                                                                </motion.div>
                                                              )}
                                                            </AnimatePresence>

                                                            {/* LEVEL 5 */}
                                                            <AnimatePresence>
                                                              {isLevel4Open && (
                                                                <motion.div
                                                                  initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                  }}
                                                                  animate={{
                                                                    opacity: 1,
                                                                    height:
                                                                      "auto",
                                                                  }}
                                                                  exit={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                  }}
                                                                  className="ml-6 my-2 space-y-2"
                                                                >
                                                                  {get(
                                                                    level5List,
                                                                    "data",
                                                                    [],
                                                                  ).length >
                                                                  0 ? (
                                                                    get(
                                                                      level5List,
                                                                      "data",
                                                                      [],
                                                                    ).map(
                                                                      (
                                                                        level5,
                                                                      ) => {
                                                                        const isLevel5Open =
                                                                          openLevel5Id ===
                                                                          level5.id;

                                                                        return (
                                                                          <div
                                                                            key={
                                                                              level5.id
                                                                            }
                                                                          >
                                                                            <div
                                                                              onClick={() =>
                                                                                setOpenLevel5Id(
                                                                                  isLevel5Open
                                                                                    ? null
                                                                                    : level5.id,
                                                                                )
                                                                              }
                                                                              className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded flex justify-between items-center cursor-pointer"
                                                                              style={{
                                                                                backgroundColor:
                                                                                  bg(
                                                                                    "#ffffff",
                                                                                    "#1e1e1e",
                                                                                  ),
                                                                                borderColor:
                                                                                  border(
                                                                                    "#e5e7eb",
                                                                                    "#333333",
                                                                                  ),
                                                                              }}
                                                                            >
                                                                              <div className="flex items-center gap-3">
                                                                                <StarIcon
                                                                                  sx={{
                                                                                    background:
                                                                                      "#FFC8C8",
                                                                                    color:
                                                                                      "#FF4D4D",
                                                                                    padding:
                                                                                      "4px",
                                                                                    width:
                                                                                      "30px",
                                                                                    height:
                                                                                      "30px",
                                                                                    borderRadius:
                                                                                      "100%",
                                                                                  }}
                                                                                />
                                                                                <div>
                                                                                  <span>
                                                                                    {
                                                                                      level5.name
                                                                                    }
                                                                                  </span>
                                                                                  {level5.workplace &&
                                                                                    level5
                                                                                      .workplace
                                                                                      .length >
                                                                                      0 && (
                                                                                      <div className="flex items-center gap-2 mt-1">
                                                                                        <WorkIcon
                                                                                          sx={{
                                                                                            fontSize: 12,
                                                                                            color:
                                                                                              "#FF4D4D",
                                                                                          }}
                                                                                        />
                                                                                        <span className="text-xs text-gray-600">
                                                                                          {
                                                                                            level5
                                                                                              .workplace
                                                                                              .length
                                                                                          }{" "}
                                                                                          рабочих
                                                                                          мест
                                                                                        </span>
                                                                                      </div>
                                                                                    )}
                                                                                </div>
                                                                              </div>
                                                                              <div className="flex items-center gap-1">
                                                                                {canCreateOrgUnit && (
                                                                                  <IconButton
                                                                                    onClick={() => {
                                                                                      setCreateModal(
                                                                                        true,
                                                                                      );
                                                                                      setCreateModalParentId(
                                                                                        level5.id,
                                                                                      );
                                                                                    }}
                                                                                  >
                                                                                    <AddCircleIcon
                                                                                      sx={{
                                                                                        background:
                                                                                          "#FFC8C8",
                                                                                        color:
                                                                                          "#FF4D4D",
                                                                                        padding:
                                                                                          "4px",
                                                                                        width:
                                                                                          "30px",
                                                                                        height:
                                                                                          "30px",
                                                                                        borderRadius:
                                                                                          "100%",
                                                                                      }}
                                                                                    />
                                                                                  </IconButton>
                                                                                )}
                                                                                {canUpdateOrgUnit && (
                                                                                  <IconButton
                                                                                    onClick={() => {
                                                                                      setEditModal(
                                                                                        true,
                                                                                      );
                                                                                      setSelectEditId(
                                                                                        level5.id,
                                                                                      );
                                                                                      setName(
                                                                                        level5.name,
                                                                                      );
                                                                                      setUnitCode(
                                                                                        level5.unit_code,
                                                                                      );
                                                                                    }}
                                                                                  >
                                                                                    <EditIcon
                                                                                      sx={{
                                                                                        background:
                                                                                          "#FFC8C8",
                                                                                        color:
                                                                                          "#FF4D4D",
                                                                                        padding:
                                                                                          "4px",
                                                                                        width:
                                                                                          "30px",
                                                                                        height:
                                                                                          "30px",
                                                                                        borderRadius:
                                                                                          "100%",
                                                                                      }}
                                                                                    />
                                                                                  </IconButton>
                                                                                )}
                                                                                {canDeleteOrgUnit && (
                                                                                  <IconButton
                                                                                    onClick={() => {
                                                                                      setDeleteModal(
                                                                                        true,
                                                                                      );
                                                                                      setSelectEditId(
                                                                                        level5.id,
                                                                                      );
                                                                                    }}
                                                                                  >
                                                                                    <DeleteIcon
                                                                                      sx={{
                                                                                        background:
                                                                                          "#FFC8C8",
                                                                                        color:
                                                                                          "#FF4D4D",
                                                                                        padding:
                                                                                          "4px",
                                                                                        width:
                                                                                          "30px",
                                                                                        height:
                                                                                          "30px",
                                                                                        borderRadius:
                                                                                          "100%",
                                                                                      }}
                                                                                    />
                                                                                  </IconButton>
                                                                                )}
                                                                                {isLevel5Open ? (
                                                                                  <KeyboardArrowUpIcon />
                                                                                ) : (
                                                                                  <KeyboardArrowDownIcon />
                                                                                )}
                                                                              </div>
                                                                            </div>

                                                                            {/* LEVEL 5 WORKPLACE/EMPLOYEE */}
                                                                            <AnimatePresence>
                                                                              {isLevel5Open && (
                                                                                <motion.div
                                                                                  initial={{
                                                                                    opacity: 0,
                                                                                    height: 0,
                                                                                  }}
                                                                                  animate={{
                                                                                    opacity: 1,
                                                                                    height:
                                                                                      "auto",
                                                                                  }}
                                                                                  exit={{
                                                                                    opacity: 0,
                                                                                    height: 0,
                                                                                  }}
                                                                                  className="ml-6"
                                                                                >
                                                                                  <WorkplaceEmployeeSection
                                                                                    workplace={
                                                                                      level5.workplace
                                                                                    }
                                                                                    levelColor="#FF4D4D"
                                                                                    selectedWorkplaces={
                                                                                      selectedWorkplaces
                                                                                    }
                                                                                    onToggleWorkplace={(
                                                                                      id,
                                                                                    ) => {
                                                                                      setSourceUnitId(
                                                                                        level5.id,
                                                                                      );
                                                                                      onToggleWorkplaceSelection(
                                                                                        id,
                                                                                      );
                                                                                    }}
                                                                                  />
                                                                                </motion.div>
                                                                              )}
                                                                            </AnimatePresence>
                                                                          </div>
                                                                        );
                                                                      },
                                                                    )
                                                                  ) : (
                                                                    <div className="text-gray-400 italic text-sm">
                                                                      Разделы
                                                                      отсутствуют
                                                                    </div>
                                                                  )}
                                                                </motion.div>
                                                              )}
                                                            </AnimatePresence>
                                                          </div>
                                                        );
                                                      })
                                                    ) : (
                                                      <div className="text-gray-400 italic text-base">
                                                        Разделы отсутствуют
                                                      </div>
                                                    )}
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          );
                                        },
                                      )
                                    ) : (
                                      <div className="text-gray-400 text-sm italic">
                                        Разделы отсутствуют
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 italic text-base">
                          Разделы отсутствуют
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

        {/* create modal */}
        {createModal && (
          <MethodModal
            open={createModal}
            showCloseIcon={true}
            title={"Создать структурное дерево управления"}
            closeClick={() => {
              setName("");
              setCreateModal(false);
              setUnitCode("");
              setUnitTypeId(null);
              setIsActive();
            }}
          >
            <div className="space-y-[15px] my-[30px]">
              <Input
                type={"text"}
                label={"Имя"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={"Введите название или имя"}
                inputClass="!h-[45px] border !border-[#C9C9C9]"
                required
              />

              {createModalParentId === null && (
                <Input
                  type={"text"}
                  label={"Код единицы"}
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  required
                  inputClass="!h-[43px] border !border-[#C9C9C9]"
                  placeholder={
                    "Укажите уникальный код для новой организационной единицы"
                  }
                />
              )}

              <CustomSelect
                options={optionsUnitType}
                value={unitTypeId}
                label={"Тип единицы"}
                onChange={(val) => setUnitTypeId(val)}
                placeholder={"Выберите тип единицы"}
                returnObject={false}
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

              <Button
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
                  marginTop: "15px",
                }}
                variant="contained"
                onClick={onSubmitCreateOrg}
                type="submit"
              >
                Создать
              </Button>
            </div>
          </MethodModal>
        )}
        {/* edit modal */}
        {editModal && (
          <MethodModal
            open={editModal}
            showCloseIcon={true}
            title={"Изменить структурное дерево управления"}
            closeClick={() => {
              setName("");
              setEditModal(false);
              setUnitCode("");
              setUnitTypeId(null);
              setIsActive();
            }}
          >
            <div className="space-y-[15px] my-[30px]">
              <Input
                type={"text"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={"Имя"}
                inputClass="!h-[45px] border !border-[#C9C9C9]"
                required
              />

              <Button
                sx={{
                  textTransform: "initial",
                  fontFamily: "DM Sans, sans-serif",
                  backgroundColor: "#F07427",
                  boxShadow: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  fontSize: "14px",
                  minWidth: "100px",
                  borderRadius: "8px",
                  marginTop: "15px",
                }}
                variant="contained"
                onClick={() => onSubmitEditOrg(selectEditId)}
                type="submit"
              >
                Изменить
              </Button>
            </div>
          </MethodModal>
        )}
        {/* transfer modal */}
        {transferModal && (
          <TransferWorkplacesModal
            open={transferModal}
            onClose={() => {
              setTransferModal(false);
              setDestinationUnitId(null);
              setSelectedWorkplaces([]);
              setSourceUnitId(null);
            }}
            onSubmit={onSubmitTransferWorkplaces}
            selectedWorkplaces={selectedWorkplaces}
            sourceUnitName={getSourceUnitName()}
            destinationUnitId={destinationUnitId}
            onDestinationChange={(val) => setDestinationUnitId(val)}
            allUnits={collectAllUnits(get(level1List, "data", []))}
            sourceUnitId={sourceUnitId}
          />
        )}
        {/* delete modal */}
        {deleteModal && (
          <DeleteModal
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            title={"Вы точно хотите удалить эту организационную единицу?"}
            deleting={() => onSubmitDeleteOrg(selectEditId)}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
