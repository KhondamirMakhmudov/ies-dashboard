import { useState, useEffect } from "react";
import { get } from "lodash";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import CustomTable from "@/components/table";
import dayjs from "dayjs";
import Link from "next/link";
export default function EmployeeList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 🔹 Debounce qidiruv (yuklanishni kamaytirish uchun)
  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 0.5s delay bilan API chaqiradi
    return () => clearTimeout(delay);
  }, [search]);

  const {
    data: employee,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: [KEYS.employees, debouncedSearch, currentPage],
    url: URLS.employees,
    params: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      ...(debouncedSearch && { first_name: debouncedSearch }),
    },
  });

  const columns = [
    {
      header: "№",
      cell: ({ row }) => {
        return (currentPage - 1) * pageSize + (row.index + 1);
      },
    },
    {
      accessorKey: "last_name",
      header: "Имя сотрудника",
      cell: ({ row }) => {
        const { first_name, last_name } = row.original;
        return (
          <span className="font-medium">
            {last_name} {first_name}
          </span>
        );
      },
    },
    {
      accessorKey: "tabel_number",
      header: "Табельный номер",
      cell: ({ row }) => {
        return (
          <span className="font-medium">№{row?.original?.tabel_number}</span>
        );
      },
    },
    {
      accessorKey: "workplace.position.name",
      header: "Должность",
    },
    {
      accessorKey: "hire_date",
      header: "Дата приема на работу",
      cell: ({ row }) => {
        return (
          <span className="font-medium">
            {row?.original?.hire_date
              ? dayjs(row.original.hire_date).format("DD.MM.YYYY")
              : "Дата приема не указана"}
          </span>
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="my-2">
          <Link
            href={`employees/${row.original.id}`}
            className="bg-[#EDEDF2] font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-gray-400 transition-all duration-200"
          >
            Подробнее
          </Link>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 🔍 Search input */}
      <div>
        <input
          type="text"
          placeholder="Xodim ismini kiriting..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // qidiruvda 1-betdan boshlash
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Jadval */}
      <div className="col-span-12">
        <CustomTable
          data={get(employee, "data.data", [])}
          columns={columns}
          pagination={{
            currentPage,
            pageSize,
            total: get(employee, "data.count", 0),
            onPaginationChange: ({ page }) => setCurrentPage(page),
          }}
        />
      </div>
    </div>
  );
}
