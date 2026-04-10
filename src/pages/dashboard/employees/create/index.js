import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useState } from "react";
import { config } from "@/config";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import Input from "@/components/input";
import PhoneInputUz from "@/components/input/phone-input";
import BirthDateInput from "@/components/input/birthdate-input";
import CustomSelect from "@/components/select";
import { genderOptions } from "@/constants/static-data";
import PrimaryButton from "@/components/button/primary-button";
import { educationLevelOptions } from "@/constants/static-data";
import { razryadOptions } from "@/constants/static-data";
import { get } from "lodash";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import ImageUploader from "@/components/image-uploader";

const Index = () => {
  const queryClient = useQueryClient();
  const [level1Id, setLevel1Id] = useState(null);
  const [step, setStep] = useState(1);
  const [selectUnitCode, setSelectUnitCode] = useState(null);
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

  // Кнопки для пошагового перемещения по данным
  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    "Основная информация",
    "Дополнительная информация",
    "Фото и завершение",
  ];

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
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403 && result?.detail) {
          toast.error(result.detail);
          return;
        }

        // server validation error
        if (result?.errors && Array.isArray(result.errors)) {
          // Map errors by field name
          const errorMap = {};
          result.errors.forEach((error) => {
            // Translate "Field required" to Russian
            const message =
              error.message === "Field required"
                ? "Обязательное поле"
                : error.message;
            errorMap[error.field] = message;
          });
          setErrors(errorMap);
          setStep(1); // Go back to step 1 to show errors
          toast.error("Пожалуйста, проверьте введённые данные.");
          return;
        }

        if (result?.detail && typeof result.detail === "object") {
          setErrors(result.detail);
          toast.error("Пожалуйста, проверьте введённые данные.");
          return;
        }

        toast.error("Произошла ошибка.");
        return;
      }

      toast.success("Сотрудник успешно создан!");
      setErrors({});
      setStep(1);
      queryClient.invalidateQueries(KEYS.employees);
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка сети.");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePhotoChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
  };

  return (
    <DashboardLayout headerTitle={"Создать сотрудника"}>
      <div className="bg-white p-[15px] mt-[10px] rounded-md border border-[#E9E9E9]">
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
              error={errors.last_name}
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
              error={errors.address}
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
              error={errors.education_degree}
            />

            <Input
              name="education_place"
              value={formData.education_place}
              onChange={handleChange}
              placeholder={"Введите"}
              label="Место получения образования"
              inputClass="!h-[45px] border !border-gray-200"
              required={true}
              error={errors.education_place}
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
              error={errors.workplace_id}
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
      </div>
    </DashboardLayout>
  );
};

export default Index;
