import { Modal, Box, Button, Typography } from "@mui/material";

const MethodModal = ({ open, onClose, title, children }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <Typography>{title}</Typography>
        {children}
      </Box>
    </Modal>
  );
};

export default MethodModal;
