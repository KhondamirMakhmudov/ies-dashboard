import React, { useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Typography } from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import usePostQuery from "@/hooks/java/usePostQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";

// Import your custom components
import MethodModal from "../modal/method-modal";
import Input from "../input";
import CustomSelect from "../select";
import PrimaryButton from "../button/primary-button";

export default function EmployeeBusinessTripSection({
  employeeUuid,
  isDark,
  schedules = [], // Pass available schedules from parent
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Modal state
  const [openModal, setOpenModal] = useState(false);

  // Form state
  const [numOrder, setNumOrder] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");

  // Mutation
  const { mutate: createJobTrip, isLoading } = usePostQuery({
    listKeyId: "create-job-trip-single",
  });

  const handleCloseModal = () => {
    setOpenModal(false);
    // Reset form
    setNumOrder("");
    setStartDate("");
    setEndDate("");
    setSelectedSchedule("");
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

    createJobTrip(
      {
        url: URLS.createJobTripsForEmployee,
        attributes: {
          employeeUuids: [employeeUuid], // Single employee
          numOrder: numOrder,
          startDate: startDate,
          endDate: endDate,
          entryPointScheduleId: selectedSchedule,
        },
        config: {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            Accept: "application/json",
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
          toast.error(`Ошибка: ${error.message || "Неизвестная ошибка"}`, {
            position: "top-right",
          });
        },
      }
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
