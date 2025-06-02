import Image from "next/image";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MediationIcon from "@mui/icons-material/Mediation";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import { useRouter } from "next/router";
const menuItems = [
  {
    text: "Обзор",
    icon: <DashboardIcon />,
    path: "/dashboard/main",
  },

  {
    text: "Сотрудники",
    icon: <PeopleAltIcon />,
    path: "/dashboard/employees",
  },
  {
    text: "Структура организации",
    icon: <MediationIcon />,
    path: "/dashboard/structure-organizations",
  },
  {
    text: "Должности",
    icon: <ControlCameraIcon />,
    path: "/dashboard/positions",
  },
  {
    text: "Обучение и квалификация",
    icon: <SchoolRoundedIcon />,
    path: "/dashboard/user-profile",
  },
  {
    text: "Настройки",
    icon: <SettingsRoundedIcon />,
    path: "/dashboard/settings",
  },
];

export default function Sidebar({ isOpen = true }) {
  const router = useRouter();
  return (
    <aside
      className={`${
        isOpen ? "w-[330px]" : "w-[80px]"
      } h-screen bg-white px-[16px] py-[25px] transition-all duration-300 overflow-hidden`}
    >
      <div
        onClick={() => router.push("/")}
        className="my-[32px] flex justify-center items-start gap-4 cursor-pointer"
      >
        <Image src="/icons/ies_brand.svg" alt="logo" width={53} height={76} />
        {isOpen && (
          <div className="flex flex-col">
            <p className="text-[18px] font-medium ">
              "ISSIQLIK ELЕKTR STANSIYALARI" AJ
            </p>
            <p className="text-base text-gray-400">Inventarizatsiya</p>
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-gray-200 my-[10px]"></div>

      {isOpen && (
        <div className="mb-2">
          <Typography
            sx={{
              fontFamily: "DM Sans, sans-serif",
              color: "#A0AEC0FF",
            }}
          >
            Asosiy
          </Typography>
        </div>
      )}
      {/* Linklar va menyular */}
      <List sx={{ fontFamily: "DM Sans, sans-serif", color: "#A0AEC0FF" }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={() => router.push(item.path)}
            selected={router.pathname === item.path}
            sx={{
              borderRadius: "8px",
              my: 0.5,
              color: router.pathname === item.path ? "#2D3748" : "#718096",
              backgroundColor:
                router.pathname === item.path ? "#EDF2F7" : "transparent",
              "&:hover": {
                backgroundColor: "#F7FAFC",
              },
              justifyContent: isOpen ? "flex-start" : "center",
              px: isOpen ? 2 : 0,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: "auto",
                color: router.pathname === item.path ? "#2D3748" : "#A0AEC0",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>

            {/* Text faqat isOpen bo‘lsa ko‘rsatiladi */}
            {isOpen && (
              <Typography
                sx={{
                  fontFamily: "DM Sans, sans-serif",
                  color: router.pathname === item.path ? "#2D3748" : "#A0AEC0",
                  fontSize: "18px",
                  marginLeft: "12px",
                }}
              >
                {item.text}
              </Typography>
            )}
          </ListItemButton>
        ))}
      </List>
    </aside>
  );
}
