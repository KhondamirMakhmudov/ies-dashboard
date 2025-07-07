// pages/CameraTablePage.jsx
import React, { act, useState } from "react";
import CommonTable from "@/components/table";
import CustomTable from "@/components/table";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import Button from "@mui/material/Button";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";

const Index = () => {
  const [createCameraModal, setCreateCameraModal] = useState(false);

  const [editCameraModal, setEditCameraModal] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);
  const columns = [
    { accessorKey: "id", header: "№" },
    { accessorKey: "ip", header: "IP-адрес" },
    { accessorKey: "type", header: "Тип камеры" },
    { accessorKey: "location", header: "Расположение" },
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

  const data = [
    {
      id: 1,
      ip: "192.168.1.101",
      type: "IP-камера",
      location: "Главный вход",
      status: "Активна",
      note: "Вход для сотрудников",
    },
    {
      id: 2,
      ip: "192.168.1.102",
      type: "IP-камера",
      location: "Ворота для грузовиков",
      status: "Неактивна",
      note: "На обслуживании",
    },
  ];
  return (
    <DashboardLayout headerTitle={"Устройства"}>
      <div className="bg-white p-[12px] my-[50px] rounded-md">
        <div className="col-span-12 space-y-[20px]">
          <div className="flex justify-between">
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              Камеры наблюдения
            </h1>

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
              <p>Добавить</p>
            </Button>
          </div>
          <CustomTable data={data} columns={columns} />
        </div>
        {/* delete modal */}

        <DeleteModal
          open={deleteCameraModal}
          onClose={() => setDeleteCameraModal(false)}
          title="Вы уверены, что хотите удалить эту камеру?"
        />
      </div>
    </DashboardLayout>
  );
};

export default Index;
