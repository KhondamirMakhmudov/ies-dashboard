import { useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import CustomTable from "@/components/table";
import ContentLoader from "@/components/loader";
import NoData from "@/components/no-data";
import EmployeeNameCell from "@/components/employees/EmployeeNameCell";

const EmployeesTable = ({
  paginatedEmployees,
  filteredEmployees,
  currentPage,
  pageSize,
  setCurrentPage,
  isSearching,
  isFetching,
  onCreate,
  bg,
  border,
}) => {
  const columns = useMemo(
    () => [
      {
        header: "№",
        cell: ({ row }) => {
          return (currentPage - 1) * pageSize + (row.index + 1);
        },
      },
      {
        accessorKey: "last_name",
        header: "Имя сотрудника",
        cell: (cellProps) => <EmployeeNameCell {...cellProps} />,
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
              className={
                bg("bg-blue-500", "bg-blue-600") +
                " hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md px-4 py-2"
              }
            >
              <span>Подробнее</span>
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </Link>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [bg, currentPage, pageSize],
  );

  if (isSearching && isFetching) {
    return (
      <div className="bg-white p-4 mt-3 rounded-md border border-gray-200">
        <ContentLoader />
      </div>
    );
  }

  if (!paginatedEmployees?.length) {
    return <NoData onCreate={onCreate} />;
  }

  return (
    <div
      className="p-[12px] mt-[10px] mb-[50px] rounded-md border border-[#E9E9E9]"
      style={{
        backgroundColor: bg("#ffffff", "#1e1e1e"),
        borderColor: border("#e5e7eb", "#333333"),
      }}
    >
      <div className="grid grid-cols-12 gap-[12px] p-2">
        <div className="col-span-12">
          <CustomTable
            data={paginatedEmployees}
            columns={columns}
            pagination={{
              currentPage,
              pageSize,
              total: filteredEmployees.length,
              onPaginationChange: ({ page }) => setCurrentPage(page),
            }}
          />

          {isFetching && (
            <div className="flex justify-center py-2 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Обновление данных...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesTable;
