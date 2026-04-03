import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Link,
  Chip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import EastIcon from "@mui/icons-material/East";
import {
  searchUnits,
  getBreadcrumbPath,
  getChildrenOfUnit,
} from "@/utils/orgTreeBuilder";
import useAppTheme from "@/hooks/useAppTheme";

const ImprovedTransferModal = ({
  open,
  onClose,
  onSubmit,
  allUnits,
  selectedWorkplaceCount,
  sourceUnitId,
  loading,
}) => {
  const { isDark, border } = useAppTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [destinationUnitId, setDestinationUnitId] = useState(null);
  const [currentParentId, setCurrentParentId] = useState(null);
  const [navigationHistory, setNavigationHistory] = useState([]);

  // ── derived data ──────────────────────────────────────────────────────────

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchUnits(allUnits || [], searchTerm).filter(
      (u) => u.id !== sourceUnitId,
    );
  }, [searchTerm, allUnits, sourceUnitId]);

  const currentLevelUnits = useMemo(() => {
    if (searchTerm.trim()) return searchResults;
    if (currentParentId === null)
      return (allUnits || []).filter(
        (u) => !u.parent_id && u.id !== sourceUnitId,
      );
    return getChildrenOfUnit(allUnits || [], currentParentId).filter(
      (u) => u.id !== sourceUnitId,
    );
  }, [currentParentId, allUnits, searchTerm, searchResults, sourceUnitId]);

  const selectedUnit = useMemo(
    () =>
      destinationUnitId
        ? allUnits?.find((u) => u.id === destinationUnitId)
        : null,
    [destinationUnitId, allUnits],
  );

  const selectedBreadcrumb = useMemo(
    () =>
      selectedUnit ? getBreadcrumbPath(allUnits || [], selectedUnit.id) : [],
    [selectedUnit, allUnits],
  );

  const currentBreadcrumb = useMemo(
    () =>
      currentParentId !== null
        ? getBreadcrumbPath(allUnits || [], currentParentId)
        : [],
    [currentParentId, allUnits],
  );

  const hasChildren = (unitId) =>
    getChildrenOfUnit(allUnits || [], unitId).length > 0;

  // ── navigation ────────────────────────────────────────────────────────────

  const handleNavigateInto = (parentId) => {
    setNavigationHistory((h) => [...h, currentParentId]);
    setCurrentParentId(parentId);
  };

  const handleGoBack = () => {
    setNavigationHistory((h) => {
      const next = [...h];
      const prev = next.pop() ?? null;
      setCurrentParentId(prev);
      return next;
    });
  };

  const handleBreadcrumbClick = (unitId) => {
    const idx = navigationHistory.lastIndexOf(unitId);
    setNavigationHistory(idx >= 0 ? navigationHistory.slice(0, idx) : []);
    setCurrentParentId(unitId);
  };

  // ── submit / close ────────────────────────────────────────────────────────

  const resetState = () => {
    setDestinationUnitId(null);
    setSearchTerm("");
    setCurrentParentId(null);
    setNavigationHistory([]);
  };

  const handleSubmit = () => {
    if (destinationUnitId) {
      onSubmit(destinationUnitId);
      resetState();
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // ── styles ────────────────────────────────────────────────────────────────

  const blue = {
    50: "#E6F1FB",
    100: "#B5D4F4",
    200: "#85B7EB",
    600: "#185FA5",
    800: "#0C447C",
  };

  const token = {
    border: `1px solid ${border("#e5e7eb", "#374151")}`,
    selectedBg: isDark ? "rgba(24, 95, 165, 0.12)" : blue[50],
    selectedBorder: isDark ? blue[600] : blue[200],
    destBg: isDark ? "rgba(24, 95, 165, 0.1)" : blue[50],
    destBorder: isDark ? blue[600] : blue[200],
    destText: isDark ? blue[100] : blue[800],
    destMuted: isDark ? blue[200] : blue[600],
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* ── Header ── */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            mb: 1,
            borderRadius: "20px",
            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "grey.100",
            border: token.border,
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: blue[600],
              flexShrink: 0,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Перемещение рабочих мест
          </Typography>
        </Box>

        <Typography sx={{ fontWeight: 500, fontSize: "1rem", lineHeight: 1.3 }}>
          Выберите подразделение назначения
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Выбрано рабочих мест:{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
            {selectedWorkplaceCount}
          </Box>
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1.5 }}
      >
        {/* guard */}
        {(!allUnits || allUnits.length === 0) && (
          <Typography
            variant="body2"
            color="error"
            sx={{ p: 1.5, borderRadius: 1, bgcolor: "error.light" }}
          >
            ⚠️ Организационные единицы недоступны. Пожалуйста, повторите
            попытку.
          </Typography>
        )}

        {/* ── Search ── */}
        <TextField
          fullWidth
          placeholder="Поиск по названию или коду подразделения…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          autoFocus
          InputProps={{
            startAdornment: (
              <SearchIcon
                sx={{ mr: 1, fontSize: 18, color: "action.active" }}
              />
            ),
          }}
        />

        <Divider />

        {/* ── Breadcrumb navigation ── */}
        <AnimatePresence>
          {!searchTerm && currentBreadcrumb.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Button
                  size="small"
                  startIcon={
                    <ArrowBackIcon sx={{ fontSize: "14px !important" }} />
                  }
                  onClick={handleGoBack}
                  variant="outlined"
                  sx={{ borderRadius: "20px", fontSize: 12, py: 0.4, px: 1.5 }}
                >
                  Назад
                </Button>
                <Breadcrumbs
                  separator="›"
                  sx={{
                    "& .MuiBreadcrumbs-separator": {
                      mx: 0.25,
                      color: "text.disabled",
                    },
                  }}
                >
                  <Link
                    component="button"
                    variant="caption"
                    underline="hover"
                    onClick={() => {
                      setCurrentParentId(null);
                      setNavigationHistory([]);
                    }}
                    sx={{ cursor: "pointer", color: "primary.main" }}
                  >
                    Корень
                  </Link>
                  {currentBreadcrumb.map((item, i) =>
                    i < currentBreadcrumb.length - 1 ? (
                      <Link
                        key={item.id}
                        component="button"
                        variant="caption"
                        underline="hover"
                        onClick={() => handleBreadcrumbClick(item.id)}
                        sx={{ cursor: "pointer", color: "primary.main" }}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Typography
                        key={item.id}
                        variant="caption"
                        color="text.primary"
                        fontWeight={500}
                      >
                        {item.name}
                      </Typography>
                    ),
                  )}
                </Breadcrumbs>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── List header ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: -1,
          }}
        >
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            {searchTerm
              ? "Результаты поиска"
              : currentParentId === null
                ? "Все подразделения"
                : "Подразделения"}
          </Typography>
          {searchTerm && (
            <Typography variant="caption" color="text.disabled">
              Найдено: {searchResults.length}
            </Typography>
          )}
        </Box>

        {/* ── Unit List ── */}
        <List
          disablePadding
          sx={{
            border: token.border,
            borderRadius: 1.5,
            overflow: "hidden",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          <AnimatePresence mode="popLayout">
            {currentLevelUnits.length > 0 ? (
              currentLevelUnits.map((unit, index) => {
                const isSelected = destinationUnitId === unit.id;
                const hasKids = hasChildren(unit.id);

                return (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: index * 0.02, duration: 0.15 }}
                  >
                    <Box
                      onClick={() => setDestinationUnitId(unit.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.75,
                        py: 1.25,
                        cursor: "pointer",
                        borderBottom: token.border,
                        bgcolor: isSelected ? token.selectedBg : "transparent",
                        transition: "background 0.12s",
                        "&:last-child": { borderBottom: "none" },
                        "&:hover": {
                          bgcolor: isSelected
                            ? token.selectedBg
                            : isDark
                              ? "rgba(255,255,255,0.04)"
                              : "grey.50",
                        },
                      }}
                    >
                      {/* icon */}
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: 1.5,
                          bgcolor: isSelected
                            ? isDark
                              ? "rgba(24,95,165,0.25)"
                              : blue[100]
                            : isDark
                              ? "rgba(255,255,255,0.06)"
                              : "grey.100",
                          border: `1px solid ${isSelected ? (isDark ? blue[600] : blue[200]) : border("#e5e7eb", "#374151")}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {hasKids ? (
                          <FolderIcon
                            sx={{
                              fontSize: 15,
                              color: isSelected ? blue[600] : "action.active",
                            }}
                          />
                        ) : (
                          <BusinessIcon
                            sx={{
                              fontSize: 14,
                              color: isSelected ? blue[600] : "action.active",
                            }}
                          />
                        )}
                      </Box>

                      {/* text */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected
                              ? isDark
                                ? blue[100]
                                : blue[800]
                              : "text.primary",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {unit.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isSelected
                              ? isDark
                                ? blue[200]
                                : blue[600]
                              : "text.disabled",
                            fontFamily: "monospace",
                            fontSize: "0.7rem",
                          }}
                        >
                          {unit.unit_code}
                        </Typography>
                      </Box>

                      {/* actions */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        {isSelected && (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: blue[600] }}
                          />
                        )}
                        {hasKids && !searchTerm && (
                          <Box
                            component="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateInto(unit.id);
                            }}
                            title="Открыть подразделения"
                            sx={{
                              width: 26,
                              height: 26,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: token.border,
                              borderRadius: 1,
                              bgcolor: "transparent",
                              cursor: "pointer",
                              color: "action.active",
                              "&:hover": {
                                bgcolor: isDark
                                  ? "rgba(255,255,255,0.08)"
                                  : "grey.100",
                                color: "text.primary",
                              },
                            }}
                          >
                            <ChevronRightIcon sx={{ fontSize: 16 }} />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </motion.div>
                );
              })
            ) : (
              <Box
                sx={{
                  py: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  color: "text.disabled",
                }}
              >
                <FolderIcon sx={{ fontSize: 32, opacity: 0.35 }} />
                <Typography variant="body2">
                  {searchTerm ? "Ничего не найдено" : "Подразделений нет"}
                </Typography>
              </Box>
            )}
          </AnimatePresence>
        </List>

        <Divider />

        {/* ── Selected destination box ── */}
        <AnimatePresence>
          {selectedUnit && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 1.25,
                  alignItems: "flex-start",
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: token.destBg,
                  border: `1px solid ${token.destBorder}`,
                }}
              >
                {/* icon */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: isDark ? "rgba(24,95,165,0.25)" : blue[100],
                    border: `1px solid ${isDark ? blue[600] : blue[200]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    mt: 0.25,
                  }}
                >
                  <BusinessIcon sx={{ fontSize: 16, color: blue[600] }} />
                </Box>

                {/* content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: token.destMuted,
                      fontWeight: 600,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Выбранное подразделение
                  </Typography>

                  {/* breadcrumb path */}
                  {selectedBreadcrumb.length > 1 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.75,
                      }}
                    >
                      {selectedBreadcrumb.slice(0, -1).map((item, i) => (
                        <React.Fragment key={item.id}>
                          <Typography
                            variant="caption"
                            sx={{ color: token.destMuted, opacity: 0.7 }}
                          >
                            {item.name}
                          </Typography>
                          {i < selectedBreadcrumb.length - 2 && (
                            <Typography
                              variant="caption"
                              sx={{ color: token.destMuted, opacity: 0.4 }}
                            >
                              ›
                            </Typography>
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  )}

                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: token.destText,
                    }}
                  >
                    {selectedUnit.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: token.destMuted, fontFamily: "monospace" }}
                  >
                    {selectedUnit.unit_code}
                  </Typography>
                </Box>

                {/* deselect */}
                <Box
                  component="button"
                  onClick={() => setDestinationUnitId(null)}
                  title="Снять выбор"
                  sx={{
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    color: token.destMuted,
                    borderRadius: 1,
                    opacity: 0.6,
                    flexShrink: 0,
                    "&:hover": { opacity: 1 },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 15 }} />
                </Box>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{ borderRadius: "20px" }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!destinationUnitId || loading}
          startIcon={
            loading ? (
              <CircularProgress size={16} />
            ) : (
              <EastIcon sx={{ fontSize: "16px !important" }} />
            )
          }
          sx={{ borderRadius: "20px", px: 2.5 }}
        >
          {loading ? "Перемещение…" : "Переместить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImprovedTransferModal;
