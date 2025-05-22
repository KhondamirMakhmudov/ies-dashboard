import { Button, Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Avatar from "@mui/material/Avatar";
import { useState } from "react";
import Link from "next/link";
import MarkUnreadChatAltOutlinedIcon from "@mui/icons-material/MarkUnreadChatAltOutlined";

const MainContentHeader = ({ children, toggleSidebar }) => {
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotification, setOpenNotification] = useState(false);

  const handleClickProfile = () => {
    setOpenProfile(!openProfile);
    setOpenNotification(false);
  };

  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  const handleClickNotification = () => {
    setOpenNotification(!openNotification);
    setOpenProfile(false);
  };
  return (
    <div className="bg-white p-[12px] rounded-md flex justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <IconButton aria-label="menu" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
        <Typography
          sx={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "22px",
            fontWeight: "medium",
          }}
        >
          {children}
        </Typography>
      </div>

      <div className="flex items-center relative">
        <IconButton onClick={handleClickNotification}>
          <NotificationsIcon />
        </IconButton>
        <IconButton onClick={handleClickProfile}>
          <Avatar {...stringAvatar("Otavali Saksonov")} />
        </IconButton>

        {openNotification && (
          <div className="w-100 h-45 bg-white absolute border border-gray-200 overflow-hidden right-18 z-50 top-18 rounded-lg ">
            <div className="flex items-center justify-between p-[12px]">
              <p className="text-base font-medium ">Eslatmalar</p>
              <Button
                sx={{
                  textTransform: "none",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Hammasi o&apos;qilgan deb belgilang
              </Button>
            </div>

            <div className="bg-gray-200 w-full h-[1px]"></div>

            <div className="p-[18px] text-[17px] flex flex-col gap-[12px]">
              <Link href={"/dashboard/user-profile"}>
                <Button
                  sx={{
                    width: "100%",
                    border: "none",
                    textTransform: "none",
                    borderRadius: "16px",
                    bgcolor: "#ECF3FF",
                  }}
                >
                  <p>Profil sozlamalari</p>
                </Button>
              </Link>

              <Button
                sx={{
                  width: "100%",
                  border: "none",
                  textTransform: "none",
                  borderRadius: "16px",
                  bgcolor: "#ECF3FF",
                }}
              >
                <p>Chiqish</p>
              </Button>
            </div>
          </div>
        )}

        {openProfile && (
          <div className="w-60 h-45 bg-white absolute border border-gray-200 overflow-hidden right-0 z-50 top-18 rounded-lg ">
            <p className="text-base font-medium p-[18px]">
              👋 Otavali Saksonov
            </p>

            <div className="bg-gray-200 w-full h-[1px]"></div>

            <div className="p-[18px] text-[17px] flex flex-col gap-[12px]">
              <Link href={"/dashboard/user-profile"}>
                <Button
                  sx={{
                    width: "100%",
                    border: "none",
                    textTransform: "none",
                    borderRadius: "16px",
                    bgcolor: "#ECF3FF",
                  }}
                >
                  <p>Profil sozlamalari</p>
                </Button>
              </Link>

              <Button
                sx={{
                  width: "100%",
                  border: "none",
                  textTransform: "none",
                  borderRadius: "16px",
                  bgcolor: "#ECF3FF",
                }}
              >
                <p>Chiqish</p>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default MainContentHeader;
