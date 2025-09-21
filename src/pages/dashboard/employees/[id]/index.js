import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { Tabs, Tab, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { get, set } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import ContentLoader from "@/components/loader";
import useGetQuery from "@/hooks/java/useGetQuery";
import { useSession } from "next-auth/react";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CustomTable from "@/components/table";
import DeleteModal from "@/components/modal/delete-modal";
import toast from "react-hot-toast";
import { config } from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import BirthDateInput from "@/components/input/birthdate-input";
import PhoneInputUz from "@/components/input/phone-input";
import CustomSelect from "@/components/select";
import usePatchPythonQuery from "@/hooks/python/usePatchQuery";
const Index = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  );

  const [photoFile, setPhotoFile] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tab, setTab] = useState("personal");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone_number: "",
    level: 1,
    hire_date: "",
    date_of_birth: "",
    tabel_number: "",
    gender: "",
    address: "",
    education_degree: "школа",
    education_place: "",
    workplace_id: "",
  });
  // Format function: converts to 'YYYY-MM-DDTHH:mm'
  const formatDateTime = (date) => {
    return date.toISOString().slice(0, 16);
  };

  const { id: employee_id } = router.query;
  // GET employee all informations
  const {
    data: employeePhoto,
    isLoading: isLoadingPhoto,
    isFetching: isFetchingPhoto,
  } = useGetPythonQuery({
    key: KEYS.employeePhoto,
    url: `${URLS.employeePhoto}${employee_id}`,
    enabled: !!employee_id,
  });

  useEffect(() => {
    if (get(employeePhoto, "data", [])) {
      setFormData({
        first_name: get(employeePhoto, "data.first_name", ""),
        last_name: get(employeePhoto, "data.last_name", ""),
        middle_name: get(employeePhoto, "data.middle_name", ""),
        date_of_birth: get(employeePhoto, "data.date_of_birth", ""),
        gender: get(employeePhoto, "data.gender", ""),
        tabel_number: get(employeePhoto, "data.tabel_number", ""),
        address: get(employeePhoto, "data.address", ""),
        email: get(employeePhoto, "data.email", ""),
        phone_number: get(employeePhoto, "data.phone_number", ""),
        education_degree: get(employeePhoto, "data.education_degree", ""),
        education_place: get(employeePhoto, "data.education_place", ""),
        level: get(employeePhoto, "data.level", ""),
        hire_date: get(employeePhoto, "data.hire_date", ""),
        workplace_id: get(employeePhoto, "data.workplace_id", ""),
      });

      if (get(employeePhoto, "data.file_url", null)) {
        setPhotoPreview(get(employeePhoto, "data.file_url"));
      }
    }
  }, [employeePhoto]);

  // GET report of the employee by employee_id (right now used table_number instead of id)
  const {
    data: employeeReport,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
  } = useGetQuery({
    key: KEYS.employeeReport,
    url: `${URLS.logEntersOfEmployeeById}${get(
      employeePhoto,
      "data.tabel_number",
      ""
    )}/dates/new-output`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

  // edit Employee

  const { mutate: editEmployee } = usePatchPythonQuery({
    listKeyId: "edit-employee",
  });

  const onSubmitEditEmployee = () => {
    const formDataToSend = new FormData();

    // Faqat o‘zgargan fieldlarni solamiz
    Object.keys(formData).forEach((key) => {
      const newValue = formData[key];
      const oldValue = get(employeePhoto, `data.${key}`, "");

      if (newValue !== oldValue) {
        formDataToSend.append(key, newValue);
      }
    });

    // Agar yangi rasm tanlangan bo‘lsa, faqat shunda yuboramiz

    editEmployee(
      {
        url: `${URLS.employees}${employee_id}`,
        attributes: formDataToSend, // faqat keraklilar yuborilyapti
      },
      {
        onSuccess: () => {
          setEditModal(false);
          toast.success("Успешно редактировано", { position: "top-center" });
          queryClient.invalidateQueries(KEYS.employeePhoto);
        },
        onError: (error) => {
          toast.error(`Error is ${error}`, { position: "top-right" });
        },
      }
    );
  };

  // delete Employee
  const onSubmitDeletePosition = async () => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}${employee_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ employee_id: employee_id }),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Успешно удалено");
      router.push("/dashboard/employees");
      queryClient.invalidateQueries(KEYS.unitTypes);
      console.log("Deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Не удалось удалить");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeTab = (event, newValue) => {
    setTab(newValue);
  };

  if (isLoadingPhoto || isFetchingPhoto) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file); // ✅ Faylni saqlab qo'yamiz
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Kamera ochish
  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Kamera xatosi:", err);
    }
  };

  // Surat olish
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Canvas o‘lchamini video bilan teng qilamiz
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Videodan rasmni canvasga chizamiz
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Blob (file) obyektini olamiz
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoFile(file); // 🚀 bu yerda file real "File" obyekt bo‘ladi
      }
    }, "image/jpeg");

    setIsCameraOpen(false);
  };

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },

    {
      accessorKey: "time",
      header: "Время действие",
      cell: ({ getValue }) => {
        const datetime = getValue(); // masalan: "2025-07-22T11:14:56"
        const date = dayjs(datetime).format("DD.MM.YYYY");
        const time = dayjs(datetime).format("HH:mm:ss");

        return (
          <div className="flex flex-col">
            <span className="font-medium">{date}</span>
            <span className="text-gray-400 text-xs">{time}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "errorCode",
      header: "Статус",
      cell: ({ getValue }) => {
        const errorCode = getValue();

        return (
          <span
            className={
              errorCode === 0
                ? "text-green-600 font-medium bg-[#E8F6F0] p-1 rounded-md border border-green-600"
                : "text-red-600 font-medium bg-[#FAE7E7] p-1 rounded-md border border-red-600"
            }
          >
            {errorCode === 0
              ? "доступ разрешен"
              : "отказ в доступе (режим графика)"}
          </span>
        );
      },
    },
    {
      accessorKey: "event",
      header: "Событие",
      cell: ({ getValue }) => {
        const event = getValue();
        return (
          <span
            className={
              event
                ? "text-green-600 font-medium bg-[#E8F6F0] p-1 px-3 rounded-md border border-green-600"
                : "text-red-600 font-medium bg-[#FAE7E7] p-1 rounded-md border border-red-600"
            }
          >
            {event === "enter" ? "Вход" : "Выход"}
          </span>
        );
      },
    },
    {
      accessorKey: "eventType",
      header: "Тип доступа",
      cell: ({ getValue }) => {
        const eventType = getValue();
        return (
          <div
            className={
              "text-[#1E5EFF] font-medium bg-[#ECF2FF] p-1 px-3 rounded-md border border-[#1E5EFF]  items-center gap-1 inline-flex"
            }
          >
            <EmojiEmotionsIcon
              sx={{ width: "15px", height: "15px", color: "#1E5EFF" }}
            />
            <span>{eventType === 15 ? "FACE ID" : "Другое"}</span>
          </div>
        );
      },
    },

    { accessorKey: "entryPointName", header: "Точка входа" },
    { accessorKey: "structureName", header: "Отдел" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const genderOptions = [
    { value: "мужской", label: "Мужской" },
    { value: "женский", label: "Женский" },
  ];
  const educationLevelOptions = [
    { value: "школа", label: "Школа" },
    { value: "среднее", label: "Среднее" },
    { value: "среднее специальноe", label: "Среднее специальноe" },
    { value: "военное училище", label: "Военное училище" },
    { value: "высшее", label: "Высшее" },
    { value: "бакалавр", label: "бакалавр" },
    { value: "специалитет", label: "Специалитет" },
    { value: "магистр", label: "Магистр" },
    { value: "кандидат наук", label: "Кандидат наук" },
    { value: "доктор наук", label: "Доктор наук" },
  ];

  const razryadOptions = Array.from({ length: 16 }, (_, i) => {
    const lvl = i + 1;
    return {
      value: lvl,
      label: `${lvl}-разряд`,
    };
  });

  return (
    <DashboardLayout headerTitle={`Полная информация о сотруднике`}>
      <div>
        {/* employee details */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white mb-5 border border-[#E9E9E9] w-full grid grid-cols-1 md:grid-cols-12 mt-8 rounded-md"
        >
          {/* Chap tomonda profil */}
          <div className="md:col-span-3 flex flex-col gap-2 items-center text-center border-b md:border-b-0 md:border-r border-[#E9E9E9] py-5 px-4">
            <div className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] rounded-full overflow-hidden border border-[#C9C9C9]">
              <Image
                src={get(employeePhoto, "data.file_url", "")}
                loader={() => get(employeePhoto, "data.file_url", "")}
                alt="user photo"
                width={180}
                height={180}
                className="object-cover w-full h-full"
              />
            </div>

            <div>
              <Typography
                variant="h7"
                sx={{ fontSize: "20px", fontWeight: "600" }}
              >
                {get(employeePhoto, "data.first_name")}{" "}
                {get(employeePhoto, "data.last_name")}
              </Typography>
              <p className="text-gray-400 text-sm">
                {get(employeePhoto, "data.email")}
              </p>

              <p className="text-[13px] py-1 rounded-xl inline-block px-3 bg-gray-200 font-medium mt-2">
                {get(employeePhoto, "data.workplace.position.name", "")}
              </p>
            </div>
          </div>

          {/* O‘ng tomonda tabs + ma’lumotlar */}
          <div className="md:col-span-9 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-0 border-b border-b-[#E9E9E9]"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <Tabs
                  value={
                    ["personal", "employee"].includes(tab) ? tab : "personal"
                  }
                  onChange={handleChangeTab}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ paddingTop: "1px" }}
                >
                  <Tab
                    value="personal"
                    label="Основная информация"
                    sx={{ px: 1, py: 0.5, textTransform: "none" }}
                  />
                  <Tab
                    value="employee"
                    label="Данные о сотрудниках"
                    sx={{ px: 1, py: 0.5, textTransform: "none" }}
                  />
                </Tabs>

                <div className="flex gap-2 pr-4">
                  <Button
                    onClick={() => setEditModal(true)}
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
                    onClick={() => setDeleteModal(true)}
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
              </div>
            </motion.div>

            {/* PERSONAL INFO */}
            {tab === "personal" && (
              <div className="p-2 sm:p-4">
                {/* Личная информация */}
                <div className="border border-gray-200 p-4 rounded-xl mb-5">
                  <Typography
                    variant="h7"
                    sx={{ fontSize: "18px", fontWeight: "600" }}
                  >
                    Личная информация
                  </Typography>

                  <ul className="flex flex-wrap gap-4 mt-3">
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Имя</h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.first_name")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Фамилия</h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.last_name")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Отчество</h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.middle_name")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Пол</h4>
                      <p className="text-base font-medium capitalize">
                        {get(employeePhoto, "data.gender")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Дата рождения
                      </h4>
                      <p className="text-base font-medium">
                        {dayjs(
                          get(employeePhoto, "data.date_of_birth", "")
                        ).format("DD.MM.YYYY")}
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Контактные данные */}
                <div className="border border-gray-200 p-4 rounded-xl mb-5">
                  <Typography
                    variant="h7"
                    sx={{ fontSize: "18px", fontWeight: "600" }}
                  >
                    Контактные данные
                  </Typography>

                  <ul className="flex flex-wrap gap-4 mt-3">
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Номер телефона
                      </h4>
                      <p className="text-base font-medium">
                        +998 {get(employeePhoto, "data.phone_number")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Электронная почта
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.email", "-")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Адрес проживания
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.address")}
                      </p>
                    </li>
                  </ul>
                </div>

                {/* Образование */}
                <div className="border border-gray-200 p-4 rounded-xl">
                  <Typography
                    variant="h7"
                    sx={{ fontSize: "18px", fontWeight: "600" }}
                  >
                    Образование
                  </Typography>

                  <ul className="flex flex-wrap gap-4 mt-3">
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Степень образования
                      </h4>
                      <p className="text-base font-medium capitalize">
                        {get(employeePhoto, "data.education_degree")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Место образование
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.education_place", "-")}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* EMPLOYEE INFO */}
            {tab === "employee" && (
              <div className="p-2 sm:p-4">
                <div className="border border-gray-200 p-4 rounded-xl">
                  <Typography
                    variant="h7"
                    sx={{ fontSize: "18px", fontWeight: "600" }}
                  >
                    Сведения о трудоустройстве
                  </Typography>

                  <ul className="flex flex-wrap gap-4 mt-3">
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Должность сотрудника
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.workplace.position.name")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Отдел</h4>
                      <p className="text-base font-medium">
                        {get(
                          employeePhoto,
                          "data.workplace.organizational_unit.name"
                        )}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Разряд сотрудника
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.level", "")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Дата приема на работу
                      </h4>
                      <p className="text-base font-medium">
                        {dayjs(get(employeePhoto, "data.hire_date")).format(
                          "DD.MM.YYYY"
                        )}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Табельный номер
                      </h4>
                      <p className="text-base font-medium">
                        №{get(employeePhoto, "data.tabel_number", "")}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Cтатус занятости
                      </h4>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          get(employeePhoto, "data.is_active", "")
                            ? "bg-green-100 text-green-800 "
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {get(employeePhoto, "data.is_active", "")
                          ? "Активный"
                          : "Неактивный"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* report of the employee */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white col-span-12 p-6 my-[50px] rounded-md border border-[#E9E9E9] w-full"
        >
          <div className="border-b border-b-gray-200 pb-[10px]">
            <Typography
              variant="h6"
              sx={{ fontSize: "20px", fontWeight: "600" }}
            >
              Отчёты о сотруднике
            </Typography>
          </div>
          <div className="flex gap-6 items-end flex-wrap mt-[15px]">
            {/* Start date */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата начала
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="!h-[44px] border !border-[#C9C9C9] px-2 rounded-md"
              />
            </div>

            {/* End date */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата окончания
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="!h-[44px] border !border-[#C9C9C9] px-2 rounded-md"
              />
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  const now = new Date();
                  const start = new Date();
                  start.setHours(0, 0, 0, 0); // bugun 00:00

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(now));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Сегодня
              </button>

              <button
                onClick={() => {
                  const start = new Date();
                  start.setDate(start.getDate() - 1);
                  start.setHours(0, 0, 0, 0); // kecha 00:00

                  const end = new Date();
                  end.setDate(end.getDate() - 1);
                  end.setHours(23, 59, 59, 999); // kecha 23:59

                  setStartDate(formatDateTime(start));
                  setEndDate(formatDateTime(end));
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Вчера
              </button>
            </div>
          </div>

          {isLoadingReport || isFetchingReport ? (
            <ContentLoader />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white my-[20px]   w-full"
            >
              <CustomTable
                data={get(employeeReport, "data", []).flat()}
                columns={columns}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
      {/* edit modal */}

      {editModal && (
        <MethodModal open={editModal} width={1000} padding={0}>
          <div className="bg-[#E57F3A] p-[16px] text-white rounded-t-[8px] flex justify-between items-center">
            <div>
              <Typography variant="h6">Редактировать сотрудника</Typography>
              <p>Обновить информацию о сотруднике</p>
            </div>

            <button
              onClick={() => setEditModal(false)}
              className="text-white hover:text-gray-200 transition-colors cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <div className="max-h-[500px] overflow-y-scroll">
            <div className="text-center my-[30px]">
              <div className="inline-block">
                <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Employee"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Photo</span>
                  )}
                </div>

                {/* Tugmalar */}
                <div className="flex justify-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("photoInput").click()
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    Загрузить файл
                  </button>
                  <input
                    type="file"
                    id="photoInput"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPhotoPreview(URL.createObjectURL(file));
                        setPhotoFile(e.target.files[0]);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={openCamera}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    Сделать фото
                  </button>
                </div>

                {/* Kamera modal */}
                {isCameraOpen && (
                  <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                      <video
                        ref={videoRef}
                        autoPlay
                        className="w-164 h-148 bg-black rounded-md"
                      ></video>
                      <canvas ref={canvasRef} className="hidden"></canvas>

                      <div className="flex justify-center gap-4 mt-4">
                        <button
                          onClick={takePhoto}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg"
                        >
                          Сделать фото
                        </button>
                        <button
                          onClick={() => setIsCameraOpen(false)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 m-[20px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                Личная информация
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label={"Имя сотрудника"}
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Имя"
                  inputClass="!h-[45px] border !border-gray-200"
                  required
                />

                <Input
                  label={"Фамилия сотрудника"}
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Фамилия"
                  inputClass="!h-[45px] border !border-gray-200"
                  required={true}
                />
                <Input
                  label={"Отчество сотрудника"}
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                  placeholder="Отчество"
                  inputClass="!h-[45px] border !border-gray-200"
                />

                <BirthDateInput
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  inputClass="!h-[45px] border !border-gray-200"
                  required
                />

                <CustomSelect
                  label={"Пол"}
                  options={genderOptions}
                  value={formData.gender}
                  placeholder="Выберите пол"
                  className="!h-[55px]"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      gender: val,
                    }))
                  }
                  required
                  returnObject={false}
                />

                <Input
                  name="tabel_number"
                  label={"Табельный номер"}
                  value={formData.tabel_number}
                  onChange={handleChange}
                  placeholder="Введите"
                  inputClass="!h-[45px] border !border-gray-200"
                  required
                />
              </div>

              <div className="mt-6">
                <Input
                  name="address"
                  value={formData.address}
                  label={"Адрес проживания"}
                  onChange={handleChange}
                  placeholder="Введите"
                  inputClass="!h-[45px] border !border-gray-200"
                  required={true}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-green-50 rounded-xl p-6 m-[20px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
                Контактная информация
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <Input
                  label={"Электронная почта"}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Электронная почта"
                  inputClass="!h-[45px] border !border-gray-200"
                  classNames="col-span-2 md:col-span-1"
                />

                <PhoneInputUz
                  label={"Телефон номер сотрудника"}
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="Телефонный номер"
                  inputClass="!h-[45px] border !border-gray-200"
                  classNames="col-span-2 md:col-span-1"
                />
              </div>
            </div>

            {/* Education Information */}
            <div className="bg-purple-50 rounded-xl p-6 m-[20px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
                Информация об образовании
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomSelect
                  options={educationLevelOptions}
                  value={formData.education_degree} // ✅ faqat value (string/number)
                  label="Степень образования"
                  placeholder="Выберите уровень образования"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      education_degree: val, // faqat value saqlanadi
                    }))
                  }
                  required
                  returnObject={false} // ⚡ faqat value qaytarish uchun
                />

                <Input
                  name="education_place"
                  value={formData.education_place}
                  onChange={handleChange}
                  placeholder={"Введите"}
                  label="Место получения образования"
                  inputClass="!h-[45px] border !border-gray-200"
                  required={true}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-orange-50 rounded-xl p-6 m-[20px]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V6z"
                  ></path>
                </svg>
                Информация о трудоустройстве
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomSelect
                  label={"Выберите разряд"}
                  options={razryadOptions}
                  value={formData.level}
                  placeholder="Выберите разряд"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      level: val,
                    }))
                  }
                  returnObject={false} // ✅ faqat value qaytaradi
                />
                <Input
                  name="hire_date"
                  type="date"
                  label={"Дата приема на работу"}
                  value={formData.hire_date}
                  onChange={handleChange}
                  inputClass="!h-[45px] border !border-gray-200"
                  required
                />
              </div>
            </div>
          </div>

          <div className="sticky  bg-white border-t border-t-gray-200 p-4 flex justify-end gap-3">
            <button
              onClick={() => setEditModal(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
            >
              Отмена
            </button>
            <button
              onClick={onSubmitEditEmployee}
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              Сохранить изменения
            </button>
          </div>
        </MethodModal>
      )}
      {/* delete modal */}
      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          deleting={onSubmitDeletePosition}
        >
          <div className="space-y-2 px-1 py-2">
            <Typography variant="body1">
              Вы собираетесь удалить сотрудника, чьи данные представлены в
              следующих разделах:
            </Typography>

            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>
                Личная информация — имя, фамилия, отчество, пол, дата рождения
              </li>
              <li>
                Контактные данные — номер телефона, электронная почта, адрес
              </li>
              <li>Образование — степень, место обучения</li>
              <li>
                Сведения о трудоустройстве — должность, отдел, дата приёма,
                табельный номер, статус
              </li>
            </ul>

            <Typography variant="body2" className="text-red-600 font-medium">
              После удаления восстановить данные будет невозможно.
            </Typography>
          </div>
        </DeleteModal>
      )}
    </DashboardLayout>
  );
};

export default Index;
