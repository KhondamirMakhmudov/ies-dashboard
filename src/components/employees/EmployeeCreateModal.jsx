import Input from "@/components/input";
import ImageUploader from "@/components/image-uploader";
import CustomSelect from "@/components/select";
import MethodModal from "@/components/modal/method-modal";
import PhoneInputUz from "@/components/input/phone-input";
import BirthDateInput from "@/components/input/birthdate-input";
import PrimaryButton from "@/components/button/primary-button";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import { get } from "lodash";
import {
  genderOptions,
  educationLevelOptions,
  razryadOptions,
} from "@/constants/static-data";

const EmployeeCreateModal = ({
  open,
  setOpen,
  step,
  setStep,
  isDark,
  formData,
  setFormData,
  errors,
  setErrors,
  handleChange,
  handlePhotoChange,
  onSubmitCreateEmployee,
  level1List,
  workplaceData,
  isLoadingWorkplace,
  level1Id,
  setLevel1Id,
  setSelectUnitCode,
  resetForm,
}) => {
  const steps = [
    "Основная информация",
    "Дополнительная информация",
    "Фото и завершение",
  ];

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <MethodModal
      open={open}
      closeClick={() => {
        setOpen(false);
        setStep(1);
        resetForm();
      }}
      title={"Добавить нового сотрудника"}
      showCloseIcon={true}
    >
      <div className="flex items-center justify-between my-6">
        {steps.map((_, index) => {
          const current = index + 1;
          const isActive = step === current;
          const isCompleted = step > current;

          return (
            <div
              key={index}
              className="flex items-center w-full cursor-pointer"
              onClick={() => setStep(current)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[15px] font-bold transition-colors
                  ${
                    isActive
                      ? "bg-blue-600"
                      : isCompleted
                        ? "bg-green-500 hover:bg-green-600"
                        : `${
                            isDark
                              ? "bg-gray-600 hover:bg-gray-500"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`
                  }`}
              >
                {current}
              </div>

              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] ${
                    isDark ? "bg-gray-600" : "bg-gray-300"
                  } mx-2 relative`}
                >
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

      {step === 1 && (
        <div className="space-y-3">
          <Input
            label={"Имя сотрудника"}
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="Имя"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.first_name}
          />
          <Input
            label={"Фамилия сотрудника"}
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Фамилия"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.last_name}
          />
          <Input
            label={"Отчество сотрудника"}
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            placeholder="Отчество"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
          />

          <Input
            label={"Электронная почта"}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Электронная почта"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.email}
          />
          <PhoneInputUz
            label={"Телефон номер сотрудника"}
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Телефонный номер"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.phone_number}
          />

          <div className="flex gap-2">
            <BirthDateInput
              value={formData.date_of_birth}
              onChange={handleChange}
              error={errors.date_of_birth}
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
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
              returnObject={false}
            />
          </div>

          <Input
            name="address"
            value={formData.address}
            label={"Адрес проживания"}
            onChange={handleChange}
            placeholder="Введите адрес"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.address}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <CustomSelect
            options={educationLevelOptions}
            value={formData.education_degree}
            label="Степень образования"
            placeholder="Выберите уровень образования"
            onChange={(val) =>
              setFormData((prev) => ({
                ...prev,
                education_degree: val,
              }))
            }
            returnObject={false}
            error={errors.education_degree}
          />

          <Input
            name="education_place"
            value={formData.education_place}
            onChange={handleChange}
            placeholder={"Введите"}
            label="Место получения образования"
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.education_place}
          />
          <div className="flex gap-2 ">
            <Input
              name="tabel_number"
              label={"Табельный номер"}
              value={formData.tabel_number}
              onChange={handleChange}
              placeholder="Введите"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
              error={errors.tabel_number}
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
              returnObject={false}
            />
          </div>
          <Input
            name="hire_date"
            type="date"
            label={"Дата приема на работу"}
            value={formData.hire_date}
            onChange={handleChange}
            inputClass={`!h-[45px] border ${
              isDark ? "!border-gray-800" : "!border-gray-300"
            }`}
            error={errors.hire_date}
          />

          <CustomSelect
            label={"Выберите организационную единицу"}
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
            onChange={(val) => {
              setFormData((prev) => ({
                ...prev,
                workplace_id: val,
              }));
              setErrors((prev) => ({
                ...prev,
                workplace_id: undefined,
              }));
            }}
            isLoading={isLoadingWorkplace}
            returnObject={false}
            error={errors.workplace_id}
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <div
            className={`${
              isDark
                ? "bg-blue-900/30 border-blue-500"
                : "bg-blue-50 border-blue-400"
            } border-l-4 p-3 mb-8 rounded-r-lg`}
          >
            <div
              className={`text-[16px] font-semibold ${
                isDark ? "text-blue-300" : "text-blue-800"
              } mb-4 items-center flex gap-1`}
            >
              <ReportGmailerrorredIcon />
              <h2>Требования к фотографии</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div
                  className={`w-2 h-2 ${
                    isDark ? "bg-blue-500" : "bg-blue-400"
                  } rounded-full mt-2 mr-3 flex-shrink-0`}
                ></div>
                <div>
                  <span
                    className={`font-medium ${
                      isDark ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    Размер файла:
                  </span>
                  <span className={isDark ? "text-blue-200" : "text-blue-700"}>
                    {" "}
                    Максимум 10МБ
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <div
                  className={`w-2 h-2 ${
                    isDark ? "bg-blue-500" : "bg-blue-400"
                  } rounded-full mt-2 mr-3 flex-shrink-0`}
                ></div>
                <div>
                  <span
                    className={`font-medium ${
                      isDark ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    Положение лица:
                  </span>
                  <span className={isDark ? "text-blue-200" : "text-blue-700"}>
                    {" "}
                    Ваше лицо должно быть в центре фотографии
                  </span>
                </div>
              </div>
              <div className="flex items-start">
                <div
                  className={`w-2 h-2 ${
                    isDark ? "bg-blue-500" : "bg-blue-400"
                  } rounded-full mt-2 mr-3 flex-shrink-0`}
                ></div>
                <div>
                  <span
                    className={`font-medium ${
                      isDark ? "text-blue-300" : "text-blue-800"
                    }`}
                  >
                    Качество изображения:
                  </span>
                  <span className={isDark ? "text-blue-200" : "text-blue-700"}>
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

      <div className="flex justify-between pt-4">
        {step > 1 ? (
          <PrimaryButton
            onClick={handlePrev}
            backgroundColor={isDark ? "#374151" : "#EDEDF2"}
            color={isDark ? "white" : "black"}
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
  );
};

export default EmployeeCreateModal;
