import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import ContentLoader from "@/components/loader";

const UnauthorizedPage = () => {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshFailed, setRefreshFailed] = useState(false);

  useEffect(() => {
    // Attempt to refresh session when 401 page is loaded
    const attemptRefresh = async () => {
      try {
        console.log("Attempting to refresh session on 401 page...");
        const result = await update();

        if (result && !result.error) {
          console.log("Session refreshed successfully, redirecting back");
          // Refresh successful, go back to previous page or dashboard
          setTimeout(() => {
            router.back();
          }, 500);
        } else {
          console.log("Session refresh failed or has error");
          setRefreshFailed(true);
          setIsRefreshing(false);
        }
      } catch (error) {
        console.error("Session refresh error:", error);
        setRefreshFailed(true);
        setIsRefreshing(false);
      }
    };

    if (session) {
      attemptRefresh();
    } else {
      setIsRefreshing(false);
      setRefreshFailed(true);
    }
  }, [session, update, router]);

  if (isRefreshing) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <ContentLoader />
          <p className="mt-4 text-gray-600">Обновление сессии...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!refreshFailed) {
    return null; // Page is redirecting
  }

  // If refresh fails, show the 401 error page
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center text-center min-h-screen px-4">
        <div>
          <Image src="/icons/401.svg" alt="401" width={400} height={400} />
        </div>
        <h1 className="text-3xl font-semibold mt-4">
          Требуется аутентификация
        </h1>
        <p className="text-lg text-gray-600 mt-2 max-w-md">
          Извините, вам необходимо войти в систему для доступа к этой странице.
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

export default UnauthorizedPage;
