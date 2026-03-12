import { Modal, Box, Typography, IconButton } from "@mui/material";
import useAppTheme from "@/hooks/useAppTheme";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import CustomSelect from "@/components/select";
import Input from "@/components/input";
import PrimaryButton from "@/components/button/primary-button";
import dayjs from "dayjs";

const TransferModal = ({
  open,
  onClose,
  employee,
  workplaceOptions,
  isLoading,
  onTransfer,
}) => {
  const { isDark, bg, text, border } = useAppTheme();
  const [selectedWorkplace, setSelectedWorkplace] = useState(null);
  const [transferDate, setTransferDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [notes, setNotes] = useState("");

  const handleTransfer = () => {
    if (!selectedWorkplace) {
      return;
    }
    onTransfer({
      to_workplace_id: selectedWorkplace,
      transfer_date: transferDate,
      notes,
    });
    setSelectedWorkplace(null);
    setTransferDate(dayjs().format("YYYY-MM-DD"));
    setNotes("");
  };

  const handleClose = () => {
    setSelectedWorkplace(null);
    setTransferDate(dayjs().format("YYYY-MM-DD"));
    setNotes("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: bg("#ffffff", "#1e1e1e"),
          boxShadow: isDark ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : 24,
          p: 4,
          borderRadius: "8px",
          border: isDark ? `1px solid ${border("#e5e7eb", "#333333")}` : "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Typography
            variant="h6"
            sx={{
              color: text("#000000", "#f3f4f6"),
              fontWeight: 600,
            }}
          >
            Перевод сотрудника
          </Typography>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: text("#6b7280", "#9ca3af"),
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>

        {/* Employee Info */}
        {employee && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              isDark
                ? "bg-blue-900/30 border border-blue-700"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <p className={`text-sm font-medium ${text("#4b5563", "#d1d5db")}`}>
              Сотрудник:
            </p>
            <p
              className={`text-lg font-semibold ${text("#000000", "#f3f4f6")}`}
            >
              {employee.last_name} {employee.first_name} {employee.middle_name}
            </p>
            {employee.workplace && (
              <p className={`text-sm mt-2 ${text("#6b7280", "#9ca3af")}`}>
                <span className="font-medium">Текущее рабочее место:</span>{" "}
                {employee.workplace?.organizational_unit?.name}
              </p>
            )}
          </div>
        )}

        {/* Form Content */}
        <div className="space-y-4">
          {/* New Workplace Selection */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${text(
                "#374151",
                "#d1d5db",
              )}`}
            >
              Новое рабочее место <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              options={workplaceOptions || []}
              value={selectedWorkplace}
              placeholder="Выберите новое рабочее место"
              onChange={setSelectedWorkplace}
              isLoading={isLoading}
              returnObject={false}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <PrimaryButton
            onClick={handleClose}
            backgroundColor={isDark ? "#374151" : "#EDEDF2"}
            color={isDark ? "white" : "black"}
          >
            Отмена
          </PrimaryButton>
          <PrimaryButton
            onClick={handleTransfer}
            disabled={!selectedWorkplace || isLoading}
          >
            {isLoading ? "Обработка..." : "Перевести"}
          </PrimaryButton>
        </div>
      </Box>
    </Modal>
  );
};

export default TransferModal;
