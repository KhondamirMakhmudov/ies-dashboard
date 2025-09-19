import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import { useState } from "react";
import Input from "@/components/input";
import Image from "next/image";
import { Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import ImageUploader from "@/components/image-uploader";
import CustomSelect from "@/components/select";
import MethodModal from "@/components/modal/method-modal";
import usePostPythonQuery from "@/hooks/python/usePostQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { config } from "@/config";
import { get, isEmpty } from "lodash";
import PhoneInputUz from "@/components/input/phone-input";
import toast from "react-hot-toast";
import CustomTable from "@/components/table";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import ContentLoader from "@/components/loader";
import BirthDateInput from "@/components/input/birthdate-input";
import NoData from "@/components/no-data";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExcelButton from "@/components/button/excel-button";

const Index = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [level1Id, setLevel1Id] = useState(null); // Birinchi select (organizational unit)
  const [selectUnitCode, setSelectUnitCode] = useState(null); // Tanlangan unit_code
  const [selectedWorkplace, setSelectedWorkplace] = useState(null); // Workplace tanlovi
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
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

  // employee GET method

  const {
    data: employee,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: KEYS.employees,
    url: URLS.employees,
    params: { limit: 150, offset: 0 },
  });

  // organization units
  const { data: level1List, isLoading: isLoadingLevel1 } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true, limit: 150 },
  });
  // workplace
  const { data: workplaceData, isLoading: isLoadingWorkplace } =
    useGetPythonQuery({
      key: [KEYS.workplace, selectUnitCode],
      url: URLS.workplace,
      params: {
        limit: 150,
        unit_code: selectUnitCode ? +selectUnitCode : undefined,
        is_vacant: true,
      },
      enabled: !!selectUnitCode, // faqat selectUnitCode tanlanganda chaqilsin
    });

  console.log(selectUnitCode, "selectUnitCode");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };
  // employee yaratish POST
  const onSubmitCreateEmployee = async () => {
    try {
      const form = new FormData();
      for (const key in formData) {
        form.append(key, formData[key]);
      }

      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}`,
        {
          method: "POST",
          body: form,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // server validation error
        if (result?.detail && typeof result.detail === "object") {
          setErrors(result.detail); // ✅ errorlarni inputlarga ulash uchun
          toast.error("Iltimos, kiritilgan ma'lumotlarni tekshiring.");
          return;
        }

        toast.error("Xatolik yuz berdi.");
        return;
      }

      toast.success("Xodim muvaffaqiyatli qo'shildi!");
      setErrors({});
      setStep(1);
      queryClient.invalidateQueries(KEYS.employees);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Tarmoqda xatolik yuz berdi.");
    }
  };

  const genderOptions = [
    { value: "мужской", label: "Мужской" },
    { value: "женский", label: "Женский" },
  ];

  const razryadOptions = Array.from({ length: 16 }, (_, i) => {
    const lvl = i + 1;
    return {
      value: lvl,
      label: `${lvl}-разряд`,
    };
  });
  // photoni formdataga qo'shish
  const handlePhotoChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
  };
  // postda datalarga bosqichma bosqich o'tish uchun buttonlar
  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

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

  const steps = [
    "Asosiy ma'lumotlar",
    "Qo‘shimcha ma'lumotlar",
    "Rasm va yakun",
  ];

  const columns = [
    {
      header: "№",
      cell: ({ row }) => row.index + 1,
    },
    {
      header: "Имя сотрудника",
      cell: ({ row }) => {
        const { first_name, last_name } = row.original;
        return (
          <span className="font-medium">
            {last_name} {first_name}
          </span>
        );
      },
    },
    {
      accessorKey: "phone_number",
      header: "Номер телефона",
      cell: ({ row }) => {
        return (
          <span className="font-medium">+998{row?.original?.phone_number}</span>
        );
      },
    },
    {
      accessorKey: "workplace.position.name",
      header: "Должность",
    },
    {
      accessorKey: "hire_date",
      header: "Дата приема на работу",
      cell: ({ row }) => {
        return (
          <span className="font-medium">
            {dayjs(row?.original?.hire_date).format("DD.MM.YYYY")}
          </span>
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <button
          onClick={() => router.push(`employees/${row.original.id}`)}
          className="bg-[#EDEDF2] font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-gray-400 transition-all duration-200"
        >
          Подробнее
        </button>
      ),
      enableSorting: false,
    },
  ];

  const exportToExcel = (data, filename = "employees.xlsx") => {
    if (!data || data.length === 0) {
      alert("Ma'lumot topilmadi");
      return;
    }

    // 1. API dan kelgan obyektlarni oddiy array-of-objects ko‘rinishga o‘tkazamiz
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Workbook yaratamiz
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // 3. Blob qilib olish va yuklab berish
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, filename);
  };

  if (isLoading || isFetching) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Сотрудники"}>
      {isEmpty(get(employee, "data", [])) ? (
        <NoData onCreate={() => setOpen(true)} />
      ) : (
        <div className="bg-white p-[12px] my-[50px] rounded-md border border-[#E9E9E9]">
          <div className="grid grid-cols-12 gap-[12px] p-2">
            <div className="col-span-12 flex justify-between ">
              <Typography variant="h6">
                Просмотр и управление сотрудниками
              </Typography>

              <div className="flex gap-2">
                <ExcelButton
                  onClick={() => exportToExcel(get(employee, "data", []))}
                />

                <Button
                  onClick={() => setOpen(true)}
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
                  <p>Добавить сотрудника</p>
                </Button>
              </div>
            </div>

            <div className="col-span-12 mt-6">
              <CustomTable data={get(employee, "data", [])} columns={columns} />
            </div>
          </div>
        </div>
      )}

      <MethodModal
        open={open}
        closeClick={() => {
          setOpen(false);
          setStep(1);
          setFormData({});
        }}
        showCloseIcon={true}
      >
        <Typography variant="h6" className="text-xl font-bold">
          Добавить нового сотрудника
        </Typography>
        <div className="flex items-center justify-between my-6">
          {steps.map((_, index) => {
            const current = index + 1;
            const isActive = step === current;
            const isCompleted = step > current;

            return (
              <div
                key={index}
                className="flex items-center w-full cursor-pointer"
                onClick={() => setStep(current)} // ✅ stepni update qilish
              >
                {/* Step circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-colors
          ${
            isActive
              ? "bg-blue-600"
              : isCompleted
              ? "bg-green-500 hover:bg-green-600"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
                >
                  {current}
                </div>

                {/* Line (except after the last step) */}
                {index !== steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-gray-300 mx-2 relative">
                    <div
                      className={`absolute top-0 left-0 h-full transition-all ${
                        step > current ? "bg-green-500 w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3">
            <Input
              label={"Имя сотрудника"}
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Имя"
              inputClass="!h-[45px] border !border-gray-200"
              required
              error={errors.first_name}
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

            <Input
              label={"Электронная почта"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Электронная почта"
              inputClass="!h-[45px] border !border-gray-200"
              error={errors.email}
            />
            <PhoneInputUz
              label={"Телефон номер сотрудника"}
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Телефонный номер"
              inputClass="!h-[45px] border !border-gray-200"
              error={errors.phone_number}
            />

            <div className="flex gap-2">
              <BirthDateInput
                value={formData.date_of_birth}
                onChange={handleChange}
                error={errors.date_of_birth}
                inputClass="!h-[45px] border !border-gray-200"
                required
              />

              <CustomSelect
                label={"Пол"}
                options={genderOptions}
                value={formData.gender}
                placeholder="Выберите пол"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: val,
                  }))
                }
                required
                returnObject={false}
              />
            </div>

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
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3">
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
            <div className="flex gap-2 ">
              <Input
                name="tabel_number"
                label={"Табельный номер"}
                value={formData.tabel_number}
                onChange={handleChange}
                placeholder="Введите"
                inputClass="!h-[45px] border !border-gray-200"
                error={errors.tabel_number}
                required
              />

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
                sortOptions={false}
                returnObject={false} // ✅ faqat value qaytaradi
              />
            </div>
            <Input
              name="hire_date"
              type="date"
              label={"Дата приема на работу"}
              value={formData.hire_date}
              onChange={handleChange}
              inputClass="!h-[45px] border !border-gray-200"
              error={errors.hire_date}
              required
            />

            {/* LEVEL 1 */}
            <CustomSelect
              options={get(level1List, "data", []).map((i) => ({
                value: i.unit_code,
                label: i.name,
              }))}
              value={level1Id}
              placeholder="Выберите"
              onChange={(val) => {
                setLevel1Id(val);
                setSelectUnitCode(val);
                setSelectedWorkplace(null);
              }}
              returnObject={false}
            />

            <CustomSelect
              options={get(workplaceData, "data", []).map((w) => ({
                value: w.id,
                label: `${w.organizational_unit.name} - ${w.position.name}`,
              }))}
              value={formData.workplace_id}
              placeholder="Выберите рабочее место"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  workplace_id: val, // faqat value keladi
                }))
              }
              isLoading={isLoadingWorkplace}
              returnObject={false} // ✅ faqat value qaytarish uchun
            />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-8 rounded-r-lg">
              <h2 className="text-[16px] font-semibold text-blue-800 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Требования к фотографии
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Размер файла:
                    </span>
                    <span className="text-blue-700"> Максимум 2МБ</span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Положение лица:
                    </span>
                    <span className="text-blue-700">
                      {" "}
                      Ваше лицо должно быть в центре фотографии
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Качество изображения:
                    </span>
                    <span className="text-blue-700">
                      {" "}
                      Четкое, хорошо освещенное фото с резким фокусом
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-3">
                  <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <div className="text-sm text-green-700 font-medium">
                    Лицо в центре и четкое
                  </div>
                </div>
                <div className="flex items-center justify-center text-green-600">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Хороший пример</span>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-3">
                  <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2 relative overflow-hidden">
                    <svg
                      className="w-8 h-8 text-red-400 absolute top-1 left-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <div className="absolute inset-0 bg-red-200 opacity-50"></div>
                  </div>
                  <div className="text-sm text-red-700 font-medium">
                    Размытое или не в центре
                  </div>
                </div>
                <div className="flex items-center justify-center text-red-600">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Избегайте этого</span>
                </div>
              </div>
            </div> */}
            <div>
              <ImageUploader
                image={formData.photo}
                onFileChange={handlePhotoChange}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <Button
              sx={{ textTransform: "initial" }}
              onClick={handlePrev}
              variant="secondary"
            >
              Назад
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button sx={{ textTransform: "initial" }} onClick={handleNext}>
              Вперёд
            </Button>
          ) : (
            <Button
              sx={{ textTransform: "initial" }}
              onClick={onSubmitCreateEmployee}
            >
              Закончить
            </Button>
          )}
        </div>
      </MethodModal>
    </DashboardLayout>
  );
};

export default Index;
