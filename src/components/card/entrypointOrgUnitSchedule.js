import { get, isEmpty } from "lodash";
import useAppTheme from "@/hooks/useAppTheme"; // Update with your actual path

const EntryPointOrgUnitScheduleCard = ({
  schedules,
  unitCodeName,
  unitCodeCode,
  unitCodeIsMain,
}) => {
  const { isDark } = useAppTheme();

  return (
    <div>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
          >
            {unitCodeName}
          </h3>
          <p
            className="text-sm"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
          >
            Код подразделения:{" "}
            <span
              className="font-medium"
              style={{ color: isDark ? "#d1d5db" : "#374151" }}
            >
              {unitCodeCode}
            </span>
          </p>
        </div>

        {unitCodeIsMain === 1 && (
          <span
            className="px-2 py-1 text-xs font-medium rounded-full"
            style={{
              background: isDark ? "rgba(34, 197, 94, 0.2)" : "#dcfce7",
              color: isDark ? "#86efac" : "#16a34a",
            }}
          >
            Основная точка доступа
          </span>
        )}
      </div>

      {!isEmpty(schedules) && (
        <div
          className="mt-3 border-t pt-2"
          style={{ borderColor: isDark ? "#374151" : "#f3f4f6" }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: isDark ? "#6b7280" : "#9ca3af" }}
          >
            Графики:
          </p>
          <ul className="space-y-1">
            {schedules.map((schedule, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center px-3 py-1.5 rounded-md"
                style={{
                  background: isDark ? "#374151" : "#f9fafb",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: isDark ? "#d1d5db" : "#374151" }}
                >
                  {get(schedule, "scheduleName")}
                </p>
                {get(schedule, "isMain") === 1 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: isDark
                        ? "rgba(59, 130, 246, 0.2)"
                        : "#dbeafe",
                      color: isDark ? "#93c5fd" : "#2563eb",
                    }}
                  >
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
