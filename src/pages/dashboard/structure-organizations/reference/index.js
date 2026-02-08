import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import UnitType from "@/components/reference/unit-type";
import PositionType from "@/components/reference/position-type";
import Position from "@/components/reference/position";
import useAppTheme from "@/hooks/useAppTheme";

const Index = () => {
  const router = useRouter();
  const { query } = router;
  const { isDark, bg, text, border } = useAppTheme();
  const tab = query.tab || "unit-type";

  const handleTab = (tabValue) => {
    router.push({
      pathname: router.pathname,
      query: { tab: tabValue },
    });
  };

  const tabs = [
    { value: "unit-type", label: "Тип организационные единицы" },
    { value: "position-type", label: "Тип позиции" },
    { value: "position", label: "Позиция" },
  ];

  return (
    <DashboardLayout headerTitle={"Справочник"}>
      <div
        className="p-2 mt-[20px] border rounded-md"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <div className="flex text-base items-center gap-[20px]">
          {tabs.map((tabItem, index) => (
            <div key={tabItem.value} className="flex items-center gap-[20px]">
              {/* Tab Button */}
              <button
                onClick={() => handleTab(tabItem.value)}
                className="py-[11px] px-[15px] rounded-md flex flex-col items-center cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor:
                    tab === tabItem.value
                      ? isDark
                        ? "#2a2a2a"
                        : "#f5f5f5"
                      : "transparent",
                  color:
                    tab === tabItem.value
                      ? text("#000000", "#f3f4f6")
                      : text("#828282", "#9ca3af"),
                }}
                onMouseEnter={(e) => {
                  if (tab !== tabItem.value) {
                    e.currentTarget.style.backgroundColor = isDark
                      ? "#2a2a2a50"
                      : "#f5f5f550";
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab !== tabItem.value) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <p>{tabItem.label}</p>
                <AnimatePresence>
                  {tab === tabItem.value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.2 }}
                      className="w-[8px] h-[8px] rounded-full mt-[2px]"
                      style={{
                        backgroundColor: isDark ? "#3b82f6" : "#000000",
                      }}
                    />
                  )}
                </AnimatePresence>
              </button>

              {/* Divider (not after last tab) */}
              {index < tabs.length - 1 && (
                <div
                  className="w-[1px] h-[15px]"
                  style={{
                    backgroundColor: border("#e9e9e9", "#4b5563"),
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {tab === "unit-type" && <UnitType />}
      {tab === "position-type" && <PositionType />}
      {tab === "position" && <Position />}
    </DashboardLayout>
  );
};

export default Index;
