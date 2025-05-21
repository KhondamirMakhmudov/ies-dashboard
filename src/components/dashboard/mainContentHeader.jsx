import { Typography } from "@mui/material";
import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
const MainContentHeader = ({ children, toggleSidebar }) => {
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

      <div>
        <IconButton>
          <NotificationsIcon />
        </IconButton>
      </div>
    </div>
  );
};
export default MainContentHeader;
