import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  searchable = false,
  searchPlaceholder = "Поиск...",
}) => {
  const { isDark, bg, text, border } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState({});
  const selectRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const toggleDropdown = () => {
    if (!isOpen) {
      // Calculate position before opening
      updateDropdownPosition();
    }
    setIsOpen((prev) => !prev);
  };

  const updateDropdownPosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 240; // max-h-60 = 15rem = 240px

    const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }),
    });
  }, []);

  const handleSelect = (opt) => {
    onChange(returnObject ? opt : opt.value);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const inButton = selectRef.current?.contains(event.target);
      const inDropdown = dropdownRef.current?.contains(event.target);
      if (!inButton && !inDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reposition on scroll or resize while open
  useEffect(() => {
    if (!isOpen) return;
    const handleReposition = () => updateDropdownPosition();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      return;
    }

    if (searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const selectedLabel = returnObject
    ? value?.label
    : options.find((opt) => opt.value === value)?.label;

  const finalOptions = sortOptions
    ? [...options].sort((a, b) =>
        a.label?.localeCompare(b.label, "ru", { sensitivity: "base" }),
      )
    : options;

  const filteredOptions = searchable
    ? finalOptions.filter((opt) =>
        opt.label
          ?.toString()
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase()),
      )
    : finalOptions;

  const dropdown = isOpen
    ? createPortal(
        <ul
          ref={dropdownRef}
          style={{
            ...dropdownStyle,
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#d1d5db", "#4b5563"),
          }}
          className="border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {searchable && (
            <li
              className="p-2 border-b"
              style={{ borderColor: border("#e5e7eb", "#374151") }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 px-3 rounded-md border text-sm focus:outline-none"
                style={{
                  backgroundColor: bg("#ffffff", "#2a2a2a"),
                  borderColor: border("#d1d5db", "#4b5563"),
                  color: text("#000000", "#f3f4f6"),
                }}
              />
            </li>
          )}

          {filteredOptions.map((opt, idx) => (
            <li
              key={idx}
              className={clsx(
                "px-4 py-2 cursor-pointer transition-colors",
                (returnObject ? value?.value : value) === opt.value &&
                  "font-medium",
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

          {filteredOptions.length === 0 && (
            <li
              className="px-4 py-2 text-sm"
              style={{ color: text("#6b7280", "#9ca3af") }}
            >
              Ничего не найдено
            </li>
          )}
        </ul>,
        document.body,
      )
    : null;

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
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={clsx(
          "w-full h-[45px] border rounded-md p-2 text-[15px] text-left flex items-center justify-between focus:outline-none focus:ring-2",
          error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500",
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

      {dropdown}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CustomSelect;
