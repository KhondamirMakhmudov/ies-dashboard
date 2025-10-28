"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  List,
  ListItemButton,
  ListItemIcon,
  Typography,
  Collapse,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";
import {
  PeopleAlt as PeopleAltIcon,
  Mediation as MediationIcon,
  SettingsRounded as SettingsRoundedIcon,
  CameraAlt as CameraAltIcon,
  Wifi as WifiIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import AirlineStopsIcon from "@mui/icons-material/AirlineStops";
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
      { text: "по сотрудникам", path: "/dashboard/reports/employee-uuid" },
      {
        text: "по подразделениям",
        path: "/dashboard/reports/report-by-orgUnit",
      },
      {
        text: "по подразделениям и точкам доступа",
        path: "/dashboard/reports/report-by-entrypointid-orgUnit",
      },
      {
        text: "отчёты всех сотрудников",
        path: "/dashboard/reports/all-employees",
      },
    ],
  },
  { text: "Расписание", icon: <EventNoteIcon />, path: "/dashboard/schedule" },
  {
    text: "Командировки",
    icon: <AirlineStopsIcon />,
    path: "/dashboard/business-trips",
  },
  {
    text: "Настройки",
    icon: <SettingsRoundedIcon />,
    path: "/dashboard/settings",
  },
];

function Sidebar({ isOpen = true }) {
  const [openExitModal, setOpenExitModal] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const router = useRouter();

  // Open active submenu on first render
  useEffect(() => {
    const newOpen = {};
    menuItems.forEach((item, index) => {
      if (
        item.submenu?.some(
          (sub) =>
            router.pathname === sub.path ||
            router.pathname.startsWith(sub.path + "/")
        )
      ) {
        newOpen[index] = true;
      }
    });
    setOpenSubmenus(newOpen);
  }, []); // run once

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
      } h-screen bg-white border-r border-gray-200 px-4 py-6 transition-all duration-300 overflow-y-auto flex flex-col justify-between`}
    >
      <div>
        {/* LOGO */}
        <div
          onClick={() => router.push("/")}
          className={`mb-8 flex ${
            isOpen ? "justify-start" : "justify-center"
          } items-center gap-3 cursor-pointer group transition-all duration-300`}
        >
          <div className="group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/icons/ies_brand.svg"
              alt="logo"
              width={36}
              height={36}
              priority
              className="w-9 h-9"
            />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <p className="text-base font-semibold text-gray-800 leading-tight">
                ISSIQLIK ELЕKTR
              </p>
              <p className="text-sm text-gray-600">STANSIYALARI AJ</p>
            </motion.div>
          )}
        </div>

        {isOpen && (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
        )}

        {/* MENU */}
        <List sx={{ fontFamily: "DM Sans, sans-serif", padding: 0 }}>
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
              <div key={index} className="mb-1">
                {/* Parent item */}
                <ListItemButton
                  onClick={() =>
                    item.submenu
                      ? handleToggleSubmenu(index)
                      : router.push(item.path)
                  }
                  selected={isActive || isAnySubmenuActive}
                  sx={{
                    borderRadius: "12px",
                    minHeight: "48px",
                    color:
                      isActive || isAnySubmenuActive ? "#1F2937" : "#6B7280",
                    background:
                      isActive || isAnySubmenuActive
                        ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                        : "transparent",
                    border:
                      isActive || isAnySubmenuActive
                        ? "1px solid #BFDBFE"
                        : "1px solid transparent",
                    "&:hover": {
                      backgroundColor:
                        isActive || isAnySubmenuActive ? "#DBEAFE" : "#F9FAFB",
                      transform: "translateX(4px)",
                    },
                    transition: "all 0.2s ease",
                    justifyContent: isOpen ? "flex-start" : "center",
                    px: isOpen ? 2 : 1,
                    position: "relative",
                    overflow: "hidden",
                    "&::before":
                      isActive || isAnySubmenuActive
                        ? {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "4px",
                            height: "24px",
                            backgroundColor: "#3B82F6",
                            borderRadius: "0 4px 4px 0",
                          }
                        : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isOpen ? "40px" : "auto",
                      color:
                        isActive || isAnySubmenuActive ? "#3B82F6" : "#9CA3AF",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {isOpen && (
                    <>
                      <Typography
                        sx={{
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: "15px",
                          fontWeight:
                            isActive || isAnySubmenuActive ? 600 : 500,
                          flex: 1,
                        }}
                      >
                        {item.text}
                      </Typography>
                      {item.submenu && (
                        <span className="transition-transform duration-200">
                          {isOpenSubmenu ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </span>
                      )}
                    </>
                  )}
                </ListItemButton>

                {/* Submenu */}
                {item.submenu && isOpen && (
                  <Collapse in={isOpenSubmenu} timeout="auto" unmountOnExit>
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
                      {item.submenu.map((sub, subIndex) => {
                        const isSubActive =
                          router.pathname === sub.path ||
                          router.pathname.startsWith(sub.path + "/");

                        return (
                          <Link key={subIndex} href={sub.path} prefetch>
                            <ListItemButton
                              selected={isSubActive}
                              sx={{
                                borderRadius: "8px",
                                minHeight: "40px",
                                color: isSubActive ? "#1F2937" : "#6B7280",
                                backgroundColor: isSubActive
                                  ? "#F3F4F6"
                                  : "transparent",
                                "&:hover": {
                                  backgroundColor: isSubActive
                                    ? "#E5E7EB"
                                    : "#F9FAFB",
                                },
                                transition: "all 0.15s ease",
                                px: 2,
                              }}
                            >
                              <div
                                className={`w-2 h-2 rounded-full mr-3 transition-all duration-200 ${
                                  isSubActive
                                    ? "bg-blue-500 scale-110"
                                    : "bg-gray-300"
                                }`}
                              ></div>
                              <Typography
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: isSubActive ? 600 : 500,
                                  fontFamily: "DM Sans, sans-serif",
                                }}
                              >
                                {sub.text}
                              </Typography>
                            </ListItemButton>
                          </Link>
                        );
                      })}
                    </div>
                  </Collapse>
                )}
              </div>
            );
          })}
        </List>
      </div>

      {/* LOGOUT */}
      <div>
        {isOpen && (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
        )}
        <ListItemButton
          onClick={() => setOpenExitModal(true)}
          sx={{
            borderRadius: "12px",
            minHeight: "48px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            justifyContent: isOpen ? "flex-start" : "center",
            px: isOpen ? 2 : 1,
            "&:hover": {
              backgroundColor: "#FEE2E2",
              transform: "translateX(4px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isOpen ? "40px" : "auto",
              color: "#DC2626",
              justifyContent: "center",
            }}
          >
            <ExitToAppIcon />
          </ListItemIcon>
          {isOpen && (
            <Typography
              sx={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "15px",
                fontWeight: 600,
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

export default React.memo(Sidebar);
