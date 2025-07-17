import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { get } from "lodash";
import SubjectIcon from "@mui/icons-material/Subject";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useState } from "react";

const Index = () => {
  const [openLevel1Id, setOpenLevel1Id] = useState(null);
  const [openLevel2Id, setOpenLevel2Id] = useState(null);
  const [openLevel3Id, setOpenLevel3Id] = useState(null);

  // LEVEL 1 - Asosiy bo'limlar
  const { data: level1List } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true },
  });

  // LEVEL 2 - Level 1 child
  const { data: level2List } = useGetPythonQuery({
    key: [KEYS.organizationalUnits, openLevel1Id],
    url: URLS.organizationalUnits,
    enabled: !!openLevel1Id,
    params: { parent_id: openLevel1Id },
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

  return (
    <DashboardLayout headerTitle="Руководства управлении">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-4 my-10 rounded-md space-y-2 shadow"
      >
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
                  <SubjectIcon />
                  <h4 className="text-lg font-semibold">{level1.name}</h4>
                </div>
                {isLevel1Open ? (
                  <KeyboardArrowUpIcon />
                ) : (
                  <KeyboardArrowDownIcon />
                )}
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
                              className="p-3 bg-gray-50 rounded hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                            >
                              <span>{level2.name}</span>
                              {isLevel2Open ? (
                                <KeyboardArrowUpIcon fontSize="small" />
                              ) : (
                                <KeyboardArrowDownIcon fontSize="small" />
                              )}
                            </div>

                            {/* LEVEL 3 */}
                            <AnimatePresence>
                              {isLevel2Open && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-6 mt-1 space-y-2"
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
                                              className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex justify-between items-center cursor-pointer"
                                            >
                                              <span className="text-sm">
                                                {level3.name}
                                              </span>
                                              {isLevel3Open ? (
                                                <KeyboardArrowUpIcon fontSize="small" />
                                              ) : (
                                                <KeyboardArrowDownIcon fontSize="small" />
                                              )}
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
                                                        className="p-2 bg-gray-200 rounded text-sm"
                                                      >
                                                        {level4.name}
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
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
