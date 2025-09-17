import Image from "next/image";

export default function NoData({
  title = "Данных нет",
  description = "Для добавления нового элемента нажмите кнопку ниже",
  onCreate,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <Image
        src={"/icons/no-data-animate.svg"}
        alt="No data"
        width={400}
        height={400}
        className="mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-500 mb-4">{description}</p>
      {onCreate && (
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Создать
        </button>
      )}
    </div>
  );
}
