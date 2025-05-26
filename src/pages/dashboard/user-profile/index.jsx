import Input from "@/components/input";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Image from "next/image";

const Index = () => {
  return (
    <DashboardLayout headerTitle={"Foydalanuvchi profili"}>
      <div className="grid grid-cols-12 gap-[12px] bg-white my-[50px]">
        <div className="col-span-12">
          <div className=" rounded-lg">
            <div className="w-full user-rectangle h-[80px] rounded-t-lg"></div>
            <div className="bg-white p-[32px]  flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Image
                  src="/images/profile-default.jpg"
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-xl font-medium">Otavali Saksonov</h2>
                  <p className="text-[#808080]">otavalisaksonov@gmail.com</p>
                </div>
              </div>

              <div>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: "initial",
                    fontFamily: "DM Sans, sans-serif",
                    backgroundColor: "#4182F9",
                  }}
                >
                  Tahrirlash
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 grid grid-cols-12 gap-[32px] px-[32px] mb-[40px]">
          <Input
            label={"F.I.O."}
            placeholder={"F.I.O"}
            classNames="col-span-6"
            inputClass={
              "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
            }
          />

          <Input
            label={"Email manzili"}
            placeholder={"Emailingizni kiriting"}
            classNames="col-span-6"
            inputClass={
              "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
            }
          />

          <Input
            label={"Telefon raqami"}
            placeholder={"Telefon raqamingizni kiriting"}
            classNames="col-span-6"
            inputClass={
              "border-none bg-[#F9F9F9] !h-[52px] px-[20px] py-[16px]"
            }
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
