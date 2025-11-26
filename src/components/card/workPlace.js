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
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <Typography variant="h6" className="font-bold text-gray-800">
              {workplace}
            </Typography>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
              {unitCode}
            </span>
            <span>•</span>
            <span className="font-medium text-gray-700">{position}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Chip
            label={is_active ? "Активно" : "Неактивно"}
            color={is_active ? "success" : "default"}
            size="small"
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
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Unit Type */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">
            Тип единицы
          </p>
          <p className="text-sm font-bold text-gray-800">{unitType}</p>
        </div>

        {/* Employee Info */}
        <div
          className={`rounded-lg p-3 border flex justify-between items-end ${
            employee
              ? "bg-green-50 border-green-100"
              : "bg-gray-50 border-gray-200 border-dashed"
          }`}
        >
          <div>
            <p
              className={`text-xs font-semibold uppercase mb-1 ${
                employee ? "text-green-600" : "text-gray-500"
              }`}
            >
              Сотрудник
            </p>
            {employee ? (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-0.5">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {employee.email || "Нет email"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Не назначен</p>
            )}
          </div>

          <div className="text-xs">
            <Link
              href={employeeURL}
              className="text-white hover:bg-green-600 hover:text-white bg-green-600 px-2 py-1 rounded-md transition-all duration-100"
            >
              Страница сотрудника
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">ID:</span>
          <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {id}
          </span>
        </div>
        <button
          onClick={deleteWorkplace}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default WorkPlaceCard;
