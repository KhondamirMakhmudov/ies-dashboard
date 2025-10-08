import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { List, ListItemButton, ListItemIcon, Typography } from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import {
  PeopleAlt as PeopleAltIcon,
  Mediation as MediationIcon,
  SettingsRounded as SettingsRoundedIcon,
  SchoolRounded as SchoolRoundedIcon,
  CameraAlt as CameraAltIcon,
  Wifi as WifiIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ExitModal from "../modal/exit-modal";
import { signOut } from "next-auth/react";

const menuItems = [
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
        path: "/dashboard/structure-organizations/reference",
      },
      {
        text: "Руководства управлении",
        path: "/dashboard/structure-organizations/management-organizations",
      },
      {
        text: "Место работы",
        path: "/dashboard/structure-organizations/workplace",
      },
    ],
  },
  {
    text: "Точки контроля",
    icon: <SecurityIcon />,
    submenu: [
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
    ],
  },
  {
    text: "Отчёты",
    icon: <AssessmentIcon />,
    submenu: [
      {
        text: "по сотрудникам",
        path: "/dashboard/reports/employee-id",
      },
      {
        text: "по структура организации",
        path: "/dashboard/reports",
      },
      {
        text: "всех сотрудников",
        path: "/dashboard/reports/all-employees",
      },
    ],
  },
  {
    text: "Расписание",
    icon: <EventNoteIcon />,
    path: "/dashboard/schedule",
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

  // 🔑 Avtomatik submenu ochilishi agar ichki path bo'lsa
  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (
        item.submenu?.some(
          (sub) =>
            router.pathname === sub.path ||
            router.pathname.startsWith(sub.path + "/")
        )
      ) {
        setOpenSubmenus((prev) => ({
          ...prev,
          [index]: true,
        }));
      }
    });
  }, [router.pathname]);

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
        {/* LOGO */}
        <div
          onClick={() => router.push("/")}
          className="my-[32px] flex justify-center items-start gap-4 cursor-pointer"
        >
          <Image
            src="/icons/ies_brand.svg"
            alt="logo"
            width={53}
            height={76}
            priority
            className="w-[53px] h-auto"
          />
          {isOpen && (
            <div className="flex flex-col">
              <p className="text-[18px] font-medium">
                "ISSIQLIK ELЕKTR STANSIYALARI" AJ
              </p>
            </div>
          )}
        </div>

        <div className="w-full h-[1px] bg-gray-200 my-[10px]"></div>

        {/* MENU */}
        <List sx={{ fontFamily: "DM Sans, sans-serif", color: "#A0AEC0" }}>
          {menuItems.map((item, index) => {
            const isActive =
              router.pathname === item.path ||
              router.pathname.startsWith(item.path + "/");

            const isAnySubmenuActive =
              item.submenu?.some(
                (sub) =>
                  router.pathname === sub.path ||
                  router.pathname.startsWith(sub.path + "/")
              ) || false;

            const isOpenSubmenu = openSubmenus[index] || false;

            return (
              <div key={index}>
                {/* Parent item */}
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
                        isActive || isAnySubmenuActive ? "#0247b5" : "#A0AEC0",
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
                      {isOpenSubmenu ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </span>
                  )}
                </ListItemButton>

                {/* Submenu */}
                {item.submenu && isOpenSubmenu && isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                    className="ml-10"
                  >
                    {item.submenu.map((sub, subIndex) => {
                      const isSubActive =
                        router.pathname === sub.path ||
                        router.pathname.startsWith(sub.path + "/");

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
                          <div
                            className={`w-[7px] h-[7px] rounded-full ${
                              isSubActive ? "bg-[#2D3748]" : "bg-[#A0AEC0]"
                            }`}
                          ></div>
                          <Typography sx={{ fontSize: "16px", ml: 1 }}>
                            {sub.text}
                          </Typography>
                        </ListItemButton>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </List>
      </div>

      {/* LOGOUT */}
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
