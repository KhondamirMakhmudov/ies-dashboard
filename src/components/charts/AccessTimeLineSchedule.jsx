import React from "react";
import { motion } from "framer-motion";

const dayNames = ["Пн.", "Вт.", "Ср.", "Чт.", "Пт.", "Сб.", "Вс."];

const timeToMinutes = (time) => {
  const [h, m] = time.split(":");
  return parseInt(h) * 60 + parseInt(m);
};

const AccessCustomTimeline = ({ schedule }) => {
  const week = schedule?.weekSchedule || {};

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md shadow-md p-4 space-y-3 bg-white text-gray-800">
      {/* Soatlar liniyasi */}
      <div className="ml-14 grid grid-cols-24 text-[10px] text-gray-500 pb-1">
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="text-center col-span-1">
            {hour.toString().padStart(2, "0")}:00
          </div>
        ))}
      </div>

      {/* Haftalik qatlam */}
      {dayNames.map((day, index) => {
        const intervals = week[day] || [];

        return (
          <motion.div
            key={index}
            className="flex items-center group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 50 }}
          >
            {/* Kun nomi */}
            <div className="w-12 font-medium text-sm">{day}</div>

            {/* 24-soatli jadval */}
            <div className="relative w-full h-8 bg-gray-100 rounded ml-2 overflow-hidden group-hover:bg-blue-50 transition-colors duration-300">
              {/* Grid fon */}
              <div className="absolute inset-0 grid grid-cols-24 gap-[1px] pointer-events-none">
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div key={idx} className="bg-gray-200"></div>
                ))}
              </div>

              {/* Intervallar */}
              {intervals
                .filter((intv) => intv.enabled === 1)
                .map((intv, idx) => {
                  const start = timeToMinutes(intv.startTime);
                  const end = timeToMinutes(intv.endTime);
                  const duration = end - start;

                  const leftPercent = (start / 1440) * 100;
                  const widthPercent = (duration / 1440) * 100;

                  return (
                    <motion.div
                      key={idx}
                      className="absolute h-full bg-blue-500 text-[10px] text-white font-medium flex items-center justify-center rounded shadow-md cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-200"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      whileHover={{ scale: 1.08 }}
                    >
                      {intv.startTime.slice(0, 5)}–{intv.endTime.slice(0, 5)}
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AccessCustomTimeline;
