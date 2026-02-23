"use client";
import { useTheme } from "next-themes";
import {
  Switch,
  Typography,
  useTheme as useMuiTheme,
  Slider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store";

export default function SettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const [mounted, setMounted] = useState(false);
  const {
    darkMode,
    setMode,
    highContrast,
    setHighContrast,
    fontScale,
    setFontScale,
    fontFamily,
    setFontFamily,
  } = useSettingsStore();

  // Hydration issue prevention
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const desiredTheme = darkMode ? "dark" : "light";
    if (theme !== desiredTheme) {
      setTheme(desiredTheme);
    }
  }, [darkMode, mounted, setTheme, theme]);

  useEffect(() => {
    if (!mounted) return;
    if (fontFamily === "Inter") {
      setFontFamily('"Inter", sans-serif');
    }
    if (fontFamily === "Nunito Sans") {
      setFontFamily('"Nunito Sans", sans-serif');
    }
  }, [fontFamily, mounted, setFontFamily]);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  const handleThemeToggle = (e) => {
    const isDark = e.target.checked;
    setMode(isDark);
    setTheme(isDark ? "dark" : "light");
  };

  const handleHighContrastToggle = (e) => {
    setHighContrast(e.target.checked);
  };

  const handleFontScaleChange = (_event, value) => {
    setFontScale(Number(value));
  };

  const handleFontFamilyChange = (event) => {
    setFontFamily(event.target.value);
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
              Повышенная контрастность
            </h3>
            <p style={{ color: muiTheme.palette.text.secondary }}>
              Усиливает контраст для лучшей читаемости
            </p>
          </div>

          <div>
            <Switch
              checked={highContrast}
              onChange={handleHighContrastToggle}
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

        <div
          className="p-[12px] rounded-lg my-[15px]"
          style={{
            backgroundColor: currentTheme === "dark" ? "#2a2a2a" : "#f5f5f5",
          }}
        >
          <div className="flex items-center justify-between mb-[10px]">
            <div>
              <h3
                className="text-lg"
                style={{ color: muiTheme.palette.text.primary }}
              >
                Масштаб шрифта
              </h3>
              <p style={{ color: muiTheme.palette.text.secondary }}>
                От 90% до 130%
              </p>
            </div>
            <Typography color="text.primary">
              {Math.round((fontScale || 1) * 100)}%
            </Typography>
          </div>
          <Slider
            value={fontScale || 1}
            min={0.9}
            max={1.3}
            step={0.05}
            onChange={handleFontScaleChange}
            valueLabelDisplay="auto"
          />
        </div>

        <div
          className="p-[12px] rounded-lg my-[15px]"
          style={{
            backgroundColor: currentTheme === "dark" ? "#2a2a2a" : "#f5f5f5",
          }}
        >
          <div className="flex items-center justify-between mb-[10px]">
            <div>
              <h3
                className="text-lg"
                style={{ color: muiTheme.palette.text.primary }}
              >
                Шрифт интерфейса
              </h3>
              <p style={{ color: muiTheme.palette.text.secondary }}>
                Выберите основной шрифт
              </p>
            </div>
          </div>

          <Box sx={{ maxWidth: 320 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="font-family-label">Шрифт</InputLabel>
              <Select
                labelId="font-family-label"
                value={fontFamily}
                label="Шрифт"
                onChange={handleFontFamilyChange}
              >
                <MenuItem value='"Nunito Sans", sans-serif'>
                  Nunito Sans
                </MenuItem>
                <MenuItem value='"Inter", sans-serif'>Inter</MenuItem>
                <MenuItem value='system-ui, "Segoe UI", Arial, sans-serif'>
                  Системный
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
