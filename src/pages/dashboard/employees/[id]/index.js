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
import PrimaryButton from "@/components/button/primary-button";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InboxIcon from "@mui/icons-material/Inbox";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import DescriptionIcon from "@mui/icons-material/Description";
import DateRangeIcon from "@mui/icons-material/DateRange";
import Link from "next/link";
import useAppTheme from "@/hooks/useAppTheme";
import EmployeeBusinessTripSection from "@/components/business-trip-section";
import DocsOfEmployee from "@/components/docs-employee";
import { canUserDo } from "@/utils/checkpermission";
import StatusNotAllowed from "@/components/status/statusNotAllowed";

const Index = () => {
  const { bg, text, isDark, border } = useAppTheme();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id: employee_id } = router.query;
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { data: session } = useSession();
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [connectScheduleModal, setConnectScheduleModal] = useState(false);
  const [selectEntrypointId, setSelectEntrypointId] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [tab, setTab] = useState("personal");
  const [selectedJobTrip, setSelectedJobTrip] = useState(null);
  const [deleteJobTripModal, setDeleteJobTripModal] = useState(false);

  // Connect schedule states
  const [selectedEntryPoint, setSelectedEntryPoint] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

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

  const canReadEmployeeDetail = canUserDo(session?.user, "employee", "read");
  const canUpdateEmployeeDetail = canUserDo(
    session?.user,
    "employee",
    "update",
  );
  const canDeleteEmployeeDetail = canUserDo(
    session?.user,
    "employee",
    "delete",
  );

  // GET employee all informations
  const {
    data: employeePhoto,
    isLoading: isLoadingPhoto,
    isFetching: isFetchingPhoto,
  } = useGetPythonQuery({
    key: KEYS.employeePhoto,
    url: `${URLS.employeePhoto}${employee_id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    enabled: !!employee_id && !!session?.accessToken,
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
  }, []);

  // GET schedule and entrypoint which are connected to employee
  const {
    data: ScheduleAndEntrypointOfEmployee,
    isLoading: isLoadingScheduleAndEntrypointOfEmployee,
    isFetching: isFetchingScheduleAndEntrypointOfEmployee,
    status: statusOfScheduleAndEntrypointOfEmployee,
    isError: isScheduleError,
  } = useGetQuery({
    key: KEYS.ScheduleAndEntrypointOfEmployee,
    url: `${URLS.ScheduleAndEntrypointOfEmployee}${employee_id}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!employee_id && !!session?.accessToken,
    redirectOn403: false,
  });

  const isScheduleForbidden = statusOfScheduleAndEntrypointOfEmployee === 403;

  useEffect(() => {
    if (isScheduleForbidden && tab === "schedule") {
      setTab("personal");
    }
  }, [isScheduleForbidden, tab]);

  const {
    data: schedulesOfEntrypoints,
    isLoading: isLoadingSchedules,
    isFetching: isFetchingSchedules,
  } = useGetQuery({
    key: KEYS.schedulesOfEntrypoints,
    url: `${URLS.schedulesOfEntrypoints}${selectEntrypointId}/schedules`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!selectEntrypointId && !!session?.accessToken,
  });

  const tableNumberPrefix = get(employeePhoto, "data.tabel_number")?.split(
    "-",
  )[0];

  const {
    data: entrypointSchedules,
    isLoading: isLoadingEntrypointSchedules,
    isFetching: isFetchingEntrypointSchedules,
  } = useGetQuery({
    key: KEYS.entrypointSchedules,
    url: URLS.entrypointSchedules,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const scheduleOptions = get(schedulesOfEntrypoints, "data.schedules", [])
    // Filter schedules where unitCode matches table number prefix
    .filter((item) => item.unitCode === tableNumberPrefix)
    .map((item) => ({
      label: `${item.scheduleName} - ${item.unitCodeName}`,
      value: item.entryPointScheduleId,
    }));

  // GET report of the employee by employee_id
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
      !!employee_id && !!session?.accessToken && !!startDate && !!endDate,
    redirectOn403: false,
  });

  // Connect schedule to employee
  const handleConnectSchedule = async () => {
    if (!selectedSchedule) {
      toast.warning("Пожалуйста, выберите расписание!");
      return;
    }

    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.connectScheduleAndEmployee}?entryPointScheduleId=${selectedSchedule}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([employee_id]),
        },
      );

      if (!response.ok) {
        throw new Error("Ошибка при подключении расписания");
      }

      toast.success("Расписание успешно подключено!", {
        position: "top-center",
      });

      queryClient.invalidateQueries(KEYS.ScheduleAndEntrypointOfEmployee);
      queryClient.invalidateQueries(KEYS.connectScheduleAndEmployee);

      // Reset and close
      setSelectedEntryPoint(null);
      setSelectedSchedule(null);
      setConnectScheduleModal(false);
    } catch (error) {
      console.error("Error connecting schedule:", error);
      toast.error(`Ошибка: ${error.message}`, { position: "top-right" });
    }
  };

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

    try {
      const res = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}${employee_id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          body: formDataToSend,
        },
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
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ employee_id: employee_id }),
        },
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

  // delete jobTrip from Employee

  const submitDeleteJobTrip = async () => {
    try {
      const response = await fetch(
        `${config.JAVA_API_URL}${URLS.jobTrips}/${selectedJobTrip}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ jobTripId: selectedJobTrip }),
        },
      );

      if (!response.ok) {
        let errorMessage = "Ошибка при удалении";
        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorData?.error || errorMessage;
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      toast.success("Успешно удалено");
      setSelectedJobTrip(null);
      setDeleteJobTripModal(false);
      queryClient.invalidateQueries(KEYS.jobTrips);
      console.log("Deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error(error?.message || "Не удалось удалить");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset connect modal when closed
  useEffect(() => {
    if (!connectScheduleModal) {
      setSelectedEntryPoint(null);
      setSelectedSchedule(null);
    }
  }, [connectScheduleModal]);

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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoFile(file);
      }
    }, "image/jpeg");

    setIsCameraOpen(false);
  };

  return (
    <DashboardLayout headerTitle={`Полная информация о сотруднике`}>
      <div
        className="bg-white p-[15px] mt-[10px] rounded-md border border-[#E9E9E9]"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
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
                "data.last_name",
              )}`,
              href: "/dashboard/employees",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <div>
        {/* employee details */}
        {canReadEmployeeDetail && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white mb-5 border border-[#E9E9E9] w-full grid grid-cols-1 lg:grid-cols-12 mt-[10px] rounded-md"
            style={{
              backgroundColor: bg("#ffffff", "#1e1e1e"),
              borderColor: border("#e5e7eb", "#333333"),
            }}
          >
            {/* Chap tomonda profil */}
            <div
              className="lg:col-span-3 flex flex-col gap-2 items-center text-center border-b md:border-b-0 md:border-r border-[#E9E9E9] py-5 px-4"
              style={{ borderColor: border("#e5e7eb", "#333333") }}
            >
              <div className="w-[150px] h-[150px] lg:w-[170px] lg:h-[170px] rounded-full overflow-hidden border border-[#C9C9C9]">
                <Image
                  src={
                    isEmpty(
                      get(
                        employeePhoto,
                        "data.file_url",
                        "/images/profile-default.jpg",
                      ),
                    )
                      ? "/images/profile-default.jpg"
                      : get(
                          employeePhoto,
                          "data.file_url",
                          "/images/profile-default.jpg",
                        )
                  }
                  alt="user photo"
                  width={180}
                  height={180}
                  unoptimized
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex flex-col items-center space-y-3">
                {/* Full Name */}
                <div className="flex flex-wrap gap-x-2 justify-center items-center">
                  <Typography
                    variant="h7"
                    sx={{ fontSize: "20px", fontWeight: "600" }}
                  >
                    {get(employeePhoto, "data.last_name")}
                  </Typography>
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
                    {get(employeePhoto, "data.middle_name")}
                  </Typography>
                </div>

                {/* Email */}
                <p className="text-gray-500 text-sm">
                  {get(employeePhoto, "data.email")}
                </p>

                {/* Department */}
                <p className="text-base font-medium text-gray-700 text-center max-w-xl px-4">
                  {get(
                    employeePhoto,
                    "data.workplace.organizational_unit.name",
                  ) || "Отдел не указан"}
                </p>

                {/* Position Badge */}
                <div
                  className={`inline-flex items-center px-4 py-1.5 rounded-full ${
                    !isDark
                      ? "bg-blue-50 border border-blue-200"
                      : "border border-blue-700 bg-blue-900/30"
                  }`}
                >
                  <p className="text-sm font-medium text-blue-700">
                    {get(employeePhoto, "data.workplace.position.name") ||
                      "Должность не указана"}
                  </p>
                </div>
              </div>
            </div>

            {/* O'ng tomonda tabs + ma'lumotlar */}
            <div className="lg:col-span-9 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-0 border-b border-b-[#E9E9E9]"
                style={{
                  backgroundColor: bg("#ffffff", "#1e1e1e"),
                  borderColor: border("#e5e7eb", "#333333"),
                }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex gap-3 px-3 py-1">
                    {(isScheduleForbidden
                      ? tabs.filter((t) => t.key !== "schedule")
                      : tabs
                    ).map((t) => (
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
                    {canUpdateEmployeeDetail && (
                      <Button
                        onClick={() => setEditModal(true)}
                        sx={{
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                          background: isDark ? "#7c2d12" : "#F0D8C8",
                          color: isDark ? "#fb923c" : "#FF6200",
                          "&:hover": {
                            background: isDark ? "#9a3412" : "#F0B28B",
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                    )}
                    {canDeleteEmployeeDetail && (
                      <Button
                        onClick={() => setDeleteModal(true)}
                        sx={{
                          width: "32px",
                          height: "32px",
                          minWidth: "32px",
                          background: isDark ? "#7f1d1d" : "#FCD8D3",
                          color: isDark ? "#fca5a5" : "#FF1E00",
                          "&:hover": {
                            background: isDark ? "#991b1b" : "#FCA89D",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
              {/* PERSONAL INFO */}
              {tab === "personal" && (
                <div className="p-2 sm:p-4">
                  {/* Личная информация */}
                  <div
                    className="border border-gray-200 p-4 rounded-xl mb-5"
                    style={{ borderColor: border("#e5e7eb", "#333333") }}
                  >
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
                                get(employeePhoto, "data.date_of_birth"),
                              ).format("DD.MM.YYYY")
                            : "Дата рождения не указана"}
                        </p>
                      </li>
                    </ul>
                  </div>

                  {/* Контактные данные */}
                  <div
                    className="border border-gray-200 p-4 rounded-xl mb-5"
                    style={{ borderColor: border("#e5e7eb", "#333333") }}
                  >
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
                  <div
                    className="border border-gray-200 p-4 rounded-xl"
                    style={{ borderColor: border("#e5e7eb", "#333333") }}
                  >
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
                  <div
                    className="border border-gray-200 p-4 rounded-xl"
                    style={{ borderColor: border("#e5e7eb", "#333333") }}
                  >
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
                            "data.workplace.organizational_unit.name",
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
                            ? dayjs(
                                get(employeePhoto, "data.hire_date"),
                              ).format("DD.MM.YYYY")
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
                              ? isDark
                                ? "bg-green-900/30 text-green-400"
                                : "bg-green-100 text-green-800"
                              : isDark
                                ? "bg-red-900/30 text-red-400"
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

                  <div className="my-4">
                    <DocsOfEmployee employeeId={employee_id} />
                  </div>
                </div>
              )}
              {/* Connected schedule and entrypoint to employee */}
              {tab === "schedule" && (
                <div className="space-y-[10px] p-2 sm:p-4">
                  {isScheduleError &&
                  statusOfScheduleAndEntrypointOfEmployee === 403 ? (
                    <StatusNotAllowed />
                  ) : (
                    <div>
                      {" "}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#3B82F6] p-2 rounded-lg">
                            <CalendarMonthIcon
                              className="text-white"
                              sx={{ fontSize: 20 }}
                            />
                          </div>
                          <div>
                            <Typography
                              variant="h6"
                              style={{ color: text("#000000", "#f3f4f6") }}
                            >
                              Точки доступа и расписания
                            </Typography>
                            <p style={{ color: text("#6b7280", "#9ca3af") }}>
                              Точки входа, к которым у сотрудника есть доступ, и
                              связанные с ними расписания.
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Regular Schedule Assignments Section */}
                      <div className="space-y-[16px]">
                        <div className="flex items-center gap-2 mb-3"></div>

                        <div className="grid grid-cols-2 gap-4">
                          {get(
                            ScheduleAndEntrypointOfEmployee,
                            "data.scheduleAssignments",
                            [],
                          ).length > 0 ? (
                            get(
                              ScheduleAndEntrypointOfEmployee,
                              "data.scheduleAssignments",
                              [],
                            ).map((item, index) => (
                              <div
                                key={index}
                                className="col-span-1 border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                style={{
                                  background: isDark
                                    ? "linear-gradient(to bottom right, #1e1e1e, #2a2a2a)"
                                    : "linear-gradient(to bottom right, #ffffff, #f9fafb)",
                                  borderColor: border("#e5e7eb", "#333333"),
                                }}
                              >
                                {/* Header Section */}
                                <div
                                  className="px-5 py-4"
                                  style={{
                                    backgroundColor: isDark
                                      ? "#1e3a8a"
                                      : "#DFEDFE",
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-[#3B82F6] backdrop-blur-sm p-2 rounded-lg">
                                        <LocationOnIcon
                                          className="text-white"
                                          sx={{ fontSize: 20 }}
                                        />
                                      </div>
                                      <Typography
                                        variant="h6"
                                        className="font-semibold tracking-wide"
                                        style={{
                                          color: text("#1f2937", "#f3f4f6"),
                                        }}
                                      >
                                        {get(item, "entryPointName") ||
                                          "Название точки не указано"}
                                      </Typography>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                      <Button
                                        onClick={() => {
                                          setConnectScheduleModal(true);
                                          setSelectEntrypointId(
                                            get(item, "entryPointId"),
                                          );
                                        }}
                                        sx={{
                                          width: "40px",
                                          height: "38px",
                                          minWidth: "40px",
                                          background: isDark
                                            ? "#7c2d12"
                                            : "#F0D8C8",
                                          color: isDark ? "#fb923c" : "#FF6200",
                                          borderRadius: "10px",
                                          "&:hover": {
                                            background: isDark
                                              ? "#9a3412"
                                              : "#F0B28B",
                                            transform: "scale(1.05)",
                                          },
                                          transition: "all 0.2s",
                                        }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </Button>
                                      <Link
                                        href={`/dashboard/access-points/${
                                          get(item, "entryPointId") || ""
                                        }`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                                        style={{
                                          backgroundColor: isDark
                                            ? "#1e3a8a"
                                            : "#ffffff",
                                          color: isDark ? "#93c5fd" : "#3B82F6",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            isDark ? "#1e40af" : "#b9d6fa";
                                          e.currentTarget.style.color =
                                            "#ffffff";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            isDark ? "#1e3a8a" : "#ffffff";
                                          e.currentTarget.style.color = isDark
                                            ? "#93c5fd"
                                            : "#3B82F6";
                                        }}
                                      >
                                        Перейти к точке
                                        <ArrowForwardIcon
                                          sx={{ fontSize: 16 }}
                                        />
                                      </Link>
                                    </div>
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5">
                                  <div
                                    className="border rounded-lg p-4 transition-colors duration-200"
                                    style={{
                                      borderColor: isDark
                                        ? "rgba(59, 130, 246, 0.3)"
                                        : "rgba(59, 130, 246, 0.2)",
                                      backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        isDark
                                          ? "rgba(59, 130, 246, 0.1)"
                                          : "rgba(223, 237, 254, 0.8)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <div className="space-y-4">
                                      {/* Unit Information */}
                                      <div className="flex items-start gap-3">
                                        <div className="bg-[#3B82F6] p-2 rounded-lg mt-1">
                                          <BusinessIcon
                                            className="text-white"
                                            sx={{ fontSize: 16 }}
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className="text-xs font-semibold uppercase tracking-wider mb-1"
                                            style={{
                                              color: isDark
                                                ? "#93c5fd"
                                                : "#3B82F6",
                                            }}
                                          >
                                            Подразделение
                                          </p>
                                          <p
                                            className="text-[15px] font-bold"
                                            style={{
                                              color: text("#1f2937", "#f3f4f6"),
                                            }}
                                          >
                                            {get(item, "unitCodeName") ||
                                              "Подразделение не указано"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Divider */}
                                      <div
                                        className="border-t"
                                        style={{
                                          borderColor: isDark
                                            ? "rgba(59, 130, 246, 0.3)"
                                            : "rgba(59, 130, 246, 0.2)",
                                        }}
                                      ></div>

                                      {/* Schedule Information */}
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3 flex-1">
                                          <div className="bg-[#3B82F6] p-2 rounded-lg mt-1">
                                            <CalendarMonthIcon
                                              className="text-white"
                                              sx={{ fontSize: 16 }}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <p
                                              className="text-xs font-semibold uppercase tracking-wider mb-1"
                                              style={{
                                                color: isDark
                                                  ? "#93c5fd"
                                                  : "#3B82F6",
                                              }}
                                            >
                                              Расписание
                                            </p>
                                            <p
                                              className="text-[15px] font-bold"
                                              style={{
                                                color: text(
                                                  "#1f2937",
                                                  "#f3f4f6",
                                                ),
                                              }}
                                            >
                                              {get(item, "scheduleName") ||
                                                "Расписание не указано"}
                                            </p>
                                          </div>
                                        </div>
                                        <Link
                                          href={`/dashboard/schedule/${
                                            get(item, "scheduleId") || ""
                                          }`}
                                          className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 border ml-2 whitespace-nowrap"
                                          style={{
                                            color: isDark
                                              ? "#93c5fd"
                                              : "#3B82F6",
                                            backgroundColor: isDark
                                              ? "#1e1e1e"
                                              : "#ffffff",
                                            borderColor: isDark
                                              ? "rgba(59, 130, 246, 0.5)"
                                              : "rgba(59, 130, 246, 0.3)",
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                              isDark ? "#1e3a8a" : "#DFEDFE";
                                            e.currentTarget.style.color = isDark
                                              ? "#dbeafe"
                                              : "#2563EB";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                              isDark ? "#1e1e1e" : "#ffffff";
                                            e.currentTarget.style.color = isDark
                                              ? "#93c5fd"
                                              : "#3B82F6";
                                          }}
                                        >
                                          Подробнее
                                          <ChevronRightIcon
                                            sx={{ fontSize: 16 }}
                                          />
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div
                              className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed"
                              style={{
                                background: isDark
                                  ? "linear-gradient(to bottom right, #1e1e1e, #2a2a2a)"
                                  : "linear-gradient(to bottom right, #f9fafb, #f3f4f6)",
                                borderColor: isDark ? "#4b5563" : "#d1d5db",
                              }}
                            >
                              <div
                                className="p-4 rounded-full mb-4"
                                style={{
                                  backgroundColor: isDark
                                    ? "#374151"
                                    : "#e5e7eb",
                                }}
                              >
                                <InboxIcon
                                  style={{
                                    color: isDark ? "#6b7280" : "#9ca3af",
                                  }}
                                  sx={{ fontSize: 48 }}
                                />
                              </div>
                              <p
                                className="font-semibold text-lg mb-1"
                                style={{ color: text("#4b5563", "#9ca3af") }}
                              >
                                Нет данных
                              </p>
                              <p
                                className="text-sm"
                                style={{ color: text("#9ca3af", "#6b7280") }}
                              >
                                Обычные расписания не найдены
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Job Trip Schedules Section */}
                      <div className="space-y-[16px] mt-8">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="bg-[#10B981] p-2 rounded-lg">
                              <FlightTakeoffIcon
                                className="text-white"
                                sx={{ fontSize: 20 }}
                              />
                            </div>
                            <Typography
                              variant="h6"
                              className="font-semibold"
                              style={{ color: text("#1f2937", "#f3f4f6") }}
                            >
                              Командировки
                            </Typography>
                          </div>
                          <EmployeeBusinessTripSection
                            employeeUuid={employee_id} // Pass the current employee UUID
                            isDark={isDark}
                            text={text}
                            schedules={get(entrypointSchedules, "data", [])} // Pass available schedules
                          />
                        </div>

                        {get(
                          ScheduleAndEntrypointOfEmployee,
                          "data.jobTripSchedules",
                          [],
                        ).length > 0 ? (
                          <div className="grid grid-cols-2 gap-4">
                            {get(
                              ScheduleAndEntrypointOfEmployee,
                              "data.jobTripSchedules",
                              [],
                            ).map((item, index) => (
                              <div
                                key={index}
                                className="col-span-1 border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                style={{
                                  background: isDark
                                    ? "linear-gradient(to bottom right, #1e1e1e, #064e3b)"
                                    : "linear-gradient(to bottom right, #ffffff, #ecfdf5)",
                                  borderColor: isDark ? "#16a34a" : "#a7f3d0",
                                }}
                              >
                                {/* Header Section */}
                                <div
                                  className="px-5 py-4"
                                  style={{
                                    backgroundColor: isDark
                                      ? "#065f46"
                                      : "#D1FAE5",
                                  }}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-[#10B981] backdrop-blur-sm p-2 rounded-lg">
                                        <LocationOnIcon
                                          className="text-white"
                                          sx={{ fontSize: 20 }}
                                        />
                                      </div>
                                      <Typography
                                        variant="h6"
                                        className="font-semibold tracking-wide"
                                        style={{
                                          color: text("#1f2937", "#f3f4f6"),
                                        }}
                                      >
                                        {get(item, "entryPointName") ||
                                          "Название точки не указано"}
                                      </Typography>
                                    </div>

                                    <div className="flex gap-2 items-center">
                                      <Link
                                        href={`/dashboard/access-points/${
                                          get(item, "entryPointId") || ""
                                        }`}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                                        style={{
                                          backgroundColor: isDark
                                            ? "#065f46"
                                            : "#ffffff",
                                          color: isDark ? "#6ee7b7" : "#10B981",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            isDark ? "#047857" : "#A7F3D0";
                                          e.currentTarget.style.color =
                                            "#ffffff";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor =
                                            isDark ? "#065f46" : "#ffffff";
                                          e.currentTarget.style.color = isDark
                                            ? "#6ee7b7"
                                            : "#10B981";
                                        }}
                                      >
                                        Перейти к точке
                                        <ArrowForwardIcon
                                          sx={{ fontSize: 16 }}
                                        />
                                      </Link>

                                      <Button
                                        onClick={() => {
                                          setDeleteJobTripModal(true);
                                          setSelectedJobTrip(
                                            get(item, "jobTripId"),
                                          );
                                        }}
                                        sx={{
                                          width: "32px",
                                          height: "32px",
                                          minWidth: "32px",
                                          background: isDark
                                            ? "#7f1d1d"
                                            : "#FCD8D3",
                                          color: isDark ? "#fca5a5" : "#FF1E00",
                                          "&:hover": {
                                            background: isDark
                                              ? "#991b1b"
                                              : "#FCA89D",
                                          },
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-5">
                                  <div
                                    className="border rounded-lg p-4 transition-colors duration-200"
                                    style={{
                                      borderColor: isDark
                                        ? "rgba(16, 185, 129, 0.3)"
                                        : "rgba(16, 185, 129, 0.2)",
                                      backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        isDark
                                          ? "rgba(16, 185, 129, 0.1)"
                                          : "rgba(209, 250, 229, 0.8)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-center">
                                        {/* Order Number */}
                                        <div className="flex items-start gap-3">
                                          <div className="bg-[#10B981] p-2 rounded-lg mt-1">
                                            <DescriptionIcon
                                              className="text-white"
                                              sx={{ fontSize: 16 }}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <p
                                              className="text-xs font-semibold uppercase tracking-wider mb-1"
                                              style={{
                                                color: isDark
                                                  ? "#6ee7b7"
                                                  : "#10B981",
                                              }}
                                            >
                                              Номер приказа
                                            </p>
                                            <p
                                              className="text-[15px] font-bold"
                                              style={{
                                                color: text(
                                                  "#1f2937",
                                                  "#f3f4f6",
                                                ),
                                              }}
                                            >
                                              {get(item, "numOrder") ||
                                                "Номер приказа не указан"}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Date Range */}
                                        <div className="flex items-start gap-3">
                                          <div className="bg-[#10B981] p-2 rounded-lg mt-1">
                                            <DateRangeIcon
                                              className="text-white"
                                              sx={{ fontSize: 16 }}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <p
                                              className="text-xs font-semibold uppercase tracking-wider mb-1"
                                              style={{
                                                color: isDark
                                                  ? "#6ee7b7"
                                                  : "#10B981",
                                              }}
                                            >
                                              Период командировки
                                            </p>
                                            <p
                                              className="text-[15px] font-bold"
                                              style={{
                                                color: text(
                                                  "#1f2937",
                                                  "#f3f4f6",
                                                ),
                                              }}
                                            >
                                              {get(item, "startDate") &&
                                              get(item, "endDate")
                                                ? `${new Date(
                                                    get(item, "startDate"),
                                                  ).toLocaleDateString(
                                                    "ru-RU",
                                                  )} - ${new Date(
                                                    get(item, "endDate"),
                                                  ).toLocaleDateString(
                                                    "ru-RU",
                                                  )}`
                                                : "Период не указан"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Divider */}
                                      <div
                                        className="border-t"
                                        style={{
                                          borderColor: isDark
                                            ? "rgba(16, 185, 129, 0.3)"
                                            : "rgba(16, 185, 129, 0.2)",
                                        }}
                                      ></div>

                                      {/* Unit Information */}
                                      <div className="flex items-start gap-3">
                                        <div className="bg-[#10B981] p-2 rounded-lg mt-1">
                                          <BusinessIcon
                                            className="text-white"
                                            sx={{ fontSize: 16 }}
                                          />
                                        </div>
                                        <div className="flex-1">
                                          <p
                                            className="text-xs font-semibold uppercase tracking-wider mb-1"
                                            style={{
                                              color: isDark
                                                ? "#6ee7b7"
                                                : "#10B981",
                                            }}
                                          >
                                            Подразделение
                                          </p>
                                          <p
                                            className="text-[15px] font-bold"
                                            style={{
                                              color: text("#1f2937", "#f3f4f6"),
                                            }}
                                          >
                                            {get(item, "unitCodeName") ||
                                              "Подразделение не указано"}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Divider */}
                                      <div
                                        className="border-t"
                                        style={{
                                          borderColor: isDark
                                            ? "rgba(16, 185, 129, 0.3)"
                                            : "rgba(16, 185, 129, 0.2)",
                                        }}
                                      ></div>

                                      {/* Schedule Information */}
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3 flex-1">
                                          <div className="bg-[#10B981] p-2 rounded-lg mt-1">
                                            <CalendarMonthIcon
                                              className="text-white"
                                              sx={{ fontSize: 16 }}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <p
                                              className="text-xs font-semibold uppercase tracking-wider mb-1"
                                              style={{
                                                color: isDark
                                                  ? "#6ee7b7"
                                                  : "#10B981",
                                              }}
                                            >
                                              Расписание
                                            </p>
                                            <p
                                              className="text-[15px] font-bold"
                                              style={{
                                                color: text(
                                                  "#1f2937",
                                                  "#f3f4f6",
                                                ),
                                              }}
                                            >
                                              {get(item, "scheduleName") ||
                                                "Расписание не указано"}
                                            </p>
                                          </div>
                                        </div>
                                        <Link
                                          href={`/dashboard/schedule/${
                                            get(item, "scheduleId") || ""
                                          }`}
                                          className="flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200 border ml-2 whitespace-nowrap"
                                          style={{
                                            color: isDark
                                              ? "#6ee7b7"
                                              : "#10B981",
                                            backgroundColor: isDark
                                              ? "#1e1e1e"
                                              : "#ffffff",
                                            borderColor: isDark
                                              ? "rgba(16, 185, 129, 0.5)"
                                              : "rgba(16, 185, 129, 0.3)",
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                              isDark ? "#065f46" : "#D1FAE5";
                                            e.currentTarget.style.color = isDark
                                              ? "#a7f3d0"
                                              : "#059669";
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor =
                                              isDark ? "#1e1e1e" : "#ffffff";
                                            e.currentTarget.style.color = isDark
                                              ? "#6ee7b7"
                                              : "#10B981";
                                          }}
                                        >
                                          Подробнее
                                          <ChevronRightIcon
                                            sx={{ fontSize: 16 }}
                                          />
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed"
                            style={{
                              background: isDark
                                ? "linear-gradient(to bottom right, #1e1e1e, #2a2a2a)"
                                : "linear-gradient(to bottom right, #f9fafb, #f3f4f6)",
                              borderColor: isDark ? "#4b5563" : "#d1d5db",
                            }}
                          >
                            <div
                              className="p-4 rounded-full mb-4"
                              style={{
                                backgroundColor: isDark ? "#374151" : "#e5e7eb",
                              }}
                            >
                              <InboxIcon
                                style={{
                                  color: isDark ? "#6b7280" : "#9ca3af",
                                }}
                                sx={{ fontSize: 48 }}
                              />
                            </div>
                            <p
                              className="font-semibold text-lg mb-1"
                              style={{ color: text("#4b5563", "#9ca3af") }}
                            >
                              Нет данных
                            </p>
                            <p
                              className="text-sm"
                              style={{ color: text("#9ca3af", "#6b7280") }}
                            >
                              Командировки не найдены
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

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
          name={`${get(employeePhoto, "data.first_name")} ${get(
            employeePhoto,
            "data.last_name",
          )} ${get(employeePhoto, "data.middle_name")}`}
        />
      </div>

      {/* Connect Schedule Modal */}
      {connectScheduleModal && (
        <MethodModal
          open={connectScheduleModal}
          closeClick={() => {
            setConnectScheduleModal(false);
            setSelectEntrypointId(null);
          }}
          showCloseIcon={true}
          title={"Подключить расписание к сотруднику"}
        >
          <div className="space-y-4 my-[15px]">
            <CustomSelect
              label="Выберите расписание"
              options={scheduleOptions}
              value={selectedSchedule}
              placeholder="Выберите расписание"
              onChange={(val) => {
                setSelectedSchedule(val);
              }}
              returnObject={false}
            />

            {selectedSchedule && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                <p className="text-sm text-blue-800">
                  Выбранное расписание будет подключено к этому сотруднику для
                  выбранной точки доступа.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <PrimaryButton
              onClick={() => setConnectScheduleModal(false)}
              backgroundColor="#EDEDF2"
              color="black"
            >
              Отмена
            </PrimaryButton>
            <PrimaryButton
              onClick={handleConnectSchedule}
              disabled={!selectedSchedule}
            >
              Подключить
            </PrimaryButton>
          </div>
        </MethodModal>
      )}

      {/* edit modal */}
      {editModal && (
        <MethodModal open={editModal} width={1000} padding={0}>
          <div
            className={`${
              isDark ? "bg-orange-700" : "bg-[#E57F3A]"
            } p-[16px] text-white rounded-t-[8px] flex justify-between items-center`}
          >
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

          <div className={`max-h-[500px] overflow-y-scroll ${bg}`}>
            <div className="text-center my-[30px]">
              <div className="inline-block">
                <div
                  className={`w-32 h-32 mx-auto ${
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  } rounded-full border-4 border-dashed ${
                    isDark ? "border-gray-600" : "border-gray-300"
                  } flex items-center justify-center overflow-hidden`}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Employee"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span
                      className={`${
                        isDark ? "text-gray-400" : "text-gray-400"
                      } text-sm`}
                    >
                      No Photo
                    </span>
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
                    <div className={`${bg} p-4 rounded-lg shadow-lg`}>
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

            {/* Personal Information */}
            <div
              className={`${
                isDark ? "bg-gray-800/50" : "bg-gray-50"
              } rounded-xl p-6 m-[20px]`}
            >
              <h3
                className={`text-lg font-semibold ${text} mb-4 flex items-center`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}
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
                  inputClass={`!h-[45px] `}
                  required
                />

                <Input
                  label={"Фамилия сотрудника"}
                  name="last_name"
                  value={formData.last_name || ""}
                  onChange={handleChange}
                  placeholder="Фамилия"
                  inputClass={`!h-[45px]`}
                  required={true}
                />
                <Input
                  label={"Отчество сотрудника"}
                  name="middle_name"
                  value={formData.middle_name || ""}
                  onChange={handleChange}
                  placeholder="Отчество"
                  inputClass={`!h-[45px]`}
                />

                <BirthDateInput
                  value={formData.date_of_birth || ""}
                  onChange={handleChange}
                  inputClass={`!h-[45px]`}
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
                  inputClass={`!h-[45px]`}
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
                  inputClass={`!h-[45px]`}
                  required={true}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div
              className={`${
                isDark ? "bg-green-900/30" : "bg-green-50"
              } rounded-xl p-6 m-[20px]`}
            >
              <h3
                className={`text-lg font-semibold ${text} mb-4 flex items-center`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
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
                  inputClass={`!h-[45px]`}
                  classNames="col-span-2 md:col-span-1"
                />

                <PhoneInputUz
                  label={"Телефон номер сотрудника"}
                  name="phone_number"
                  value={formData.phone_number || ""}
                  onChange={handleChange}
                  placeholder="Телефонный номер"
                  inputClass={`!h-[45px]`}
                  classNames="col-span-2 md:col-span-1"
                />
              </div>
            </div>

            {/* Education Information */}
            <div
              className={`${
                isDark ? "bg-purple-900/30" : "bg-purple-50"
              } rounded-xl p-6 m-[20px]`}
            >
              <h3
                className={`text-lg font-semibold ${text} mb-4 flex items-center`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${
                    isDark ? "text-purple-400" : "text-purple-600"
                  }`}
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
                  value={formData.education_degree || ""}
                  label="Степень образования"
                  placeholder="Выберите уровень образования"
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      education_degree: val,
                    }))
                  }
                  required
                  returnObject={false}
                />

                <Input
                  name="education_place"
                  value={formData.education_place || ""}
                  onChange={handleChange}
                  placeholder={"Введите"}
                  label="Место получения образования"
                  inputClass={`!h-[45px]`}
                  required={true}
                />
              </div>
            </div>

            {/* Employment Information */}
            <div
              className={`${
                isDark ? "bg-orange-900/30" : "bg-orange-50"
              } rounded-xl p-6 m-[20px]`}
            >
              <h3
                className={`text-lg font-semibold ${text} mb-4 flex items-center`}
              >
                <svg
                  className={`w-5 h-5 mr-2 ${
                    isDark ? "text-orange-400" : "text-orange-600"
                  }`}
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
                  returnObject={false}
                />
                <Input
                  name="hire_date"
                  type="date"
                  label={"Дата приема на работу"}
                  value={formData.hire_date || ""}
                  onChange={handleChange}
                  inputClass={`!h-[45px]`}
                  required
                />
              </div>
            </div>
          </div>

          <div
            className={`sticky ${bg} border-t ${border} p-4 flex justify-end gap-3`}
          >
            <button
              onClick={() => setEditModal(false)}
              className={`px-4 py-2 ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } rounded-lg text-sm font-medium ${text}`}
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

      <DeleteModal
        open={deleteJobTripModal}
        onClose={() => setDeleteJobTripModal(false)}
        deleting={() => {
          submitDeleteJobTrip();
          setDeleteJobTripModal(false);
          setSelectedJobTrip(null);
        }}
        title="Вы уверены, что хотите удалить эту назначенную командировку"
      />
    </DashboardLayout>
  );
};

export default Index;
