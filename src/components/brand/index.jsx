import Image from "next/image";

const Brand = ({
  title = "“ISSIQLIK ELЕKTR STANSIYALARI” AKSIYADORLIK JAMIYATI",
}) => {
  return (
    <div className="flex justify-center items-center">
      <Image
        src="/icons/ies_brand.svg"
        alt="logo"
        width={43}
        height={46}
        priority
        className="w-[43px] h-auto"
      />
      <p className="text-[20px] font-bold ml-2">{title}</p>
    </div>
  );
};

export default Brand;
