import Image from "next/image";

const Brand = () => {
  return (
    <div className="flex justify-center items-center">
      <Image src="/icons/ies_brand.svg" alt="logo" width={43} height={46} />
      <p className="text-[20px] font-bold ml-2">
        “ISSIQLIK ELЕKTR STANSIYALARI” AKSIYADORLIK JAMIYATI
      </p>
    </div>
  );
};

export default Brand;
