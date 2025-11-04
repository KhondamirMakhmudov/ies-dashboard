import React from "react";

const SearchInput = ({ value, onChange, placeholder = "Поиск..." }) => {
  return (
    <div className="relative my-4">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
      <svg
        className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
        />
      </svg>
    </div>
  );
};

export default SearchInput;
