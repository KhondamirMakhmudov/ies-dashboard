// ScheduleDayCard.jsx
import ScheduleInterval from "./schedule-interval";

const ScheduleDayCard = ({ day, dayIdx, weekDaysRu, onChange }) => {
  return (
    <div className="bg-white shadow-md rounded-xl border border-gray-200 p-5 transition hover:shadow-lg">
      <p className="font-semibold text-lg text-gray-800 mb-4 border-b border-b-gray-300 pb-2">
        {weekDaysRu[day.weekDay - 1]}
      </p>

      <div className="space-y-4">
        {day.timeList.map((interval, intIdx) => (
          <ScheduleInterval
            key={intIdx}
            interval={interval}
            dayIdx={dayIdx}
            intIdx={intIdx}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
};

export default ScheduleDayCard;
