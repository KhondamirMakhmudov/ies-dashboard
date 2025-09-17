import { Typography } from "@mui/material";

const WorkPlaceCard = ({
  workplace,
  unitCode,
  unitType,
  position,
  is_active,
  is_vacant,
  employee,

  deleteWorkplace = () => {},
  id,
}) => {
  return (
    <div className="border border-gray-200 rounded-md p-3 hover:shadow-md shadow-sm cursor-pointer transition-all duration-200">
      <div className="flex justify-between items-start gap-2">
        <div className="col-span-6">
          <Typography variant="h8">{workplace}</Typography>
          <p className="text-gray-400 text-sm">
            {workplace} ({unitCode})
          </p>
          <p className="text-gray-400 text-sm">
            Позиция: <b>{position}</b>
          </p>

          <p className="mt-[10px] text-gray-400 text-sm">
            Тип организационные единицы: <b>{unitType}</b>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              is_active
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {is_active ? "Активно" : "Неактивно"}
          </span>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              is_vacant
                ? "bg-green-100 text-green-800 "
                : "bg-red-100 text-red-800"
            }`}
          >
            {is_vacant ? "Вакантно" : "Занято"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Информация о сотруднике
          </p>

          {employee ? (
            <>
              <p className="text-sm text-gray-700 font-medium">
                {employee.first_name} {employee.last_name}
              </p>
              <p className="text-xs text-gray-600">
                {employee.email || "Нет email"}
              </p>
              <p className="text-xs text-gray-600">
                Дата найма: {employee.hire_date || "Н/Д"}
              </p>
              <p className="text-xs text-gray-600">
                Статус: {employee.status || "Н/Д"}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Сотрудник не назначен</p>
          )}
        </div>
        {/* 
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Детали рабочего места
          </p>
          <p className="text-xs text-gray-600">
            Дата начала: $
            {workplace.start_date
              ? new Date(workplace.start_date).toLocaleDateString()
              : "Не указана"}
          </p>
          <p className="text-xs text-gray-600">
            Создано: ${new Date(workplace.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-600">
            Обновлено: ${new Date(workplace.updated_at).toLocaleDateString()}
          </p>
        </div> */}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">ID: {id}</div>
        <div className="flex space-x-2">
          {/* <button
            onClick={editWorkplace}
            className="text-white bg-orange-500 hover:bg-orange-600 p-2 rounded-lg text-sm font-medium"
          >
            Редактировать
          </button> */}
          <button
            onClick={deleteWorkplace}
            className="text-white bg-red-500 hover:bg-red-600 p-2 rounded-lg text-sm font-medium"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkPlaceCard;
