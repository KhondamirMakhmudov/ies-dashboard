import Image from "next/image";
import { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import toast from "react-hot-toast";
import useAppTheme from "@/hooks/useAppTheme"; // Update the import path

export default function ImageUploader({ image, onFileChange }) {
  const [scale, setScale] = useState(1.0);
  const editorRef = useRef(null);
  const { isDark, bg, text, border } = useAppTheme();

  // Fayl yuklash
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Файл 10MB dan kichik bo'lishi kerak!");
      return;
    }

    onFileChange(file); // ✅ parentga yuboramiz
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Файл 2MB dan kichik bo'lishi kerak!");
      return;
    }

    onFileChange(file); // ✅ parentga yuboramiz
  };

  const handleSave = () => {
    if (editorRef.current) {
      editorRef.current.getImageScaledToCanvas().toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], image.name, {
            type: image.type,
          });
          onFileChange(croppedFile); // ✅ parent state update
        }
      }, image.type);
    }
  };

  return (
    <div
      className={`relative w-full h-[350px] border ${border} rounded-xl flex flex-col items-center justify-center text-center p-4 ${bg} overflow-hidden`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {!image ? (
        <>
          <Image
            src={"/icons/plus-circle.svg"}
            alt="upload"
            width={35}
            height={35}
            className={isDark ? "invert" : ""}
          />
          <p className={`${text} text-[17px] font-medium my-[24px]`}>
            Перетащите фото или загрузите
          </p>
          <label
            htmlFor="fileInput"
            className={`mt-3 py-2 px-4 ${
              isDark ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"
            } rounded-lg cursor-pointer flex items-center gap-2 scale-100 active:scale-90 transition-all duration-200`}
          >
            <Image
              src={"/icons/upload.svg"}
              alt="upload"
              width={20}
              height={20}
              className={isDark ? "invert" : ""}
            />
            <p>Загрузить</p>
          </label>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={150}
            height={150}
            border={10}
            borderRadius={110}
            scale={scale}
            className="rounded-lg shadow-md"
          />

          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />

          <div className="flex gap-3">
            <label
              htmlFor="fileInput"
              className={`py-2 px-4 border ${border} rounded-lg cursor-pointer ${
                isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
              } active:scale-90 transition-all duration-200`}
            >
              Изменить фото
            </label>
            <button
              onClick={handleSave}
              className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
