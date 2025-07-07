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
import { Typography } from "@mui/material";
import Input from "@/components/input";
import toast from "react-hot-toast";
import Image from "next/image";
import MethodModal from "@/components/modal/method-modal";
const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MTg4MTk5NSwiZXhwIjoxNzUxOTY4Mzk1fQ.U778Fj0r4eD9bY5KYBvdreyfrv7MuHD74A0t4suTOAc";
const Index = () => {
  const [createCameraModal, setCreateCameraModal] = useState(false);
  const [formData, setFormData] = useState({
    ipAddress: "",
    building: "",
    login: "",
    password: "",
    departmentId: "",
    checkPointId: "",
    doorTypeId: "",
    isActive: "",
  });
  const [editCameraModal, setEditCameraModal] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);

  const {
    data: allCameras,
    isLoading,
    isFetching,
  } = useGetQuery({
    key: KEYS.allCameras,
    url: URLS.allCameras,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  });

  if (!allCameras) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    ); // ma'lumot kelyapti
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

  // const data = [
  //   {
  //     id: 1,
  //     ip: "192.168.1.101",
  //     type: "IP-камера",
  //     location: "Главный вход",
  //     status: "Активна",
  //     note: "Вход для сотрудников",
  //   },
  //   {
  //     id: 2,
  //     ip: "192.168.1.102",
  //     type: "IP-камера",
  //     location: "Ворота для грузовиков",
  //     status: "Неактивна",
  //     note: "На обслуживании",
  //   },
  // ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ipRegex.test(formData.ipAddress)) {
      toast.error("IP-адрес введён неправильно!");
      return;
    }
    console.log("Submitted data:", formData);
    // You can send it to your API here
  };

  return (
    <DashboardLayout headerTitle={"Устройства"}>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-[12px] my-[50px] rounded-md"
      >
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

      {createCameraModal && (
        <MethodModal
          open={createCameraModal}
          onClose={() => setCreateCameraModal(false)}
        >
          <Typography variant="h6" className="mb-2">
            Добавить камеру
          </Typography>

          <div className="my-[15px] border-t border-t-[#C9C9C9] py-[10px]">
            <Typography variant="h6" sx={{ fontSize: "15px" }}>
              Основная информация
            </Typography>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-4 my-[30px] gap-[15px]"
            >
              <Input
                label="IP адрес"
                type="text"
                name="ipAddress"
                placeholder="Введите IP адрес"
                classNames="col-span-4"
                value={formData.ipAddress}
                onChange={handleChange}
                pattern={ipRegex.source}
                required
              />

              <Input
                label="Здание"
                name="building"
                placeholder="Введите название здания"
                classNames="col-span-4"
                value={formData.building}
                onChange={handleChange}
                required
              />

              <Input
                label="Имя пользователя"
                name="login"
                placeholder="Введите имя пользователя"
                classNames="col-span-2"
                value={formData.login}
                onChange={handleChange}
                required
              />

              <Input
                label="Пароль"
                name="password"
                type="password"
                placeholder="Введите пароль"
                classNames="col-span-2"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="submit"
                className="col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-all duration-200"
              >
                Создать
              </button>

              <div className="col-span-4 flex justify-center mt-4">
                <Image
                  src="/images/secure-img.png"
                  alt="secure"
                  width={400}
                  height={300}
                  className="w-full max-w-[350px] h-auto object-cover"
                />
              </div>
            </form>
          </div>
        </MethodModal>
      )}

      {editCameraModal && (
        <MethodModal
          open={editCameraModal}
          onClose={() => setEditCameraModal(false)}
        >
          <Typography variant="h6" className="mb-2">
            Изменить
          </Typography>

          <div className="my-[15px] border-t border-t-[#C9C9C9] py-[10px]">
            <Typography variant="h6" sx={{ fontSize: "15px" }}>
              Основная информация
            </Typography>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-4 my-[30px] gap-[15px]"
            >
              <Input
                label="IP адрес"
                type="text"
                name="ipAddress"
                placeholder="Введите IP адрес"
                classNames="col-span-4"
                value={formData.ipAddress}
                onChange={handleChange}
                pattern={ipRegex.source}
                required
              />

              <Input
                label="Здание"
                name="building"
                placeholder="Введите название здания"
                classNames="col-span-4"
                value={formData.building}
                onChange={handleChange}
                required
              />

              <Input
                label="Имя пользователя"
                name="login"
                placeholder="Введите имя пользователя"
                classNames="col-span-2"
                value={formData.login}
                onChange={handleChange}
                required
              />

              <Input
                label="Пароль"
                name="password"
                type="password"
                placeholder="Введите пароль"
                classNames="col-span-2"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="submit"
                className="col-span-4 bg-[#F08543] hover:bg-[#F08A4B] text-white  font-semibold py-2 rounded transition-all duration-200"
              >
                Изменить
              </button>

              <div className="col-span-4 flex justify-center mt-4">
                <Image
                  src="/images/edit.png"
                  alt="secure"
                  width={400}
                  height={300}
                  className="w-full max-w-[350px] h-auto object-cover"
                />
              </div>
            </form>
          </div>
        </MethodModal>
      )}
    </DashboardLayout>
  );
};

export default Index;
