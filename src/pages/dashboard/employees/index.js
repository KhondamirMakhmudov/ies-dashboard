import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useState } from "react";
import Input from "@/components/input";
import { Typography } from "@mui/material";
import ImageUploader from "@/components/image-uploader";
import CustomSelect from "@/components/select";
import MethodModal from "@/components/modal/method-modal";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { config } from "@/config";
import { genderOptions } from "@/constants/static-data";
import { educationLevelOptions } from "@/constants/static-data";
import { razryadOptions } from "@/constants/static-data";
import { get, isEmpty } from "lodash";
import PhoneInputUz from "@/components/input/phone-input";
import toast from "react-hot-toast";
import CustomTable from "@/components/table";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import ContentLoader from "@/components/loader";
import BirthDateInput from "@/components/input/birthdate-input";
import NoData from "@/components/no-data";
import ExcelButton from "@/components/button/excel-button";
import Breadcrumb from "@/components/breadcrumb";
import { exportToExcel } from "@/utils/exportToExcelStyled";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import PrimaryButton from "@/components/button/primary-button";
import Link from "next/link";
const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [level1Id, setLevel1Id] = useState(null); // Birinchi select (organizational unit)
  const [selectUnitCode, setSelectUnitCode] = useState(null); // Tanlangan unit_code
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
    params: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    },
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

  const steps = [
    "Asosiy ma'lumotlar",
    "Qo‘shimcha ma'lumotlar",
    "Rasm va yakun",
  ];

  const columns = [
    {
      header: "№",
      cell: ({ row }) => {
        return (currentPage - 1) * pageSize + (row.index + 1);
      },
    },
    {
      accessorKey: "last_name",
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
      accessorKey: "tabel_number",
      header: "Табельный номер",
      cell: ({ row }) => {
        return (
          <span className="font-medium">№{row?.original?.tabel_number}</span>
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
            {row?.original?.hire_date
              ? dayjs(row.original.hire_date).format("DD.MM.YYYY")
              : "Дата приема не указана"}
          </span>
        );
      },
    },

    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="my-2">
          <Link
            href={`employees/${row.original.id}`}
            className="bg-[#EDEDF2] font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-gray-400 transition-all duration-200"
          >
            Подробнее
          </Link>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const fetchAllEmployeesForExport = async () => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}?limit=10000`
      );
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching all employees:", error);
      toast.error("Ошибка при загрузке данных для экспорта");
      return [];
    }
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
      <div className="bg-white p-[15px] mt-[10px] rounded-md border border-[#E9E9E9]">
        <Breadcrumb
          paths={[
            {
              label: "Сотрудники",
              href: "/dashboard/employees",
              isCurrent: true,
            },
          ]}
        />
      </div>
      <div className="bg-white p-[15px] mt-[10px] rounded-md border border-[#E9E9E9]">
        <div className="col-span-12 flex justify-between items-center ">
          <Typography variant="h6" fontWeight={"600"}>
            Просмотр и управление сотрудниками
          </Typography>

          <div className="flex gap-2 items-center">
            <ExcelButton
              onClick={async () => {
                const loadingToast = toast.loading("Загрузка данных...");

                const allEmployees = await fetchAllEmployeesForExport();

                toast.dismiss(loadingToast);

                if (allEmployees.length > 0) {
                  exportToExcel(allEmployees);
                  toast.success(
                    `Экспортировано ${allEmployees.length} сотрудников`
                  );
                } else {
                  toast.error("Нет данных для экспорта");
                }
              }}
            />

            <PrimaryButton onClick={() => setOpen(true)}>
              Добавить
            </PrimaryButton>
          </div>
        </div>
      </div>
      {isEmpty(get(employee, "data.data", [])) ? (
        <NoData onCreate={() => setOpen(true)} />
      ) : (
        <div className="bg-white p-[12px] mt-[5px] mb-[50px] rounded-md border border-[#E9E9E9]">
          <div className="grid grid-cols-12 gap-[12px] p-2">
            <div className="col-span-12 ">
              <CustomTable
                data={get(employee, "data.data", [])}
                columns={columns}
                pagination={{
                  currentPage,
                  pageSize: pageSize,
                  total: get(employee, "data.count", 0), // 👈 bu umumiy son (backenddan kelmasa qo‘lda berish kerak)
                  onPaginationChange: ({ page }) => setCurrentPage(page),
                }}
              />
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
              <div className="text-[16px] font-semibold text-blue-800 mb-4 items-center flex gap-1">
                <ReportGmailerrorredIcon />
                <h2>Требования к фотографии</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <span className="font-medium text-blue-800">
                      Размер файла:
                    </span>
                    <span className="text-blue-700"> Максимум 10МБ</span>
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
            <PrimaryButton
              onClick={handlePrev}
              backgroundColor="#EDEDF2"
              color="black"
            >
              Назад
            </PrimaryButton>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <PrimaryButton onClick={handleNext}>Вперёд</PrimaryButton>
          ) : (
            <PrimaryButton onClick={onSubmitCreateEmployee}>
              Закончить
            </PrimaryButton>
          )}
        </div>
      </MethodModal>
    </DashboardLayout>
  );
};

export default Index;
