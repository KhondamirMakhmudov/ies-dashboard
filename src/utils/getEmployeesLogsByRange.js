import axios from "axios";
import { URLS } from "@/constants/url";
import { config } from "@/config";

export const getEmployeesLogsByRange = async ({
  token,
  employeeIds,
  startDate,
  endDate,
  baseUrl = config.JAVA_API_URL, // Allow custom base URL
  endpoint = URLS.logEntersOfEmployeeById, // Allow custom endpoint
  pathSuffix = "/dates/new-output", // Allow custom path suffix
  throwOnError = false,
  returnError = false,
}) => {
  if (!employeeIds || employeeIds.length === 0 || !startDate || !endDate) {
    return returnError ? { data: [], error: null } : [];
  }

  let requestError = null;

  // Create requests for each employee ID
  const requests = employeeIds.map((id) =>
    axios
      .get(
        `${baseUrl}${endpoint}${id}${pathSuffix}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      )
      .then((res) => {
        // Handle both array and object responses
        const data = res.data?.data || res.data;
        return Array.isArray(data)
          ? data.map((item) => ({ ...item, empId: id }))
          : [];
      })
      .catch((error) => {
        console.error(`Failed to fetch data for employee ${id}:`, error);
        if (!requestError) {
          requestError = error;
        }
        return [];
      }),
  );

  const results = await Promise.all(requests);
  const flatResults = results.flat();

  if (throwOnError && requestError) {
    throw requestError;
  }

  if (returnError) {
    return { data: flatResults, error: requestError };
  }

  return flatResults;
};

// Keep this function if you need to support range strings elsewhere
export function parseEmployeeIdRange(input) {
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
