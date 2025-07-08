import { useState, useEffect } from "react";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import dayjs from "dayjs";
import { motion } from "framer-motion"
import { Typography } from "@mui/material";
import ContentLoader from "@/components/loader";

const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MTk5NjYxMywiZXhwIjoxNzUyMDgzMDEzfQ.XUQpIWiyBcqsQSqUYLDCcb9iZaoudLuQq0U042mtcQ0";

const Index = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: employees, isLoading, isFetching } = useGetQuery({
    key: [KEYS.logEntersOfEmployees, startDate, endDate],
    url: URLS.logEntersOfEmployees,
    params: {
      startDate: startDate,
      endDate: endDate,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  });

  const setToday = () => {
    const today = dayjs().format("YYYY-MM-DD");
    setStartDate(today);
    setEndDate(today);
  };

  const setYesterday = () => {
    const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    setStartDate(yesterday);
    setEndDate(yesterday);
  };

  return (
    <DashboardLayout headerTitle={"Отчеты"}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-[12px] my-[50px] rounded-md"
            >

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={setToday}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Сегодня
                  </button>
                  <button
                    onClick={setYesterday}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Вчера
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Typography>Выберите дату</Typography>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border px-3 py-2 rounded"
                  />
                </div>
              </div>

              <div className="mt-6">
                {isLoading ? (
                  <ContentLoader/>
                ) : employees?.length ? (
                  <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border px-4 py-2 text-left">ID</th>
                        <th className="border px-4 py-2 text-left">Имя</th>
                        <th className="border px-4 py-2 text-left">Время входа</th>
                        <th className="border px-4 py-2 text-left">IP адрес</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp) => (
                        <tr key={emp.id}>
                          <td className="border px-4 py-2">{emp.id}</td>
                          <td className="border px-4 py-2">{emp.name}</td>
                          <td className="border px-4 py-2">{emp.enteredAt}</td>
                          <td className="border px-4 py-2">{emp.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Нет данных за выбранный период.</p>
                )}
              </div>


            </motion.div>

    </DashboardLayout>
  );
};

export default Index;
