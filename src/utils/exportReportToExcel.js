import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

// ✅ ReportComponent uchun maxsus Excel export funksiyasi
export const exportReportToExcel = (
  data,
  employeeName, // Changed from generic 'name' to 'employeeName' for clarity
  periodTitle = "Отчёт",
  reportName = "отчёт_сотрудники", // Optional custom filename prefix
) => {
  if (!data || data.length === 0) {
    toast.error("Нет данных для экспорта");
    return;
  }

  const rows = [];
  const merges = [];

  // Header row
  const headerRow = [
    {
      v: "Время действие",
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      },
    },
    {
      v: "Статус",
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      },
    },
    {
      v: "Событие",
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      },
    },
    {
      v: "Тип доступа",
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      },
    },
    {
      v: "Точка входа",
      s: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      },
    },
  ];

  let rowIndex = 0;

  // Sarlavha qo'shish - Now includes employee name
  const title = employeeName ? `${periodTitle} - ${employeeName}` : periodTitle;

  rows.push([
    {
      v: `${title} - ${dayjs().format("DD.MM.YYYY HH:mm")}`,
      s: {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "FCE4D6" } },
      },
    },
    {},
    {},
    {},
    {},
  ]);

  merges.push({
    s: { r: rowIndex, c: 0 },
    e: { r: rowIndex, c: 4 },
  });
  rowIndex++;

  // Bo'sh qator
  rows.push([]);
  rowIndex++;

  // Header row
  rows.push(headerRow);
  rowIndex++;

  // Ma'lumot qatorlari
  data.forEach((item, index) => {
    const statusText =
      item.errorCode === 0
        ? "доступ разрешен"
        : "отказ в доступе (режим графика)";

    const eventText = item.event === "enter" ? "Вход" : "Выход";
    const accessTypeText = item.eventType === 15 ? "FACE ID" : "Другое";

    const statusStyle =
      item.errorCode === 0
        ? {
            font: { color: { rgb: "107C41" } },
            fill: { fgColor: { rgb: "E8F6F0" } },
          }
        : {
            font: { color: { rgb: "E7042E" } },
            fill: { fgColor: { rgb: "FAE7E7" } },
          };

    const eventStyle =
      item.event === "enter"
        ? {
            font: { color: { rgb: "107C41" } },
            fill: { fgColor: { rgb: "E8F6F0" } },
          }
        : {
            font: { color: { rgb: "E7042E" } },
            fill: { fgColor: { rgb: "FAE7E7" } },
          };

    rows.push([
      {
        v: dayjs(item.time).format("DD.MM.YYYY HH:mm:ss"),
        s: {
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
        },
      },
      {
        v: statusText,
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
          ...statusStyle,
        },
      },
      {
        v: eventText,
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
          ...eventStyle,
        },
      },
      {
        v: accessTypeText,
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
          font: { color: { rgb: "1E5EFF" } },
          fill: { fgColor: { rgb: "ECF2FF" } },
        },
      },
      {
        v: item.entryPointName || "",
        s: {
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "DDDDDD" } },
            bottom: { style: "thin", color: { rgb: "DDDDDD" } },
            left: { style: "thin", color: { rgb: "DDDDDD" } },
            right: { style: "thin", color: { rgb: "DDDDDD" } },
          },
        },
      },
    ]);
    rowIndex++;
  });

  // Statistika qo'shish - Also includes employee name
  const accessGranted = data.filter((e) => e.errorCode === 0).length;
  const accessDenied = data.filter((e) => e.errorCode !== 0).length;
  const total = data.length;

  rows.push([]);
  rowIndex++;

  rows.push([
    {
      v: "СТАТИСТИКА",
      s: {
        font: { bold: true, sz: 14 },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "FFF2CC" } },
      },
    },
    {},
    {},
    {},
    {},
  ]);

  merges.push({
    s: { r: rowIndex, c: 0 },
    e: { r: rowIndex, c: 4 },
  });
  rowIndex++;

  rows.push([
    { v: "Всего событий:", s: { font: { bold: true } } },
    { v: total, s: { alignment: { horizontal: "center" } } },
    {},
    { v: "Доступ разрешен:", s: { font: { bold: true } } },
    {
      v: accessGranted,
      s: {
        alignment: { horizontal: "center" },
        font: { color: { rgb: "107C41" } },
        fill: { fgColor: { rgb: "E8F6F0" } },
      },
    },
  ]);
  rowIndex++;

  rows.push([
    { v: "Процент доступа:", s: { font: { bold: true } } },
    {
      v: total > 0 ? `${((accessGranted / total) * 100).toFixed(1)}%` : "0%",
      s: { alignment: { horizontal: "center" } },
    },
    {},
    { v: "Отказ в доступе:", s: { font: { bold: true } } },
    {
      v: accessDenied,
      s: {
        alignment: { horizontal: "center" },
        font: { color: { rgb: "E7042E" } },
        fill: { fgColor: { rgb: "FAE7E7" } },
      },
    },
  ]);
  rowIndex++;

  // Add employee name row if provided
  if (employeeName) {
    rows.push([]);
    rowIndex++;

    rows.push([
      {
        v: `Сотрудник: ${employeeName}`,
        s: {
          font: { italic: true },
          alignment: { horizontal: "left", vertical: "center" },
          fill: { fgColor: { rgb: "F2F2F2" } },
        },
      },
      {},
      {},
      {},
      {},
    ]);

    merges.push({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: 4 },
    });
  }

  try {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet["!merges"] = merges;
    worksheet["!cols"] = [
      { wch: 25 }, // Время действие
      { wch: 30 }, // Статус
      { wch: 15 }, // Событие
      { wch: 15 }, // Тип доступа
      { wch: 25 }, // Точка входа
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Отчёт о сотруднике");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create filename with employee name if provided
    const safeEmployeeName = employeeName
      ? employeeName.replace(/[^a-zA-Z0-9а-яА-Я]/g, "_")
      : "";

    const filename = safeEmployeeName
      ? `${reportName}_${safeEmployeeName}_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`
      : `${reportName}_${dayjs().format("DD-MM-YYYY_HH-mm")}.xlsx`;

    saveAs(blob, filename);
    toast.success("Excel файл успешно загружен");
  } catch (error) {
    console.error("Excel export error", error);
    toast.error("Ошибка при загрузке Excel файла");
  }
};
