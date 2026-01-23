import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import useAppTheme from "@/hooks/useAppTheme";
import PermissionSection from "@/components/permission-of-roles/permission";
import ActionSection from "@/components/permission-of-roles/action";
import ResourceSection from "@/components/permission-of-roles/resource";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FolderIcon from "@mui/icons-material/Folder";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const Index = () => {
  const router = useRouter();
  const { query } = router;
  const { isDark, bg, text, border } = useAppTheme();
  const tab = query.tab || "permission";

  const handleTab = (tabValue) => {
    router.push({
      pathname: router.pathname,
      query: { tab: tabValue },
    });
  };

  const tabs = [
    {
      value: "permission",
      label: "Разрешения",
      icon: <LockOpenIcon fontSize="small" />,
    },
    {
      value: "resource",
      label: "Ресурсы",
      icon: <FolderIcon fontSize="small" />,
    },
    {
      value: "action",
      label: "Действия",
      icon: <PlayCircleOutlineIcon fontSize="small" />,
    },
  ];

  return (
    <DashboardLayout headerTitle={"Доступ и права"}>
      {/* Modern Tab Navigation */}
      <div
        className="mt-[20px] border-b"
        style={{
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <div className="flex gap-[8px] px-[20px]">
          {tabs.map((tabItem) => {
            const isActive = tab === tabItem.value;

            return (
              <button
                key={tabItem.value}
                onClick={() => handleTab(tabItem.value)}
                className="relative px-[20px] py-[14px] font-medium text-[15px] transition-all duration-200 flex items-center gap-[8px] group"
                style={{
                  color: isActive
                    ? text("#2563eb", "#60a5fa")
                    : text("#6b7280", "#9ca3af"),
                }}
              >
                {/* Icon */}
                <span
                  className="transition-transform duration-200"
                  style={{
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {tabItem.icon}
                </span>

                {/* Label */}
                <span>{tabItem.label}</span>

                {/* Active Indicator - Bottom Border */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full"
                    style={{
                      backgroundColor: bg("#2563eb", "#60a5fa"),
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {/* Hover Background */}
                {!isActive && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-md"
                    style={{
                      backgroundColor: bg("#f3f4f6", "#262626"),
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with Fade Animation */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tab === "permission" && <PermissionSection />}
        {tab === "resource" && <ResourceSection />}
        {tab === "action" && <ActionSection />}
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
