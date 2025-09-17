import axios from "axios";
import { URLS } from "@/constants/url";
import { config } from "@/config";

export const getEmployeesLogsByRange = async ({
  token,
  rangeString,
  startDate,
  endDate,
}) => {
  if (!rangeString || !startDate || !endDate) return [];

  const ids = parseEmployeeIdRange(rangeString);
  if (ids.length === 0) return [];

  const requests = ids.map((id) =>
    axios
      .get(
        `${config.JAVA_API_URL}${URLS.logEntersOfEmployeeById}${id}/dates/new-output`,
        {
          params: { startDate, endDate },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )
      .then((res) => res.data.map((item) => ({ ...item, empId: id })))
      .catch(() => [])
  );

  const results = await Promise.all(requests);
  return results.flat();
};

function parseEmployeeIdRange(input) {
  const result = new Set();

  input.split(",").forEach((part) => {
    const trimmed = part.trim();

    if (trimmed.includes("-")) {
      const [start, end] = trimmed.split("-").map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          result.add(i);
        }
      }
    } else {
      const id = Number(trimmed);
      if (!isNaN(id)) {
        result.add(id);
      }
    }
  });

  return Array.from(result);
}
