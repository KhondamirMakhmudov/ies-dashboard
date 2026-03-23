import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import CustomTable from "@/components/table";
import ContentLoader from "@/components/loader";
import NoData from "@/components/no-data";
import { config } from "@/config";
import { URLS } from "@/constants/url";

const photoCache = new Map();

const EmployeeNameCell = ({ row }) => {
  const { data: cellSession } = useSession();
  const {
    first_name,
    last_name,
    middle_name,
    photo_id_from_s3,
    file_url: initialFileUrl,
  } = row.original;
  const [imageError, setImageError] = useState(false);
  const [fileUrl, setFileUrl] = useState(
    initialFileUrl || photoCache.get(photo_id_from_s3) || null,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!photo_id_from_s3 || initialFileUrl) return;

    if (photoCache.has(photo_id_from_s3)) {
      setFileUrl(photoCache.get(photo_id_from_s3));
      return;
    }

    if (!fileUrl && cellSession?.accessToken) {
      const fetchPhotoUrl = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${config.FILE_API_URL}${URLS.employeeFaces}${photo_id_from_s3}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${cellSession.accessToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();
          if (data.file_url) {
            photoCache.set(photo_id_from_s3, data.file_url);
            setFileUrl(data.file_url);
          }
        } catch (error) {
          console.error("Error fetching photo URL:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPhotoUrl();
    }
  }, [photo_id_from_s3, initialFileUrl, fileUrl, cellSession?.accessToken]);

  return (
    <div className="flex items-center gap-3 px-1 py-1.5">
      <div className="relative w-14 h-14 flex-shrink-0 rounded-full ring-2 ring-offset-1 ring-blue-400/40 dark:ring-blue-500/30 overflow-hidden shadow-md">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />
          </div>
        ) : fileUrl && !imageError ? (
          <Image
            src={fileUrl}
            priority
            alt={`${last_name} ${first_name}`}
            fill
            className="object-cover object-top"
            onError={() => setImageError(true)}
            quality={90}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-200 dark:from-slate-700 dark:to-slate-800">
            <PersonIcon
              sx={{ fontSize: 22 }}
              className="text-slate-400 dark:text-slate-500"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 gap-0.5">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-400 truncate tracking-tight">
          {last_name} {first_name}
        </span>
        {middle_name && (
          <span className="text-sm text-slate-400 dark:text-slate-500 truncate">
            {middle_name}
          </span>
        )}
      </div>
    </div>
  );
};

const EmployeeTable = ({
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

export default EmployeeTable;
