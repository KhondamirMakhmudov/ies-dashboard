import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@mui/material";
import EastIcon from "@mui/icons-material/East";
import useAppTheme from "@/hooks/useAppTheme";

const TransferActionBar = ({
  selectedWorkplaces,
  sourceUnitId,
  getSourceUnitName,
  onOpenTransferModal,
  onClearSelection,
}) => {
  const { border, bg, text } = useAppTheme();

  const blue = {
    50: "#E6F1FB",
    100: "#B5D4F4",
    200: "#85B7EB",
    600: "#185FA5",
    800: "#0C447C",
  };

  return (
    <AnimatePresence>
      {selectedWorkplaces.length > 0 && sourceUnitId && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={`
              flex gap-0 rounded-lg overflow-hidden max-w-[520px] w-full
              ${bg("bg-white", "bg-gray-900")}
            `}
            style={{
              border: `0.5px solid ${blue[200]}`,
            }}
          >
            {/* left accent bar */}
            <div
              className="w-1 flex-shrink-0"
              style={{ background: blue[600] }}
            />

            {/* info section */}
            <div className="flex-1 flex items-center gap-4 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                {/* label */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: blue[600] }}
                  />
                  <span
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: blue[600] }}
                  >
                    Готово к переводу
                  </span>
                </div>

                {/* source row */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs whitespace-nowrap ${text(
                      "text-gray-500",
                      "text-gray-400",
                    )}`}
                  >
                    Источник:
                  </span>
                  <span
                    className={`text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] rounded-full px-2.5 py-0.5 ${bg(
                      "bg-gray-100",
                      "bg-white/5",
                    )}`}
                    style={{
                      border: `0.5px solid ${border("#e5e7eb", "#374151")}`,
                      color: text("#111827", "#f9fafb"),
                    }}
                  >
                    {getSourceUnitName()}
                  </span>
                </div>

                {/* count row */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs whitespace-nowrap ${text(
                      "text-gray-500",
                      "text-gray-400",
                    )}`}
                  >
                    Рабочих мест:
                  </span>
                  <span
                    className="text-sm font-medium rounded-full px-2.5 py-0.5 flex-shrink-0"
                    style={{
                      color: blue[800],
                      background: blue[100],
                      border: `0.5px solid ${blue[200]}`,
                    }}
                  >
                    {selectedWorkplaces.length}
                  </span>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="flex flex-col gap-1.5 flex-shrink-0 px-3.5 py-3.5">
              <Button
                variant="contained"
                startIcon={<EastIcon sx={{ fontSize: "14px !important" }} />}
                onClick={() => onOpenTransferModal(sourceUnitId)}
                sx={{
                  background: blue[600],
                  border: `0.5px solid ${blue[800]}`,
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 13,
                  px: 2,
                  py: "7px",
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                  "&:hover": { background: blue[800], boxShadow: "none" },
                }}
              >
                Переместить
              </Button>

              <Button
                variant="outlined"
                onClick={onClearSelection}
                sx={{
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: 13,
                  px: 2,
                  py: "7px",
                  whiteSpace: "nowrap",
                  borderColor: border("#d1d5db", "#4b5563"),
                  color: text("#374151", "#d1d5db"),
                  "&:hover": {
                    background: bg("#f3f4f6", "rgba(255,255,255,0.06)"),
                    borderColor: border("#9ca3af", "#6b7280"),
                  },
                }}
              >
                Отменить выбор
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransferActionBar;
