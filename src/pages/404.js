import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen px-4">
      <div>
        <Image src="/icons/404-error.svg" alt="404" width={400} height={400} />
      </div>
      <h1 className="text-3xl font-semibold mt-4">Страница не найдена</h1>
      <p className="text-lg text-gray-600 mt-2 max-w-md">
        Извините, страница, которую вы ищете, не существует или была удалена.
      </p>
      <button
        onClick={() => router.back()}
        className="mt-6 px-6 py-2 bg-[#407BFF] hover:bg-[#407cffef] text-white rounded-lg transition active:scale-95 cursor-pointer"
      >
        Назад
      </button>
    </div>
  );
};

export default Index;
