import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import usePostQuery from "@/hooks/java/usePostQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import CustomTable from "@/components/table";
import { get } from "lodash";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import PrimaryButton from "@/components/button/primary-button";
import ContentLoader from "@/components/loader";
import { useState } from "react";
const Index = () => {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const {
    data: jobTrips,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.jobTrips,
    url: URLS.jobTrips,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
    enabled: !!session?.accessToken,
  });

  const { mutate: createJobTrip } = usePostQuery({
    listKeyId: "create-job-trip",
  });

  // const submitCreateJobTrip = () => {
  //   createJobTrip({
  //     url: URLS.jobTrips,
  //     attributes: {
  //       employeeUuids: ["550e8400-e29b-41d4-a716-446655440000"],
  //       numOrder: "Приказ №123/2025",
  //       startDate: "2025-10-15",
  //       endDate: "2025-10-30",
  //       entryPointScheduleId: 15,
  //     },
  //   });
  // };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => {
        return (currentPage - 1) * pageSize + (row.index + 1);
      },
    },
    {
      accessorKey: "firstName",
      header: "Имя",
      cell: ({ row }) => {
        return (
          <span>
            {row.original.lastName} {row.original.firstName}{" "}
            {row.original.fatherName}
          </span>
        );
      },
    },

    {
      header: "Откуда",
      accessorKey: "unitCodeNameLong",
    },

    {
      header: "Куда",
      accessorKey: "destinationUnitCodeNameLong",
    },
    {
      header: "Точки входа",
      accessorKey: "entryPointName",
    },

    {
      accessorKey: "startDate",
      header: "Начало",
      cell: ({ row }) => {
        return (
          <span
            className={
              "text-green-600 font-medium text-sm bg-[#E8F6F0] p-1 rounded-md border border-green-600"
            }
          >
            {dayjs(row.original.startDate).format("DD.MM.YYYY")}
          </span>
        );
      },
    },

    {
      accessorKey: "endDate",
      header: "Конец",
      cell: ({ row }) => {
        return (
          <span
            className={
              "text-red-600 font-medium text-sm bg-[#f7dcdc] p-1 rounded-md border border-red-600"
            }
          >
            {dayjs(row.original.endDate).format("DD.MM.YYYY")}
          </span>
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Link
            className="bg-[#bfd2f5] text-[#4182F9] h-[32px] px-2 flex justify-center items-center rounded-md"
            href={`/dashboard/employees/${row.original.uuidSus}`}
          >
            <VisibilityIcon fontSize="small" />
          </Link>
          <Button
            onClick={() => {
              setEditModal(true);
              setSelectedUnitType(row.original.id);
              setName(row.original.name);
              setIsActive(row.original.is_active);
              setPositionTypeId(row.original.position_type_id);
              setOriginalUnitType({
                name: row.original.name,
                position_type_id: row.original.position_type_id,
                is_active: row.original.is_active,
              });
            }}
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: "#F0D8C8",
              color: "#FF6200",
            }}
          >
            <EditIcon fontSize="small" />
          </Button>
          <Button
            onClick={() => {
              setDeleteModal(true);
              setSelectedUnitType(row.original.id);
            }}
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: "#FCD8D3",
              color: "#FF1E00",
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Командировки"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout headerTitle={"Командировки"}>
      <motion.div
        initial={{ opacity: 0, translateY: "20px" }}
        animate={{ opacity: 1, translateY: "0" }}
        className="bg-white p-[12px] mb-[50px] rounded-md border border-gray-200 my-[20px]"
      >
        <div className="my-[10px]">
          <PrimaryButton>Назначить командировку</PrimaryButton>
        </div>

        <CustomTable
          data={get(jobTrips, "data.data", [])}
          columns={columns}
          pagination={{
            currentPage,
            pageSize,
            total: get(jobTrips, "data.totalCount", 0),
            onPaginationChange: ({ page }) => setCurrentPage(page),
          }}
        />
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
