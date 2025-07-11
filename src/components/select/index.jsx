import React, { useState, useRef, useEffect } from "react";
import { KeyboardArrowDown } from "@mui/icons-material";
import clsx from "clsx";

const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Выберите контрольную точку",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative w-full col-span-4" ref={selectRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="w-full border border-gray-300 rounded-md p-2 text-[15px] text-left text-black flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className={clsx("truncate", !value && "text-gray-400")}>
          {selectedLabel || placeholder}
        </span>
        <KeyboardArrowDown
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((opt, idx) => (
            <li
              key={idx}
              className={clsx(
                "px-4 py-2 hover:bg-blue-100 cursor-pointer",
                opt.value === value && "bg-blue-50 font-medium"
              )}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
