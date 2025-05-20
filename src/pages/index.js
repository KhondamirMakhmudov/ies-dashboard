import Brand from "@/components/brand";
import Button from "@/components/button";
import Input from "@/components/input";
import Image from "next/image";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import { FormControl } from "@mui/material";
import { Button as MuiButton } from "@mui/material";
export default function Home() {
  const [age, setAge] = useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };
  return (
    <div className={"login h-screen"}>
      <div
        className={
          "container mx-auto  flex items-center justify-center translate-y-1/2"
        }
      >
        <div className="grid grid-cols-12 w-full gap-[30px]">
          <div className="col-span-6 bg-white border border-gray-200 rounded-md p-[24px]">
            <div className="mb-[20px]">
              <h1 className={"text-[36px] mb-[12px] font-semibold"}>
                Tizimga kirish
              </h1>
              <p className={"text-gray-400"}>
                Tizimga kirish uchun emailingiz va parolingizni kiriting!
              </p>
            </div>

            <FormControl fullWidth className="py-[40px] space-y-[10px]">
              <Input
                label="Email"
                type="email"
                placeholder="example@mail.com"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter the password"
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
                <MenuItem value={10}>Adminstrator</MenuItem>
                <MenuItem value={20}>Moderator</MenuItem>
                <MenuItem value={30}>ATK</MenuItem>
              </Select>

              <Button>Kirish</Button>
            </FormControl>
          </div>
          <div className="col-span-6 second-part border border-gray-200 bg-white rounded-md flex flex-col justify-center items-center">
            {/* <Brand /> */}

            <Image src="/icons/logo.svg" alt="logo" width={153} height={76} />

            <MuiButton
              sx={{
                borderColor: "#333435FF",
                border: "1px", // Tailwind'dagi border-gray-200
                width: "70%",
                padding: 0,
                borderRadius: "20px",
                color: "#333435FF",
                textTransform: "none", // padding ichki divga berilgan
              }}
              variant="outlined"
              href="https://www.tmsiti.uz/"
            >
              <div className=" flex flex-col items-center w-[300px] gap-2 p-[15px]">
                <p className="text-2xl text-white">Rasmiy saytimiz</p>
                <p className="text-lg text-white">tmsiti.uz</p>
              </div>
            </MuiButton>
          </div>
        </div>
      </div>
    </div>
  );
}
