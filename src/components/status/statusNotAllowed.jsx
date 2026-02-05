import { LockOutline } from "@mui/icons-material/LockOutline";
import useAppTheme from "@/hooks/useAppTheme";
const StatusNotAllowed = () => {
  const { text, isDark } = useAppTheme();
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2"
      style={{
        background: isDark
          ? "linear-gradient(to bottom right, #1e1e1e, #2a2a2a)"
          : "linear-gradient(to bottom right, #fff5f5, #fee2e2)",
        borderColor: isDark ? "#991b1b" : "#fca5a5",
      }}
    >
      <div
        className="p-4 rounded-full mb-4"
        style={{
          backgroundColor: isDark ? "#7f1d1d" : "#fee2e2",
        }}
      >
        <LockOutline
          style={{ color: isDark ? "#fca5a5" : "#dc2626" }}
          sx={{ fontSize: 48 }}
        />
      </div>
      <p
        className="font-semibold text-lg mb-1"
        style={{ color: isDark ? "#fca5a5" : "#dc2626" }}
      >
        Нет доступа
      </p>
      <p
        className="text-sm text-center"
        style={{ color: text("#991b1b", "#fca5a5") }}
      >
        У вас нет прав для просмотра этой информации
      </p>
    </div>
  );
};

export default StatusNotAllowed;
