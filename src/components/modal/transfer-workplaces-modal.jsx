import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CloseIcon from "@mui/icons-material/Close";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import WorkIcon from "@mui/icons-material/Work";
import useAppTheme from "@/hooks/useAppTheme";

/**
 * TransferWorkplacesModal
 *
 * Props:
 *   open               – boolean
 *   onClose            – () => void
 *   onSubmit           – () => void  (called when user confirms)
 *   selectedWorkplaceIds – string[]  (ids of workplaces to move)
 *   sourceUnit         – { id, name, breadcrumb: [{id,name}][] } | null
 *   allFlatUnits       – { id, name, depth, breadcrumb }[]  (flat tree from flattenUnits())
 *   sourceUnitId       – string | null
 *   destinationUnitId  – string | null
 *   onDestinationChange – (id: string) => void
 */
const TransferWorkplacesModal = ({
  open,
  onClose,
  onSubmit,
  selectedWorkplaceIds = [],
  sourceUnit = null,
  allFlatUnits = [],
  sourceUnitId,
  destinationUnitId,
  onDestinationChange,
}) => {
  const { bg, border, text, isDark } = useAppTheme();
  const [search, setSearch] = useState("");

  // ── filter destination list ────────────────────────────────────────────────
  const filteredUnits = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allFlatUnits.filter((u) => {
      if (u.id === sourceUnitId) return false; // can't move to source
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.breadcrumb.some((b) => b.name.toLowerCase().includes(q))
      );
    });
  }, [allFlatUnits, sourceUnitId, search]);

  const selectedDestUnit = useMemo(
    () => allFlatUnits.find((u) => u.id === destinationUnitId) || null,
    [allFlatUnits, destinationUnitId],
  );

  if (!open) return null;

  // ── level colours ──────────────────────────────────────────────────────────
  const depthColor = (depth) => {
    const colors = ["#1E5EFF", "#B08600", "#0A8050", "#8A2BE2", "#FF4D4D"];
    return colors[Math.min(depth, colors.length - 1)];
  };
  const depthBg = (depth) => {
    const bgs = ["#ECF2FF", "#FFF4C9", "#C4F8E2", "#E0C8FF", "#FFC8C8"];
    return bgs[Math.min(depth, bgs.length - 1)];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl mx-4 rounded-2xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: bg("#ffffff", "#1a1a1a"),
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* ── header ──────────────────────────────────────────────────────── */}
        <div
          className="px-6 pt-5 pb-4"
          style={{ borderBottom: `1px solid ${border("#e5e7eb", "#2e2e2e")}` }}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <SwapHorizIcon sx={{ color: "#1E5EFF", fontSize: 22 }} />
              <h2
                className="text-base font-semibold"
                style={{ color: text("#111827", "#f3f4f6") }}
              >
                Move workplaces
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              style={{ color: text("#6b7280", "#9ca3af") }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
          </div>

          {/* breadcrumb of source unit */}
          {sourceUnit?.breadcrumb?.length > 0 && (
            <div className="flex items-center flex-wrap gap-1 mt-2">
              <span
                className="text-xs"
                style={{ color: text("#6b7280", "#9ca3af") }}
              >
                From:
              </span>
              {sourceUnit.breadcrumb.map((crumb, i) => (
                <span key={crumb.id} className="flex items-center gap-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor:
                        i === sourceUnit.breadcrumb.length - 1
                          ? "#ECF2FF"
                          : bg("#f3f4f6", "#2a2a2a"),
                      color:
                        i === sourceUnit.breadcrumb.length - 1
                          ? "#1E5EFF"
                          : text("#6b7280", "#9ca3af"),
                    }}
                  >
                    {crumb.name}
                  </span>
                  {i < sourceUnit.breadcrumb.length - 1 && (
                    <span
                      className="text-xs"
                      style={{ color: text("#9ca3af", "#6b7280") }}
                    >
                      ›
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── selected workplaces strip ────────────────────────────────────── */}
        <div
          className="px-6 py-3"
          style={{
            backgroundColor: bg("#f9fafb", "#111111"),
            borderBottom: `1px solid ${border("#e5e7eb", "#2e2e2e")}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <WorkIcon sx={{ fontSize: 14, color: "#1E5EFF" }} />
            <span
              className="text-xs font-semibold"
              style={{ color: text("#374151", "#d1d5db") }}
            >
              {selectedWorkplaceIds.length} workplace
              {selectedWorkplaceIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>
          {/* Workplace id chips — in a real app you'd map ids → names */}
          <div className="flex flex-wrap gap-1">
            {selectedWorkplaceIds.map((id) => (
              <span
                key={id}
                className="text-xs px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: bg("#ffffff", "#1e1e1e"),
                  borderColor: border("#d1d5db", "#374151"),
                  color: text("#374151", "#d1d5db"),
                }}
              >
                {id}
              </span>
            ))}
          </div>
        </div>

        {/* ── destination picker ───────────────────────────────────────────── */}
        <div className="px-6 pt-4 pb-2">
          <p
            className="text-xs font-semibold mb-2"
            style={{ color: text("#6b7280", "#9ca3af") }}
          >
            CHOOSE DESTINATION UNIT
          </p>

          {/* search */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 border mb-3"
            style={{
              backgroundColor: bg("#f9fafb", "#111111"),
              borderColor: border("#e5e7eb", "#374151"),
            }}
          >
            <SearchIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search units…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: text("#111827", "#f3f4f6") }}
            />
          </div>
        </div>

        {/* ── unit list ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          {filteredUnits.length === 0 ? (
            <p
              className="text-sm text-center py-8 italic"
              style={{ color: text("#9ca3af", "#6b7280") }}
            >
              No units match your search
            </p>
          ) : (
            <div className="space-y-1">
              {filteredUnits.map((unit) => {
                const isSelected = destinationUnitId === unit.id;
                const indent = unit.depth * 20;

                return (
                  <button
                    key={unit.id}
                    onClick={() => onDestinationChange(unit.id)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100 border"
                    style={{
                      paddingLeft: `${12 + indent}px`,
                      backgroundColor: isSelected
                        ? bg("#f0fdf4", "#052e16")
                        : bg("#ffffff", "#1a1a1a"),
                      borderColor: isSelected
                        ? "#1FD286"
                        : border("transparent", "transparent"),
                    }}
                  >
                    {/* depth indicator dot */}
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: depthColor(unit.depth),
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      {/* breadcrumb path (compact) */}
                      {unit.breadcrumb.length > 1 && (
                        <p
                          className="text-xs truncate mb-0.5"
                          style={{ color: text("#9ca3af", "#6b7280") }}
                        >
                          {unit.breadcrumb
                            .slice(0, -1)
                            .map((b) => b.name)
                            .join(" › ")}
                        </p>
                      )}
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: text("#111827", "#f3f4f6") }}
                      >
                        {unit.name}
                      </p>
                    </div>

                    {/* depth badge */}
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-medium flex-shrink-0"
                      style={{
                        backgroundColor: depthBg(unit.depth),
                        color: depthColor(unit.depth),
                      }}
                    >
                      L{unit.depth + 1}
                    </span>

                    {/* radio */}
                    {isSelected ? (
                      <CheckCircleIcon
                        sx={{ fontSize: 18, color: "#1FD286", flexShrink: 0 }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{
                          fontSize: 18,
                          color: text("#d1d5db", "#4b5563"),
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── footer ──────────────────────────────────────────────────────── */}
        <div
          className="px-6 py-4 flex flex-col gap-3"
          style={{ borderTop: `1px solid ${border("#e5e7eb", "#2e2e2e")}` }}
        >
          {/* destination summary */}
          <AnimatePresence mode="wait">
            {selectedDestUnit ? (
              <motion.div
                key="dest"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <span
                  className="text-xs"
                  style={{ color: text("#6b7280", "#9ca3af") }}
                >
                  Moving to:
                </span>
                <div className="flex items-center flex-wrap gap-1">
                  {selectedDestUnit.breadcrumb.map((crumb, i) => (
                    <span key={crumb.id} className="flex items-center gap-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            i === selectedDestUnit.breadcrumb.length - 1
                              ? "#f0fdf4"
                              : bg("#f3f4f6", "#1f2937"),
                          color:
                            i === selectedDestUnit.breadcrumb.length - 1
                              ? "#1FD286"
                              : text("#6b7280", "#9ca3af"),
                        }}
                      >
                        {crumb.name}
                      </span>
                      {i < selectedDestUnit.breadcrumb.length - 1 && (
                        <span
                          className="text-xs"
                          style={{ color: text("#9ca3af", "#6b7280") }}
                        >
                          ›
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs italic"
                style={{ color: text("#9ca3af", "#6b7280") }}
              >
                No destination selected yet
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
              style={{
                borderColor: border("#d1d5db", "#374151"),
                color: text("#374151", "#d1d5db"),
                backgroundColor: bg("#f9fafb", "#111111"),
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!destinationUnitId}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: destinationUnitId ? "#1FD286" : "#9ca3af",
                color: destinationUnitId ? "#052e16" : "#ffffff",
              }}
            >
              Confirm move
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TransferWorkplacesModal;
