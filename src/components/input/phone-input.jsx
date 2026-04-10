import React from "react";
import useAppTheme from "@/hooks/useAppTheme";
export default function PhoneInputUz({
  label = "Номер телефона",
  name,
  value,
  onChange,
  placeholder = "(xx) xxx-xx-xx",
  inputClass = "",
  error,
  labelClass = "",
  className = "",
}) {
  const { isDark, bg, text, border } = useAppTheme();
  const formatForDisplay = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    if (digits.length < 3) return `(${digits}`;
    if (digits.length < 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length < 8)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} - ${digits.slice(
        5,
      )}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 5)} - ${digits.slice(
      5,
      7,
    )} - ${digits.slice(7, 9)}`;
  };

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 9);
    onChange({
      target: {
        name,
        value: raw,
      },
    });
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className={`text-sm block mb-1  ${labelClass} ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}

      <div
        className={`flex items-center h-[45px] rounded-md border ${
          error ? "border-red-500" : "border-gray-200"
        } focus-within:ring-2 ${
          error ? "focus-within:ring-red-500" : "focus-within:ring-blue-500"
        }`}
      >
        {/* +998 Prefix */}
        <div
          className={`px-3 text-sm  border-r  border-gray-300 ${
            isDark ? "bg-[#2A2A2A] text-gray-100" : "bg-gray-100 text-gray-600"
          } rounded-l-md h-full flex items-center justify-center`}
        >
          +998
        </div>

        {/* Input */}
        <input
          id={name}
          type="tel"
          name={name}
          value={formatForDisplay(value || "")}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`flex-1 h-full px-3 text-sm focus:outline-none rounded-r-md ${inputClass}`}
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
