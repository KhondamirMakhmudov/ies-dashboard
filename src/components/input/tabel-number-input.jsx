import useAppTheme from "@/hooks/useAppTheme";

export default function TabelNumberInput({
  label,
  value,
  onChange,
  placeholder = "Введите",
  inputClass = "",
  error,
  required = false,
}) {
  const { isDark, text } = useAppTheme();

  // Split the value into left and right parts
  const [leftPart, rightPart] = value ? value.split("-") : ["", ""];

  const handleRightPartChange = (e) => {
    const newRightPart = e.target.value;
    const newValue = leftPart ? `${leftPart}-${newRightPart}` : newRightPart;

    onChange({
      target: {
        name: e.target.name,
        value: newValue,
      },
    });
  };

  return (
    <div className="w-full">
      {label && (
        <label
          className={`block mb-1 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Left part (disabled) */}
        <div
          className={`flex-1 h-[45px] px-3 border rounded-[5px] flex items-center text-sm font-medium ${
            isDark
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-100 border-gray-300"
          }`}
          style={{
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          {leftPart || "-"}
        </div>

        {/* Separator */}
        <div className="text-xl font-bold">-</div>

        {/* Right part (editable) */}
        <input
          type="text"
          name="tabel_number"
          value={rightPart}
          onChange={handleRightPartChange}
          placeholder={placeholder}
          maxLength="10"
          className={`flex-1 h-[45px] border rounded-[5px] p-2 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-blue-500"
          } ${inputClass}`}
          style={{
            backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
            borderColor: error ? "#ef4444" : isDark ? "#4b5563" : "#d1d5db",
            color: isDark ? "#f3f4f6" : "#000000",
          }}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
