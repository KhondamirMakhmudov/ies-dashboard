import { Modal, Box, Typography, IconButton } from "@mui/material";
import useAppTheme from "@/hooks/useAppTheme";

const MethodModal = ({
  open,
  onClose,
  title,
  children,
  width = 600,
  padding = 4,
  height,
  showCloseIcon = false,
  closeClick,
}) => {
  const { isDark, bg, text } = useAppTheme();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: width,
          height: height,
          bgcolor: bg("#ffffff", "#1e1e1e"),
          boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : 24,
          p: padding,
          borderRadius: "8px",
          border: isDark ? "1px solid #333333" : "none",
        }}
      >
        {/* Title va X icon joylashuvi */}
        <div className="flex items-center justify-between">
          <Typography
            variant="h6"
            style={{ color: text("#000000", "#f3f4f6") }}
          >
            {title}
          </Typography>

          <div>
            {showCloseIcon && (
              <IconButton
                onClick={closeClick}
                size="medium"
                sx={{
                  color: text("#6b7280", "#9ca3af"),
                  "&:hover": {
                    backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6",
                    color: text("#111827", "#d1d5db"),
                  },
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </IconButton>
            )}
          </div>
        </div>

        {children}
      </Box>
    </Modal>
  );
};

export default MethodModal;
