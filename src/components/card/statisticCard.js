import React from "react";
import { Typography } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import LinkIcon from "@mui/icons-material/Link";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import useAppTheme from "@/hooks/useAppTheme";
import CountUp from "react-countup";

const StatCard = ({ title, value, icon: Icon, iconColor }) => {
  const { bg, text, border, isDark } = useAppTheme();

  // Smart color mapping based on title
  const getIconColor = () => {
    // If a custom color is provided and it's not "black", use it
    if (iconColor && iconColor !== "black") {
      return iconColor;
    }

    // Otherwise, use smart defaults based on the card title
    const colorMap = {
      "Всего пользователей": "#3b82f6", // Blue
      "С ролями": "#10b981", // Green
      "С привязанным сотрудником": "#f59e0b", // Amber
      Администраторы: "#ef4444", // Red
    };

    return colorMap[title] || "#407BFF"; // Default blue
  };

  const finalIconColor = getIconColor();

  return (
    <div
      className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      style={{
        background: bg(
          "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          "linear-gradient(135deg, #1E1E1E 0%, #2a2a2a 100%)",
        ),
        borderColor: border("#e5e7eb", "#374151"),
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1">
          <Typography
            variant="body2"
            className="font-medium mb-3"
            style={{ color: text("#6b7280", "#9ca3af") }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            className="font-bold"
            style={{ color: text("#111827", "#f9fafb") }}
          >
            <CountUp end={value} duration={1.5} separator="," />
          </Typography>
        </div>
        <div
          className="p-3 rounded-lg transition-all duration-300"
          style={{
            background: `${finalIconColor}15`, // Semi-transparent background
          }}
        >
          <Icon
            sx={{
              fontSize: 32,
              color: finalIconColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
