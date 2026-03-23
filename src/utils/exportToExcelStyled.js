import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { saveAs } from "file-saver";

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

export const exportToExcel = (data, filename = "Сотрудники.xlsx") => {
  if (!data || data.length === 0) {
    alert("Нет данных для экспорта");
    return;
  }

  // 1️⃣ — Faqat kerakli maydonlar va ularning nomlari (rus tilida)
  const columns = [
    { key: "full_name", label: "Ф.И.О" },
    { key: "position", label: "Должность" },
    { key: "organizational_unit", label: "Подразделение" },
    { key: "phone_number", label: "Телефон" },
    { key: "email", label: "Электронная почта" },
    { key: "hire_date", label: "Дата приема на работу" },
    { key: "date_of_birth", label: "Дата рождения" },
    { key: "address", label: "Адрес" },
    { key: "education_degree", label: "Образование" },
    { key: "education_place", label: "Место обучения" },
  ];

  // 2️⃣ — Ma'lumotni qayta formatlash
  const formattedData = data.map((item) => ({
    full_name: `${item.last_name || ""} ${item.first_name || ""} ${
      item.middle_name || ""
    }`.trim(),
    position: item?.workplace?.position?.name || "",
    organizational_unit: item?.workplace?.organizational_unit?.name || "",
    phone_number: item.phone_number ? `+998${item.phone_number}` : "",
    email: item.email || "",
    hire_date: item.hire_date ? item.hire_date.slice(0, 10) : "",
    date_of_birth: item.date_of_birth ? item.date_of_birth.slice(0, 10) : "",
    address: item.address || "",
    education_degree: item.education_degree || "",
    education_place: item.education_place || "",
  }));

  // 3️⃣ — Jadval uchun ma’lumot tayyorlash
  const headers = columns.map((c) => c.label);
  const sheetData = [
    headers,
    ...formattedData.map((obj) => columns.map((c) => obj[c.key])),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // 4️⃣ — Stil sozlash
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 13 },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "4472C4" } }, // Moviy fon
    border: {
      top: { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left: { style: "thin", color: { rgb: "CCCCCC" } },
      right: { style: "thin", color: { rgb: "CCCCCC" } },
    },
  };

  const bodyStyle = {
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "DDDDDD" } },
      bottom: { style: "thin", color: { rgb: "DDDDDD" } },
      left: { style: "thin", color: { rgb: "DDDDDD" } },
      right: { style: "thin", color: { rgb: "DDDDDD" } },
    },
  };

  // 5️⃣ — Har bir hujayraga stil berish
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = R === 0 ? headerStyle : bodyStyle;
    }
  }

  // 6️⃣ — Ustun kengliklarini sozlash
  worksheet["!cols"] = columns.map((col) => ({ wch: col.label.length + 15 }));

  // 7️⃣ — Workbook yaratish va yuklab berish
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "все сотрудники");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
};
