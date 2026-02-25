import { useState, useMemo } from "react";
import useAppTheme from "@/hooks/useAppTheme";

export default function BirthDateInput({
  label = "День рождения",
  name = "date_of_birth",
  value,
  onChange,
  error,
  className = "",
  inputClass = "",
}) {
  const { isDark } = useAppTheme();
  const [localError, setLocalError] = useState("");

  // ✅ Bugungi sanaga qarab min/max sana hisoblash
  const { maxDate, minDate } = useMemo(() => {
    const today = new Date();
    const max = new Date(
      today.getFullYear() - 16,
      today.getMonth(),
      today.getDate()
    );
    const min = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );

    const toISO = (date) => date.toISOString().split("T")[0];

    return {
      maxDate: toISO(max),
      minDate: toISO(min),
    };
  }, []);

  const validateBirthDate = (inputDate) => {
    const birth = new Date(inputDate);
    const today = new Date();

    if (birth > today) return "Tug‘ilgan sana kelajakda bo'lishi mumkin emas";

    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    const realAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (realAge < 16) return "Xodim kamida 16 yoshda bo'lishi kerak";
    if (realAge > 100) return "Xodim 100 yoshdan katta bo'lmasligi kerak";
    return "";
  };

  const handleChange = (e) => {
    const newValue = e.target.value;

    const validationMsg = validateBirthDate(newValue);
    setLocalError(validationMsg);

    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          className={`block mb-1 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <input
        type="date"
        name={name}
        value={value}
        onChange={handleChange}
        min={minDate}
        max={maxDate}
        className={`w-full h-[55px] px-3 border rounded-md focus:outline-none focus:ring-2 ${
          localError || error
            ? "border-red-500 focus:ring-red-500"
            : isDark
              ? "border-gray-700 focus:ring-blue-500"
              : "border-gray-400 focus:ring-blue-500"
        } ${inputClass}`}
      />
      {(localError || error) && (
        <p className="text-red-500 text-sm mt-1">{localError || error}</p>
      )}
    </div>
  );
}
