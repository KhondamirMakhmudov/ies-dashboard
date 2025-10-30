// components/ActiveStatusRadio.jsx
import React from "react";

const ActiveStatusRadio = ({ isActive, setIsActive }) => {
  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="radio"
          name="isActive"
          value="true"
          checked={isActive === true}
          onChange={() => setIsActive(true)}
          className="accent-blue-500" // Tailwind bilan rang berish
        />
        <span>Активный</span>
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="radio"
          name="isActive"
          value="false"
          checked={isActive === false}
          onChange={() => setIsActive(false)}
          className="accent-blue-500"
        />
        <span>Неактивный</span>
      </label>
    </div>
  );
};

export default ActiveStatusRadio;
