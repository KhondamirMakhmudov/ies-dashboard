import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

export const exportToExcelStyled = (data) => {
  if (!data || data.length === 0) {
    toast.error("Информация для скачивания отсутствует.");
    return;
  }

  const rows = [];
  const merges = [];

  const groupedData = data.reduce((acc, item) => {
    const key = `${item.empName} (таб.№${item.empCode})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  let rowIndex = 0;

  Object.entries(groupedData).forEach(([employee, logs]) => {
    rows.push([
      {
        v: employee,
        s: {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "FFF2CC" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
      },
      {}, {}, {},
    ]);

    merges.push({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: 3 },
    });

    rowIndex++;

    logs.forEach((item) => {
      rows.push([
        {
          v: dayjs(item.time).format("DD.MM.YYYY HH:mm:ss"),
          s: { alignment: { horizontal: "left" } },
        },
        {
          v: item.eventType,
          s: { alignment: { horizontal: "left" } },
        },
        {
           v: item.event === "enter" ? "Вход разрешён" : "Вход Запрешён",
           s: { alignment: { horizontal: "center" } },
        },
        {
          v: item.event === "enter" ? "вход" : "выход",
          s: { alignment: { horizontal: "center" } },
        },
        {
          v: item.entryPointName,
          s: { alignment: { horizontal: "left" } },
        },
      ]);
      rowIndex++;
    });

    rows.push([]);
    rowIndex++;
  });

  try {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!merges"] = merges;

    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 25 },
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LogEntries");

    XLSX.writeFile(workbook, `employees.xlsx`);
  } catch (error) {
    console.error("Excel export error", error);
    toast.error("Excel faylini yuklashda xatolik yuz berdi.");
  }
};
