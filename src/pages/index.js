import Brand from "@/components/brand";
import Button from "@/components/button";
import Input from "@/components/input";

import { useState, useEffect } from "react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ContentLoader from "@/components/loader";
import Link from "next/link";
import useAppTheme from "@/hooks/useAppTheme";

export default function Home() {
  const { bg, text, border, isDark } = useAppTheme();
  const { data: session } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [savedLogins, setSavedLogins] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("logins") || "[]");
    setSavedLogins(stored);
  }, []);

  const saveLogin = (username, password) => {
    let updated = [...savedLogins];
    const existingIndex = updated.findIndex((u) => u.username === username);
    if (existingIndex > -1) {
      updated[existingIndex].password = password;
    } else {
      updated.push({ username, password });
    }
    setSavedLogins(updated);
    localStorage.setItem("logins", JSON.stringify(updated));
  };

  const removeLogin = (username) => {
    const updated = savedLogins.filter((u) => u.username !== username);
    setSavedLogins(updated);
    localStorage.setItem("logins", JSON.stringify(updated));
  };

  const handleSelectLogin = (login) => {
    setUsername(login.username);
    setPassword(login.password);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Attempting sign in with:", { username });

      const response = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      console.log("SignIn response:", response);

      if (response?.ok && !response?.error) {
        toast.success("Добро пожаловать");
        saveLogin(username, password);
        router.push("/dashboard/employees");
      } else {
        console.error("SignIn error details:", response?.error);
        toast.error(
          "Login xato! " + (response?.error || "Ma'lumotlar noto'g'ri.")
        );
      }
    } catch (error) {
      console.error("SignIn exception:", error);
      toast.error("Tizimga kirishda xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={
        bg("bg-white", "bg-[#0D0D0D]") +
        " login min-h-screen transition-colors duration-300 overflow-hidden"
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {isLoading && (
        <div
          className={
            bg("bg-white/80", "bg-black/60") +
            " fixed inset-0 z-[9999] backdrop-blur-sm flex items-center justify-center"
          }
        >
          <ContentLoader />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 w-full min-h-screen overflow-hidden">
        {/* Left side image - Hidden on mobile, visible on large screens */}
        <motion.div
          className="hidden lg:flex lg:col-span-6 justify-center items-center h-full px-4 overflow-hidden"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src="/icons/login.svg"
            alt="login"
            width={600}
            height={300}
            className="max-w-full h-auto"
          />
        </motion.div>

        {/* Right side form */}
        <motion.div
          className={
            bg("bg-white", "bg-[#1A1A1A]") +
            " col-span-1 lg:col-span-6 w-full flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 lg:p-[24px] transition-colors duration-300 overflow-hidden " +
            border("lg:border-l border-gray-200", "lg:border-l border-gray-700")
          }
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            className="w-full max-w-[600px] flex flex-col items-start justify-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Brand />

            <div
              className={
                bg("bg-gray-200", "bg-gray-700") +
                " w-full h-[1px] my-[10px] transition-colors"
              }
            />

            <div className="mb-[20px] w-full">
              <h1
                className={
                  text("text-black", "text-white") +
                  " text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] mb-[12px] font-semibold"
                }
              >
                Вход в систему
              </h1>
              {!session?.accessToken && (
                <p
                  className={
                    text("text-gray-400", "text-gray-300") +
                    " text-sm sm:text-base"
                  }
                >
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
                <Link href={"/dashboard/employees"}>
                  <Button sx={{ width: "100%" }}>Вход</Button>
                </Link>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={onSubmit}
                className="py-[20px] sm:py-[30px] md:py-[40px] space-y-[10px] w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                {/* Saved logins */}
                {savedLogins.length > 0 && (
                  <div className="mb-4">
                    <p
                      className={
                        text("text-gray-600", "text-gray-300") +
                        " text-xs sm:text-sm mb-2"
                      }
                    >
                      Сохраненные логины:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {savedLogins.map((login, i) => (
                        <div
                          key={i}
                          onClick={() => handleSelectLogin(login)}
                          className={
                            bg("bg-blue-50", "bg-blue-900/30") +
                            " flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-blue-600 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all text-sm"
                          }
                        >
                          <span
                            className={
                              bg("bg-blue-500", "bg-blue-700") +
                              " w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-white text-xs"
                            }
                          >
                            {login.username.charAt(0).toUpperCase()}
                          </span>
                          <span
                            className={
                              text("text-blue-600", "text-blue-300") +
                              " text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none"
                            }
                          >
                            {login.username}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLogin(login.username);
                            }}
                            className="ml-1 text-red-400 hover:text-red-600 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inputs */}
                <Input
                  label="Имя пользователя"
                  type="text"
                  value={username}
                  inputClass={
                    bg("bg-white", "bg-[#262626]") +
                    " " +
                    text("text-black", "text-white") +
                    " " +
                    border("!border-gray-300", "!border-gray-600") +
                    " !h-[44px] sm:!h-[48px] rounded-[8px] text-[14px] sm:text-[15px]"
                  }
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите имя пользователя"
                />

                <Input
                  label="Пароль"
                  type="password"
                  value={password}
                  inputClass={
                    bg("bg-white", "bg-[#262626]") +
                    " " +
                    text("text-black", "text-white") +
                    " " +
                    border("!border-gray-300", "!border-gray-600") +
                    " !h-[44px] sm:!h-[48px] rounded-[8px] text-[14px] sm:text-[15px]"
                  }
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                />

                {/* Submit button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="pt-2"
                >
                  <Button>Вход</Button>
                </motion.div>
              </motion.form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
