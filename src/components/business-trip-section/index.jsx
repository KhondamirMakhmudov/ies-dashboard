import React, { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import usePostQuery from "@/hooks/java/usePostQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import MethodModal from "../modal/method-modal";
import Input from "../input";
import CustomSelect from "../select";
import PrimaryButton from "../button/primary-button";
import { FileUpload } from "@mui/icons-material";
import useAppTheme from "@/hooks/useAppTheme";

export default function EmployeeBusinessTripSection({
  employeeUuid,
  isDark,
  schedules = [],
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { bg, border, text } = useAppTheme();

  // Modal state
  const [openModal, setOpenModal] = useState(false);

  // Form state
  const [numOrder, setNumOrder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Mutation
  const { mutate: createJobTrip, isLoading } = usePostQuery({
    listKeyId: "create-job-trip-single",
  });

  // File size validation (50MB limit)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

  const handleFileSelect = (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `Файл слишком большой! Максимальный размер: 50MB (текущий размер: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
        { position: "top-right" }
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    // Reset form
    setNumOrder("");
    setStartDate("");
    setEndDate("");
    setSelectedSchedule("");
    setSelectedFile(null);
  };

  const submitCreateJobTrip = () => {
    // Validation
    if (!numOrder || !startDate || !endDate || !selectedSchedule) {
      toast.warning("Пожалуйста, заполните все обязательные поля!");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.warning("Дата начала не может быть позже даты окончания!");
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        employeeUuids: [employeeUuid], // Single employee
        numOrder: numOrder,
        startDate: startDate,
        endDate: endDate,
        entryPointScheduleId: selectedSchedule,
      })
    );

    // Append file if selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    createJobTrip(
      {
        url: URLS.createJobTripsForEmployee,
        attributes: formData,
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      },
      {
        onSuccess: () => {
          handleCloseModal();
          toast.success("Командировка успешно создана", {
            position: "top-center",
          });
          // Invalidate relevant queries
          queryClient.invalidateQueries(KEYS.employeePhoto);
        },
        onError: (error) => {
          console.error("Error creating job trip:", error);
          const apiMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Неизвестная ошибка";
          toast.error(`${apiMessage}`, {
            position: "top-right",
          });
        },
      },
    );
  };

  // Prepare options for CustomSelect
  const scheduleOptions = schedules.map((item) => ({
    label: `${item.unitCode.nameLong} - ${item.entryPoint.entryPointName} - ${item.schedule.name}`,
    value: item.id,
  }));

  return (
    <>
      {/* Button in the employee page */}
      <PrimaryButton
        backgroundColor="#10B981"
        onClick={() => setOpenModal(true)}
      >
        Назначить командировку
      </PrimaryButton>

      {/* Modal */}
      {openModal && (
        <MethodModal
          open={openModal}
          showCloseIcon={true}
          closeClick={handleCloseModal}
          onClose={handleCloseModal}
          title={"Назначить командировку"}
        >
          <div className="my-[30px] space-y-[15px]">
            <Input
              name="numOrder"
              onChange={(e) => setNumOrder(e.target.value)}
              placeholder="Введите номер приказа"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              value={numOrder}
              required
            />

            <Input
              name="startDate"
              type="date"
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Дата начала"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              value={startDate}
              required
            />

            <Input
              name="endDate"
              type="date"
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="Дата окончания"
              classNames="col-span-2"
              inputClass={
                "!h-[45px] rounded-[8px] !border-gray-300 text-[15px]"
              }
              labelClass={"text-sm"}
              value={endDate}
              required
            />

            <CustomSelect
              options={scheduleOptions}
              value={selectedSchedule}
              onChange={(val) => setSelectedSchedule(val)}
              placeholder="Выберите расписание точки доступа"
            />

            {/* File Upload Section */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: text("#374151", "#d1d5db") }}
              >
                Файл документа
              </label>
              <div
                className="relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer"
                style={{
                  backgroundColor: selectedFile
                    ? bg("#f0fdf4", "#1a3a1a")
                    : bg("#f9fafb", "#1e1e1e"),
                  borderColor: selectedFile
                    ? "#10b981"
                    : border("#d1d5db", "#4b5563"),
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.backgroundColor = bg(
                    "#eff6ff",
                    "#1e3a8a"
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = selectedFile
                    ? "#10b981"
                    : border("#d1d5db", "#4b5563");
                  e.currentTarget.style.backgroundColor = selectedFile
                    ? bg("#f0fdf4", "#1a3a1a")
                    : bg("#f9fafb", "#1e1e1e");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = selectedFile
                    ? "#10b981"
                    : border("#d1d5db", "#4b5563");
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handleFileSelect(file);
                  }
                }}
              >
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] || null)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  {selectedFile ? (
                    <>
                      <div className="text-xl" style={{ color: "#10b981" }}>
                        ✓
                      </div>
                      <p
                        className="font-medium text-sm"
                        style={{ color: text("#111827", "#f3f4f6") }}
                      >
                        {selectedFile.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: text("#059669", "#10b981") }}
                      >
                        Размер: {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB (макс. 50MB)
                      </p>
                    </>
                  ) : (
                    <>
                      <FileUpload
                        fontSize="small"
                        style={{
                          color: text("#9ca3af", "#6b7280"),
                          fontSize: 24,
                        }}
                      />
                      <p
                        className="font-medium text-sm"
                        style={{ color: text("#374151", "#d1d5db") }}
                      >
                        Перетащите файл или нажмите
                      </p>
                    </>
                  )}
                </div>
              </div>
              {selectedFile && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="mt-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
                >
                  ✕ Удалить файл
                </button>
              )}
            </div>

            <PrimaryButton
              variant="contained"
              backgroundColor="#10B981"
              color="white"
              onClick={submitCreateJobTrip}
              disabled={isLoading}
            >
              {isLoading ? "Создание..." : "Создать"}
            </PrimaryButton>
          </div>
        </MethodModal>
      )}
    </>
  );
}
