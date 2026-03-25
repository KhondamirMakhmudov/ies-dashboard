"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { signOut, useSession } from "next-auth/react";
import useAppTheme from "@/hooks/useAppTheme";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const allMenuItems = [
  {
    text: "Сотрудники",
    icon: <ContactPageIcon />,
    path: "/dashboard/employees",
    roles: [
      "admin",
      "main-hr-tpp",
      "hr-admin",
      "hr-moderator",
      "acs-admin",
      "hr-main-tash-iem",
    ],
  },
  {
    text: "Структура организации",
    icon: <MediationIcon />,
    submenu: [
      {
        text: "Справочник",
        path: "/dashboard/structure-organizations/reference",
        roles: ["admin"],
      },
      {
        text: "Руководства управлении",
        path: "/dashboard/structure-organizations/management-organizations",
        roles: ["admin", "hr-admin", "hr-main-tash-iem"],
      },
      {
        text: "Место работы",
        path: "/dashboard/structure-organizations/workplace",
        roles: ["admin", "hr-admin", "hr-main-tash-iem"],
      },
    ],
    roles: ["admin", "hr-admin", "hr-main-tash-iem"],
  },
  {
    text: "Точки контроля",
    icon: <SecurityIcon />,
    submenu: [
      {
        text: "Контрольные точки",
        icon: <SecurityIcon />,
        path: "/dashboard/checkpoints",
        roles: ["admin", "acs-admin"],
      },
      {
        text: "Устройства (камеры)",
        icon: <CameraAltIcon />,
        path: "/dashboard/devices",
        roles: ["admin", "acs-admin"],
      },
      {
        text: "Точки доступа",
        icon: <WifiIcon />,
        path: "/dashboard/access-points",
        roles: ["admin", "acs-admin"],
      },
    ],
    roles: ["admin", "acs-admin"],
  },
  {
    text: "Отчёты",
    icon: <AssessmentIcon />,
    submenu: [
      {
        text: "по сотрудникам",
        path: "/dashboard/reports/employee-uuid",
        roles: ["admin", "hr-admin", "hr-moderator", "hr-tash-iem"],
      },
      {
        text: "по подразделениям",
        path: "/dashboard/reports/report-by-orgUnit",
        roles: ["admin", "hr-admin", "hr-main-tash-iem"],
      },
      {
        text: "по подразделениям и точкам доступа",
        path: "/dashboard/reports/report-by-entrypointid-orgUnit",
        roles: ["admin", "hr-admin", "hr-main-tash-iem"],
      },
      {
        text: "отчёты всех сотрудников",
        path: "/dashboard/reports/all-employees",
        roles: ["admin", "hr-admin", "hr-moderator", "hr-main-tash-iem"],
      },
    ],
    roles: ["admin", "hr-admin", "hr-moderator", "hr-main-tash-iem"],
  },
  {
    text: "Расписание",
    icon: <EventNoteIcon />,
    path: "/dashboard/schedule",
    roles: ["admin", "acs-admin"],
  },
  {
    text: "Командировки",
    icon: <AirlineStopsIcon />,
    path: "/dashboard/business-trips",
    roles: ["admin", "hr-admin"],
  },
  {
    text: "Управление профилями",
    icon: <ManageAccountsIcon />,
    submenu: [
      {
        text: "Пользователи",
        path: "/dashboard/users",
        roles: ["admin"],
      },
      {
        text: "Роли",
        path: "/dashboard/roles",
        roles: ["admin"],
      },
      {
        text: "Доступ и права",
        path: "/dashboard/permission-of-roles",
        roles: ["admin"],
      },
    ],
    roles: ["admin"],
  },
  {
    text: "Настройки",
    icon: <SettingsRoundedIcon />,
    path: "/dashboard/settings",
    roles: ["admin", "hr-admin", "hr-moderator", "acs-admin"],
  },
];

function Sidebar({ isOpen = true }) {
  const { data: session } = useSession();
  const [openExitModal, setOpenExitModal] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const router = useRouter();
  const { isDark, bg, text, border } = useAppTheme();

  // Helper function to check if user has required roles
  const hasRequiredRole = (requiredRoles, userRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const normalizedUserRoles = userRoles.map((r) =>
      typeof r === "string" ? r.toLowerCase() : "",
    );

    return requiredRoles.some((role) =>
      normalizedUserRoles.includes(role.toLowerCase()),
    );
  };

  // Filter menu items based on user's roles (both parent and submenu items)
  const menuItems = useMemo(() => {
    const userRoles = session?.user?.roles || [];

    // If no roles, return empty array
    if (!Array.isArray(userRoles) || userRoles.length === 0) {
      return [];
    }

    return allMenuItems
      .filter((item) => hasRequiredRole(item.roles, userRoles))
      .map((item) => {
        // If item has submenu, filter submenu items based on roles
        if (item.submenu) {
          const filteredSubmenu = item.submenu.filter((subItem) =>
            hasRequiredRole(subItem.roles, userRoles),
          );

          // Only return the parent item if it has at least one visible submenu item
          if (filteredSubmenu.length > 0) {
            return {
              ...item,
              submenu: filteredSubmenu,
            };
          }
          return null;
        }

        return item;
      })
      .filter(Boolean); // Remove null items
  }, [session?.user?.roles]);

  useEffect(() => {
    const newOpen = {};
    menuItems.forEach((item, index) => {
      if (
        item.submenu?.some(
          (sub) =>
            router.pathname === sub.path ||
            router.pathname.startsWith(sub.path + "/"),
        )
      ) {
        newOpen[index] = true;
      }
    });
    setOpenSubmenus(newOpen);
  }, [menuItems, router.pathname]);

  const handleToggleSubmenu = (index) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: "/" });
  };

  // Show loading or no access state
  if (!session?.user?.roles || session.user.roles.length === 0) {
    return (
      <aside
        className={`${
          isOpen ? "w-[330px]" : "w-[80px]"
        } h-screen border-r px-4 py-6 transition-all duration-300 overflow-y-auto flex flex-col justify-between`}
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        <div className="flex items-center justify-center h-full">
          <Typography
            sx={{ color: text("#6b7280", "#9ca3af") }}
            className="text-center"
          >
            Нет доступа
          </Typography>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`${
        isOpen ? "w-[330px]" : "w-[80px]"
      } h-screen border-r px-4 py-6 transition-all duration-300 overflow-y-auto flex flex-col justify-between`}
      style={{
        backgroundColor: bg("#ffffff", "#1e1e1e"),
        borderColor: border("#e5e7eb", "#333333"),
      }}
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
              <p
                className="text-base font-semibold leading-tight"
                style={{ color: text("#1f2937", "#f3f4f6") }}
              >
                ISSIQLIK ELЕKTR
              </p>
              <p
                className="text-sm"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                STANSIYALARI AJ
              </p>
            </motion.div>
          )}
        </div>

        {isOpen && (
          <div
            className="h-px mb-4"
            style={{
              background: isDark
                ? "linear-gradient(to right, transparent, #374151, transparent)"
                : "linear-gradient(to right, transparent, #e5e7eb, transparent)",
            }}
          ></div>
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
                  router.pathname.startsWith(sub.path + "/"),
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
                      isActive || isAnySubmenuActive
                        ? isDark
                          ? "#f3f4f6"
                          : "#1F2937"
                        : isDark
                          ? "#9ca3af"
                          : "#6B7280",
                    background:
                      isActive || isAnySubmenuActive
                        ? isDark
                          ? "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)"
                          : "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)"
                        : "transparent",
                    border:
                      isActive || isAnySubmenuActive
                        ? isDark
                          ? "1px solid #3b82f6"
                          : "1px solid #BFDBFE"
                        : "1px solid transparent",
                    "&:hover": {
                      backgroundColor:
                        isActive || isAnySubmenuActive
                          ? isDark
                            ? "#1e40af"
                            : "#DBEAFE"
                          : isDark
                            ? "#2a2a2a"
                            : "#F9FAFB",
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
                        isActive || isAnySubmenuActive
                          ? "#3B82F6"
                          : isDark
                            ? "#9ca3af"
                            : "#9CA3AF",
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
                    <div
                      className="ml-6 mt-1 space-y-1 border-l-2 pl-4"
                      style={{
                        borderColor: border("#f3f4f6", "#374151"),
                      }}
                    >
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
                                color: isSubActive
                                  ? isDark
                                    ? "#f3f4f6"
                                    : "#1F2937"
                                  : isDark
                                    ? "#9ca3af"
                                    : "#6B7280",
                                backgroundColor: isSubActive
                                  ? isDark
                                    ? "#2a2a2a"
                                    : "#F3F4F6"
                                  : "transparent",
                                "&:hover": {
                                  backgroundColor: isSubActive
                                    ? isDark
                                      ? "#333333"
                                      : "#E5E7EB"
                                    : isDark
                                      ? "#2a2a2a"
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
                                    : isDark
                                      ? "bg-gray-600"
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

        {/* No menu items available message */}
        {menuItems.length === 0 && isOpen && (
          <div className="text-center py-8">
            <Typography
              sx={{
                color: text("#9ca3af", "#6b7280"),
                fontSize: "14px",
                fontStyle: "italic",
              }}
            >
              Нет доступных пунктов меню
            </Typography>
          </div>
        )}
      </div>

      {/* LOGOUT */}
      <div>
        {isOpen && (
          <div
            className="h-px mb-4"
            style={{
              background: isDark
                ? "linear-gradient(to right, transparent, #374151, transparent)"
                : "linear-gradient(to right, transparent, #e5e7eb, transparent)",
            }}
          ></div>
        )}
        <ListItemButton
          onClick={() => setOpenExitModal(true)}
          sx={{
            borderRadius: "12px",
            minHeight: "48px",
            backgroundColor: isDark ? "#7f1d1d" : "#FEF2F2",
            border: isDark ? "1px solid #991b1b" : "1px solid #FECACA",
            color: isDark ? "#fca5a5" : "#DC2626",
            justifyContent: isOpen ? "flex-start" : "center",
            px: isOpen ? 2 : 1,
            "&:hover": {
              backgroundColor: isDark ? "#991b1b" : "#FEE2E2",
              transform: "translateX(4px)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: isOpen ? "40px" : "auto",
              color: isDark ? "#fca5a5" : "#DC2626",
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
