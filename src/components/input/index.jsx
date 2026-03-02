import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import useAppTheme from "@/hooks/useAppTheme";
import { normalizeDateInputValue } from "@/utils/normalizeDateInput";

const Input = ({
  label,
  required = false,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  classNames = "",
  inputClass = "",
  labelClass = "",
  ...props
}) => {
  const { isDark, bg, text, border } = useAppTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleChange = (e) => {
    if (!onChange) return;

    const normalizedValue = normalizeDateInputValue(e.target.value, inputType);

    if (normalizedValue !== e.target.value) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: normalizedValue,
        },
      });
      return;
    }

    onChange(e);
  };

  return (
    <div className={`relative ${classNames}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block mb-1 text-sm ${labelClass}`}
          style={{ color: text("#374151", "#d1d5db") }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <input
        {...props}
        id={name}
        name={name}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`w-full h-[55px] border ${!isDark ? "border-gray-200" : "border-gray-400"} rounded-[5px] p-2 pr-10 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500" : "focus:ring-blue-500"
        } ${inputClass}`}
        style={{
          backgroundColor: bg("#ffffff", "#2a2a2a"),

          color: text("#000000", "#f3f4f6"),
        }}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[65%] transform -translate-y-1/2"
          style={{ color: text("#6b7280", "#9ca3af") }}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </button>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
