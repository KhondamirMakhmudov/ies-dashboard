import Image from "next/image";
import { useState } from "react";

export default function ImageUploader() {
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="relative w-full h-[250px] border border-[#C9C9C9] rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer bg-white overflow-hidden"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {image ? (
        <>
          <img
            src={image}
            alt="Uploaded"
            className="w-full h-full object-contain rounded-lg"
          />
          <label
            htmlFor="fileInput"
            className="absolute bottom-4 right-4 py-1.5 px-4  text-sm border border-[#C9c9c9] rounded-lg  cursor-pointer hover:bg-gray-100 active:scale-90 transition-all duration-200"
          >
            Изменить фото
          </label>
        </>
      ) : (
        <>
          <Image
            src={"/icons/plus-circle.svg"}
            alt="upload"
            width={35}
            height={35}
          />
          <p className="text-black text-[17px] font-medium my-[24px]">
            Перетащите фото или загрузите
          </p>
          <label
            htmlFor="fileInput"
            className="mt-3 py-2 px-4 bg-gray-100 text-gray-900 rounded-lg cursor-pointer flex items-center gap-2 scale-100 active:scale-90 transition-all duration-200"
          >
            <Image
              src={"/icons/upload.svg"}
              alt="upload"
              width={20}
              height={20}
            />
            <p>Загрузить</p>
          </label>
        </>
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
