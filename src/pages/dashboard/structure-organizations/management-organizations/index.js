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
import { Button, IconButton, Typography } from "@mui/material";
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

const Index = () => {
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [createModalParentId, setCreateModalParentId] = useState(null);
  const [selectEditId, setSelectEditId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editModalOrgid, setEditOrgId] = useState(null);
  const [name, setName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitTypeId, setUnitTypeId] = useState(null);
  const [isActive, setIsActive] = useState();
  const [openLevel1Id, setOpenLevel1Id] = useState(null);
  const [openLevel2Id, setOpenLevel2Id] = useState(null);
  const [openLevel3Id, setOpenLevel3Id] = useState(null);
  const [openLevel4Id, setOpenLevel4Id] = useState(null);

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
          unit_code: unitCode,
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
      }
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
      }
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
        }
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
        className="bg-white p-4 my-10 rounded-md space-y-2 shadow"
      >
        <div className="mb-[20px]">
          <Button
            onClick={() => {
              setCreateModal(true);
              setCreateModalParentId(null);
            }}
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

        {get(level1List, "data", []).map((level1) => {
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
                className="p-4 border border-gray-200 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center"
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
                  <h4 className="text-lg font-semibold">{level1.name}</h4>
                </div>
                <div className="flex items-center gap-1">
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
                  {isLevel1Open ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </div>
              </div>

              {/* LEVEL 2 */}
              <AnimatePresence>
                {isLevel1Open && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-6 mt-2 space-y-2  rounded"
                  >
                    {get(level2List, "data", []).length > 0 ? (
                      get(level2List, "data", []).map((level2) => {
                        const isLevel2Open = openLevel2Id === level2.id;

                        return (
                          <div key={level2.id}>
                            <div
                              onClick={() => {
                                setOpenLevel2Id(
                                  isLevel2Open ? null : level2.id
                                );
                                setOpenLevel3Id(null);
                              }}
                              className="p-3 bg-white rounded hover:bg-gray-50 flex border border-gray-200 justify-between items-center cursor-pointer"
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
                                <span>{level2.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
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
                                {isLevel2Open ? (
                                  <KeyboardArrowUpIcon />
                                ) : (
                                  <KeyboardArrowDownIcon />
                                )}
                              </div>
                            </div>

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
                                                    : level3.id
                                                )
                                              }
                                              className="p-2 bg-white hover:bg-gray-50 border border-gray-200  rounded  flex justify-between items-center cursor-pointer"
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
                                                <span>{level3.name}</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <IconButton
                                                  onClick={() => {
                                                    setCreateModal(true);
                                                    setCreateModalParentId(
                                                      level3.id
                                                    );
                                                  }}
                                                  className="text-blue-600 text-sm hover:underline normal-case"
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
                                                <IconButton
                                                  onClick={() => {
                                                    setEditModal(true);
                                                    setSelectEditId(level3.id);
                                                    setName(level3.name);
                                                    setUnitCode(
                                                      level3.unit_code
                                                    );
                                                  }}
                                                  className="text-blue-600 text-sm hover:underline normal-case"
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

                                                <IconButton
                                                  onClick={() => {
                                                    setDeleteModal(true);
                                                    setSelectEditId(level3.id);
                                                  }}
                                                  className="text-blue-600 text-sm hover:underline normal-case"
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
                                                {isLevel3Open ? (
                                                  <KeyboardArrowUpIcon />
                                                ) : (
                                                  <KeyboardArrowDownIcon />
                                                )}
                                              </div>
                                            </div>

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
                                                  className="ml-6 mt-1 space-y-1"
                                                >
                                                  {get(level4List, "data", [])
                                                    .length > 0 ? (
                                                    get(
                                                      level4List,
                                                      "data",
                                                      []
                                                    ).map((level4) => {
                                                      const isLevel4Open =
                                                        openLevel4Id ===
                                                        level4.id;

                                                      return (
                                                        <div key={level4.id}>
                                                          {/* LEVEL 4 */}
                                                          <div
                                                            onClick={() =>
                                                              setOpenLevel4Id(
                                                                isLevel4Open
                                                                  ? null
                                                                  : level4.id
                                                              )
                                                            }
                                                            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded text-sm flex justify-between items-center cursor-pointer"
                                                          >
                                                            <div className="flex items-center gap-3">
                                                              <HexagonIcon
                                                                sx={{
                                                                  background:
                                                                    "#E9D3FF",
                                                                  color:
                                                                    "#6E0BD4",
                                                                  padding:
                                                                    "4px",
                                                                  width: "30px",
                                                                  height:
                                                                    "30px",
                                                                  borderRadius:
                                                                    "100%",
                                                                }}
                                                              />
                                                              <span>
                                                                {level4.name}
                                                              </span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                              <IconButton
                                                                onClick={() => {
                                                                  setCreateModal(
                                                                    true
                                                                  );
                                                                  setCreateModalParentId(
                                                                    level4.id
                                                                  );
                                                                }}
                                                                className="text-blue-600 text-sm hover:underline normal-case"
                                                              >
                                                                <AddCircleIcon
                                                                  sx={{
                                                                    background:
                                                                      "#E9D3FF",
                                                                    color:
                                                                      "#6E0BD4",
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
                                                              <IconButton
                                                                onClick={() => {
                                                                  setEditModal(
                                                                    true
                                                                  );
                                                                  setSelectEditId(
                                                                    level4.id
                                                                  );
                                                                  setName(
                                                                    level4.name
                                                                  );
                                                                  setUnitCode(
                                                                    level4.unit_code
                                                                  );
                                                                }}
                                                                className="text-blue-600 text-sm hover:underline normal-case"
                                                              >
                                                                <EditIcon
                                                                  sx={{
                                                                    background:
                                                                      "#E9D3FF",
                                                                    color:
                                                                      "#6E0BD4",
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

                                                              <IconButton
                                                                onClick={() => {
                                                                  setDeleteModal(
                                                                    true
                                                                  );
                                                                  setSelectEditId(
                                                                    level4.id
                                                                  );
                                                                }}
                                                                className="text-blue-600 text-sm hover:underline normal-case"
                                                              >
                                                                <DeleteIcon
                                                                  sx={{
                                                                    background:
                                                                      "#E9D3FF",
                                                                    color:
                                                                      "#6E0BD4",
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
                                                              {isLevel4Open ? (
                                                                <KeyboardArrowUpIcon />
                                                              ) : (
                                                                <KeyboardArrowDownIcon />
                                                              )}
                                                            </div>
                                                          </div>

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
                                                                className="ml-6 mt-1 space-y-1 flex flex-col justify-between"
                                                              >
                                                                {get(
                                                                  level5List,
                                                                  "data",
                                                                  []
                                                                ).length > 0 ? (
                                                                  get(
                                                                    level5List,
                                                                    "data",
                                                                    []
                                                                  ).map(
                                                                    (
                                                                      level5
                                                                    ) => (
                                                                      <div
                                                                        key={
                                                                          level5.id
                                                                        }
                                                                        className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded text-xs flex justify-between"
                                                                      >
                                                                        <div className="flex items-center gap-3">
                                                                          <StarIcon
                                                                            sx={{
                                                                              background:
                                                                                "#FFD6D6",
                                                                              color:
                                                                                "#FF4D4D",
                                                                              padding:
                                                                                "4px",
                                                                              width:
                                                                                "25px",
                                                                              height:
                                                                                "25px",
                                                                              borderRadius:
                                                                                "100%",
                                                                            }}
                                                                          />
                                                                          <span>
                                                                            {
                                                                              level5.name
                                                                            }
                                                                          </span>
                                                                        </div>

                                                                        <div className="flex items-center gap-1">
                                                                          <IconButton
                                                                            onClick={() => {
                                                                              setEditModal(
                                                                                true
                                                                              );
                                                                              setSelectEditId(
                                                                                level5.id
                                                                              );
                                                                              setName(
                                                                                level5.name
                                                                              );
                                                                              setUnitCode(
                                                                                level5.unit_code
                                                                              );
                                                                            }}
                                                                            className="text-blue-600 text-sm hover:underline normal-case"
                                                                          >
                                                                            <EditIcon
                                                                              sx={{
                                                                                background:
                                                                                  "#FFD6D6",
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

                                                                          <IconButton
                                                                            onClick={() => {
                                                                              setDeleteModal(
                                                                                true
                                                                              );
                                                                              setSelectEditId(
                                                                                level5.id
                                                                              );
                                                                            }}
                                                                            className="text-blue-600 text-sm hover:underline normal-case"
                                                                          >
                                                                            <DeleteIcon
                                                                              sx={{
                                                                                background:
                                                                                  "#FFD6D6",
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
                                                                        </div>
                                                                      </div>
                                                                    )
                                                                  )
                                                                ) : (
                                                                  <div className="text-gray-400 text-xs italic">
                                                                    Bo‘limlar
                                                                    mavjud emas
                                                                  </div>
                                                                )}
                                                              </motion.div>
                                                            )}
                                                          </AnimatePresence>
                                                        </div>
                                                      );
                                                    })
                                                  ) : (
                                                    <div className="text-gray-400 text-xs italic">
                                                      Разделы отсутствуют
                                                    </div>
                                                  )}
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        );
                                      }
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
                        Bo‘limlar mavjud emas
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={"Имя"}
                inputClass="!h-[45px] border !border-[#C9C9C9]"
                required
              />

              {createModalParentId === null && (
                <Input
                  type={"text"}
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  required
                  inputClass="!h-[43px] border !border-[#C9C9C9]"
                  placeholder={"Введите код единицы"}
                />
              )}

              <CustomSelect
                options={optionsUnitType}
                value={unitTypeId} // faqat id (number/string)
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
