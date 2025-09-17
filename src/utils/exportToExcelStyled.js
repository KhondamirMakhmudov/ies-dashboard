import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

export const exportToExcelStyled = (data) => {
  // 1. Tekislash (flatten)
  const flatData = Array.isArray(data)
    ? data.flat()
    : Array.isArray(data?.data)
    ? data.data.flat()
    : [];

  // 2. Bo'sh yoki noto'g'ri bo'lsa
  if (!Array.isArray(flatData) || flatData.length === 0) {
    toast.error("Информация для скачивания отсутствует.");
    return;
  }

  const rows = [];
  const merges = [];

  // 3. Xodim bo‘yicha guruhlash
  const groupedData = flatData.reduce((acc, item) => {
    const key = `${item.empName} (таб.№${item.empId})`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  let rowIndex = 0;

  // 4. Header
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

  console.log("DATA =>", data);
  console.log("FLATTED =>", flatData);
  console.log("FLATTED IS ARRAY:", Array.isArray(flatData));
  console.log("FLATTED LENGTH:", flatData.length);

  // 5. Har bir xodim uchun ma'lumot
  Object.entries(groupedData).forEach(([employee, logs]) => {
    // Xodim sarlavhasi
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
      {},
    ]);

    merges.push({
      s: { r: rowIndex, c: 0 },
      e: { r: rowIndex, c: 4 },
    });

    rowIndex++;

    // Header row
    rows.push(headerRow);
    rowIndex++;

    // Loglar
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

    // Bo'sh qator
    rows.push([]);
    rowIndex++;
  });

  // 6. Export qilish
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

    XLSX.writeFile(workbook, `сотрудники.xlsx`);
    toast.success("Excel файл успешно загружен.");
  } catch (error) {
    console.error("Excel export error", error);
    toast.error("Ошибка при загрузке Excel файла.");
  }
};
