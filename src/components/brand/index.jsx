import Image from "next/image";

const Brand = () => {
  return (
    <div className="flex justify-center items-center">
      <Image src="/icons/logo.svg" alt="logo" width={43} height={46} />
      <p className="text-[20px] font-bold ml-2">
        Texnik me’yorlash va standartlashtirish ilmiy-tadqiqot instituti
      </p>
    </div>
  );
};

export default Brand;
