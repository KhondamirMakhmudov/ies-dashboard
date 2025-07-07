// pages/CameraTablePage.jsx
import React, { useState } from "react";
import CommonTable from "@/components/table";
import CustomTable from "@/components/table";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import Button from "@mui/material/Button";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { motion } from "framer-motion";
import { get } from "lodash";
import ContentLoader from "@/components/loader";
import SimpleModal from "@/components/modal/simple-modal";
import HalfModal from "@/components/modal/half-modal";

const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MTg4MTk5NSwiZXhwIjoxNzUxOTY4Mzk1fQ.U778Fj0r4eD9bY5KYBvdreyfrv7MuHD74A0t4suTOAc"
const Index = () => {
  const [createCameraModal, setCreateCameraModal] = useState(false);

  const [editCameraModal, setEditCameraModal] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);

  const {data: allCameras, isLoading, isFetching} = useGetQuery({
    key: KEYS.allCameras,
    url: URLS.allCameras,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  })

  if (!allCameras) {
    return <DashboardLayout><ContentLoader/></DashboardLayout>; // ma'lumot kelyapti
  }

  const columns = [
    { accessorKey: "id", header: "№" },
    { accessorKey: "ipAddress", header: "IP-адрес" },
    { accessorKey: "doorType", header: "Тип двери" },
    { accessorKey: "depName", header: "Подразделение" },
    { accessorKey: "checkPointName", header: "Контрольная точка" },
    { accessorKey: "entryPointName", header: "Входная точка" },
    { accessorKey: "status", header: "Статус" },
    { accessorKey: "note", header: "Примечание" },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEdit(row.original)}
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
            onClick={() => setDeleteCameraModal(true)}
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


  return (
    <DashboardLayout headerTitle={"Устройства"}>
      <motion.div initial={{opacity: 0, scale: 0}} animate={{ opacity: 1, scale: 1}} className="bg-white p-[12px] my-[50px] rounded-md">
        <div className="col-span-12 space-y-[15px]">
          <div className="">  
            <Button
              onClick={() => setCreateCameraModal(true)}
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#4182F9",
                boxShadow: "none",
                color: "white",
                display: "flex",
                gap: "4px",
                fontSize: "14px",
                borderRadius: "8px",
              }}
              variant="contained"
            >
              <p>Создать</p>
            </Button>
          </div>
          <CustomTable data={get(allCameras, "data")} columns={columns} />
        </div>
        {/* delete modal */}

        <DeleteModal
          open={deleteCameraModal}
          onClose={() => setDeleteCameraModal(false)}
          title="Вы уверены, что хотите удалить эту камеру?"
        />
      </motion.div>

      {
        createCameraModal && <HalfModal isOpen={createCameraModal} onClose={() => setCreateCameraModal(false)}></HalfModal>
      }
    </DashboardLayout>
  );
};

export default Index;
