import {
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Box,
} from "@mui/material";

const InfoRow = ({ icon, label, value }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    spacing={1}
    alignItems="center"
  >
    <div className="flex items-center gap-2">
      <Box sx={{ width: 34 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={500} sx={{ width: 120 }}>
        {label}:
      </Typography>
    </div>
    <Typography variant="h6" color="text.secondary">
      {value || "—"}
    </Typography>
  </Stack>
);

export default InfoRow;
