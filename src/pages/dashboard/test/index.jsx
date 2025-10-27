import { useState } from "react";
import SyncIcon from "@mui/icons-material/Sync";
import { Button } from "@mui/material";
import { toast } from "react-toastify";

export default function SyncButton({
  synchronCamera,
  URLS,
  id,
  session,
  queryClient,
  KEYS,
}) {
  const [loading, setLoading] = useState(false);

  const submitSynchronCamera = async () => {
    setLoading(true);
    try {
      await synchronCamera(
        {
          url: `${URLS.newEntryPoints}/${id}/cameras/sync-schedules`,
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
            queryClient.invalidateQueries(KEYS.entrypoint);
          },
          onError: (error) => {
            toast.error(`Error is ${error}`, { position: "top-right" });
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
        gap: "4px",
        fontSize: "14px",
        minWidth: "120px",
        borderRadius: "8px",
        "&:disabled": { opacity: 0.7, cursor: "not-allowed" },
      }}
      variant="contained"
    >
      {loading ? (
        <>
          <p className="md:block hidden">Синхронизация...</p>
          <SyncIcon
            sx={{
              animation: "spin 1s linear infinite",
            }}
          />
        </>
      ) : (
        <>
          <p className="md:block hidden">Cинхронизация</p>
          <SyncIcon />
        </>
      )}

      {/* CSS animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Button>
  );
}
