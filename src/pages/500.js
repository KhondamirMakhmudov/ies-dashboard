import Image from "next/image";
import React from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const ServerErrorPage = () => {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center text-center min-h-screen px-4">
        <div>
          <Image
            src="/icons/500.svg"
            alt="500 error"
            width={400}
            height={400}
          />
        </div>
        <h1 className="text-3xl font-semibold mt-4">Ошибка сервера</h1>
        <p className="text-lg text-gray-600 mt-2 max-w-md">
          Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже или
          вернитесь назад.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2 bg-[#407BFF] hover:bg-[#407cffef] text-white rounded-lg transition active:scale-95 cursor-pointer"
        >
          Назад
        </button>
      </div>
    </DashboardLayout>
  );
};

export default ServerErrorPage;
