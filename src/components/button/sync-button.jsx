import { useState } from "react";
import SyncIcon from "@mui/icons-material/Sync";
import { Button, keyframes, CircularProgress, Tooltip } from "@mui/material";
import toast from "react-hot-toast";
import usePostQuery from "@/hooks/java/usePostQuery";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export default function SyncButton({ url, session }) {
  const { mutate: synchronCamera } = usePostQuery({
    listKeyId: "synchronCamera",
    hideSuccessToast: true,
  });
  const [loading, setLoading] = useState(false);

  const submitSynchronCamera = async () => {
    setLoading(true);
    try {
      synchronCamera(
        {
          url: `${url}`,
          config: {
            headers: {
              Authorization: `Bearer ${session?.accessToken}`,
            },
          },
        },
        {
          onSuccess: () => {
            toast.success("Успешно синхрониризирован", {
              position: "top-center",
            });
            setLoading(false);
          },
          onError: (error) => {
            const errorMessage =
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              "Произошла ошибка при синхронизации";

            toast.error(errorMessage, { position: "top-right" });
            setLoading(false);
          },
        }
      );
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="Синхронизировать камеры с системой" arrow placement="top">
      <span>
        <Button
          onClick={submitSynchronCamera}
          disabled={loading}
          sx={{
            textTransform: "initial",
            fontFamily: "DM Sans, sans-serif",
            backgroundColor: "#4182F9",
            boxShadow: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
            borderRadius: "8px",
            position: "relative",
            "&:hover": {
              backgroundColor: "#3670E0",
            },
            "&:disabled": {
              opacity: 0.7,
              cursor: "not-allowed",
              backgroundColor: "#4182F9",
            },
          }}
          variant="contained"
        >
          {loading ? (
            <>
              <span className="md:block hidden">Синхронизация...</span>
              <CircularProgress
                size={20}
                sx={{
                  color: "white",
                }}
              />
            </>
          ) : (
            <>
              <span className="md:block hidden">Cинхронизация</span>
              <SyncIcon />
            </>
          )}
        </Button>
      </span>
    </Tooltip>
  );
}
