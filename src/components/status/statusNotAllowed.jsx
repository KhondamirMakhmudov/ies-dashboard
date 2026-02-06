import useAppTheme from "@/hooks/useAppTheme";
import Image from "next/image";

const StatusNotAllowed = () => {
  const { text, isDark } = useAppTheme();

  return (
    <div
      className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 "
      style={{
        background: isDark
          ? "linear-gradient(to bottom right, #1a1a1a, #2a2a2a)"
          : "linear-gradient(to bottom right, #ffffff, #fff5f5)",
        borderColor: isDark ? "#991b1b" : "#fca5a5",
      }}
    >
      {/* 403 Image */}
      <div className="relative mb-6">
        <Image
          src="/icons/403-for-content.svg" // Your 403 image path
          alt="403 Forbidden Access"
          width={300}
          height={300}
          className="object-cover"
          priority
        />
      </div>

      {/* Title */}
      <h3
        className="font-bold text-2xl mb-2 text-center"
        style={{ color: isDark ? "#fca5a5" : "#dc2626" }}
      >
        Нет доступа
      </h3>

      {/* Description */}
      <p
        className="text-center mb-6 max-w-xs"
        style={{ color: text("#991b1b", "#fca5a5") }}
      >
        У вас нет прав для просмотра этой информации
      </p>
    </div>
  );
};

export default StatusNotAllowed;
