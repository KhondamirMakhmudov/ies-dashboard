import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormHelperText,
  Paper,
  Box,
  Chip,
  Tree,
  TreeItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HiveIcon from "@mui/icons-material/Hive";
import DetailsIcon from "@mui/icons-material/Details";
import HexagonIcon from "@mui/icons-material/Hexagon";
import StarIcon from "@mui/icons-material/Star";
import CustomSelect from "@/components/select";
import useAppTheme from "@/hooks/useAppTheme";
import { motion } from "framer-motion";
import { get } from "lodash";

const TransferWorkplacesModal = ({
  open,
  onClose,
  onSubmit,
  selectedWorkplaces = [],
  sourceUnitName = "",
  destinationUnitId,
  onDestinationChange,
  allUnits = [],
  sourceUnitId,
  isLoading = false,
}) => {
  const { bg, isDark, border, text } = useAppTheme();

  // Get color for hierarchy level
  const getUnitColor = (unit, allUnits) => {
    const getLevel = (u, units, level = 0) => {
      const found = units.find((item) => item.id === u.id);
      if (!found?.parent_id) return level;
      return getLevel({ id: found.parent_id }, units, level + 1);
    };
    const level = getLevel(unit, allUnits);
    const colors = [
      { bg: "#ECF2FF", color: "#1E5EFF" }, // Level 1 - Blue
      { bg: "#FFF4C9", color: "#FFC700" }, // Level 2 - Yellow
      { bg: "#C4F8E2", color: "#1FD286" }, // Level 3 - Green
      { bg: "#FFE8D6", color: "#FF9600" }, // Level 4 - Orange
      { bg: "#FFD9D9", color: "#FF4D4D" }, // Level 5 - Red
    ];
    return colors[level % colors.length];
  };

  // Filter available units (exclude source unit)
  const availableUnits = useMemo(() => {
    return allUnits
      .filter((u) => u.id !== sourceUnitId)
      .sort((a, b) => {
        // Sort by hierarchy level, then name
        const levelA = allUnits.filter((u) => u.id === a.id).length;
        const levelB = allUnits.filter((u) => u.id === b.id).length;
        return levelA - levelB || a.name.localeCompare(b.name);
      });
  }, [allUnits, sourceUnitId]);

  const unitOptions = useMemo(
    () =>
      availableUnits.map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    [availableUnits],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "18px",
          fontWeight: 600,
          color: text("#1f2937", "#ffffff"),
          borderBottom: `1px solid ${border("#e5e7eb", "#333333")}`,
          paddingBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <SendIcon sx={{ color: "#4182F9", fontSize: 24 }} />
        Переместить рабочие места
      </DialogTitle>

      <DialogContent sx={{ paddingY: "24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Source Information */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: bg("#eff6ff", "#1e3a8a"),
              border: `2px solid ${border("#bfdbfe", "#1e40af")}`,
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <AccountTreeIcon
                sx={{
                  color: "#1E5EFF",
                  fontSize: 20,
                }}
              />
              <span
                className={`text-xs font-medium ${text("text-blue-600", "text-blue-300")}`}
              >
                ИСТОЧНИК
              </span>
            </div>
            <h3
              className={`${text("text-blue-900", "text-blue-100")} font-semibold text-sm mb-3`}
            >
              {sourceUnitName}
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedWorkplaces.length > 0 && (
                <Chip
                  label={`${selectedWorkplaces.length} рабочих мест выбрано`}
                  color="primary"
                  size="small"
                  icon={<SendIcon />}
                  sx={{
                    backgroundColor: "#1E5EFF",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              )}
            </div>
          </Paper>

          {/* Destination Selection */}
          <FormControl fullWidth>
            <label
              className={`text-sm font-semibold mb-2 block ${text("text-gray-700", "text-gray-300")}`}
            >
              Целевая организационная единица
            </label>
            <CustomSelect
              options={unitOptions}
              value={destinationUnitId}
              onChange={onDestinationChange}
              placeholder="Выберите куда переместить..."
              returnObject={false}
              isMulti={false}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  border: `2px solid ${border("#d1d5db", "#4b5563")}`,
                  backgroundColor: bg("#ffffff", "#1e1e1e"),
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#4182F9",
                  },
                  "&.Mui-focused": {
                    borderColor: "#4182F9",
                    boxShadow: "0 0 0 3px rgba(65, 130, 249, 0.1)",
                  },
                },
              }}
            />
            <FormHelperText sx={{ color: text("#6b7280", "#9ca3af") }}>
              {availableUnits.length} доступных единиц для перемещения
            </FormHelperText>
          </FormControl>

          {/* Destination Preview */}
          {destinationUnitId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: bg("#f0fdf4", "#064e3b"),
                  border: `2px solid ${border("#bbf7d0", "#10b981")}`,
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <AccountTreeIcon
                    sx={{
                      color: "#10b981",
                      fontSize: 20,
                    }}
                  />
                  <span
                    className={`text-xs font-medium ${text("text-green-600", "text-green-300")}`}
                  >
                    НАЗНАЧЕНИЕ
                  </span>
                </div>
                <h3
                  className={`${text("text-green-900", "text-green-100")} font-semibold text-sm`}
                >
                  {availableUnits.find((u) => u.id === destinationUnitId)?.name}
                </h3>
              </Paper>
            </motion.div>
          )}

          {/* Confirmation Message */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: bg("#fef3c7", "#78350f"),
              border: `2px solid ${border("#fde68a", "#ea580c")}`,
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            <div
              className={`text-xs ${text("text-amber-800", "text-amber-100")} flex items-start gap-2`}
            >
              <span className="font-semibold">⚠️</span>
              <span>
                При перемещении{" "}
                <strong>{selectedWorkplaces.length} рабочих мест</strong>,
                все сотрудники будут переведены в выбранную единицу. Это
                действие нельзя отменить.
              </span>
            </div>
          </Paper>
        </motion.div>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${border("#e5e7eb", "#333333")}`,
          padding: "16px",
          gap: "12px",
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{
            textTransform: "none",
            fontFamily: "DM Sans, sans-serif",
            borderRadius: "8px",
            borderColor: border("#d1d5db", "#4b5563"),
            color: text("#374151", "#d1d5db"),
            "&:hover": {
              backgroundColor: bg("#f3f4f6", "#374151"),
            },
          }}
        >
          Отменить
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!destinationUnitId || selectedWorkplaces.length === 0 || isLoading}
          startIcon={<SendIcon />}
          sx={{
            textTransform: "none",
            fontFamily: "DM Sans, sans-serif",
            backgroundColor: destinationUnitId ? "#10b981" : "#d1d5db",
            color: "white",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: destinationUnitId ? "#059669" : "#d1d5db",
            },
            "&:disabled": {
              backgroundColor: "#d1d5db",
              color: "#9ca3af",
            },
          }}
        >
          {isLoading ? "Перемещение..." : "Переместить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferWorkplacesModal;
