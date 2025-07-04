import Image from "next/image";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Modal,
  Box,
  Button,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MediationIcon from "@mui/icons-material/Mediation";
import ControlCameraIcon from "@mui/icons-material/ControlCamera";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { useRouter } from "next/router";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useState } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import WifiIcon from "@mui/icons-material/Wifi";
import SecurityIcon from "@mui/icons-material/Security";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ExitModal from "../modal/exit-modal";
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
    text: "Устройства (камеры)",
    icon: <CameraAltIcon />,
    path: "/dashboard/devices",
  },
  {
    text: "Точки доступа",
    icon: <WifiIcon />,
    path: "/dashboard/access-points",
  },
  {
    text: "Контрольные точки",
    icon: <SecurityIcon />,
    path: "/dashboard/checkpoints",
  },
  {
    text: "Отчёты",
    icon: <AssessmentIcon />,
    path: "/dashboard/reports",
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
  const [openexitModal, setOpenExitModal] = useState(false);

  const router = useRouter();

  const handleOpenExitModal = () => {
    setOpenExitModal(false);
  };

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <aside
      className={`${
        isOpen ? "w-[330px]" : "w-[80px]"
      } h-screen bg-white px-[16px] py-[25px] transition-all duration-300 overflow-hidden flex flex-col justify-between`}
    >
      <div>
        <div
          onClick={() => router.push("/")}
          className="my-[32px] flex justify-center items-start gap-4 cursor-pointer"
        >
          <Image src="/icons/ies_brand.svg" alt="logo" width={53} height={76} />
          {isOpen && (
            <div className="flex flex-col">
              <p className="text-[18px] font-medium">
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
              {isOpen && (
                <Typography
                  sx={{
                    fontFamily: "DM Sans, sans-serif",
                    color:
                      router.pathname === item.path ? "#2D3748" : "#A0AEC0",
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
      </div>

      {/* 🚪 Logout tugmasi pastda */}
      <div className="mb-4">
        <ListItemButton
          onClick={() => setOpenExitModal(true)} // funksiyani yozing
          sx={{
            borderRadius: "8px",
            backgroundColor: "#FCD8D3",
            color: "#E53E3E",
            justifyContent: isOpen ? "flex-start" : "center",
            px: isOpen ? 2 : 0,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: "auto",
              color: "#991300",
              justifyContent: "center",
            }}
          >
            <ExitToAppIcon />{" "}
            {/* logout icon (mui yoki sizda bor bo'lgan icon) */}
          </ListItemIcon>
          {isOpen && (
            <Typography
              sx={{
                fontFamily: "DM Sans, sans-serif",
                color: "#991300",
                fontSize: "18px",
                marginLeft: "12px",
              }}
            >
              Выход
            </Typography>
          )}
        </ListItemButton>
      </div>

      <ExitModal
        open={openexitModal}
        onClose={handleOpenExitModal}
        handleLogout={handleLogout}
      />
    </aside>
  );
}
