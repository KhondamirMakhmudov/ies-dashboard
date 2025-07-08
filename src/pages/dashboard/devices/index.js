import React, { useState } from "react";
import CustomTable from "@/components/table";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteModal from "@/components/modal/delete-modal";
import useGetQuery from "@/hooks/java/useGetQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import { motion } from "framer-motion";
import { get } from "lodash";
import ContentLoader from "@/components/loader";
import { Typography, Select, MenuItem } from "@mui/material";
import Input from "@/components/input";
import toast from "react-hot-toast";
import Image from "next/image";
import MethodModal from "@/components/modal/method-modal";
import usePostQuery from "@/hooks/java/usePostQuery";
const ipRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImlhdCI6MTc1MTk2ODcyMiwiZXhwIjoxNzUyMDU1MTIyfQ.4vySSuX4YTL0lujqCqkGoAXIKB8UFM6wAPCBv0B1qS0";
const Index = () => {
  const [createCameraModal, setCreateCameraModal] = useState(false);
  const [editCameraModal, setEditCameraModal] = useState(false);
  const [deleteCameraModal, setDeleteCameraModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEntryPoint, setSelectedEntryPoint] = useState("");
  const [selectedCheckPoint, setSelectedCheckPoint] = useState("")
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

  // department get
  const {
    data: departments,
  } = useGetQuery({
    key: KEYS.departments,
    url: URLS.departments,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token, 
  });

  // entrypoint get

  const {data: entrypoints} = useGetQuery({
    key: KEYS.entrypoints,
    url: URLS.entrypoints,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  })

  // checkpoint get 
  const { data: checkpoints } = useGetQuery({
    key: KEYS.checkpoints,
    url: URLS.checkpoints,
        headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    enabled: !!token,
  })
  const {mutate: createCamera} = usePostQuery({
    listKeyId: "create-camera"
  })

  const onSubmitCreateCamera = () => { 
    createCamera({
      url: URLS.createCamera,
      attributes: {
        ipAddress: "198.52.2.4",
        building: "Главный офис",
        login: "iesqwerty",
        password: "ies2025",
        departmentId: 1,
        checkPointId: 1,
        doorTypeId: 1,
        isActive: 1,
      },
      config: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
      },
    })
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


  const handleChange = (event) => {
    setSelectedDepartment(event.target.value);
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

    if (!allCameras) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }



  if (!departments) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout headerTitle={"Устройства"}>
      <button onClick={onSubmitCreateCamera}>
        hello
      </button>
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
              className="grid grid-cols-4 my-[30px] gap-[15px]"
            >
              <Input
                label="IP адрес"
                type="text"
                name="ipAddress"
                placeholder="Введите IP адрес"
                classNames="col-span-4"
                inputClass={"!h-[45px] rounded-[12px] text-[15px]"}
                labelClass={"text-sm"}
                pattern={ipRegex.source}
                required
              />

              <Input
                label="Имя пользователя"
                name="login"
                placeholder="Введите имя пользователя"
                classNames="col-span-2"
                inputClass={"!h-[45px] rounded-[12px] text-[15px]"}
                labelClass={"text-sm"}

                required
              />

              <Input
                label="Пароль"
                name="password"
                type="text"
                placeholder="Введите пароль"
                inputClass={"!h-[45px] rounded-[12px] text-[15px]"}
                labelClass={"text-sm"}
                classNames="col-span-2"
                required
              />

              <Select
                className="w-full text-black mt-[15px] col-span-4"
                id="demo-simple-select"
                value={selectedDepartment}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Выберите департамент
                </MenuItem>
                {get(departments, "data", []).map((department, index) => (
                  <MenuItem key={index} value={get(department, "id")}>
                    {get(department, "nameDep")}
                  </MenuItem>
                ))}
              </Select>

              
              <Select
                className="w-full text-black mt-[15px] col-span-4"
                id="demo-simple-select"
                value={selectedEntryPoint}
                onChange={(e) => {
                  e.preventDefault();
                  setSelectedEntryPoint(e.target.value)
                }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Выберите контрольную точку
                </MenuItem>
                {get(entrypoints, "data", []).map((entry, index) => (
                  <MenuItem key={index} value={get(entry, "id")}>
                    {get(entry, "entryPointName")}
                  </MenuItem>
                ))}
              </Select>

              <Select
                className="w-full text-black mt-[15px] col-span-4"
                id="demo-simple-select"
                value={selectedCheckPoint}
                onChange={(e) => {
                  e.preventDefault();
                  setSelectedCheckPoint(e.target.value)
                }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Выберите точки доступа
                </MenuItem>
                {get(checkpoints, "data", []).map((entry, index) => (
                  <MenuItem key={index} value={get(entry, "id")}>
                    {get(entry, "checkPointName")}
                  </MenuItem>
                ))}
              </Select>



              <button
                type="submit"
                className="col-span-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-all duration-200"
              >
                Создать
              </button>

              {/* <div className="col-span-4 flex justify-center mt-4">
                <Image
                  src="/images/secure-img.png"
                  alt="secure"
                  width={400}
                  height={300}
                  className="w-full max-w-[350px] h-auto object-cover"
                />
              </div> */}
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

                onChange={handleChange}
                pattern={ipRegex.source}
                required
              />

              <Input
                label="Здание"
                name="building"
                placeholder="Введите название здания"
                classNames="col-span-4"
  
                onChange={handleChange}
                required
              />

              <Input
                label="Имя пользователя"
                name="login"
                placeholder="Введите имя пользователя"
                classNames="col-span-2"
 
                onChange={handleChange}
                required
              />

              <Input
                label="Пароль"
                name="password"
                type="password"
                placeholder="Введите пароль"
                classNames="col-span-2"

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
