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
    const key = `${item.empName} (таб.№${item.empId})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  let rowIndex = 0;

  const headerRow = [
    {
      v: "Дата и время",
      s: {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DDEBF7" } },
      },
    },
    {
      v: "Тип события",
      s: {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DDEBF7" } },
      },
    },
    {
      v: "Разрешение",
      s: {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DDEBF7" } },
      },
    },
    {
      v: "Событие",
      s: {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DDEBF7" } },
      },
    },
    {
      v: "Точка входа",
      s: {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DDEBF7" } },
      },
    },
  ];

  Object.entries(groupedData).forEach(([employee, logs]) => {
    // Xodim ismi
    rows.push([
      {
        v: employee,
        s: {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "FFF2CC" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
      },
      {},
      {},
      {},
      {}, // 5 ta ustun
    ]);

    merges.push({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: 4 },
    });

    rowIndex++;

    // Header row for log data
    rows.push(headerRow);
    rowIndex++;

    // Log rows
    logs.forEach((item) => {
      rows.push([
        {
          v: dayjs(item.time).format("DD.MM.YYYY HH:mm:ss"),
          s: { alignment: { horizontal: "left" } },
        },
        {
          v: item.eventType === 15 ? "FaceID" : "",
          s: { alignment: { horizontal: "left" } },
        },
        {
          v:
            item.errorCode === 0
              ? "доступ разрешен"
              : item.errorCode === 32
              ? "отказ в доступе"
              : "",
          s: { alignment: { horizontal: "left" } },
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

    rows.push([]); // Bo'sh qator ajratish uchun
    rowIndex++;
  });

  try {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!merges"] = merges;

    worksheet["!cols"] = [
      { wch: 22 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LogEntries");

    XLSX.writeFile(workbook, `employees.xlsx`);

    // 🔔 Muvaffaqiyatli yuklandi
    toast.success("Excel файл успешно загружен.");
  } catch (error) {
    console.error("Excel export error", error);
    toast.error("Ошибка при загрузке Excel файла.");
  }
};
