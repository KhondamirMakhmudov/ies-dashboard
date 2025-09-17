// EditScheduleForm.jsx
import { Typography } from "@mui/material";
import React, { useState, useEffect } from "react";

const weekdays = [
  { label: "Dushanba", value: "Пн." },
  { label: "Seshanba", value: "Вт." },
  { label: "Chorshanba", value: "Ср." },
  { label: "Payshanba", value: "Чт." },
  { label: "Juma", value: "Пт." },
  { label: "Shanba", value: "Сб." },
  { label: "Yakshanba", value: "Вс." },
];

const EditScheduleForm = ({ initialData = [], onClose, onSubmit }) => {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    setSchedules(initialData);
  }, [initialData]);

  const handleScheduleChange = (sIdx, field, value) => {
    setSchedules((prev) =>
      prev.map((s, i) => (i === sIdx ? { ...s, [field]: value } : s))
    );
  };

  const handleToggleEnabled = (sIdx) => {
    setSchedules((prev) =>
      prev.map((s, i) => (i === sIdx ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleTimeChange = (sIdx, dayKey, tIdx, key, value) => {
    const updated = [...schedules];
    updated[sIdx].weekSchedule[dayKey][tIdx][key] = value + ":00";
    setSchedules(updated);
  };

  const handleSubmit = () => {
    const normalized = schedules.map((sched) => ({
      index: sched.index,
      enabled: sched.enabled,
      schedName: sched.scheduleName || sched.schedName || "",
      days: Object.entries(sched.weekSchedule || {}).map(
        ([dayName, times]) => ({
          weekDay:
            weekdays.find((w) => w.value === dayName)?.valueCode ||
            Object.fromEntries(weekdays.map((w, idx) => [w.value, idx + 1]))[
              dayName
            ],
          timeList: times.map((t) => ({
            index: t.index,
            enabled: t.enabled,
            startTime: t.startTime,
            endTime: t.endTime,
          })),
        })
      ),
    }));
    onSubmit(normalized);
  };

  return (
    <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
      <Typography variant="h6">Редактировать</Typography>
      {schedules.map((schedule, sIdx) => (
        <div key={sIdx} className="border border-gray-200 p-4 rounded bg-white">
          <div className="flex justify-between items-center mb-3">
            <input
              value={schedule.scheduleName || schedule.schedName || ""}
              onChange={(e) =>
                handleScheduleChange(sIdx, "scheduleName", e.target.value)
              }
              className="border border-gray-200 px-2 py-1 rounded w-2/3"
              placeholder="Schedule nomi"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedule.enabled}
                onChange={() => handleToggleEnabled(sIdx)}
              />
              Активный
            </label>
          </div>

          {weekdays.map(({ label, value }) => {
            const times = schedule.weekSchedule?.[value] || [];
            return (
              <div key={value} className="mb-4">
                <div className="font-medium text-sm text-gray-600 mb-2">
                  {label}
                </div>
                {times.length > 0 ? (
                  times.map(
                    (time, tIdx) =>
                      time.enabled === 1 && (
                        <div
                          key={tIdx}
                          className="flex items-center gap-3 ml-6 mb-1"
                        >
                          <input
                            type="time"
                            value={time.startTime.slice(0, 5)}
                            onChange={(e) =>
                              handleTimeChange(
                                sIdx,
                                value,
                                tIdx,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                          <span>—</span>
                          <input
                            type="time"
                            value={time.endTime.slice(0, 5)}
                            onChange={(e) =>
                              handleTimeChange(
                                sIdx,
                                value,
                                tIdx,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )
                  )
                ) : (
                  <div className="text-sm text-gray-400 italic ml-6">
                    Vaqtlar yo‘q
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="flex justify-end gap-4">
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
          Отменить
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default EditScheduleForm;
