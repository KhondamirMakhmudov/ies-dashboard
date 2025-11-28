import { Modal, Box, Button, Typography } from "@mui/material";
import useAppTheme from "@/hooks/useAppTheme";

const DeleteModal = ({ open, onClose, deleting, title, children }) => {
  const { isDark, bg, text, border } = useAppTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: bg("#ffffff", "#1e1e1e"),
          boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : 24,
          p: 4,
          borderRadius: "8px",
          border: isDark ? `1px solid ${border("#e5e7eb", "#333333")}` : "none",
        }}
      >
        <Typography style={{ color: text("#000000", "#f3f4f6") }}>
          {title}
        </Typography>

        <div style={{ color: text("#374151", "#d1d5db") }}>{children}</div>

        <div className="flex justify-end gap-1 mt-4">
          <Button
            sx={{
              boxShadow: "none",
              backgroundColor: isDark ? "#4b5563" : "#C9C9C9",
              color: isDark ? "#f3f4f6" : "#000000",
              fontSize: "17px",
              width: "50%",
              paddingY: "8px",
              textTransform: "initial",
              "&:hover": {
                backgroundColor: isDark ? "#6b7280" : "#b0b0b0",
              },
            }}
            onClick={onClose}
          >
            Нет
          </Button>
          <Button
            sx={{
              fontFamily: "DM Sans, sans-serif",
              color: isDark ? "#fca5a5" : "#991300",
              textTransform: "initial",
              fontSize: "17px",
              width: "50%",
              paddingY: "8px",
              backgroundColor: isDark ? "#7f1d1d" : "#FCD8D3",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: isDark ? "#991b1b" : "#FCA89D",
                boxShadow: isDark ? "none" : 14,
              },
            }}
            onClick={deleting}
          >
            Да
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default DeleteModal;
