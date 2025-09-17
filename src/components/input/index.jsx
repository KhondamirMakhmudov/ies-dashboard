import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`relative ${classNames}`}>
      {label && (
        <label
          htmlFor={name}
          className={`block mb-1 text-sm text-gray-700 ${labelClass}`}
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
        onChange={onChange}
        className={`w-full h-[55px] border ${
          error ? "border-red-500" : "border-gray-400"
        } rounded-[5px] p-2 pr-10 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500" : "focus:ring-blue-500"
        } ${inputClass}`}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[65%] transform -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </button>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
