import { Modal, Box, Button, Typography } from "@mui/material";

const DeleteModal = ({ open, onClose, deleting, title, children }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "white",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <Typography>{title}</Typography>

        {children}

        <div className="flex justify-end gap-1 mt-4">
          <Button
            sx={{
              boxShadow: "none",
              backgroundColor: "#C9C9C9",
              color: "black",
              fontSize: "17px",
              width: "50%",
              paddingY: "8px",
              textTransform: "initial",
            }}
            onClick={onClose}
          >
            Нет
          </Button>
          <Button
            sx={{
              fontFamily: "DM Sans, sans-serif",
              color: "#991300",
              textTransform: "initial",
              fontSize: "17px",
              width: "50%",
              paddingY: "8px",
              backgroundColor: "#FCD8D3",
              boxShadow: "none",
              "&hover": {
                boxShadow: 14,
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
