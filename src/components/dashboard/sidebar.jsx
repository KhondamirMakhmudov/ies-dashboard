import Image from "next/image";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import TableChartIcon from "@mui/icons-material/TableChart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import { useRouter } from "next/router";
const menuItems = [
  {
    text: "Kategoriyalar",
    icon: <CategoryIcon />,
    path: "/dashboard/categories",
  },
  {
    text: "Umumiy jadval",
    icon: <TableChartIcon />,
    path: "/dashboard/general",
  },
  {
    text: "Foydalanuvchi profili",
    icon: <AccountCircleIcon />,
    path: "/dashboard/user-profile",
  },
  {
    text: "Ruxsat etilganlar",
    icon: <LockPersonIcon />,
    path: "/dashboard/who-has-access",
  },
];

export default function Sidebar({ isOpen = true }) {
  const router = useRouter();
  return (
    <aside
      className={`${
        isOpen ? "w-[300px]" : "w-[80px]"
      } h-screen bg-white px-[16px] py-[25px] transition-all duration-300 overflow-hidden`}
    >
      <div
        onClick={() => router.push("/")}
        className="my-[32px] flex justify-center items-center gap-4 cursor-pointer"
      >
        <Image src="/icons/logo.svg" alt="logo" width={53} height={76} />
        {isOpen && (
          <p className="text-[28px] font-medium whitespace-nowrap">
            TM va SITI
          </p>
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
