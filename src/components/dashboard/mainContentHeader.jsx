import { Button, Typography, Badge, Divider } from "@mui/material";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Avatar from "@mui/material/Avatar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // Refs for click outside detection
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Hide back button on main dashboard page
  const showBackButton = router.pathname !== "/dashboard";

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: "http://10.20.6.30:3000" });
  };

  const handleOpenExitModal = () => setOpenExitModal(false);

  const handleClickProfile = () => {
    setOpenProfile(!openProfile);
    setOpenNotification(false);
  };

  const handleBack = () => {
    router.back();
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    <div
      className={`p-4 h-[72px] sticky top-0 z-30 rounded-md border flex justify-between items-center gap-4 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-lg bg-white/70 shadow-lg border-gray-300"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Back Button */}
        {showBackButton && (
          <IconButton
            onClick={handleBack}
            sx={{
              backgroundColor: "#DFEDFE",
              width: "40px",
              height: "40px",
              "&:hover": {
                backgroundColor: "#3B82F6",
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
                transform: "translateX(-2px)",
              },
              transition: "all 0.2s",
            }}
          >
            <ArrowBackIcon sx={{ color: "#3B82F6", fontSize: 20 }} />
          </IconButton>
        )}

        {/* Menu Button */}
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

        {/* Title */}
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
