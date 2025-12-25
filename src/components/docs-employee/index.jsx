import { useState, useEffect } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import useAppTheme from "@/hooks/useAppTheme";
import toast from "react-hot-toast";

const DocsOfEmployee = ({ employeeId }) => {
  const { isDark, text, border, bg } = useAppTheme();
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
        `http://10.20.6.60:8088/file-service/?${query}`
      );
      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
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
        `http://10.20.6.60:8088/file-service/${fileId}`,
        { method: "POST" }
      );
      const json = await response.json();
      setFileUrl(json.file_url);
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
        alert("Размер файла не должен превышать 500 МБ");
        return;
      }
      setUploadData((prev) => ({ ...prev, file }));
    }
  }

  async function uploadFile() {
    if (!uploadData.file || !uploadData.description) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("owner_service", "staffio");
      formData.append("owner_id", employeeId);
      formData.append("description", uploadData.description);
      formData.append("file", uploadData.file);

      const response = await fetch("http://10.20.6.60:8088/file-service/", {
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
      alert("Ошибка при загрузке файла");
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(fileId, fileName) {
    if (!confirm(`Вы уверены, что хотите удалить "${fileName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://10.20.6.60:8088/file-service/${fileId}`,
        { method: "DELETE" }
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
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

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
                "text-gray-100"
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
                    "text-gray-500"
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
            <div className="flex items-center justify-center py-12">
              <div className={text("text-gray-500", "text-gray-400")}>
                Загрузка...
              </div>
            </div>
          ) : currentDocuments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className={text("text-gray-500", "text-gray-400")}>
                Нет документов
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: bg("#f9fafb", "#2a2a2a"),
                    borderColor: border("#e5e7eb", "#333333"),
                  }}
                >
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${text(
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    Имя файла
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${text(
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    Категория
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${text(
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    Дата загрузки
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${text(
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    Размер
                  </th>
                  <th
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${text(
                      "text-gray-500",
                      "text-gray-400"
                    )}`}
                  >
                    Действие
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: border("#e5e7eb", "#333333") }}
              >
                {currentDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <div
                            className={`text-sm font-medium ${text(
                              "text-gray-900",
                              "text-gray-100"
                            )}`}
                          >
                            {doc.file_name}
                          </div>
                          <div
                            className={`text-xs ${text(
                              "text-gray-500",
                              "text-gray-400"
                            )}`}
                          >
                            Added by {doc.owner_service}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          doc.description
                        )}`}
                      >
                        {doc.description}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${text(
                        "text-gray-700",
                        "text-gray-300"
                      )}`}
                    >
                      {formatDate(doc.created_at)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${text(
                        "text-gray-700",
                        "text-gray-300"
                      )}`}
                    >
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            openFile(doc.id, doc.file_name, doc.file_type)
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
                          onClick={() => deleteFile(doc.id, doc.file_name)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: bg("#ffffff", "#1e1e1e") }}
          >
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: border("#e5e7eb", "#333333") }}
            >
              <h3
                className={`text-lg font-semibold ${text(
                  "text-gray-900",
                  "text-gray-100"
                )}`}
              >
                {selectedFile.file_name}
              </h3>
              <button
                onClick={closeModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <svg
                  className={`w-5 h-5 ${text(
                    "text-gray-600",
                    "text-gray-400"
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

            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {loadingFile ? (
                <div className="flex items-center justify-center py-12">
                  <div className={text("text-gray-500", "text-gray-400")}>
                    Загрузка файла...
                  </div>
                </div>
              ) : fileUrl ? (
                <div className="flex flex-col items-center">
                  {selectedFile.file_type &&
                  selectedFile.file_type.startsWith("image/") ? (
                    <img
                      src={fileUrl}
                      alt={selectedFile.file_name}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full">
                      <iframe
                        src={fileUrl}
                        className={`w-full h-[600px] border rounded-lg ${
                          isDark ? "border-gray-700" : "border-gray-300"
                        }`}
                        title={selectedFile.file_name}
                      />
                      <div className="mt-4 flex gap-2">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Открыть в новой вкладке
                        </a>
                        <a
                          href={fileUrl}
                          download
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Скачать
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-red-500">Ошибка загрузки файла</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  "text-gray-100"
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
                    "text-gray-400"
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
                      "text-gray-300"
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
                      "text-gray-300"
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
                          "text-gray-500"
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
                          "text-gray-400"
                        )}`}
                      >
                        {uploadData.file
                          ? uploadData.file.name
                          : "Нажмите для выбора файла"}
                      </p>
                      <p
                        className={`mt-1 text-xs ${text(
                          "text-gray-500",
                          "text-gray-500"
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
