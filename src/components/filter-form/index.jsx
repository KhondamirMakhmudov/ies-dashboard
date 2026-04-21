import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Box,
  Stack,
  Paper,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import PrimaryButton from "../button/primary-button";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://app.tpp.uz/event_storage";

export default function FilterBuilder() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isPublic: false,
    employeeIds: [],
    logic: "AND",
    conditions: [
      {
        id: Date.now().toString(),
        type: "PRESENCE",
        timeFrom: "08:00:00",
        timeTo: "18:00:00",
        eventType: "",
        entryPointIds: [],
      },
    ],
  });
  const [currentEmployee, setCurrentEmployee] = useState("");
  const [currentDoor, setCurrentDoor] = useState("");

  const createFilterApi = async (filterData) => {
    const response = await axios.post(
      `${API_BASE}/api/v1/filters`,
      filterData,
      {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  };

  const queryClient = useQueryClient();

  const {
    mutate: submitFilter,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) {
        throw new Error("Filter nomi majburiy");
      }
      if (form.employeeIds.length === 0) {
        throw new Error("Kamida bitta xodim tanlang");
      }
      if (form.conditions.length === 0) {
        throw new Error("Kamida bitta shart qo'shing");
      }

      const payload = {
        ...form,
        conditions: form.conditions.map(({ id, ...rest }) => rest),
      };

      return createFilterApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filters"] });
      handleClose();
    },
  });

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addEmployee = useCallback(() => {
    if (!currentEmployee.trim()) return;
    if (form.employeeIds.includes(currentEmployee)) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      employeeIds: [...prev.employeeIds, currentEmployee],
    }));
    setCurrentEmployee("");
  }, [currentEmployee, form.employeeIds]);

  const removeEmployee = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.filter((empId) => empId !== id),
    }));
  }, []);

  const addCondition = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: Date.now().toString(),
          type: "PRESENCE",
          timeFrom: "08:00:00",
          timeTo: "18:00:00",
          eventType: "",
          entryPointIds: [],
        },
      ],
    }));
  }, []);

  const updateCondition = useCallback((id, field, value) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.map((cond) =>
        cond.id === id ? { ...cond, [field]: value } : cond,
      ),
    }));
  }, []);

  const removeCondition = useCallback((id) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((cond) => cond.id !== id),
    }));
  }, []);

  const addDoorToCondition = useCallback(
    (conditionId) => {
      if (!currentDoor || isNaN(parseInt(currentDoor))) return;
      const doorNum = parseInt(currentDoor, 10);

      setForm((prev) => ({
        ...prev,
        conditions: prev.conditions.map((cond) =>
          cond.id === conditionId
            ? {
                ...cond,
                entryPointIds: [...new Set([...cond.entryPointIds, doorNum])],
              }
            : cond,
        ),
      }));
      setCurrentDoor("");
    },
    [currentDoor],
  );

  const removeDoorFromCondition = useCallback((conditionId, doorId) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.map((cond) =>
        cond.id === conditionId
          ? {
              ...cond,
              entryPointIds: cond.entryPointIds.filter((d) => d !== doorId),
            }
          : cond,
      ),
    }));
  }, []);

  const handleClose = () => {
    if (!isPending) {
      setOpen(false);
      setForm({
        name: "",
        description: "",
        isPublic: false,
        employeeIds: [],
        logic: "AND",
        conditions: [
          {
            id: Date.now().toString(),
            type: "PRESENCE",
            timeFrom: "08:00:00",
            timeTo: "18:00:00",
            eventType: "",
            entryPointIds: [],
          },
        ],
      });
      setCurrentEmployee("");
    }
  };

  return (
    <Box>
      <PrimaryButton onClick={() => setOpen(true)} variant="contained">
        <p>New Filter</p>
      </PrimaryButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Yangi Filter Yaratish</span>
          <IconButton
            onClick={handleClose}
            disabled={isPending}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error?.message || "Xatolik yuz berdi"}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Asosiy Ma'lumotlar */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
              >
                📋 Asosiy Ma'lumotlar
              </Typography>

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Filter Nomi"
                  placeholder="Masalan: Ish soatida kirish-chiqish"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  required
                  size="small"
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Tasnifi"
                  placeholder="Ixtiyoriy tavsif..."
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  size="small"
                  multiline
                  rows={2}
                  variant="outlined"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isPublic}
                      onChange={(e) =>
                        handleFormChange("isPublic", e.target.checked)
                      }
                    />
                  }
                  label="Hamma uchun ochiq?"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Xodimlar */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}
              >
                👥 Xodimlar
              </Typography>

              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    placeholder="UUID kiriting"
                    value={currentEmployee}
                    onChange={(e) => setCurrentEmployee(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") addEmployee();
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                    variant="outlined"
                  />
                  <Button
                    onClick={addEmployee}
                    variant="outlined"
                    startIcon={<AddIcon />}
                  >
                    Qo'sh
                  </Button>
                </Stack>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {form.employeeIds.map((empId) => (
                    <Chip
                      key={empId}
                      label={
                        empId.length > 12 ? `${empId.slice(0, 8)}...` : empId
                      }
                      onDelete={() => removeEmployee(empId)}
                      variant="outlined"
                      color="primary"
                      sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                    />
                  ))}
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Shartlar */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  ⚙️ Shartlar
                </Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Mantiqi</InputLabel>
                  <Select
                    value={form.logic}
                    onChange={(e) => handleFormChange("logic", e.target.value)}
                    label="Mantiqi"
                  >
                    <MenuItem value="AND">VA (AND)</MenuItem>
                    <MenuItem value="OR">YOKI (OR)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Stack spacing={2}>
                {form.conditions.map((condition, idx) => (
                  <Paper
                    key={condition.id}
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      background: "rgba(102, 126, 234, 0.04)",
                      border: "1px solid rgba(102, 126, 234, 0.1)",
                      borderRadius: 1.5,
                    }}
                  >
                    {/* Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: "0.9rem",
                        }}
                      >
                        Shart #{idx + 1}
                      </Typography>
                      {form.conditions.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeCondition(condition.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    <Stack spacing={2}>
                      {/* Type */}
                      <FormControl fullWidth size="small">
                        <InputLabel>Tur</InputLabel>
                        <Select
                          value={condition.type}
                          onChange={(e) =>
                            updateCondition(
                              condition.id,
                              "type",
                              e.target.value,
                            )
                          }
                          label="Tur"
                        >
                          <MenuItem value="PRESENCE">
                            ✓ PRESENCE (Ichiga tush)
                          </MenuItem>
                          <MenuItem value="ABSENCE">
                            ✗ ABSENCE (Tashqarida)
                          </MenuItem>
                        </Select>
                      </FormControl>

                      {/* Time Range */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1.5,
                        }}
                      >
                        <TextField
                          label="Vaqt From"
                          type="time"
                          value={condition.timeFrom}
                          onChange={(e) =>
                            updateCondition(
                              condition.id,
                              "timeFrom",
                              e.target.value,
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          variant="outlined"
                        />
                        <TextField
                          label="Vaqt To"
                          type="time"
                          value={condition.timeTo}
                          onChange={(e) =>
                            updateCondition(
                              condition.id,
                              "timeTo",
                              e.target.value,
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {/* Event Type */}
                      <FormControl fullWidth size="small">
                        <InputLabel>Hodisa Turi</InputLabel>
                        <Select
                          value={condition.eventType}
                          onChange={(e) =>
                            updateCondition(
                              condition.id,
                              "eventType",
                              e.target.value,
                            )
                          }
                          label="Hodisa Turi"
                        >
                          <MenuItem value="">Barcha</MenuItem>
                          <MenuItem value="IN">🚪 Kirish (IN)</MenuItem>
                          <MenuItem value="OUT">🚶 Chiqish (OUT)</MenuItem>
                        </Select>
                      </FormControl>

                      {/* Doors */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            fontWeight: 600,
                            color: "text.secondary",
                            mb: 1,
                          }}
                        >
                          Eshiklar (entryPointIds)
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                          <TextField
                            placeholder="Eshik raqami"
                            type="number"
                            value={currentDoor}
                            onChange={(e) => setCurrentDoor(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter")
                                addDoorToCondition(condition.id);
                            }}
                            inputProps={{ min: 0 }}
                            size="small"
                            sx={{ width: 120 }}
                            variant="outlined"
                          />
                          <Button
                            onClick={() => addDoorToCondition(condition.id)}
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                          >
                            Qo'sh
                          </Button>
                        </Stack>

                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
                        >
                          {condition.entryPointIds.length === 0 ? (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.disabled",
                                fontStyle: "italic",
                              }}
                            >
                              Barcha eshiklar
                            </Typography>
                          ) : (
                            condition.entryPointIds.map((doorId) => (
                              <Chip
                                key={doorId}
                                label={`Eshik ${doorId}`}
                                onDelete={() =>
                                  removeDoorFromCondition(condition.id, doorId)
                                }
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ))
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                ))}

                <Button
                  onClick={addCondition}
                  variant="outlined"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Shart Qo'sh
                </Button>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1, borderTop: "1px solid #eee" }}>
          <Button onClick={handleClose} disabled={isPending}>
            Bekor
          </Button>
          <Button
            onClick={() => submitFilter()}
            variant="contained"
            disabled={isPending}
            startIcon={isPending && <CircularProgress size={20} />}
          >
            {isPending ? "Saqlash..." : "Saqlash"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
