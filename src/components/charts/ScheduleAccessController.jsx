import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const AccessScheduleChart = ({ scheduleData }) => {
  const dayOrder = ["Пн.", "Вт.", "Ср.", "Чт.", "Пт.", "Сб.", "Вс."];

  // Convert time (e.g. "06:00:00") → minutes (e.g. 360)
  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Recharts requires flat data: [ { day: "Пн.", intervals: [{ start, end }] } ]
  const chartData = dayOrder.map((day) => {
    const intervals = scheduleData[0].weekSchedule[day]
      .filter((item) => item.enabled === 1)
      .map((item) => ({
        start: toMinutes(item.startTime),
        end: toMinutes(item.endTime),
      }));

    return { day, intervals };
  });

  // Convert to a format Recharts understands: each interval becomes its own bar row
  const flattenedData = [];
  chartData.forEach(({ day, intervals }) => {
    intervals.forEach((interval, idx) => {
      flattenedData.push({
        day,
        start: interval.start,
        duration: interval.end - interval.start,
        label: `${day} ${Math.floor(interval.start / 60)
          .toString()
          .padStart(2, "0")}:${(interval.start % 60)
          .toString()
          .padStart(2, "0")} – ${Math.floor(interval.end / 60)
          .toString()
          .padStart(2, "0")}:${(interval.end % 60)
          .toString()
          .padStart(2, "0")}`,
      });
    });
  });

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={flattenedData}
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <XAxis
            type="number"
            domain={[0, 1440]}
            tickFormatter={(min) =>
              `${Math.floor(min / 60)
                .toString()
                .padStart(2, "0")}:${(min % 60).toString().padStart(2, "0")}`
            }
            ticks={[0, 360, 720, 1080, 1440]}
            interval={0}
          />
          <YAxis dataKey="day" type="category" />
          <Tooltip
            formatter={(value, name, props) => {
              if (name === "duration") {
                const { start } = props.payload;
                const end = start + value;
                const format = (m) =>
                  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
                    m % 60
                  ).padStart(2, "0")}`;
                return [`${format(start)} – ${format(end)}`, "Время"];
              }
              return value;
            }}
          />
          <Bar dataKey="duration" stackId="a" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccessScheduleChart;
