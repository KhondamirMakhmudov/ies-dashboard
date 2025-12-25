import { Modal, Box, Button, Typography } from "@mui/material";
import useAppTheme from "@/hooks/useAppTheme";

const ExitModal = ({ open, onClose, handleLogout }) => {
  const { bg, isDark, text } = useAppTheme();

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
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <Typography
          sx={{
            color: isDark ? "#e5e7eb" : "#1a1a1a",
            fontSize: "16px",
            fontWeight: 500,
          }}
        >
          Вы уверены, что хотите покинуть страницу?
        </Typography>

        <div className="flex gap-1 mt-4">
          <Button
            sx={{
              boxShadow: "none",
              width: "50%",
              backgroundColor: isDark ? "#374151" : "#C9C9C9",
              color: isDark ? "#e5e7eb" : "#000000",
              "&:hover": {
                backgroundColor: isDark ? "#4b5563" : "#b0b0b0",
                boxShadow: "none",
              },
            }}
            onClick={onClose}
            variant="contained"
          >
            Нет
          </Button>
          <Button
            sx={{
              fontFamily: "DM Sans, sans-serif",
              color: isDark ? "#fca5a5" : "#991300",
              backgroundColor: isDark ? "#7f1d1d" : "#FCD8D3",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: isDark ? "#991b1b" : "#FCA89D",
                boxShadow: "none",
              },
              width: "50%",
            }}
            onClick={handleLogout}
          >
            Да
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ExitModal;
