import { AnimatePresence, motion } from "framer-motion";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
const HalfModal = ({ children, isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-black/50 flex items-end justify-end"
        >
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-bl-[16px] rounded-tl-[16px] shadow-lg w-1/2 h-screen overflow-y-auto p-[24px] z-50"
          >
            {children}

            <IconButton
              sx={{
                position: "absolute",
                top: "16px",
                right: "16px",
                color: "#000",
              }}
            >
              <CloseIcon onClick={onClose} />
            </IconButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HalfModal;
