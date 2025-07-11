import Brand from "@/components/brand";
import Button from "@/components/button";
import Input from "@/components/input";

import { useState } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ContentLoader from "@/components/loader";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await signIn("credentials", {
        username,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (response?.ok && !response?.error) {
        toast.success("Добро пожаловать");
        router.push("/dashboard/main");
      } else {
        toast.error(
          "Login xato! " + (response?.error || "Ma'lumotlar noto‘g‘ri.")
        );
      }
    } catch (error) {
      toast.error("Tizimga kirishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false); // agar xohlasangiz, router.push'dan keyin olib tashlasa ham bo'ladi
    }
  };

  return (
    <motion.div
      className="login h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <ContentLoader />
        </div>
      )}
      <div className="">
        <div className="grid grid-cols-12 w-full gap-[30px] place-items-center">
          <motion.div
            className="col-span-6"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src="/icons/login.svg"
              alt="login"
              width={600}
              height={300}
            />
          </motion.div>

          <motion.div
            className="col-span-6 w-full flex flex-col items-center justify-center h-screen bg-white rounded-md p-[24px]"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="max-w-[600px] flex flex-col items-start justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Brand />
              <div className="w-full h-[1px] bg-gray-200 my-[10px]" />
              <div className="mb-[20px]">
                <h1 className="text-[36px] mb-[12px] font-semibold">
                  Вход в систему
                </h1>
                {session?.accessToken ? (
                  ""
                ) : (
                  <p className="text-gray-400">
                    Для входа в систему введите ваше имя пользователя и пароль!
                  </p>
                )}
              </div>

              {session?.accessToken ? (
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <Button sx={{ width: "100%" }}>
                    <Link href={"/dashboard/main"}>Вход</Link>
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={onSubmit}
                  className="py-[40px] space-y-[10px] w-full"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <Input
                    label="Имя пользователя"
                    type="text"
                    inputClass="!h-[48px] rounded-[8px] !border-gray-300 text-[15px]"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите имя пользователя"
                  />
                  <Input
                    label="Пароль"
                    type="password"
                    inputClass="!h-[48px] rounded-[8px] !border-gray-300 text-[15px]"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                  />
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button>Вход</Button>
                  </motion.div>
                </motion.form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
