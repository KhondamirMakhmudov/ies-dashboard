import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import EnhancedTable from "@/components/table";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";
import SimpleModal from "@/components/modal/simple-modal";
import HalfModal from "@/components/modal/half-modal";
import Input from "@/components/input";
const Index = () => {
  const [modal, setModal] = useState(false);
  const [category, setCategory] = useState("");
  const handleClose = () => setModal(false);
  const columns = [
    { id: "name", label: "Nomi" },
    { id: "category", label: "Kategoriya" },
    { id: "price", label: "Narxi" },
  ];

  const handleChange = (event) => {
    setCategory(event.target.value);
  };

  const rows = [
    { name: "Kompyuter", category: "Texnika", price: "1200$" },
    { name: "Printer", category: "Ofis", price: "300$" },
    { name: "Monitor", category: "Texnika", price: "400$" },
    { name: "Telefon", category: "Aloqa", price: "700$" },
    { name: "Proyektor", category: "Ofis", price: "600$" },
    { name: "Avtomobil", category: "Transport", price: "15000$" },
  ];

  const categories = [
    "Kompyuterlar",
    "Printerlar va skanerlar",
    "Monitorlar",
    "Telefonlar va mobil qurilmalar",
    "Proyektorlar",
    "Transport vositalari",
    "Ofis uskunalari",
    "Maxsus uskunalar",
  ];
  return (
    <DashboardLayout headerTitle={"Сотрудники"}>
      <div className="bg-white p-[12px] my-[50px] rounded-md">
        <div className="grid grid-cols-12 gap-[12px] p-2">
          <div className="col-span-12 flex justify-between ">
            <Typography variant="h6">
              Просмотр и управление сотрудниками
            </Typography>

            <Button
              onClick={() => setModal(true)}
              sx={{
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serif",
                backgroundColor: "#4182F9",
                boxShadow: "none",
                color: "white",
                display: "flex",
                gap: "8px",
                fontSize: "17px",
              }}
              variant="contained"
            >
              <PersonAddAlt1Icon />
              <p>Добавить</p>
            </Button>
          </div>
          <div className="col-span-12 flex justify-end"></div>
          <div className="col-span-12">
            <EnhancedTable columns={columns} rows={rows} />
          </div>
        </div>
      </div>

      {modal && (
        <HalfModal isOpen={modal} onClose={handleClose}>
          <Typography
            sx={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "22px",
              fontWeight: "medium",
              marginBottom: "16px",
            }}
          >
            Добавление сотрудника
          </Typography>

          <form className="space-y-[20px]">
            <div className="flex gap-4">
              <Input
                label={"Имя"}
                placeholder={"Nomini kiriting"}
                classNames={"w-1/3"}
              />

              <Input
                label={"Фамилия"}
                placeholder={"Nomini kiriting"}
                classNames={"w-1/3"}
              />

              <Input
                label={"Отчество"}
                placeholder={"Nomini kiriting"}
                classNames={"w-1/3"}
              />
            </div>
            <InputLabel
              id="category-select-label"
              sx={{
                color: "black",
                fontFamily: "DM Sans, sans-serif",
                mb: "2px",
              }}
            >
              Kategoriyani tanlang
            </InputLabel>
            <Select
              labelId="category-select-label"
              id="category-select"
              sx={{
                width: "100%",
                textAlign: "left",
                fontFamily: "DM Sans, sans-serif",
                color: "#000",
              }}
              value={category}
              label="Kategoriyani tanlang"
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>

            <Input label={"Sseriya raqami"} placeholder={"Nomini kiriting"} />

            {category === "Kompyuterlar" && (
              <Input
                label={"MAC address"}
                placeholder={"MAC addressni kiriting"}
              />
            )}

            <Input label={"Biriktirilgan xodim"} placeholder={"Kiriting"} />

            <div className="flex gap-4">
              <Input
                type={"date"}
                label={"Sotib olish sanasi"}
                placeholder={"Kiriting"}
                classNames={"w-1/2"}
              />

              <Input
                label={"Holati"}
                placeholder={"Kiriting"}
                classNames={"w-1/2"}
              />
            </div>
            <Input
              type={"text"}
              label={"Texnik xususiyatlari"}
              placeholder={"Kiriting"}
            />

            <Input
              type={"number"}
              label={"Sotib olish qiymati"}
              placeholder={"Kiriting"}
            />

            <Button
              onClick={() => setModal(false)}
              variant="contained"
              sx={{
                float: "right",
                textTransform: "initial",
                fontFamily: "DM Sans, sans-serifs",
              }}
            >
              Yakunlash
            </Button>
          </form>
        </HalfModal>
      )}
    </DashboardLayout>
  );
};

export default Index;
