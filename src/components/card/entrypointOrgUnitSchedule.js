import { get, isEmpty } from "lodash";

const EntryPointOrgUnitScheduleCard = ({
  schedules,
  unitCodeName,
  unitCodeCode,
  unitCodeIsMain,
}) => {
  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            {unitCodeName}
          </h3>
          <p className="text-sm text-gray-500">
            Код подразделения:{" "}
            <span className="font-medium text-gray-700">{unitCodeCode}</span>
          </p>
        </div>

        {unitCodeIsMain === 1 && (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">
            Основная точка доступа
          </span>
        )}
      </div>

      {!isEmpty(schedules) && (
        <div className="mt-3 border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-400 mb-1">Графики:</p>
          <ul className="space-y-1">
            {schedules.map((schedule, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded-md"
              >
                <p className="text-sm font-medium text-gray-700">
                  {get(schedule, "scheduleName")}
                </p>
                {get(schedule, "isMain") === 1 && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    Основной график
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EntryPointOrgUnitScheduleCard;
