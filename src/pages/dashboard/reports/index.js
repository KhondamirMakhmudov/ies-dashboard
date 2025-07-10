import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Input from "@/components/input";
import Image from "next/image";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { exportToExcelStyled } from "@/utils/exportToExcelStyled";
import { getEmployeesLogsByRange } from "@/utils/getEmployeesLogsByRange";
import { toast } from "react-hot-toast";
import ContentLoader from "@/components/loader";
import { useSession } from "next-auth/react";

const Index = () => {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const token = session.accessToken;
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleExport = async () => {
    setIsExporting(true); // 👈 Loadingni yoqamiz
    try {
      const data = await getEmployeesLogsByRange({
        token,
        rangeString: employeeId,
        startDate,
        endDate,
      });

      if (!data || data.length === 0) {
        toast.error("Ma'lumot topilmadi.");
        return;
      }

      exportToExcelStyled(data);
      toast.success("Excel файл успешно загружен.");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Ошибка при загрузке Excel файла.");
    } finally {
      setIsExporting(false); // 👈 Loadingni o‘chiramiz
    }
  };

  if (!isClient) return null;

  return (
    <DashboardLayout headerTitle={"Отчеты"}>
      <div className="grid grid-cols-12 gap-[12px]">
        {isExporting ? (
          <div className="col-span-12">
            <ContentLoader />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white col-span-12 p-6 my-[50px] rounded-md shadow-md w-full"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Сотрудники (диапазон ID ##-##)
              </label>
              <Input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                inputClass={"!h-[44px] border !border-[#C9C9C9]"}
                labelClass={"!font-semibold !text-[#C9C9C9]"}
                placeholder="например, 1-10 или 5"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата начала:
              </label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                inputClass={"!h-[44px] border !border-[#C9C9C9]"}
                labelClass={"!font-semibold !text-[#C9C9C9]"}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Дата окончания:
              </label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                inputClass={"!h-[44px] border !border-[#C9C9C9]"}
                labelClass={"!font-semibold !text-[#C9C9C9]"}
              />
            </div>

            <button
              onClick={handleExport}
              className="flex gap-x-[10px] bg-[#00733B] hover:bg-[#00733bf1] scale-100 active:scale-90 lg:py-[9px] py-[10px] lg:px-[15px] px-[10px] items-center rounded-[8px] transform-all duration-200 cursor-pointer"
            >
              <Image
                src={"/icons/excel.svg"}
                alt="excel"
                width={28}
                height={28}
              />
              <p className="text-xs lg:text-sm font-gilroy text-white">
                Выгрузить в Excel
              </p>
            </button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Index;
