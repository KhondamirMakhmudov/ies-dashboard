import Input from "@/components/input";
import ContentLoader from "@/components/loader";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";
import useGetGeneralAuthQuery from "@/hooks/general-auth/useGetGeneralAuthQuery";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import useAppTheme from "@/hooks/useAppTheme";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
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
    <div
      className="py-4 border-b last:border-b-0"
      style={{ borderColor: border("#f3f4f6", "#333333") }}
    >
      <p className={`text-sm mb-1 ${text("text-[#808080]", "text-gray-400")}`}>
        {label}
      </p>
      <p
        className={`text-base font-medium ${text(
          "text-[#1A1A1A]",
          "text-gray-100"
        )}`}
      >
        {value || "-"}
      </p>
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
      <div
        className="rounded-lg overflow-hidden my-5 shadow-sm"
        style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
      >
        <div
          className="w-full h-[80px] rounded-t-lg"
          style={{ backgroundColor: isDark ? "#1e40af" : "#93c5fd" }}
        ></div>
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
                <div
                  className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2"
                  style={{ borderColor: bg("#ffffff", "#1e1e1e") }}
                ></div>
              )}
            </div>
            <div>
              <h2
                className={`text-xl font-semibold ${text(
                  "text-[#1A1A1A]",
                  "text-gray-100"
                )}`}
              >
                {fullName || "Пользователь"}
              </h2>
              <p className={`mt-1 ${text("text-[#808080]", "text-gray-400")}`}>
                {email}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {profileData.name && (
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                      isDark
                        ? "bg-blue-900/30 text-blue-400 border border-blue-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {profileData.name}
                  </span>
                )}
                {employeeData.tabel_number && (
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      isDark
                        ? "bg-gray-700 text-gray-300 border border-gray-600"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
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
        <div
          className="col-span-12 lg:col-span-6 rounded-lg p-6 shadow-sm"
          style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${text(
              "text-[#1A1A1A]",
              "text-gray-100"
            )}`}
          >
            Личная информация
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label={"Фамилия"}
                placeholder={"Фамилия"}
                defaultValue={employeeData.last_name}
                inputClass={
                  isDark
                    ? "border-none bg-gray-800 !h-[52px] px-[20px] py-[16px] text-gray-100"
                    : "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Имя"}
                placeholder={"Имя"}
                defaultValue={employeeData.first_name}
                inputClass={
                  isDark
                    ? "border-none bg-gray-800 !h-[52px] px-[20px] py-[16px] text-gray-100"
                    : "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Отчество"}
                placeholder={"Отчество"}
                defaultValue={employeeData.middle_name}
                inputClass={
                  isDark
                    ? "border-none bg-gray-800 !h-[52px] px-[20px] py-[16px] text-gray-100"
                    : "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
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
        <div
          className="col-span-12 lg:col-span-6 rounded-lg p-6 shadow-sm"
          style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
        >
          <h3
            className={`text-lg font-semibold mb-4 ${text(
              "text-[#1A1A1A]",
              "text-gray-100"
            )}`}
          >
            Контактная информация
          </h3>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label={"Email адрес"}
                placeholder={"Email"}
                defaultValue={employeeData.email}
                inputClass={
                  isDark
                    ? "border-none bg-gray-800 !h-[52px] px-[20px] py-[16px] text-gray-100"
                    : "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Номер телефона"}
                placeholder={"+998"}
                defaultValue={phoneNumber}
                inputClass={
                  isDark
                    ? "border-none bg-gray-800 !h-[52px] px-[20px] py-[16px] text-gray-100"
                    : "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
                }
              />
              <Input
                label={"Адрес"}
                placeholder={"Адрес"}
                defaultValue={employeeData.address}
                inputClass={
                  isDark
                    ? "border-none bg-gray-800 !h-[52px] px-[20px] py-[16px] text-gray-100"
                    : "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
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
