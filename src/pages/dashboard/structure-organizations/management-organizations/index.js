import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "lodash";
import HiveIcon from "@mui/icons-material/Hive";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DetailsIcon from "@mui/icons-material/Details";
import HexagonIcon from "@mui/icons-material/Hexagon";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Button, IconButton, Typography, Chip, Avatar } from "@mui/material";
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
import {
  ErrorOutline as ErrorOutlineIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { canUserDo } from "@/utils/checkpermission";
import { useSession } from "next-auth/react";

const WorkplaceEmployeeSection = ({ workplace = [], levelColor }) => {
  const { bg, isDark, text, border } = useAppTheme();
  const [showEmployees, setShowEmployees] = useState(false);

  if (!workplace || workplace.length === 0) {
    return (
      <div
        className={
          bg("bg-gray-50", "bg-gray-800/30") +
          " " +
          text("text-gray-500", "text-gray-400") +
          " mt-3 p-4 rounded-lg border-2 border-dashed " +
          border("border-gray-200", "border-gray-700") +
          " flex items-center gap-2 transition-colors"
        }
      >
        <ErrorOutlineIcon sx={{ fontSize: 18, opacity: 0.6 }} />
        <span className="text-sm italic">Рабочие места не назначены</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Toggle Header */}
      <motion.div
        className={
          bg(
            "bg-gradient-to-r from-blue-50 to-indigo-50",
            "bg-gradient-to-r from-gray-800 to-gray-700",
          ) +
          " " +
          border("border-blue-100", "border-gray-600") +
          " flex items-center justify-between cursor-pointer p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
        }
        onClick={() => setShowEmployees(!showEmployees)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div
            className={
              bg("bg-white", "bg-gray-900") + " p-2 rounded-lg shadow-sm"
            }
          >
            <WorkIcon sx={{ fontSize: 20, color: levelColor || "#3b82f6" }} />
          </div>
          <div>
            <span
              className={
                text("text-gray-900", "text-white") +
                " text-sm font-semibold block"
              }
            >
              Рабочие места
            </span>
            <span
              className={text("text-gray-500", "text-gray-400") + " text-xs"}
            >
              {workplace.length}{" "}
              {workplace.length === 1 ? "позиция" : "позиций"}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: showEmployees ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={bg("bg-white", "bg-gray-900") + " p-1.5 rounded-full"}
        >
          <KeyboardArrowDownIcon
            sx={{ fontSize: 20, color: isDark ? "#9ca3af" : "#6b7280" }}
          />
        </motion.div>
      </motion.div>

      {/* Workplace Cards */}
      <AnimatePresence>
        {showEmployees && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 space-y-3"
          >
            {workplace.map((wp, index) => (
              <motion.div
                key={wp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={
                  bg("bg-white", "bg-gray-800") +
                  " " +
                  border("border-gray-200", "border-gray-700") +
                  " ml-6 p-4 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-200"
                }
              >
                {/* Position Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={
                        bg("bg-blue-50", "bg-blue-900/30") + " p-2 rounded-lg"
                      }
                    >
                      <BadgeIcon
                        sx={{ fontSize: 18, color: levelColor || "#3b82f6" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={
                          text("text-gray-900", "text-white") +
                          " text-sm font-semibold"
                        }
                      >
                        {wp.position?.name || "Без названия"}
                      </h4>
                      <p
                        className={
                          text("text-gray-500", "text-gray-400") +
                          " text-xs mt-0.5"
                        }
                      >
                        ID: {wp.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Chip
                      label={wp.is_vacant ? "Вакантно" : "Занято"}
                      size="small"
                      color={wp.is_vacant ? "warning" : "success"}
                      variant={isDark ? "filled" : "outlined"}
                      sx={{ fontSize: "0.7rem", height: "24px" }}
                    />
                    <Chip
                      label={wp.is_active ? "Активно" : "Неактивно"}
                      size="small"
                      color={wp.is_active ? "success" : "error"}
                      variant={isDark ? "filled" : "outlined"}
                      sx={{ fontSize: "0.7rem", height: "24px" }}
                    />
                  </div>
                </div>

                {/* Employee Information */}
                {wp.employee && !wp.is_vacant ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={
                      bg("bg-gray-50", "bg-gray-900/50") +
                      " " +
                      border("border-gray-100", "border-gray-700") +
                      " p-4 rounded-lg border"
                    }
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: levelColor || "#3b82f6",
                          fontSize: 18,
                          fontWeight: 600,
                          boxShadow: isDark
                            ? "0 4px 6px rgba(0,0,0,0.3)"
                            : "0 4px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        {wp.employee.last_name?.[0]}
                        {wp.employee.first_name?.[0]}
                      </Avatar>

                      {/* Employee Details */}
                      <div className="flex-1 space-y-3">
                        {/* Name */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <PersonIcon
                              sx={{
                                fontSize: 16,
                                color: isDark ? "#9ca3af" : "#6b7280",
                              }}
                            />
                            <span
                              className={
                                text("text-gray-900", "text-white") +
                                " text-base font-semibold"
                              }
                            >
                              {wp.employee.last_name} {wp.employee.first_name}{" "}
                              {wp.employee.middle_name}
                            </span>
                          </div>
                          {wp.employee.education_degree && (
                            <p
                              className={
                                text("text-gray-500", "text-gray-400") +
                                " text-xs ml-6"
                              }
                            >
                              {wp.employee.education_degree}
                            </p>
                          )}
                        </div>

                        {/* Contact Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {wp.employee.phone_number && (
                            <div
                              className={
                                bg("bg-white", "bg-gray-800") +
                                " " +
                                text("text-gray-700", "text-gray-300") +
                                " flex items-center gap-2 p-2 rounded-lg text-sm"
                              }
                            >
                              <PhoneIcon
                                sx={{
                                  fontSize: 16,
                                  color: "#10b981",
                                }}
                              />
                              <span className="text-xs">
                                +998 {wp.employee.phone_number}
                              </span>
                            </div>
                          )}

                          {wp.employee.email && (
                            <div
                              className={
                                bg("bg-white", "bg-gray-800") +
                                " " +
                                text("text-gray-700", "text-gray-300") +
                                " flex items-center gap-2 p-2 rounded-lg text-sm"
                              }
                            >
                              <EmailIcon
                                sx={{
                                  fontSize: 16,
                                  color: "#3b82f6",
                                }}
                              />
                              <span className="text-xs truncate">
                                {wp.employee.email}
                              </span>
                            </div>
                          )}

                          {wp.employee.tabel_number && (
                            <div
                              className={
                                bg("bg-white", "bg-gray-800") +
                                " " +
                                text("text-gray-700", "text-gray-300") +
                                " flex items-center gap-2 p-2 rounded-lg text-sm"
                              }
                            >
                              <BadgeIcon
                                sx={{
                                  fontSize: 16,
                                  color: "#f59e0b",
                                }}
                              />
                              <span className="text-xs">
                                Таб. №: {wp.employee.tabel_number}
                              </span>
                            </div>
                          )}

                          {wp.start_date && (
                            <div
                              className={
                                bg("bg-white", "bg-gray-800") +
                                " " +
                                text("text-gray-700", "text-gray-300") +
                                " flex items-center gap-2 p-2 rounded-lg text-sm"
                              }
                            >
                              <CalendarTodayIcon
                                sx={{
                                  fontSize: 16,
                                  color: "#8b5cf6",
                                }}
                              />
                              <span className="text-xs">
                                С:{" "}
                                {new Date(wp.start_date).toLocaleDateString(
                                  "ru-RU",
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end pt-2">
                          <a
                            href={`/dashboard/employees/${wp.employee.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={
                              bg("bg-blue-500", "bg-blue-600") +
                              " hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                            }
                          >
                            <span>Подробнее</span>
                            <OpenInNewIcon sx={{ fontSize: 16 }} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Vacant Position */
                  <div
                    className={
                      bg("bg-orange-50", "bg-orange-900/20") +
                      " " +
                      border("border-orange-200", "border-orange-800") +
                      " " +
                      text("text-orange-700", "text-orange-300") +
                      " p-3 rounded-lg border flex items-center gap-2"
                    }
                  >
                    <PersonIcon sx={{ fontSize: 18 }} />
                    <span className="text-sm font-medium">
                      Позиция вакантна - ожидается назначение
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Index = () => {
  const { data: session } = useSession();
  const { bg, text, isDark, border } = useAppTheme();
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [createModalParentId, setCreateModalParentId] = useState(null);
  const [selectEditId, setSelectEditId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitTypeId, setUnitTypeId] = useState(null);
  const [isActive, setIsActive] = useState();
  const [openLevel1Id, setOpenLevel1Id] = useState(null);
  const [openLevel2Id, setOpenLevel2Id] = useState(null);
  const [openLevel3Id, setOpenLevel3Id] = useState(null);
  const [openLevel4Id, setOpenLevel4Id] = useState(null);
  const [openLevel5Id, setOpenLevel5Id] = useState(null);

  const canCreateOrgUnit = canUserDo(
    session?.user,
    "структура организации",
    "create",
  );

  const canUpdateOrgUnit = canUserDo(
    session?.user,
    "структура организации",
    "update",
  );

  const canReadOrgUnit = canUserDo(
    session?.user,
    "структура организации",
    "read",
  );

  const canDeleteOrgUnit = canUserDo(
    session?.user,
    "структура организации",
    "delete",
  );

  // LEVEL 1 - Asosiy bo'limlar
  const { data: level1List } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true, limit: 150 },
  });

  // LEVEL 2 - Level 1 child
  const { data: level2List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel1Id],
    url: URLS.organizationalUnits,
    params: { parent_id: openLevel1Id, limit: 150 },
    enabled: !!openLevel1Id,
  });

  // LEVEL 3 - Level 2 child
  const { data: level3List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel2Id],
    url: URLS.organizationalUnits,
    enabled: !!openLevel2Id,
    params: { parent_id: openLevel2Id, limit: 150 },
  });

  // LEVEL 4 - Level 3 child
  const { data: level4List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel3Id],
    url: URLS.organizationalUnits,
    enabled: !!openLevel3Id,
    params: { parent_id: openLevel3Id, limit: 150 },
  });

  const { data: level5List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel4Id],
    url: URLS.organizationalUnits,
    enabled: !!openLevel4Id,
    params: { parent_id: openLevel4Id, limit: 150 },
  });

  const {
    data: unitType,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.unitTypes,
    url: URLS.unitTypes,
    params: {
      is_active: true,
      limit: 100,
    },
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
        <div className="mb-[20px]">
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
                  className="p-4 border rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center"
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
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Continue with LEVEL 3, 4, 5 following the same pattern... */}

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
                                                    />
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>

                                              {/* Continue with Level 4 and 5 following the same pattern... */}

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
            onClose={() => {
              setName("");
              setCreateModal(false);
              setUnitCode("");
              setUnitTypeId(null);
              setIsActive();
            }}
          >
            <Typography variant="h6" className="mb-2">
              Создать структурное дерево управления
            </Typography>

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
                label={"Тип единицы"} // faqat id (number/string)
                onChange={(val) => setUnitTypeId(val)} // object emas
                placeholder={"Выберите тип единицы"}
                returnObject={false}
                required // ixtiyoriy, default ham false
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
            onClose={() => {
              setName("");
              setEditModal(false);
              setUnitCode("");
              setUnitTypeId(null);
              setIsActive();
            }}
          >
            <Typography variant="h6" className="mb-2">
              Изменить
            </Typography>

            <div className="space-y-[15px] my-[30px]">
              <Input
                type={"text"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={"Имя"}
                inputClass="!h-[45px] border !border-[#C9C9C9]"
                required
              />

              {/* <Input
                type={"text"}
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                required
                inputClass="!h-[43px] border !border-[#C9C9C9]"
                placeholder={"Enter the unit code"}
              /> */}

              {/* <CustomSelect
                options={optionsUnitType}
                value={unitTypeId}
                onChange={(val) => setUnitTypeId(val)}
                placeholder="Выберите"
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
              </div> */}

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
        {/* delete modal */}
        {deleteModal && (
          <DeleteModal
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            title={"Вы точно хотите удалить эту"}
            deleting={() => onSubmitDeleteOrg(selectEditId)}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
