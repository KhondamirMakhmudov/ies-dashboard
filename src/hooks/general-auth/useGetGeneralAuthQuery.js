import { useQuery } from "@tanstack/react-query";
import { requestGeneralAuth } from "@/services/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

const useGetGeneralAuthQuery = ({
  key = "get-all",
  url = "/",
  params = {},
  headers = {},
  showSuccessMsg = false,
  showErrorMsg = false,
  enabled = true,
}) => {
  const router = useRouter();

  const { isLoading, isError, data, error, isFetching } = useQuery(
    [key, params],
    () =>
      requestGeneralAuth.get(url, {
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

        // 🔴 401 - Let ErrorBoundary/component handle refresh attempt
        if (status === 401) {
          return; // Don't redirect, let component decide
        }

        if (showErrorMsg) {
          toast.error("ERROR");
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
  };
};

export default useGetGeneralAuthQuery;
