import {
  ErrorOutline as ErrorOutlineIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { Chip, Avatar } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import useAppTheme from "@/hooks/useAppTheme";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import React from "react";

const WorkplaceEmployeeSection = ({
  workplace = [],
  levelColor,
  selectedWorkplaces = [],
  onToggleWorkplace,
}) => {
  const { bg, isDark, text, border } = useAppTheme();
  const [showEmployees, setShowEmployees] = useState(false);

  if (!workplace || workplace.length === 0) {
    return (
      <div
        className={
          bg("bg-gray-50", "bg-gray-800/30") +
          " " +
          text("text-gray-500", "text-gray-400") +
          " mt-3 p-4 rounded-lg border-2 border-dashed " +
          border("border-gray-200", "border-gray-700") +
          " flex items-center gap-2 transition-colors"
        }
      >
        <ErrorOutlineIcon sx={{ fontSize: 18, opacity: 0.6 }} />
        <span className="text-sm italic">Рабочие места не назначены</span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Toggle Header */}
      <motion.div
        className={
          bg(
            "bg-gradient-to-r from-blue-50 to-indigo-50",
            "bg-gradient-to-r from-gray-800 to-gray-700",
          ) +
          " " +
          border("border-blue-100", "border-gray-600") +
          " flex items-center justify-between cursor-pointer p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
        }
        onClick={() => setShowEmployees(!showEmployees)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-3">
          <div
            className={
              bg("bg-white", "bg-gray-900") + " p-2 rounded-lg shadow-sm"
            }
          >
            <WorkIcon sx={{ fontSize: 20, color: levelColor || "#3b82f6" }} />
          </div>
          <div>
            <span
              className={
                text("text-gray-900", "text-white") +
                " text-sm font-semibold block"
              }
            >
              Рабочие места
            </span>
            <span
              className={text("text-gray-500", "text-gray-400") + " text-xs"}
            >
              {workplace.length}{" "}
              {workplace.length === 1 ? "позиция" : "позиций"}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: showEmployees ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className={bg("bg-white", "bg-gray-900") + " p-1.5 rounded-full"}
        >
          <KeyboardArrowDownIcon
            sx={{ fontSize: 20, color: isDark ? "#9ca3af" : "#6b7280" }}
          />
        </motion.div>
      </motion.div>

      {/* Workplace Cards */}
      <AnimatePresence>
        {showEmployees && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 space-y-3"
          >
            {workplace.map((wp, index) => {
              const isSelected = selectedWorkplaces.includes(wp.id);
              return (
                <motion.div
                  key={wp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={
                    (isSelected
                      ? bg("bg-blue-50", "bg-blue-900/40")
                      : bg("bg-white", "bg-gray-800")) +
                    " " +
                    (isSelected
                      ? border("border-blue-300", "border-blue-600")
                      : border("border-gray-200", "border-gray-700")) +
                    " ml-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border-2 overflow-hidden group relative"
                  }
                >
                  {/* Selection Left Border Indicator */}
                  {isSelected && (
                    <motion.div
                      layoutId={`indicator-${wp.id}`}
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: 4 }}
                    />
                  )}

                  <div className="p-4 flex items-start gap-4">
                    {/* Premium Checkbox - Left Side */}
                    {onToggleWorkplace && (
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          onToggleWorkplace(wp.id);
                        }}
                        className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded"
                      >
                        <motion.div
                          animate={isSelected ? { rotate: 360 } : {}}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                          }}
                          className={
                            (isSelected
                              ? "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-400/50"
                              : bg(
                                  "bg-white border-2 border-gray-300",
                                  "bg-gray-700 border-2 border-gray-600",
                                )) +
                            " w-6 h-6 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-md"
                          }
                        >
                          {isSelected && (
                            <motion.svg
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                            >
                              <path
                                d="M12 3.5L5.5 10.5L2 7"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </motion.div>
                      </motion.button>
                    )}

                    {/* Content Area */}
                    <div className="flex-1">
                      {/* Position Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className={
                              bg("bg-blue-50", "bg-blue-900/30") +
                              " p-2 rounded-lg"
                            }
                          >
                            <BadgeIcon
                              sx={{
                                fontSize: 18,
                                color: levelColor || "#3b82f6",
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={
                                text("text-gray-900", "text-white") +
                                " text-sm font-semibold truncate"
                              }
                            >
                              {wp.position?.name || "Без названия"}
                            </h4>
                            <p
                              className={
                                text("text-gray-500", "text-gray-400") +
                                " text-xs mt-0.5 truncate"
                              }
                            >
                              ID: {wp.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end ml-2">
                          <Chip
                            label={wp.is_vacant ? "Вакантно" : "Занято"}
                            size="small"
                            color={wp.is_vacant ? "warning" : "success"}
                            variant={isDark ? "filled" : "outlined"}
                            sx={{
                              fontSize: "0.7rem",
                              height: "24px",
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={wp.is_active ? "Активно" : "Неактивно"}
                            size="small"
                            color={wp.is_active ? "success" : "error"}
                            variant={isDark ? "filled" : "outlined"}
                            sx={{
                              fontSize: "0.7rem",
                              height: "24px",
                              fontWeight: 600,
                            }}
                          />
                        </div>
                      </div>

                      {/* Employee Information */}
                      {wp.employee && !wp.is_vacant ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className={
                            bg("bg-gray-50", "bg-gray-900/50") +
                            " " +
                            border("border-gray-100", "border-gray-700") +
                            " p-4 rounded-lg border"
                          }
                        >
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                bgcolor: levelColor || "#3b82f6",
                                fontSize: 18,
                                fontWeight: 600,
                                boxShadow: isDark
                                  ? "0 4px 6px rgba(0,0,0,0.3)"
                                  : "0 4px 6px rgba(0,0,0,0.1)",
                              }}
                            >
                              {wp.employee.last_name?.[0]}
                              {wp.employee.first_name?.[0]}
                            </Avatar>

                            {/* Employee Details */}
                            <div className="flex-1 space-y-3">
                              {/* Name */}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <PersonIcon
                                    sx={{
                                      fontSize: 16,
                                      color: isDark ? "#9ca3af" : "#6b7280",
                                    }}
                                  />
                                  <span
                                    className={
                                      text("text-gray-900", "text-white") +
                                      " text-base font-semibold"
                                    }
                                  >
                                    {wp.employee.last_name}{" "}
                                    {wp.employee.first_name}{" "}
                                    {wp.employee.middle_name}
                                  </span>
                                </div>
                                {wp.employee.education_degree && (
                                  <p
                                    className={
                                      text("text-gray-500", "text-gray-400") +
                                      " text-xs ml-6"
                                    }
                                  >
                                    {wp.employee.education_degree}
                                  </p>
                                )}
                              </div>

                              {/* Contact Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {wp.employee.phone_number && (
                                  <div
                                    className={
                                      bg("bg-white", "bg-gray-800") +
                                      " " +
                                      text("text-gray-700", "text-gray-300") +
                                      " flex items-center gap-2 p-2 rounded-lg text-sm hover:shadow-sm transition-shadow"
                                    }
                                  >
                                    <PhoneIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "#10b981",
                                      }}
                                    />
                                    <span className="text-xs">
                                      +998 {wp.employee.phone_number}
                                    </span>
                                  </div>
                                )}

                                {wp.employee.email && (
                                  <div
                                    className={
                                      bg("bg-white", "bg-gray-800") +
                                      " " +
                                      text("text-gray-700", "text-gray-300") +
                                      " flex items-center gap-2 p-2 rounded-lg text-sm hover:shadow-sm transition-shadow"
                                    }
                                  >
                                    <EmailIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "#3b82f6",
                                      }}
                                    />
                                    <span className="text-xs truncate">
                                      {wp.employee.email}
                                    </span>
                                  </div>
                                )}

                                {wp.employee.tabel_number && (
                                  <div
                                    className={
                                      bg("bg-white", "bg-gray-800") +
                                      " " +
                                      text("text-gray-700", "text-gray-300") +
                                      " flex items-center gap-2 p-2 rounded-lg text-sm hover:shadow-sm transition-shadow"
                                    }
                                  >
                                    <BadgeIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "#f59e0b",
                                      }}
                                    />
                                    <span className="text-xs">
                                      Таб. №: {wp.employee.tabel_number}
                                    </span>
                                  </div>
                                )}

                                {wp.start_date && (
                                  <div
                                    className={
                                      bg("bg-white", "bg-gray-800") +
                                      " " +
                                      text("text-gray-700", "text-gray-300") +
                                      " flex items-center gap-2 p-2 rounded-lg text-sm hover:shadow-sm transition-shadow"
                                    }
                                  >
                                    <CalendarTodayIcon
                                      sx={{
                                        fontSize: 16,
                                        color: "#8b5cf6",
                                      }}
                                    />
                                    <span className="text-xs">
                                      С:{" "}
                                      {new Date(
                                        wp.start_date,
                                      ).toLocaleDateString("ru-RU")}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Action Button */}
                              <div className="flex justify-end pt-2">
                                <a
                                  href={`/dashboard/employees/${wp.employee.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={
                                    bg("bg-blue-500", "bg-blue-600") +
                                    " hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                                  }
                                >
                                  <span>Подробнее</span>
                                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </a>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        /* Vacant Position */
                        <div
                          className={
                            bg("bg-orange-50", "bg-orange-900/20") +
                            " " +
                            border("border-orange-200", "border-orange-800") +
                            " " +
                            text("text-orange-700", "text-orange-300") +
                            " p-3 rounded-lg border flex items-center gap-2"
                          }
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                          <span className="text-sm font-medium">
                            Позиция вакантна - ожидается назначение
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkplaceEmployeeSection;
