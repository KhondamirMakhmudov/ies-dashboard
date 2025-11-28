"use client";
import { useTheme } from "next-themes";
import { Switch, Typography, useTheme as useMuiTheme } from "@mui/material";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration issue prevention
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleThemeToggle = (e) => {
    setTheme(e.target.checked ? "dark" : "light");
  };

  return (
    <DashboardLayout headerTitle={"Настройки"}>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.3 }}
        className="p-[15px] border rounded-lg my-[20px] manrope"
        style={{
          backgroundColor: muiTheme.palette.background.paper,
          borderColor: currentTheme === "dark" ? "#333" : "#E7E7F4",
        }}
      >
        <Typography variant="h6" color="text.primary">
          Настройки панели управления
        </Typography>

        <div
          className="p-[12px] rounded-lg my-[15px] flex items-center justify-between"
          style={{
            backgroundColor: currentTheme === "dark" ? "#2a2a2a" : "#f5f5f5",
          }}
        >
          <div>
            <h3
              className="text-lg"
              style={{ color: muiTheme.palette.text.primary }}
            >
              Темная тема
            </h3>
            <p style={{ color: muiTheme.palette.text.secondary }}>
              Переключение между светлой и темной темами
            </p>
          </div>

          <div>
            <Switch
              checked={currentTheme === "dark"}
              onChange={handleThemeToggle}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#A877FD",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#A877FD",
                },
              }}
            />
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
