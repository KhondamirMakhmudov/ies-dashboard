const SelectedEmployeesBadge = ({ employees, onRemove }) => {
  if (employees.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Выбрано сотрудников: {employees.length}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="flex items-center gap-2 bg-white border border-blue-300 rounded-full px-3 py-1.5 text-sm group hover:border-blue-500 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {emp.first_name?.[0] || "?"}
            </div>
            <span className="text-gray-700 font-medium">
              {emp.first_name} {emp.last_name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(emp.id);
              }}
              className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Удалить"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedEmployeesBadge;
