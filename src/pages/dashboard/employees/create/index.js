import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useState } from "react";
import { config } from "@/config";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import useGetPythonQuery from "@/hooks/python/useGetQuery";

const Index = () => {
  const queryClient = useQueryClient();
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

  // postda datalarga bosqichma bosqich o'tish uchun buttonlar
  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    "Asosiy ma'lumotlar",
    "Qo‘shimcha ma'lumotlar",
    "Rasm va yakun",
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
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // server validation error
        if (result?.detail && typeof result.detail === "object") {
          setErrors(result.detail);
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
      </div>
    </DashboardLayout>
  );
};

export default Index;
