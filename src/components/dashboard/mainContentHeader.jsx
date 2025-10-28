import { Button, Typography, Badge, Divider } from "@mui/material";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Avatar from "@mui/material/Avatar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MarkUnreadChatAltOutlinedIcon from "@mui/icons-material/MarkUnreadChatAltOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import { useRouter } from "next/router";
import ExitModal from "../modal/exit-modal";
import { signOut, useSession } from "next-auth/react";

const MainContentHeader = ({ children, toggleSidebar }) => {
  const { data: session } = useSession();
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);
  const [openExitModal, setOpenExitModal] = useState(false);
  const router = useRouter();

  // Refs for click outside detection
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: "http://10.20.6.30:3000" });
  };

  const handleOpenExitModal = () => setOpenExitModal(false);

  const handleClickProfile = () => {
    setOpenProfile(!openProfile);
    setOpenNotification(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setOpenNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function stringToColor(string) {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name) {
    const nameParts = name.split(" ");
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[1][0]}`
        : nameParts[0][0];

    return {
      sx: {
        bgcolor: stringToColor(name),
        width: 40,
        height: 40,
        fontSize: "16px",
        fontWeight: 600,
      },
      children: initials,
    };
  }

  const handleClickNotification = () => {
    setOpenNotification(!openNotification);
    setOpenProfile(false);
  };

  return (
    <div className="bg-white p-4 h-[72px] sticky top-0 z-30 rounded-md border border-gray-200 flex justify-between items-center gap-4 ">
      <div className="flex items-center gap-4">
        <IconButton
          aria-label="menu"
          onClick={toggleSidebar}
          sx={{
            "&:hover": {
              backgroundColor: "#F3F4F6",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          sx={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "22px",
            fontWeight: 600,
            color: "#1F2937",
          }}
        >
          {children}
        </Typography>
      </div>

      <div className="flex items-center gap-2 relative">
        {/* Notification Button */}
        {/* <div ref={notificationRef} className="relative">
          <IconButton
            onClick={handleClickNotification}
            sx={{
              "&:hover": {
                backgroundColor: "#F3F4F6",
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {openNotification && (
            <div className="w-80 bg-white absolute border border-gray-200 shadow-xl right-0 z-50 top-14 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between p-4">
                <p className="text-lg font-semibold text-gray-800">
                  Уведомления
                </p>
                <Button
                  sx={{
                    textTransform: "none",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "12px",
                    color: "#3B82F6",
                    "&:hover": {
                      backgroundColor: "#EFF6FF",
                    },
                  }}
                >
                  Отметить все как прочитанные
                </Button>
              </div>

              <Divider />

              <div className="max-h-96 overflow-y-auto">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-500 p-2.5 rounded-lg flex-shrink-0">
                        <MarkUnreadChatAltOutlinedIcon
                          sx={{ color: "white", width: "20px", height: "20px" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1F2937",
                            mb: 0.5,
                          }}
                        >
                          Новое сообщение
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6B7280",
                            display: "block",
                          }}
                        >
                          У вас есть новое уведомление
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#9CA3AF",
                            fontSize: "11px",
                            mt: 0.5,
                            display: "block",
                          }}
                        >
                          5 минут назад
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />
              <div className="p-3 text-center">
                <Button
                  sx={{
                    textTransform: "none",
                    fontFamily: "DM Sans, sans-serif",
                    color: "#3B82F6",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Посмотреть все уведомления
                </Button>
              </div>
            </div>
          )}
        </div> */}

        {/* Profile Button */}
        <div ref={profileRef} className="relative">
          <IconButton
            onClick={handleClickProfile}
            sx={{
              padding: 0.5,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <Avatar
              {...stringAvatar(`${session?.user?.name} ${session?.user?.name}`)}
            />
          </IconButton>

          {openProfile && (
            <div className="w-72 bg-white absolute border border-gray-200 shadow-xl right-0 z-50 top-14 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <Avatar
                    {...stringAvatar(
                      `${session?.user?.name} ${session?.user?.name}`
                    )}
                  />
                  <div>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "16px",
                        color: "#1F2937",
                      }}
                    >
                      {session?.user?.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6B7280",
                        fontSize: "13px",
                      }}
                    >
                      Роль: admin
                    </Typography>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="p-3">
                <Link href="/dashboard/user-profile">
                  <Button
                    fullWidth
                    startIcon={<PersonOutlineIcon />}
                    sx={{
                      textTransform: "none",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      justifyContent: "flex-start",
                      color: "#1F2937",
                      fontFamily: "DM Sans, sans-serif",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#F3F4F6",
                      },
                    }}
                  >
                    Настройки профиля
                  </Button>
                </Link>

                <Button
                  fullWidth
                  startIcon={<LogoutIcon />}
                  onClick={() => setOpenExitModal(true)}
                  sx={{
                    textTransform: "none",
                    borderRadius: "10px",
                    padding: "10px 16px",
                    justifyContent: "flex-start",
                    color: "#DC2626",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                    marginTop: "4px",
                    "&:hover": {
                      backgroundColor: "#FEF2F2",
                    },
                  }}
                >
                  Выход
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ExitModal
        open={openExitModal}
        onClose={handleOpenExitModal}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default MainContentHeader;
