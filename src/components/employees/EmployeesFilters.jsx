import { Search, FilterList, Close } from "@mui/icons-material";
import CustomSelect from "@/components/select";
import {
  genderOptions,
  educationLevelOptions,
  razryadOptions,
} from "@/constants/static-data";
import dayjs from "dayjs";

const EmployeesFilters = ({
  canReadEmployee,
  bg,
  border,
  isDark,
  searchTerm,
  onSearchChange,
  isSearching,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  clearAllFilters,
  filters,
  setFilters,
}) => {
  if (!canReadEmployee) return null;

  return (
    <>
      <div
        className="bg-white p-4 mt-3 rounded-md border border-gray-200"
        style={{
          background: bg("white", "#1E1E1E"),
          borderColor: border("#d1d5db", "#4b5563"),
        }}
      >
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Поиск по имени"
              value={searchTerm}
              onChange={onSearchChange}
              className={`w-full pl-10 pr-4 py-2.5 ${
                !isDark
                  ? "border border-gray-300 text-gray-800"
                  : "border border-gray-700 text-gray-400"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400 `}
            />

            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              showFilters || hasActiveFilters
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FilterList className="w-5 h-5" />
            Фильтры
            {hasActiveFilters && (
              <span className="bg-white text-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <CustomSelect
                  label={"Пол"}
                  options={genderOptions}
                  value={filters.gender}
                  placeholder="Выберите пол"
                  onChange={(val) =>
                    setFilters((prev) => ({
                      ...prev,
                      gender: val,
                    }))
                  }
                  returnObject={false}
                />
              </div>

              <CustomSelect
                label={"Выберите разряд"}
                options={razryadOptions}
                value={filters.level}
                placeholder="Выберите разряд"
                onChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    level: val,
                  }))
                }
                sortOptions={false}
                returnObject={false}
              />

              <CustomSelect
                options={educationLevelOptions}
                value={filters.education_degree}
                label="Степень образования"
                placeholder="Выберите уровень образования"
                onChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    education_degree: val,
                  }))
                }
                returnObject={false}
              />
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className={`flex items-center gap-2 px-4 py-2 ${
                    !isDark
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-red-600 text-red-50 hover:bg-red-700"
                  } rounded-lg  transition-all font-medium cursor-pointer`}
                >
                  <Close className="w-4 h-4" />
                  Очистить фильтры
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div
          className={`${
            !isDark
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-blue-900 border border-blue-700"
          } p-3 mt-3 rounded-md `}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium ">Активные фильтры:</span>
            {searchTerm && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Поиск: {searchTerm}
              </span>
            )}
            {filters.gender && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Пол:{" "}
                {genderOptions.find((o) => o.value === filters.gender)?.label ||
                  filters.gender}
              </span>
            )}
            {filters.level && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Разряд:{" "}
                {razryadOptions.find((o) => o.value === filters.level)?.label ||
                  filters.level}
              </span>
            )}
            {filters.education_degree && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Образование:{" "}
                {educationLevelOptions.find(
                  (o) => o.value === filters.education_degree,
                )?.label || filters.education_degree}
              </span>
            )}
            {filters.hire_date_from && (
              <span className="px-3 py-1 bg-blue-100 rounded-full text-sm">
                От: {dayjs(filters.hire_date_from).format("DD.MM.YYYY")}
              </span>
            )}
            {filters.hire_date_to && (
              <span className="px-3 py-1 bg-blue-100 rounded-full text-sm">
                До: {dayjs(filters.hire_date_to).format("DD.MM.YYYY")}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeesFilters;
