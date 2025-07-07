import Brand from "@/components/brand";
import Button from "@/components/button";
import Input from "@/components/input";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { FormControl } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import usePostQuery from "@/hooks/java/usePostQuery";
import { URLS } from "@/constants/url";
import toast from "react-hot-toast";

export default function Home() {
  const [age, setAge] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (data) => {
    try {
      const response = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false,
        callbackUrl: "/",
      });

      if (response.ok) {
        toast.success("Kirish muvaffaqiyatli yakunlandi!");
        router.push("/dashboard/main");
      } else {
        toast.error(
          "Kirish muvaffaqiyatsiz yakunlandi! Iltimos, ma'lumotlaringizni tekshiring."
        );
      }
    } catch (error) {
      toast.error("An error occurred during login.");
    }
  };

  const handleChange = (event) => {
    setAge(event.target.value);
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
              <FormControl fullWidth className="py-[40px] space-y-[10px]" sx={{fontFamily: "DM Sans, sans-serif",}}>
                <Input
                  label="Имя пользователя"
                  type="email"
                  placeholder="Введите имя пользователя"
                />
                <Input
                  label="Пароль"
                  type="password"
                  placeholder="Введите пароль"
                />
                <Select
                  className="w-full text-black mt-[15px]"
                  id="demo-simple-select"
                  value={age}
                  onChange={handleChange}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Role ni tanlang
                  </MenuItem>
                  <MenuItem value={10}>HR</MenuItem>
                  <MenuItem value={20}>Админ</MenuItem>
                  <MenuItem value={30}>Руководитель</MenuItem>
                </Select>
                <Button onClick={onSubmit}>
                  Kirish
                </Button>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
