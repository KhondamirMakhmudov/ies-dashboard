import useAppTheme from "@/hooks/useAppTheme";
import { Typography, Chip } from "@mui/material";
import Link from "next/link";

const WorkPlaceCard = ({
  workplace,
  unitCode,
  unitType,
  position,
  is_active,
  is_vacant,
  employee,
  employeeURL = "#",
  deleteWorkplace = () => {},
  id,
  showByRole,
}) => {
  const { bg, isDark, text, border } = useAppTheme();

  return (
    <div
      className={
        bg(
          "bg-gradient-to-br from-white to-gray-50",
          "bg-gradient-to-br from-gray-800 to-gray-900",
        ) +
        " " +
        border("border-gray-200", "border-gray-700") +
        " border rounded-xl p-5 hover:shadow-xl " +
        border("hover:border-blue-300", "hover:border-blue-600") +
        " transition-all duration-300 hover:-translate-y-1"
      }
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <Typography
              variant="h6"
              className={text("text-gray-800", "text-white") + " font-bold"}
            >
              {workplace}
            </Typography>
          </div>
          <div
            className={
              text("text-gray-500", "text-gray-400") +
              " flex items-center gap-2 text-sm ml-4"
            }
          >
            <span
              className={
                bg("bg-gray-100", "bg-gray-700") +
                " " +
                text("text-gray-700", "text-gray-300") +
                " px-2 py-0.5 rounded text-xs font-medium"
              }
            >
              {unitCode}
            </span>
            <span>•</span>
            <span
              className={
                text("text-gray-700", "text-gray-200") + " font-medium"
              }
            >
              {position}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Chip
            label={is_active ? "Активно" : "Неактивно"}
            color={is_active ? "success" : "default"}
            size="small"
            variant={isDark ? "filled" : "outlined"}
            className="font-semibold"
          />
          <Chip
            label={is_vacant ? "Вакантно" : "Занято"}
            color={is_vacant ? "info" : "error"}
            size="small"
            variant="filled"
            className="font-semibold"
          />
        </div>
      </div>

      {/* Divider */}
      <div
        className={
          bg(
            "bg-gradient-to-r from-transparent via-gray-300 to-transparent",
            "bg-gradient-to-r from-transparent via-gray-600 to-transparent",
          ) + " h-px mb-4"
        }
      ></div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Unit Type */}
        <div
          className={
            bg("bg-blue-50", "bg-blue-900/30") +
            " " +
            border("border-blue-100", "border-blue-800") +
            " rounded-lg p-3 border"
          }
        >
          <p
            className={
              text("text-blue-600", "text-blue-400") +
              " text-xs font-semibold uppercase mb-1"
            }
          >
            Тип единицы
          </p>
          <p
            className={
              text("text-gray-800", "text-white") + " text-sm font-bold"
            }
          >
            {unitType}
          </p>
        </div>

        {/* Employee Info */}
        <div
          className={
            (employee
              ? bg("bg-green-50", "bg-green-900/30") +
                " " +
                border("border-green-100", "border-green-800")
              : bg("bg-gray-50", "bg-gray-800/50") +
                " " +
                border("border-gray-200", "border-gray-700") +
                " border-dashed") +
            " rounded-lg p-3 border flex justify-between items-end gap-3"
          }
        >
          <div className="flex-1 min-w-0">
            <p
              className={
                (employee
                  ? text("text-green-600", "text-green-400")
                  : text("text-gray-500", "text-gray-400")) +
                " text-xs font-semibold uppercase mb-1"
              }
            >
              Сотрудник
            </p>
            {employee ? (
              <div>
                <p
                  className={
                    text("text-gray-800", "text-white") +
                    " text-sm font-bold mb-0.5"
                  }
                >
                  {employee.first_name} {employee.last_name}
                </p>
                <p
                  className={
                    text("text-gray-600", "text-gray-400") + " text-xs truncate"
                  }
                >
                  {employee.email || "Нет email"}
                </p>
              </div>
            ) : (
              <p
                className={
                  text("text-gray-400", "text-gray-500") + " text-sm italic"
                }
              >
                Не назначен
              </p>
            )}
          </div>

          <div className="text-xs flex-shrink-0">
            <Link
              href={employeeURL}
              className={
                bg("bg-green-600", "bg-green-700") +
                " hover:bg-green-700 dark:hover:bg-green-800 text-white px-3 py-1.5 rounded-md transition-all duration-200 hover:shadow-md inline-block text-center whitespace-nowrap"
              }
            >
              Страница
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={
          border("border-gray-200", "border-gray-700") +
          " flex justify-between items-center pt-3 border-t"
        }
      >
        <div className="flex items-center gap-2">
          <span className={text("text-gray-400", "text-gray-500") + " text-xs"}>
            ID:
          </span>
          <span
            className={
              bg("bg-gray-100", "bg-gray-700") +
              " " +
              text("text-gray-600", "text-gray-300") +
              " text-xs font-mono font-medium px-2 py-1 rounded"
            }
          >
            {id}
          </span>
        </div>
        {showByRole && (
          <button
            onClick={deleteWorkplace}
            className={
              bg("bg-red-500", "bg-red-600") +
              " hover:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
            }
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
};

export default WorkPlaceCard;
