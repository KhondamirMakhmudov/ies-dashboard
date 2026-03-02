export const normalizeDateInputValue = (value, type) => {
  if (!value || typeof value !== "string") return value;

  if (type !== "date" && type !== "datetime-local") {
    return value;
  }

  const [datePart, timePart] = value.split("T");
  if (!datePart) return value;

  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) return value;

  const normalizedYear = year.slice(0, 4);
  const normalizedDate = `${normalizedYear}-${month}-${day}`;

  return timePart ? `${normalizedDate}T${timePart}` : normalizedDate;
};
