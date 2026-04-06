import { useState, useEffect } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import useAppTheme from "@/hooks/useAppTheme";
import toast from "react-hot-toast";
import ContentLoader from "../loader";
import CustomTable from "../table";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";

const DocsOfEmployee = ({ employeeId }) => {
  const { isDark, text, border, bg } = useAppTheme();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    description: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const itemsPerPage = 10;

  const [params, setParams] = useState({
    owner_id: employeeId,
    is_active: true,
    limit: 100,
    offset: 0,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const query = new URLSearchParams(params).toString();
      const response = await fetch(
        `https://app.tpp.uz/objects/files?${query}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      const json = await response.json();
      console.log(json, "json");

      setData(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function openFile(fileId, fileName, fileType) {
    try {
      setLoadingFile(true);
      setSelectedFile({ file_name: fileName, file_type: fileType });
      const response = await fetch(
        `https://app.tpp.uz/objects/files/${fileId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          method: "POST",
        },
      );
      const json = await response.json();

      // Force file download for certain file types
      if (
        fileType.includes("pdf") ||
        fileType.includes("text") ||
        fileType.includes("document") ||
        fileType.includes("sheet")
      ) {
        // Open in iframe for viewable content
        setFileUrl(json.file_url);
      } else {
        // For other types, we'll handle download differently
        setFileUrl(json.file_url);
      }
    } catch (error) {
      console.error("Error:", error);
      setFileUrl(null);
    } finally {
      setLoadingFile(false);
    }
  }

  function closeModal() {
    setSelectedFile(null);
    setFileUrl(null);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Размер файла не должен превышать 500 МБ");
        return;
      }
      setUploadData((prev) => ({ ...prev, file }));
    }
  }

  async function uploadFile() {
    if (!uploadData.file || !uploadData.description) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("owner_service", "staffio");
      formData.append("owner_id", employeeId);
      formData.append("description", uploadData.description);
      formData.append("file", uploadData.file);

      const response = await fetch("https://app.tpp.uz/objects/files", {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Файл успешно загружен!");
        setShowUploadModal(false);
        setUploadData({ description: "", file: null });
        fetchData();
      } else {
        toast.error("Ошибка при загрузке файла");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Ошибка при загрузке файла");
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(fileId, fileName) {
    try {
      const response = await fetch(
        `https://app.tpp.uz/objects/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Файл успешно удалён");
        fetchData();
      } else {
        toast.error("Ошибка при удалении файла");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Ошибка при удалении файла");
    }
  }

  function openDeleteModal(fileId, fileName) {
    setDeleteTarget({ id: fileId, name: fileName });
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteFile(deleteTarget.id, deleteTarget.name);
    closeDeleteModal();
  }

  useEffect(() => {
    if (!params.owner_id) return;
    fetchData();
  }, [params]);

  const getCategoryColor = (category) => {
    const colors = {
      Resume: isDark
        ? "bg-purple-900/30 text-purple-400 border border-purple-700"
        : "bg-purple-100 text-purple-700",
      Сертификат: isDark
        ? "bg-green-900/30 text-green-400 border border-green-700"
        : "bg-green-100 text-green-700",
      Личное: isDark
        ? "bg-gray-700 text-gray-300 border border-gray-600"
        : "bg-gray-100 text-gray-700",
      "main photo": isDark
        ? "bg-blue-900/30 text-blue-400 border border-blue-700"
        : "bg-blue-100 text-blue-700",
    };
    return (
      colors[category] ||
      (isDark
        ? "bg-gray-700 text-gray-300 border border-gray-600"
        : "bg-gray-100 text-gray-700")
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "Янв",
      "Фев",
      "Мар",
      "Апр",
      "Май",
      "Июн",
      "Июл",
      "Авг",
      "Сен",
      "Окт",
      "Ноя",
      "Дек",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getFileIcon = (fileType) => {
    if (fileType && fileType.startsWith("image/")) {
      return (
        <div
          className={`w-10 h-10 rounded flex items-center justify-center ${
            isDark ? "bg-blue-900/30" : "bg-blue-100"
          }`}
        >
          <svg
            className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <rect
              x="3"
              y="3"
              width="18"
              height="18"
              rx="2"
              ry="2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
            <path
              d="M21 15l-5-5L5 21"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );
    }
    return (
      <div
        className={`w-10 h-10 rounded flex items-center justify-center ${
          isDark ? "bg-red-900/30" : "bg-red-100"
        }`}
      >
        <svg
          className={`w-5 h-5 ${isDark ? "text-red-400" : "text-red-600"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  const filteredDocuments = data.filter((doc) =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);
  const columns = [
    {
      accessorKey: "file_name",
      header: "Имя файла",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {getFileIcon(row.original.file_type)}
          <div>
            <div
              className={`text-sm font-medium line-clamp-1 ${text(
                "text-gray-900",
                "text-gray-100",
              )}`}
            >
              {row.original.file_name}
            </div>
            <div
              className={`text-xs ${text("text-gray-500", "text-gray-400")}`}
            >
              Added by {row.original.owner_service}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Категория",
      cell: ({ row }) => (
        <span
          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(
            row.original.description,
          )}`}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Дата загрузки",
      cell: ({ row }) => (
        <span className={`text-sm ${text("text-gray-700", "text-gray-300")}`}>
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: "size",
      header: "Размер",
      cell: ({ row }) => (
        <span className={`text-sm ${text("text-gray-700", "text-gray-300")}`}>
          {formatFileSize(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "Действие",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              openFile(
                row.original.id,
                row.original.file_name,
                row.original.file_type,
              )
            }
            className={`${
              isDark
                ? "bg-blue-900/30 text-blue-400 border border-blue-600"
                : "bg-[#bfd2f5] text-[#4182F9]"
            } h-[32px] px-2 flex justify-center items-center rounded-md cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <VisibilityIcon fontSize="small" />
          </button>
          <Button
            onClick={() =>
              openDeleteModal(row.original.id, row.original.file_name)
            }
            sx={{
              width: "32px",
              height: "32px",
              minWidth: "32px",
              background: isDark ? "#7f1d1d" : "#FCD8D3",
              color: isDark ? "#fca5a5" : "#FF1E00",
              "&:hover": {
                background: isDark ? "#991b1b" : "#FCA89D",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <div
        className="w-full rounded-lg shadow-sm border"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b"
          style={{ borderColor: border("#e5e7eb", "#333333") }}
        >
          <div className="flex items-center justify-between">
            <h2
              className={`text-lg font-semibold ${text(
                "text-gray-900",
                "text-gray-100",
              )}`}
            >
              Загруженные документы
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
              >
                Загрузить файл
              </button>
              <div className="relative">
                <svg
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${text(
                    "text-gray-400",
                    "text-gray-500",
                  )}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path
                    d="M21 21l-4.35-4.35"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск файлов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark
                      ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <ContentLoader />
          ) : currentDocuments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className={text("text-gray-500", "text-gray-400")}>
                Нет документов
              </div>
            </div>
          ) : (
            <div className="p-4">
              <CustomTable data={filteredDocuments} columns={columns} />
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && currentDocuments.length > 0 && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{ borderColor: border("#e5e7eb", "#333333") }}
          >
            <div
              className={`text-sm ${text("text-gray-600", "text-gray-400")}`}
            >
              Показано {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredDocuments.length)} из{" "}
              {filteredDocuments.length} результатов
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "border-gray-600 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M15 19l-7-7 7-7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "border-gray-600 hover:bg-gray-800 text-gray-300"
                    : "border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div
            className="relative w-full max-w-6xl mx-auto overflow-hidden rounded-xl shadow-2xl"
            style={{
              backgroundColor: bg("#ffffff", "#1e293b"),
              maxHeight: "95vh",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 md:p-6 border-b"
              style={{ borderColor: border("#e5e7eb", "#334155") }}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-slate-800" : "bg-blue-50"
                  }`}
                >
                  {selectedFile.file_type?.startsWith("image/") ? (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : selectedFile.file_type?.includes("pdf") ? (
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : selectedFile.file_type?.includes("text") ||
                    selectedFile.file_type?.includes("document") ? (
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className={`text-sm md:text-lg font-semibold truncate ${text(
                      "text-gray-900",
                      "text-gray-100",
                    )}`}
                  >
                    {selectedFile.file_name}
                  </h3>
                  <p
                    className={`text-xs ${text("text-gray-500", "text-gray-400")}`}
                  >
                    {selectedFile.file_type || "Неизвестный формат"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {/* File size and info could go here */}
                <button
                  onClick={() => {
                    if (fileUrl) {
                      window.open(fileUrl, "_blank");
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                  } ${!fileUrl ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!fileUrl}
                  title="Открыть в новой вкладке"
                >
                  <svg
                    className={`w-5 h-5 ${text("text-gray-600", "text-gray-400")}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </button>

                <button
                  onClick={closeModal}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                  }`}
                  title="Закрыть"
                >
                  <svg
                    className={`w-5 h-5 ${text("text-gray-600", "text-gray-400")}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="relative" style={{ height: "calc(95vh - 80px)" }}>
              {loadingFile ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div
                      className={`w-16 h-16 border-4 rounded-full animate-spin ${
                        isDark
                          ? "border-slate-700 border-t-blue-500"
                          : "border-gray-200 border-t-blue-500"
                      }`}
                    ></div>
                    <div className="mt-4 text-center">
                      <p className={text("text-gray-600", "text-gray-300")}>
                        Загрузка файла...
                      </p>
                      <p
                        className={`text-sm mt-1 ${text("text-gray-500", "text-gray-400")}`}
                      >
                        {selectedFile.file_name}
                      </p>
                    </div>
                  </div>
                </div>
              ) : fileUrl ? (
                <div className="h-full overflow-auto">
                  {selectedFile.file_type?.startsWith("image/") ? (
                    <div className="flex items-center justify-center h-full p-4">
                      <div className="relative max-w-full max-h-full">
                        <img
                          src={fileUrl}
                          alt={selectedFile.file_name}
                          className="max-w-full max-h-full rounded-lg shadow-lg object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="%23999" text-anchor="middle" dy=".3em">Не удалось загрузить изображение</text></svg>';
                          }}
                        />
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Изображение
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      {/* Viewer Container */}
                      <div className="flex-1 min-h-0">
                        {selectedFile.file_type?.includes("pdf") ? (
                          <iframe
                            src={`${fileUrl}#view=fitH`}
                            className="w-full h-full border-0"
                            title={selectedFile.file_name}
                            onLoad={() => {
                              // Optional: Add loading state for iframe
                            }}
                            onError={() => {
                              // Handle iframe loading error
                            }}
                          />
                        ) : selectedFile.file_type?.includes("text") ||
                          selectedFile.file_type?.includes("document") ||
                          selectedFile.file_type?.includes("sheet") ? (
                          <div className="h-full">
                            <iframe
                              src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                              className="w-full h-full border-0"
                              title={selectedFile.file_name}
                            />
                            <div
                              className={`absolute bottom-4 left-4 text-xs px-3 py-1 rounded-full ${
                                isDark
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              Предпросмотр документа
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-8">
                            <div
                              className={`p-6 rounded-2xl mb-6 ${
                                isDark ? "bg-slate-800" : "bg-gray-50"
                              }`}
                            >
                              <svg
                                className="w-16 h-16 mx-auto text-gray-400"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <h3
                              className={`text-lg font-semibold mb-2 ${text("text-gray-900", "text-gray-100")}`}
                            >
                              Предпросмотр недоступен
                            </h3>
                            <p
                              className={`text-center mb-6 max-w-md ${text("text-gray-600", "text-gray-400")}`}
                            >
                              Данный тип файла не поддерживает просмотр в
                              браузере. Вы можете скачать файл для просмотра на
                              вашем устройстве.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div
                        className={`border-t p-4 ${isDark ? "border-slate-700 bg-slate-900" : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`text-sm ${text("text-gray-600", "text-gray-400")}`}
                            >
                              <span className="font-medium">Тип:</span>{" "}
                              {selectedFile.file_type || "Неизвестно"}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => window.open(fileUrl, "_blank")}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                isDark
                                  ? "bg-slate-700 hover:bg-slate-600 text-white"
                                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              <span>Открыть</span>
                            </button>

                            <a
                              href={fileUrl}
                              download
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                isDark
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-blue-500 hover:bg-blue-600 text-white"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              <span>Скачать</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div
                    className={`p-4 rounded-full mb-4 ${
                      isDark ? "bg-red-900/20" : "bg-red-100"
                    }`}
                  >
                    <svg
                      className="w-12 h-12 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${text("text-gray-900", "text-gray-100")}`}
                  >
                    Ошибка загрузки
                  </h3>
                  <p
                    className={`text-center mb-6 ${text("text-gray-600", "text-gray-400")}`}
                  >
                    Не удалось загрузить файл. Пожалуйста, попробуйте ещё раз
                    или скачайте файл.
                  </p>
                  <button
                    onClick={closeModal}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? "bg-slate-700 hover:bg-slate-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={closeDeleteModal}
        deleting={confirmDelete}
        title={`Вы уверены, что хотите удалить файл "${deleteTarget?.name || ""}"?`}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg shadow-xl max-w-md w-full"
            style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
          >
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: border("#e5e7eb", "#333333") }}
            >
              <h3
                className={`text-lg font-semibold ${text(
                  "text-gray-900",
                  "text-gray-100",
                )}`}
              >
                Загрузить файл
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadData({ description: "", file: null });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${text(
                    "text-gray-600",
                    "text-gray-400",
                  )}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${text(
                      "text-gray-700",
                      "text-gray-300",
                    )}`}
                  >
                    Описание <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uploadData.description}
                    onChange={(e) =>
                      setUploadData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Введите описание файла"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${text(
                      "text-gray-700",
                      "text-gray-300",
                    )}`}
                  >
                    Файл <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 transition-colors ${
                      isDark ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <svg
                        className={`mx-auto h-12 w-12 ${text(
                          "text-gray-400",
                          "text-gray-500",
                        )}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p
                        className={`mt-2 text-sm ${text(
                          "text-gray-600",
                          "text-gray-400",
                        )}`}
                      >
                        {uploadData.file
                          ? uploadData.file.name
                          : "Нажмите для выбора файла"}
                      </p>
                      <p
                        className={`mt-1 text-xs ${text(
                          "text-gray-500",
                          "text-gray-500",
                        )}`}
                      >
                        Максимальный размер: 500 МБ
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={uploadFile}
                  disabled={
                    uploading || !uploadData.file || !uploadData.description
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploading ? "Загрузка..." : "Загрузить"}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadData({ description: "", file: null });
                  }}
                  className={`px-4 py-2 border rounded-lg transition-colors ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocsOfEmployee;
