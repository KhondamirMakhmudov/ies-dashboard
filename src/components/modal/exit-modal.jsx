import { Modal, Box, Button, Typography } from "@mui/material"

const ExitModal = ({open, onClose, handleLogout}) => {
    return     <Modal open={open} onClose={onClose}>
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

          }}>
            <Typography>
              Вы уверены, что хотите покинуть страницу?
            </Typography>

                      <div className="flex justify-end gap-1 mt-4">
                        <Button 
                         sx={{boxShadow: "none", backgroundColor: "#4182F9", }}
                         onClick={onClose} variant="contained">Нет</Button>
                        <Button           
                        sx={{
                            fontFamily: "DM Sans, sans-serif",
                            color: "#991300",
                            backgroundColor: "#FCD8D3",
                            boxShadow: "none",
                            "&hover" : {
                            boxShadow: 14
                        }
                          }} 
                          onClick={handleLogout} >
                          Да
                        </Button>
                      </div>
        </Box>
    </Modal>
}

export default ExitModal