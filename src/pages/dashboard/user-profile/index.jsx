import Input from "@/components/input";
import ContentLoader from "@/components/loader";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import useAppTheme from "@/hooks/useAppTheme";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { Button } from "@mui/material";
import { get } from "lodash";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

const Index = () => {
  const { data: session } = useSession();
  const { bg, isDark, text, border } = useAppTheme();
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: userProfile,
    isLoading,
    isFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.userProfile,
    url: URLS.me,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
  });

  const { data: employee } = useGetPythonQuery({
    key: KEYS.employeePhoto,
    url: `${URLS.employees}${get(userProfile, "data.employee_id")}`,
    enabled: !!session?.accessToken && !!get(userProfile, "data.employee_id"),
  });

  const employeeData = get(employee, "data", {});
  const profileData = get(userProfile, "data", {});

  const fullName = `${employeeData.last_name || ""} ${
    employeeData.first_name || ""
  } ${employeeData.middle_name || ""}`.trim();
  const email = employeeData.email || profileData.username || "";
  const phoneNumber = employeeData.phone_number
    ? `+998 ${employeeData.phone_number}`
    : "";

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const InfoRow = ({ label, value }) => (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <p className="text-sm text-[#808080] mb-1">{label}</p>
      <p className="text-base text-[#1A1A1A] font-medium">{value || "-"}</p>
    </div>
  );

  if (isLoading || isFetching) {
    return (
      <DashboardLayout headerTitle={"Профиль пользователя"}>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Профиль пользователя"}>
      {/* Profile Header Card */}
      <div className="bg-white rounded-lg overflow-hidden my-5 shadow-sm">
        <div className="w-full bg-blue-300 h-[80px] rounded-t-lg"></div>
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/images/profile-default.jpg"
                alt="User Avatar"
                width={100}
                height={100}
                className="rounded-full"
              />
              {employeeData.is_active && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">
                {fullName || "Пользователь"}
              </h2>
              <p className="text-[#808080] mt-1">{email}</p>
              <div className="flex items-center gap-3 mt-2">
                {profileData.name && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                    {profileData.name}
                  </span>
                )}
                {employeeData.tabel_number && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    Табель: {employeeData.tabel_number}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-12 gap-5 mb-8">
        {/* Personal Information */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Личная информация
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label={"Фамилия"}
                placeholder={"Фамилия"}
                defaultValue={employeeData.last_name}
                inputClass={
                  "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Имя"}
                placeholder={"Имя"}
                defaultValue={employeeData.first_name}
                inputClass={
                  "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Отчество"}
                placeholder={"Отчество"}
                defaultValue={employeeData.middle_name}
                inputClass={
                  "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
            </div>
          ) : (
            <div>
              <InfoRow label="Фамилия" value={employeeData.last_name} />
              <InfoRow label="Имя" value={employeeData.first_name} />
              <InfoRow label="Отчество" value={employeeData.middle_name} />
              <InfoRow
                label="Дата рождения"
                value={
                  employeeData.date_of_birth
                    ? new Date(employeeData.date_of_birth).toLocaleDateString(
                        "ru-RU"
                      )
                    : null
                }
              />
              <InfoRow label="Пол" value={employeeData.gender} />
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Контактная информация
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label={"Email адрес"}
                placeholder={"Email"}
                defaultValue={employeeData.email}
                inputClass={
                  "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Номер телефона"}
                placeholder={"+998"}
                defaultValue={phoneNumber}
                inputClass={
                  "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Адрес"}
                placeholder={"Адрес"}
                defaultValue={employeeData.address}
                inputClass={
                  "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
            </div>
          ) : (
            <div>
              <InfoRow label="Email" value={employeeData.email} />
              <InfoRow label="Номер телефона" value={phoneNumber} />
              <InfoRow label="Адрес" value={employeeData.address} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
