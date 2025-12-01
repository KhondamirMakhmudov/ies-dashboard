// components/ActiveStatusRadio.jsx
import React from "react";

const ActiveStatusRadio = ({ isActive, setIsActive }) => {
  // Convert to boolean to ensure consistent comparison
  const activeValue = Boolean(isActive);

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="radio"
          name="isActive"
          value="true"
          checked={activeValue === true}
          onChange={() => setIsActive(true)}
          className="accent-blue-500"
        />
        <span>Активный</span>
      </label>
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="radio"
          name="isActive"
          value="false"
          checked={activeValue === false}
          onChange={() => setIsActive(false)}
          className="accent-blue-500"
        />
        <span>Неактивный</span>
      </label>
    </div>
  );
};

export default ActiveStatusRadio;
