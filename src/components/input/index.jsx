import { useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Input = ({
  label,
  type,
  placeholder,
  value,
  onChange,
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
      {label && <label className={`${labelClass}`}>{label}</label>}

      <input
        {...props}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full h-[55px] border border-gray-400 rounded-[5px] p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClass}`}
      />

      {/* Show/hide toggle */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-[65%] transform -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </button>
      )}
    </div>
  );
};

export default Input;
