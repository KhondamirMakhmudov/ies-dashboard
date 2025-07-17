import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { List, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  PeopleAlt as PeopleAltIcon,
  Dashboard as DashboardIcon,
  Mediation as MediationIcon,
  ControlCamera as ControlCameraIcon,
  SettingsRounded as SettingsRoundedIcon,
  SchoolRounded as SchoolRoundedIcon,
  CameraAlt as CameraAltIcon,
  Wifi as WifiIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

import ExitModal from "../modal/exit-modal";
import { signOut } from "next-auth/react";

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
    submenu: [
      {
        text: "Справочник",
        icon: (
          <div className="w-[10px] h-[10px] rounded-full bg-gray-300"></div>
        ),
        path: "/dashboard/structure-organizations/reference",
      },
      {
        text: "Руководства управлении",
        icon: (
          <div className="w-[10px] h-[10px] rounded-full bg-gray-300"></div>
        ),
        path: "/dashboard/structure-organizations/management-organizations",
      },
    ],
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
  const [openExitModal, setOpenExitModal] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const router = useRouter();

  const handleToggleSubmenu = (index) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <aside
      className={`${
        isOpen ? "w-[330px]" : "w-[80px]"
      } h-screen bg-white px-[16px] py-[25px] transition-all duration-300 overflow-y-auto flex flex-col justify-between`}
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
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-gray-200 my-[10px]"></div>

        <List sx={{ fontFamily: "DM Sans, sans-serif", color: "#A0AEC0" }}>
          {menuItems.map((item, index) => {
            const isActive = router.pathname === item.path;
            const isAnySubmenuActive =
              item.submenu?.some((sub) => router.pathname === sub.path) ||
              false;

            return (
              <div key={index}>
                <ListItemButton
                  onClick={() =>
                    item.submenu
                      ? handleToggleSubmenu(index)
                      : router.push(item.path)
                  }
                  selected={isActive || isAnySubmenuActive}
                  sx={{
                    borderRadius: "8px",
                    my: 0.5,
                    color:
                      isActive || isAnySubmenuActive ? "#2D3748" : "#718096",
                    backgroundColor:
                      isActive || isAnySubmenuActive
                        ? "#EDF2F7"
                        : "transparent",
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
                      color:
                        isActive || isAnySubmenuActive ? "#2D3748" : "#A0AEC0",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isOpen && (
                    <Typography
                      sx={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: "18px",
                        marginLeft: "12px",
                      }}
                    >
                      {item.text}
                    </Typography>
                  )}
                  {item.submenu && isOpen && (
                    <span className="ml-auto">
                      {openSubmenus[index] ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </span>
                  )}
                </ListItemButton>

                {/* Submenu render */}
                {item.submenu && openSubmenus[index] && isOpen && (
                  <div className="ml-10">
                    {item.submenu.map((sub, subIndex) => {
                      const isSubActive = router.pathname === sub.path;
                      return (
                        <ListItemButton
                          key={subIndex}
                          onClick={() => router.push(sub.path)}
                          selected={isSubActive}
                          sx={{
                            borderRadius: "6px",
                            my: 0.5,
                            color: isSubActive ? "#2D3748" : "#A0AEC0",
                            backgroundColor: isSubActive
                              ? "#EDF2F7"
                              : "transparent",
                            "&:hover": {
                              backgroundColor: "#F7FAFC",
                            },
                          }}
                        >
                          <Typography sx={{ fontSize: "16px", ml: 1 }}>
                            {sub.text}
                          </Typography>
                        </ListItemButton>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </List>
      </div>

      {/* Logout Button */}
      <div className="mb-4">
        <ListItemButton
          onClick={() => setOpenExitModal(true)}
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
            <ExitToAppIcon />
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
        open={openExitModal}
        onClose={() => setOpenExitModal(false)}
        handleLogout={handleLogout}
      />
    </aside>
  );
}
