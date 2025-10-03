"use client";

import { useState } from "react";

const ScheduleModal = ({ isOpen, onClose, onSave }) => {
  // Состояния компонента
  const [scheduleName, setScheduleName] = useState("");
  const [shortName, setShortName] = useState("");

  // Дни недели
  const days = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];

  // Данные расписания для каждого дня
  const [scheduleData, setScheduleData] = useState({
    Понедельник: [],
    Вторник: [],
    Среда: [],
    Четверг: [],
    Пятница: [],
    Суббота: [],
    Воскресенье: [],
  });

  // Функция добавления временного интервала
  const addTimeSlot = (day) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "18:00" }],
    }));
  };

  // Функция удаления временного интервала
  const removeTimeSlot = (day, index) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  // Функция обновления времени в интервале
  const updateTimeSlot = (day, index, field, value) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  // Применить расписание понедельника ко всем дням
  const applyToAllDays = () => {
    const mondaySchedule = scheduleData["Понедельник"];
    if (mondaySchedule.length === 0) {
      alert("Пожалуйста, сначала настройте расписание понедельника");
      return;
    }

    const newSchedule = {};
    days.forEach((day) => {
      newSchedule[day] = [...mondaySchedule];
    });
    setScheduleData(newSchedule);
  };

  // Очистить все расписания
  const clearAllSchedules = () => {
    const clearedSchedule = {};
    days.forEach((day) => {
      clearedSchedule[day] = [];
    });
    setScheduleData(clearedSchedule);
  };

  // Установить стандартные часы (9-18)
  const setStandardHours = () => {
    const standardSchedule = {};
    days.forEach((day) => {
      if (day !== "Суббота" && day !== "Воскресенье") {
        standardSchedule[day] = [
          { start: "00:00", end: "09:05" },
          { start: "13:00", end: "14:05" },
          { start: "18:00", end: "23:59" },
        ];
      } else {
        standardSchedule[day] = [];
      }
    });
    setScheduleData(standardSchedule);
  };

  // Сохранение расписания

  const handleSave = () => {
    if (!scheduleName.trim()) {
      alert("Пожалуйста, введите название расписания");
      return;
    }

    if (!shortName.trim()) {
      alert("Пожалуйста, введите короткое название");
      return;
    }

    // scheduleData ({"Понедельник": [...]}) → times formatiga o‘tkazamiz
    const weekDaysMap = {
      Понедельник: 1,
      Вторник: 2,
      Среда: 3,
      Четверг: 4,
      Пятница: 5,
      Суббота: 6,
      Воскресенье: 7,
    };

    const times = Object.entries(scheduleData).map(([dayName, slots]) => {
      return {
        weekDay: weekDaysMap[dayName],
        timeList: Array(4) // har kuni 4 ta bo‘lishi kerak
          .fill(null)
          .map((_, i) => {
            const slot = slots[i]; // agar modalda kamroq qo‘shilgan bo‘lsa
            return {
              index: i,
              startTime: slot ? slot.start + ":00" : "00:00:00",
              endTime: slot ? slot.end + ":00" : "00:00:00",
              enabled: slot ? 1 : 0,
            };
          }),
      };
    });

    const jsonDailySchedule = { days: times };

    onSave({
      name: scheduleName,
      shortName: shortName,
      jsonDailySchedule: JSON.stringify(jsonDailySchedule),
    });
  };

  // Если модальное окно закрыто, не рендерим ничего
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className=" px-6 py-4 border-b border-b-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold">
              Создание расписания сотрудника
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Поля ввода названий */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Название расписания
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="например, Утренняя смена"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Короткое название
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="например, УС"
                  maxLength="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Быстрые действия
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={applyToAllDays}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                Применить понедельник ко всем дням
              </button>
              <button
                onClick={clearAllSchedules}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Очистить всё
              </button>
              <button
                onClick={setStandardHours}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                Установить 9.00-18.00 стандарт
              </button>
            </div>
          </div>

          {/* Недельное расписание */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Недельное расписание
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {days.map((day) => (
                <div
                  key={day}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">{day}</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={
                          day !== "Суббота" && day !== "Воскресенье"
                        }
                        className="mr-2 rounded"
                      />
                      <span className="text-sm text-gray-600">Активен</span>
                    </label>
                  </div>

                  {/* Временные интервалы для дня */}
                  <div className="space-y-2 mb-3">
                    {scheduleData[day].map((slot, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateTimeSlot(
                                day,
                                index,
                                "start",
                                e.target.value
                              )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                          <span className="text-gray-500 font-medium">до</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateTimeSlot(day, index, "end", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            onClick={() => removeTimeSlot(day, index)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Кнопка добавления интервала */}
                  <button
                    onClick={() => addTimeSlot(day)}
                    className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                  >
                    + Добавить временной интервал
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Подвал с кнопками */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-t-gray-300">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors font-medium rounded-lg"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            Сохранить расписание
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
