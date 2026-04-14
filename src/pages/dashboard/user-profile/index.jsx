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
    },
    enabled: !!session?.accessToken,
  });

  const {
    data: userSessions,
    isLoading: userSessionsLoading,
    isFetching: userSessionsFetching,
  } = useGetGeneralAuthQuery({
    key: KEYS.mySessions,
    url: URLS.mySessions,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    enabled: !!session?.accessToken,
  });

  const { data: employee } = useGetPythonQuery({
    key: KEYS.currentUserEmployee,
    url: `${URLS.employees}${get(userProfile, "data.employeeId")}`,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    enabled: !!session?.accessToken && !!get(userProfile, "data.employeeId"),
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
          "text-gray-100",
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
                  "text-gray-100",
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
              "text-gray-100",
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
                        "ru-RU",
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
              "text-gray-100",
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

      {/* Active Sessions */}
      <div
        className="rounded-lg p-6 shadow-sm"
        style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
      >
        <h3
          className={`text-lg font-semibold mb-6 ${text(
            "text-[#1A1A1A]",
            "text-gray-100",
          )}`}
        >
          Активные сеансы
        </h3>

        {userSessionsLoading || userSessionsFetching ? (
          <ContentLoader />
        ) : userSessions?.data?.data && userSessions.data?.data.length > 0 ? (
          <div className="space-y-4">
            {userSessions.data?.data.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  session.isCurrent
                    ? isDark
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-blue-300 bg-blue-50"
                    : isDark
                      ? "border-gray-700"
                      : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <p
                          className={`font-semibold ${text(
                            "text-[#1A1A1A]",
                            "text-gray-100",
                          )}`}
                        >
                          {session.deviceName || "Неизвестное устройство"}
                        </p>
                        <p
                          className={`text-sm ${text(
                            "text-[#808080]",
                            "text-gray-400",
                          )}`}
                        >
                          {session.deviceType || "Тип устройства не определен"}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {session.isCurrent && (
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              isDark
                                ? "bg-green-900/30 text-green-400"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            Текущий сеанс
                          </span>
                        )}
                        {session.isActive ? (
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              isDark
                                ? "bg-green-900/30 text-green-400"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            Активен
                          </span>
                        ) : (
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              isDark
                                ? "bg-gray-900/30 text-gray-400"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            Неактивен
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p
                          className={`text-xs mb-1 ${text(
                            "text-[#808080]",
                            "text-gray-400",
                          )}`}
                        >
                          IP адрес
                        </p>
                        <p
                          className={`font-medium ${text(
                            "text-[#1A1A1A]",
                            "text-gray-200",
                          )}`}
                        >
                          {session.ipAddress || "-"}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-xs mb-1 ${text(
                            "text-[#808080]",
                            "text-gray-400",
                          )}`}
                        >
                          Последнее использование
                        </p>
                        <p
                          className={`font-medium ${text(
                            "text-[#1A1A1A]",
                            "text-gray-200",
                          )}`}
                        >
                          {session.lastUsedAt
                            ? new Date(session.lastUsedAt).toLocaleString(
                                "ru-RU",
                              )
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-xs mb-1 ${text(
                            "text-[#808080]",
                            "text-gray-400",
                          )}`}
                        >
                          Создан
                        </p>
                        <p
                          className={`font-medium ${text(
                            "text-[#1A1A1A]",
                            "text-gray-200",
                          )}`}
                        >
                          {session.createdAt
                            ? new Date(session.createdAt).toLocaleDateString(
                                "ru-RU",
                              )
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-xs mb-1 ${text(
                            "text-[#808080]",
                            "text-gray-400",
                          )}`}
                        >
                          Истекает
                        </p>
                        <p
                          className={`font-medium ${
                            new Date(session.expiresAt) < new Date()
                              ? "text-red-500"
                              : text("text-[#1A1A1A]", "text-gray-200")
                          }`}
                        >
                          {session.expiresAt
                            ? new Date(session.expiresAt).toLocaleDateString(
                                "ru-RU",
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? "bg-red-900/20 text-red-400 hover:bg-red-900/40"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      Выход
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p
            className={`text-center py-8 ${text(
              "text-[#808080]",
              "text-gray-400",
            )}`}
          >
            Нет активных сеансов
          </p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
