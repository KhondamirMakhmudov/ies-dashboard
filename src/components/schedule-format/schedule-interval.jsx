// ScheduleInterval.jsx
const ScheduleInterval = ({ interval, onChange, dayIdx, intIdx }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
      {/* Badge */}
      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
        {intIdx + 1}
      </span>

      {/* Start time */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Начало</label>
        <input
          type="time"
          value={interval.startTime.slice(0, 5)}
          onChange={(e) =>
            onChange(dayIdx, intIdx, "startTime", e.target.value + ":00")
          }
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* End time */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Конец</label>
        <input
          type="time"
          value={interval.endTime.slice(0, 5)}
          onChange={(e) =>
            onChange(dayIdx, intIdx, "endTime", e.target.value + ":00")
          }
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* Checkbox */}
      <div className="ml-auto flex items-center gap-2">
        <input
          type="checkbox"
          checked={interval.enabled === 1}
          onChange={(e) =>
            onChange(dayIdx, intIdx, "enabled", e.target.checked ? 1 : 0)
          }
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
        />
        <span className="text-sm text-gray-700">Активен</span>
      </div>
    </div>
  );
};

export default ScheduleInterval;
