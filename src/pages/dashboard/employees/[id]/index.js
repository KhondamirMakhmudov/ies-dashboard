import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { get, isEmpty } from "lodash";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import ContentLoader from "@/components/loader";
import useGetQuery from "@/hooks/java/useGetQuery";
import { useSession } from "next-auth/react";
import DeleteModal from "@/components/modal/delete-modal";
import toast from "react-hot-toast";
import { config } from "@/config";
import { useQueryClient } from "@tanstack/react-query";
import MethodModal from "@/components/modal/method-modal";
import Input from "@/components/input";
import BirthDateInput from "@/components/input/birthdate-input";
import PhoneInputUz from "@/components/input/phone-input";
import CustomSelect from "@/components/select";
import Breadcrumb from "@/components/breadcrumb";
import { genderOptions } from "@/constants/static-data";
import { educationLevelOptions } from "@/constants/static-data";
import { razryadOptions } from "@/constants/static-data";
import ReportComponent from "@/components/report";

const Index = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id: employee_id } = router.query;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: session } = useSession();
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");

  const [photoFile, setPhotoFile] = useState(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tab, setTab] = useState("personal");
  const tabs = [
    { key: "personal", label: "Основная информация" },
    { key: "employee", label: "Данные о сотрудниках" },
    { key: "schedule", label: "Доступ и расписание" },
  ];
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
    photo: null,
  });

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
    if (employeePhoto?.data) {
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

      const fileUrl = get(employeePhoto, "data.file_url", null);
      setPhotoPreview(fileUrl || null);
    }
  }, [employeePhoto?.data]);

  // GET schedule and entrypoint which are connected to employee

  const {
    data: ScheduleAndEntrypointOfEmployee,
    isLoading: isLoadingScheduleAndEntrypointOfEmployee,
    isFetching: isFetchingScheduleAndEntrypointOfEmployee,
  } = useGetQuery({
    key: KEYS.ScheduleAndEntrypointOfEmployee,
    url: `${URLS.ScheduleAndEntrypointOfEmployee}${employee_id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!employee_id && !!session?.accessToken,
  });

  // GET report of the employee by employee_id (right now used table_number instead of id)

  const {
    data: employeeReport,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
  } = useGetQuery({
    key: KEYS.employeeReport,
    url: `${URLS.logEntersOfEmployeeById}${employee_id}/dates/new-output`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    params: {
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    enabled:
      !!employee_id && !!session?.accessToken && !!startDate && !!endDate, // ✅ faqat sanalar bo‘lsa fetch qiladi
  });

  // edit(patch) Employee
  const onSubmitEditEmployee = async () => {
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      const newValue = formData[key];
      const oldValue = get(employeePhoto, `data.${key}`, "");

      if (String(newValue) !== String(oldValue)) {
        formDataToSend.append(key, newValue);
      }
    });

    if (photoFile) {
      formDataToSend.append("photo", photoFile);
    }

    // Debug uchun

    try {
      const res = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}${employee_id}`,
        {
          method: "PATCH",
          body: formDataToSend,
        }
      );

      if (!res.ok) {
        throw new Error(`Ошибка ${res.status}`);
      }

      toast.success("Успешно редактировано", { position: "top-center" });
      setEditModal(false);
      queryClient.invalidateQueries(KEYS.employeePhoto);
    } catch (error) {
      toast.error(`Error is ${error}`, { position: "top-right" });
    }
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

  if (isLoadingPhoto || isFetchingPhoto) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

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

  return (
    <DashboardLayout headerTitle={`Полная информация о сотруднике`}>
      <div className="bg-white p-[15px] mt-[10px] rounded-md border border-[#E9E9E9]">
        <Breadcrumb
          paths={[
            {
              label: "Сотрудники",
              href: "/dashboard/employees",
              isCurrent: false,
            },

            {
              label: `${get(employeePhoto, "data.first_name")} ${get(
                employeePhoto,
                "data.last_name"
              )}`,
              href: "/dashboard/employees",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <div>
        {/* employee details */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white mb-5 border border-[#E9E9E9] w-full grid grid-cols-1 lg:grid-cols-12 mt-[10px] rounded-md"
        >
          {/* Chap tomonda profil */}
          <div className="lg:col-span-3 flex flex-col gap-2 items-center text-center border-b md:border-b-0 md:border-r border-[#E9E9E9] py-5 px-4">
            <div className="w-[150px] h-[150px] lg:w-[170px] lg:h-[170px] rounded-full overflow-hidden border border-[#C9C9C9]">
              <Image
                src={
                  isEmpty(
                    get(
                      employeePhoto,
                      "data.file_url",
                      "/images/profile-default.jpg"
                    )
                  )
                    ? "/images/profile-default.jpg"
                    : get(
                        employeePhoto,
                        "data.file_url",
                        "/images/profile-default.jpg"
                      )
                }
                alt="user photo"
                width={180}
                height={180}
                unoptimized
                className="object-cover w-full h-full"
              />
            </div>

            <div>
              <div className="space-[10px] gap-x-2 flex flex-wrap justify-center items-center">
                <Typography
                  variant="h7"
                  sx={{ fontSize: "20px", fontWeight: "600" }}
                >
                  {get(employeePhoto, "data.first_name")}
                </Typography>

                <Typography
                  variant="h7"
                  sx={{ fontSize: "20px", fontWeight: "600" }}
                >
                  {get(employeePhoto, "data.last_name")}
                </Typography>
              </div>
              <p className="text-gray-400 text-sm">
                {get(employeePhoto, "data.email")}
              </p>

              <p className="text-[13px] py-1 rounded-xl inline-block px-3 bg-gray-200 font-medium mt-2">
                {get(employeePhoto, "data.workplace.position.name", "")}
              </p>
            </div>
          </div>

          {/* O‘ng tomonda tabs + ma’lumotlar */}
          <div className="lg:col-span-9 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-0 border-b border-b-[#E9E9E9]"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex gap-3 px-3 py-1">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        tab === t.key
                          ? "text-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t.label}

                      {tab === t.key && (
                        <motion.span
                          layoutId="underline"
                          className="absolute left-0 -bottom-1 h-[2px] w-full bg-blue-600 rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

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
                        {get(employeePhoto, "data.first_name") ||
                          "Имя не указано"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Фамилия</h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.last_name") ||
                          "Фамилия не указана"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Отчество</h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.middle_name") ||
                          "Отчество не указано"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Пол</h4>
                      <p className="text-base font-medium capitalize">
                        {get(employeePhoto, "data.gender") || "Пол не указан"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Дата рождения
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.date_of_birth")
                          ? dayjs(
                              get(employeePhoto, "data.date_of_birth")
                            ).format("DD.MM.YYYY")
                          : "Дата рождения не указана"}
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
                        {get(employeePhoto, "data.phone_number")
                          ? `+998 ${get(employeePhoto, "data.phone_number")}`
                          : "Номер телефона не указан"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Электронная почта
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.email") ||
                          "Электронная почта не указана"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Адрес проживания
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.address") ||
                          "Адрес не указан"}
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
                        {get(employeePhoto, "data.education_degree") ||
                          "Не указано"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Место образование
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.education_place") ||
                          "Не указано"}
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
                        {get(employeePhoto, "data.workplace.position.name") ||
                          "Должность не указана"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">Отдел</h4>
                      <p className="text-base font-medium">
                        {get(
                          employeePhoto,
                          "data.workplace.organizational_unit.name"
                        ) || "Отдел не указан"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Разряд сотрудника
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.level") || "Не указан"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Дата приема на работу
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.hire_date")
                          ? dayjs(get(employeePhoto, "data.hire_date")).format(
                              "DD.MM.YYYY"
                            )
                          : "Дата приема не указана"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Табельный номер
                      </h4>
                      <p className="text-base font-medium">
                        {get(employeePhoto, "data.tabel_number")
                          ? `№${get(employeePhoto, "data.tabel_number")}`
                          : "Табельный номер не указан"}
                      </p>
                    </li>
                    <li className="min-w-[120px] sm:min-w-[150px]">
                      <h4 className="text-sm text-gray-500 mb-1">
                        Cтатус занятости
                      </h4>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          get(employeePhoto, "data.is_active")
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {get(employeePhoto, "data.is_active")
                          ? "Активный"
                          : "Неактивный"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Connected schedule and entrypoint to employee */}
            {tab === "schedule" && (
              <div className="space-y-[10px] p-2 sm:p-4">
                <Typography variant="h6">Точки доступа и расписания</Typography>
                <p className="text-gray-500">
                  Точки входа, к которым у сотрудника есть доступ, и связанные с
                  ними расписания.
                </p>

                <div className="space-y-[10px]">
                  {get(
                    ScheduleAndEntrypointOfEmployee,
                    "data.entryPointSchedules",
                    []
                  ).length > 0 ? (
                    get(
                      ScheduleAndEntrypointOfEmployee,
                      "data.entryPointSchedules",
                      []
                    ).map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 p-3 rounded-md hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between">
                          <Typography variant="h6">
                            {get(item, "entryPointName") ||
                              "Название точки не указано"}
                          </Typography>

                          <Button
                            onClick={() =>
                              router.push(
                                `/dashboard/access-points/${
                                  get(item, "entryPointId") || ""
                                }`
                              )
                            }
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
                            <p>Перейти к точке доступа</p>
                          </Button>
                        </div>

                        <div className="mt-[10px] bg-gray-100 p-3 rounded-md">
                          <p className="text-[17px] font-semibold">
                            Расписание:
                          </p>
                          <div className="flex justify-between">
                            <p className="text-[17px] font-medium">
                              {get(item, "scheduleName") ||
                                "Расписание не указано"}
                            </p>
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/schedule/${
                                    get(item, "scheduleId") || ""
                                  }`
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                            >
                              Подробнее →
                            </button>
                          </div>
                        </div>
                        {/* change the schedule of the employee  */}
                        <div></div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      Нет данных по точкам доступа и расписаниям
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* report of the employee */}
        <ReportComponent
          employee_id={employee_id}
          session={session}
          data={get(employeeReport, "data", [])}
          startDate={startDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          endDate={endDate}
          isLoadingReport={isLoadingReport}
          isFetchingReport={isFetchingReport}
        />
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
                        setPhotoFile(file);
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
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  placeholder="Имя"
                  inputClass="!h-[45px] border !border-gray-200"
                  required
                />

                <Input
                  label={"Фамилия сотрудника"}
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  placeholder="Фамилия"
                  inputClass="!h-[45px] border !border-gray-200"
                  required={true}
                />
                <Input
                  label={"Отчество сотрудника"}
                  name="middle_name"
                  value={formData.middle_name || ""}
                  onChange={handleChange}
                  placeholder="Отчество"
                  inputClass="!h-[45px] border !border-gray-200"
                />

                <BirthDateInput
                  value={formData.date_of_birth || ""}
                  onChange={handleChange}
                  inputClass="!h-[45px] border !border-gray-200"
                  required
                />

                <CustomSelect
                  label={"Пол"}
                  options={genderOptions}
                  value={formData.gender || ""}
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
                  label={"Табельный номер" || ""}
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
                  value={formData.address || ""}
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
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="Электронная почта"
                  inputClass="!h-[45px] border !border-gray-200"
                  classNames="col-span-2 md:col-span-1"
                />

                <PhoneInputUz
                  label={"Телефон номер сотрудника"}
                  name="phone_number"
                  value={formData.phone_number || ""}
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
                  value={formData.education_degree || ""} // ✅ faqat value (string/number)
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
                  value={formData.education_place || ""}
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
                  value={formData.level || ""}
                  placeholder="Выберите разряд"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      level: val,
                    }))
                  }
                  sortOptions={false}
                  returnObject={false} // ✅ faqat value qaytaradi
                />
                <Input
                  name="hire_date"
                  type="date"
                  label={"Дата приема на работу"}
                  value={formData.hire_date || ""}
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
