import { useState } from "react";
import ScheduleModal from "@/components/modal/schedule-modal";

export default function SchedulePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveSchedule = (scheduleData) => {
    console.log("Сохранённое расписание:", scheduleData);
    // Здесь вы можете отправить данные на сервер
    // или сохранить в локальном состоянии
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Управление расписаниями</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Создать новое расписание
      </button>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
      />
    </div>
  );
}
