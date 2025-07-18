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
import { Button, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import usePostPythonQuery from "@/hooks/python/usePostQuery";
import CustomTable from "@/components/table";
import CustomSelect from "@/components/select";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const Index = () => {
  const queryClient = useQueryClient();
  const [createModal, setCreateModal] = useState(false);
  const [createModalParentId, setCreateModalParentId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editModalOrgid, setEditOrgId] = useState(null);
  const [name, setName] = useState("");
  const [unitCode, setUnitCode] = useState("");
  const [unitTypeId, setUnitTypeId] = useState(null);
  const [isActive, setIsActive] = useState();
  const [openLevel1Id, setOpenLevel1Id] = useState(null);
  const [openLevel2Id, setOpenLevel2Id] = useState(null);
  const [openLevel3Id, setOpenLevel3Id] = useState(null);

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
    params: { parent_id: openLevel2Id },
  });

  // LEVEL 4 - Level 3 child
  const { data: level4List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel3Id],
    url: URLS.organizationalUnits,
    enabled: !!openLevel3Id,
    params: { parent_id: openLevel3Id },
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
          toast.success("Bo‘lim muvaffaqiyatli yaratildi", {
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
            onClick={() => setCreateModal(true)}
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
                        padding: "8px",
                        width: "35px",
                        height: "35px",
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
                    className="ml-6 mt-2 space-y-2 border border-gray-200 rounded"
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
                              className="p-3 bg-white rounded hover:bg-gray-50 flex justify-between items-center cursor-pointer"
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
                                                    ).map((level4) => (
                                                      <div
                                                        key={level4.id}
                                                        className="p-2 bg-white hover:bg-gray-50 border border-gray-200  rounded text-sm"
                                                      >
                                                        <div className="flex items-center gap-3">
                                                          <HexagonIcon
                                                            sx={{
                                                              background:
                                                                "#E9D3FF",
                                                              color: "#6E0BD4",
                                                              padding: "4px",
                                                              width: "30px",
                                                              height: "30px",
                                                              borderRadius:
                                                                "100%",
                                                            }}
                                                          />
                                                          <span>
                                                            {level4.name}
                                                          </span>
                                                        </div>
                                                      </div>
                                                    ))
                                                  ) : (
                                                    <div className="text-gray-400 text-xs italic">
                                                      Bo‘limlar mavjud emas
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
                                      Bo‘limlar mavjud emas
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
              Создать
            </Typography>

            <div className="space-y-[15px] my-[30px]">
              <Input
                type={"text"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={"Имя"}
                required
                inputClass="!h-[45px] border !border-[#C9C9C9]"
              />

              <Input
                type={"text"}
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                required
                inputClass="!h-[43px] border !border-[#C9C9C9]"
                placeholder={"Enter the unit code"}
              />

              <CustomSelect
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
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
