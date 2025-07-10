import Brand from "@/components/brand";
import Button from "@/components/button";
import Input from "@/components/input";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { FormControl } from "@mui/material";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault(); // Qo‘shing
    try {
      const response = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false,
        callbackUrl: "/",
      });
      console.log("Sending login:", { username, password });

      if (response?.ok && !response?.error) {
        toast.success("Kirish muvaffaqiyatli yakunlandi!");
        router.push("/dashboard/main");
      } else {
        toast.error(
          "Login xato! " +
            (response?.error || "Iltimos, ma'lumotlaringizni tekshiring.")
        );
      }
    } catch (error) {
      toast.error("Tizimga kirishda xatolik yuz berdi.");
    }
  };

  return (
    <div className={"login h-screen"}>
      <div className="">
        <div className="grid grid-cols-12 w-full gap-[30px] place-items-center">
          <div className="col-span-6">
            <Image
              src={"/icons/login.svg"}
              alt="login"
              width={600}
              height={300}
            />
          </div>
          <div className="col-span-6  w-full flex flex-col items-center justify-center  h-screen bg-white  rounded-md p-[24px]">
            <div className="max-w-[600px] flex flex-col items-start justify-center">
              <Brand />
              <div className="w-full h-[1px] bg-gray-200 my-[10px]"></div>
              <div className="mb-[20px]">
                <h1 className="text-[36px] mb-[12px] font-semibold">
                  Вход в систему
                </h1>
                <p className="text-gray-400">
                  Для входа в систему введите ваше имя пользователя и пароль!
                </p>
              </div>
              <form
                onSubmit={onSubmit}
                className="py-[40px] space-y-[10px] w-full"
              >
                <Input
                  label="Имя пользователя"
                  type="text"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                />
                <Input
                  label="Пароль"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                />

                <Button>Kirish</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
