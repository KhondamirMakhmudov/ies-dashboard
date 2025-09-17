import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import UnitType from "@/components/reference/unit-type";
import PositionType from "@/components/reference/position-type";
import Position from "@/components/reference/position";

const Index = () => {
  const router = useRouter();
  const { query } = router;
  const tab = query.tab || "unit-type";

  const handleTab = (tabValue) => {
    router.push({
      pathname: router.pathname,
      query: { tab: tabValue },
    });
  };

  return (
    <DashboardLayout headerTitle={"Справочник"}>
      <div className="p-2 bg-white mt-[30px]">
        <div className="flex text-base items-center gap-[20px]">
          {/* First Tab */}
          <button
            onClick={() => handleTab("unit-type")}
            className={`py-[11px] px-[15px] rounded-md flex flex-col items-center ${
              tab === "unit-type"
                ? "bg-[#F5F5F5] text-black"
                : "bg-white text-[#828282]"
            }`}
          >
            <p>Тип организационные единицы</p>
            <AnimatePresence>
              {tab === "unit-type" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="w-[8px] h-[8px] rounded-full bg-black mt-[2px]"
                />
              )}
            </AnimatePresence>
          </button>

          <div className="w-[1px] h-[15px] bg-[#E9E9E9]"></div>

          {/* Second Tab */}
          <button
            onClick={() => handleTab("position-type")}
            className={`py-[11px] px-[15px] rounded-md flex flex-col items-center ${
              tab === "position-type"
                ? "bg-[#F5F5F5] text-black"
                : "bg-white text-[#828282]"
            }`}
          >
            <p>Тип позиции</p>
            <AnimatePresence>
              {tab === "position-type" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="w-[8px] h-[8px] rounded-full bg-black mt-[2px]"
                />
              )}
            </AnimatePresence>
          </button>

          <div className="w-[1px] h-[15px] bg-[#E9E9E9]"></div>

          {/* Third Tab */}
          <button
            onClick={() => handleTab("position")}
            className={`py-[11px] px-[15px] rounded-md flex flex-col items-center ${
              tab === "position"
                ? "bg-[#F5F5F5] text-black"
                : "bg-white text-[#828282]"
            }`}
          >
            <p>Позиция</p>
            <AnimatePresence>
              {tab === "position" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="w-[8px] h-[8px] rounded-full bg-black mt-[2px]"
                />
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Content rendering */}
      {tab === "unit-type" && <UnitType />}
      {tab === "position-type" && <PositionType />}
      {tab === "position" && <Position />}
    </DashboardLayout>
  );
};

export default Index;
