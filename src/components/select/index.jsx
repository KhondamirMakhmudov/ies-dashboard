import React, { useState, useRef, useEffect } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import clsx from "clsx";
import useAppTheme from "@/hooks/useAppTheme";

const CustomSelect = ({
  label,
  required = false,
  error,
  options = [],
  value,
  onChange,
  placeholder = "Выберите контрольную точку",
  className = "",
  returnObject = false,
  sortOptions = true,
}) => {
  const { isDark, bg, text, border } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (opt) => {
    onChange(returnObject ? opt : opt.value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = returnObject
    ? value?.label
    : options.find((opt) => opt.value === value)?.label;

  const finalOptions = sortOptions
    ? [...options].sort((a, b) =>
        a.label?.localeCompare(b.label, "ru", { sensitivity: "base" })
      )
    : options;

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      {label && (
        <label
          className="block mb-1 text-sm"
          style={{ color: text("#374151", "#d1d5db") }}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <button
        type="button"
        onClick={toggleDropdown}
        className={clsx(
          "w-full h-[45px] border rounded-md p-2 text-[15px] text-left flex items-center justify-between focus:outline-none focus:ring-2",
          error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
        )}
        style={{
          backgroundColor: bg("#ffffff", "#2a2a2a"),
          borderColor: error ? "#ef4444" : border("#d1d5db", "#4b5563"),
          color: text("#000000", "#f3f4f6"),
        }}
      >
        <span
          className="truncate"
          style={{
            color: !value
              ? text("#9ca3af", "#6b7280")
              : text("#000000", "#f3f4f6"),
          }}
        >
          {selectedLabel || placeholder}
        </span>
        <KeyboardArrowDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: text("#6b7280", "#9ca3af") }}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-9999 mt-2 w-full border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
        >
          {finalOptions.map((opt, idx) => (
            <li
              key={idx}
              className={clsx(
                "px-4 py-2 cursor-pointer transition-colors",
                (returnObject ? value?.value : value) === opt.value &&
                  "font-medium"
              )}
              style={{
                backgroundColor:
                  (returnObject ? value?.value : value) === opt.value
                    ? isDark
                      ? "#1e3a8a"
                      : "#eff6ff"
                    : "transparent",
                color: text("#000000", "#f3f4f6"),
              }}
              onClick={() => handleSelect(opt)}
              onMouseEnter={(e) => {
                if ((returnObject ? value?.value : value) !== opt.value) {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#2a2a2a"
                    : "#dbeafe";
                }
              }}
              onMouseLeave={(e) => {
                if ((returnObject ? value?.value : value) !== opt.value) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
