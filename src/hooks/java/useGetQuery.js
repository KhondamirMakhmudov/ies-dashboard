import { useQuery } from "@tanstack/react-query";
import { request } from "@/services/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

const useGetQuery = ({
  key = "get-all",
  url = "/",
  params = {},
  headers = {},
  showSuccessMsg = false,
  showErrorMsg = false,
  enabled = true,
  redirectOn403 = true,
  redirectOn500 = true,
}) => {
  const router = useRouter();

  const { isLoading, isError, data, error, isFetching } = useQuery(
    [key, params],
    () =>
      request.get(url, {
        params,
        headers,
      }),
    {
      keepPreviousData: true,

      onSuccess: () => {
        if (showSuccessMsg) {
          toast.success("SUCCESS");
        }
      },

      onError: (error) => {
        const status = error?.response?.status;

        // 🔴 403
        if (status === 403 && redirectOn403) {
          router.replace("/403");
          return;
        }

        // 🔴 500
        if (status >= 500 && redirectOn500) {
          router.replace("/500");
          return;
        }

        if (showErrorMsg) {
          toast.error(error?.response?.data?.message || "Ошибка запроса");
        }
      },

      enabled,
    },
  );

  return {
    isLoading,
    isError,
    data,
    error,
    isFetching,
    errorStatus: error?.response?.status, // Extract status from error object
  };
};

export default useGetQuery;
