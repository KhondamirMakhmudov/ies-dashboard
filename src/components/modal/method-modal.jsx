import { Modal, Box, Typography, IconButton } from "@mui/material";

const MethodModal = ({
  open,
  onClose,
  title,
  children,
  width = 600,
  padding = 4,
  height,
  showCloseIcon = false,
  closeClick, // ✅ yangi prop
}) => {
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
          bgcolor: "white",
          boxShadow: 24,
          p: padding,
          borderRadius: "8px",
        }}
      >
        {/* Title va X icon joylashuvi */}
        <div className="flex items-center justify-between">
          <Typography variant="h6">{title}</Typography>

          <div>
            {showCloseIcon && (
              <IconButton onClick={closeClick} size="medium">
                {/* SVG X icon */}
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
