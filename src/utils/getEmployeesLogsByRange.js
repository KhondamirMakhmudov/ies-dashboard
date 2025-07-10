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
  if (input.includes("-")) {
    const [start, end] = input.split("-").map(Number);
    if (isNaN(start) || isNaN(end) || start > end) return [];
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  const id = Number(input);
  return isNaN(id) ? [] : [id];
}
