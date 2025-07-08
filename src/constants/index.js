import Button from "@/components/button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
export const columnsCameras = [
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
      cell: () => (
        <div className="flex gap-2">
          <Button
            onClick={() => setEditCameraModal(true)}
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