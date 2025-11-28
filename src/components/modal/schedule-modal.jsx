"use client";

import { useEffect, useState } from "react";
import useAppTheme from "@/hooks/useAppTheme";

const ScheduleModal = ({
  isOpen,
  onClose,
  onSave,
  mode = "create",
  defaultValues,
}) => {
  const { isDark, bg, text, border } = useAppTheme();
  const [scheduleName, setScheduleName] = useState("");
  const [shortName, setShortName] = useState("");

  const days = [
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
    "Воскресенье",
  ];

  const [scheduleData, setScheduleData] = useState({
    Понедельник: [],
    Вторник: [],
    Среда: [],
    Четверг: [],
    Пятница: [],
    Суббота: [],
    Воскресенье: [],
  });

  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      setScheduleName(defaultValues.name || "");
      setShortName(defaultValues.shortName || "");

      const mapRu = {
        1: "Понедельник",
        2: "Вторник",
        3: "Среда",
        4: "Четверг",
        5: "Пятница",
        6: "Суббота",
        7: "Воскресенье",
      };

      const parsed =
        typeof defaultValues.jsonDailySchedule === "string"
          ? JSON.parse(defaultValues.jsonDailySchedule)
          : defaultValues.jsonDailySchedule;

      const filledSchedule = {};
      days.forEach((d) => (filledSchedule[d] = []));

      parsed?.days?.forEach((dayObj) => {
        const ruDay = mapRu[dayObj.weekDay];
        if (ruDay) {
          filledSchedule[ruDay] = (dayObj.timeList || [])
            .filter((t) => t.enabled === 1)
            .map((t) => ({
              start: t.startTime?.slice(0, 5) || "00:00",
              end: t.endTime?.slice(0, 5) || "00:00",
            }));
        }
      });

      setScheduleData(filledSchedule);
    }
  }, [mode, defaultValues]);

  const addTimeSlot = (day) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "18:00" }],
    }));
  };

  const removeTimeSlot = (day, index) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (day, index, field, value) => {
    setScheduleData((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

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

  const clearAllSchedules = () => {
    const clearedSchedule = {};
    days.forEach((day) => {
      clearedSchedule[day] = [];
    });
    setScheduleData(clearedSchedule);
  };

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

  const handleSave = () => {
    if (!scheduleName.trim()) {
      alert("Пожалуйста, введите название расписания");
      return;
    }

    if (!shortName.trim()) {
      alert("Пожалуйста, введите короткое название");
      return;
    }

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
        timeList: Array(4)
          .fill(null)
          .map((_, i) => {
            const slot = slots[i];
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: border("#e5e7eb", "#333333") }}
        >
          <div className="flex items-center justify-between">
            <h2
              className="text-[22px] font-semibold"
              style={{ color: text("#000000", "#f3f4f6") }}
            >
              {mode === "edit"
                ? "Редактировать расписание"
                : "Создание расписания сотрудника"}
            </h2>
            <button
              onClick={onClose}
              className="transition-colors cursor-pointer"
              style={{ color: text("#9ca3af", "#6b7280") }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = text("#6b7280", "#9ca3af");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = text("#9ca3af", "#6b7280");
              }}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Input Fields */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: text("#374151", "#d1d5db") }}
                >
                  Название расписания
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="например, Утренняя смена"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: bg("#ffffff", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#4b5563"),
                    color: text("#000000", "#f3f4f6"),
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: text("#374151", "#d1d5db") }}
                >
                  Короткое название
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="например, УС"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  style={{
                    backgroundColor: bg("#ffffff", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#4b5563"),
                    color: text("#000000", "#f3f4f6"),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: bg("#f9fafb", "#2a2a2a") }}
          >
            <h4
              className="text-sm font-semibold mb-3"
              style={{ color: text("#374151", "#d1d5db") }}
            >
              Быстрые действия
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={applyToAllDays}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{
                  backgroundColor: isDark ? "#1e3a8a" : "#dbeafe",
                  color: isDark ? "#93c5fd" : "#1e40af",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#1e40af"
                    : "#bfdbfe";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#1e3a8a"
                    : "#dbeafe";
                }}
              >
                Применить понедельник ко всем дням
              </button>
              <button
                onClick={clearAllSchedules}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{
                  backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
                  color: isDark ? "#fca5a5" : "#b91c1c",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#991b1b"
                    : "#fecaca";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#7f1d1d"
                    : "#fee2e2";
                }}
              >
                Очистить всё
              </button>
              <button
                onClick={setStandardHours}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{
                  backgroundColor: isDark ? "#14532d" : "#dcfce7",
                  color: isDark ? "#86efac" : "#15803d",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#166534"
                    : "#bbf7d0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#14532d"
                    : "#dcfce7";
                }}
              >
                Установить 9.00-18.00 стандарт
              </button>
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="mb-6">
            <h3
              className="text-lg font-semibold mb-4"
              style={{ color: text("#1f2937", "#f3f4f6") }}
            >
              Недельное расписание
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {days.map((day) => (
                <div
                  key={day}
                  className="border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    backgroundColor: bg("#ffffff", "#1e1e1e"),
                    borderColor: border("#f3f4f6", "#333333"),
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4
                      className="font-semibold"
                      style={{ color: text("#1f2937", "#f3f4f6") }}
                    >
                      {day}
                    </h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked={
                          day !== "Суббота" && day !== "Воскресенье"
                        }
                        className="mr-2 rounded"
                      />
                      <span
                        className="text-sm"
                        style={{ color: text("#6b7280", "#9ca3af") }}
                      >
                        Активен
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2 mb-3">
                    {scheduleData[day].map((slot, index) => (
                      <div
                        key={index}
                        className="border-2 rounded-lg p-3"
                        style={{
                          background: isDark
                            ? "linear-gradient(to right, #1e3a8a, #312e81)"
                            : "linear-gradient(to right, #eff6ff, #e0e7ff)",
                          borderColor: isDark ? "#3b82f6" : "#bfdbfe",
                        }}
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
                            className="flex-1 px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                            style={{
                              backgroundColor: bg("#ffffff", "#2a2a2a"),
                              borderColor: border("#d1d5db", "#4b5563"),
                              color: text("#000000", "#f3f4f6"),
                            }}
                          />
                          <span
                            className="font-medium"
                            style={{ color: text("#6b7280", "#9ca3af") }}
                          >
                            до
                          </span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateTimeSlot(day, index, "end", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none"
                            style={{
                              backgroundColor: bg("#ffffff", "#2a2a2a"),
                              borderColor: border("#d1d5db", "#4b5563"),
                              color: text("#000000", "#f3f4f6"),
                            }}
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

                  <button
                    onClick={() => addTimeSlot(day)}
                    className="w-full py-2 text-white rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: isDark
                        ? "linear-gradient(to right, #047857, #059669)"
                        : "linear-gradient(to right, #10b981, #14b8a6)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark
                        ? "linear-gradient(to right, #059669, #10b981)"
                        : "linear-gradient(to right, #059669, #0d9488)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark
                        ? "linear-gradient(to right, #047857, #059669)"
                        : "linear-gradient(to right, #10b981, #14b8a6)";
                    }}
                  >
                    + Добавить временной интервал
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end space-x-3 border-t"
          style={{
            backgroundColor: bg("#f9fafb", "#2a2a2a"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 transition-colors font-medium rounded-lg"
            style={{
              backgroundColor: bg("#e5e7eb", "#4b5563"),
              color: text("#6b7280", "#d1d5db"),
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = bg("#d1d5db", "#6b7280");
              e.currentTarget.style.color = text("#1f2937", "#f3f4f6");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = bg("#e5e7eb", "#4b5563");
              e.currentTarget.style.color = text("#6b7280", "#d1d5db");
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium shadow-lg"
          >
            {mode === "edit" ? "Сохранить изменения" : "Сохранить расписание"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
