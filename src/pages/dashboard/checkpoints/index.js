import ContentLoader from "@/components/loader";
import { useState } from "react";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetQuery from "@/hooks/java/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import {motion} from "framer-motion";
import CustomTable from "@/components/table";
import Button from "@/components/button";
import {get} from "lodash"
import DeleteModal from "@/components/modal/delete-modal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MethodModal from "@/components/modal/method-modal";
import { Typography } from "@mui/material";
const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MTk5NjYxMywiZXhwIjoxNzUyMDgzMDEzfQ.XUQpIWiyBcqsQSqUYLDCcb9iZaoudLuQq0U042mtcQ0";
const Index = () => {
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);
  const [createCheckpoints, setCreateCheckpoints] = useState(false);
  const [editCheckpoints, setEditCheckpoints] = useState(false);
  const [deleteCheckpoints, setDeleteCheckpoints] = useState(false);
  const { data: checkpoints, isLoading, isFetching } = useGetQuery({
    key: KEYS.checkpoints,
    url: URLS.checkpoints,
        headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  });

  if(isLoading || isFetching) {
    return <DashboardLayout>
      <ContentLoader/>
    </DashboardLayout>
  }

    const columns = [
    { accessorKey: "id", header: "№" },
    { accessorKey: "checkPointName", header: "Тип двери" },
    { accessorKey: "entryPoint.entryPointName", header: "Подразделение" },
    { accessorKey: "checkPointName", header: "Контрольная точка" },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            onClick={() => setEditCheckpoints(true)}
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
            onClick={() => setDeleteCheckpoints(true)}
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
    <DashboardLayout headerTitle={"Контрольные точки"}>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-[12px] my-[50px] rounded-md"
            >
              <div className="col-span-12 space-y-[15px]">
                <div className="max-w-[100px]">
                  <Button
                    onClick={() => setCreateCheckpoints(true)}
                    sx={{
                      textTransform: "initial",
                      fontFamily: "DM Sans, sans-serif",
                      backgroundColor: "#4182F9",
                      boxShadow: "none",
                      color: "white",
                      display: "inline-block",
                      gap: "4px",
                      fontSize: "14px",
                      width: "30px",
                      borderRadius: "8px",
                    }}
                    variant="contained"
                  >
                    <p>Создать</p>
                  </Button>
                </div>
                <CustomTable data={get(checkpoints, "data")} columns={columns} />
              </div>
              {/* delete modal */}
      
              <DeleteModal
                open={deleteCameraModal}
                onClose={() => setDeleteCameraModal(false)}
                title="Вы уверены, что хотите удалить эту камеру?"
              />
            </motion.div>

              <MethodModal 
              open={createCheckpoints}
              onClose={() => setCreateCheckpoints(false)}
              >
                          <Typography variant="h6" className="mb-2">
            Добавить камеру
          </Typography>
              </MethodModal>

    </DashboardLayout>
  );
};

export default Index;
