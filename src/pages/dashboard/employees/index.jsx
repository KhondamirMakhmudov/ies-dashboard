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
import employees from "@/dummy-data/employees";
const Index = () => {
  const [modal, setModal] = useState(false);
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [rank, setRank] = useState("");
  const [education, setEducation] = useState("");
  const handleClose = () => setModal(false);
  const columns = [
    { id: "fullName", label: "ФИО" },
    { id: "position", label: "Должность" },
    { id: "department", label: "Отдел" },
  ];

  const handleChange = (event) => {
    setCategory(event.target.value);
  };

  const rows = [
    {
      fullName: "Ибрагимов Шерзод",
      position: "Инженер",
      department: "Производственный отдел",
    },
    {
      fullName: "Саидова Лола",
      position: "Бухгалтер",
      department: "Финансовый отдел",
    },
    {
      fullName: "Каримов Азиз",
      position: "Оператор",
      department: "Цех №1",
    },
    {
      fullName: "Абдурахманова Зулайхо",
      position: "HR-менеджер",
      department: "Кадровый отдел",
    },
    {
      fullName: "Нурматов Дониёр",
      position: "Электрик",
      department: "Отдел по техническому обслуживанию",
    },
  ];

  const educationLevels = [
    "O'rta",
    "O'rta maxsus",
    "Bakalavr",
    "Magistratura",
    "PhD",
    "Doktorantura",
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
                gap: "4px",
                fontSize: "14px",
              }}
              variant="contained"
            >
              <PersonAddAlt1Icon sx={{ fontSize: "18px" }} />
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

            <div className="flex gap-4">
              <Input
                label={"Телефон номер"}
                placeholder={"Nomini kiriting"}
                classNames={"w-1/2"}
                type={"tel"}
              />

              <Input
                label={"Электронная почта"}
                placeholder={"Nomini kiriting"}
                classNames={"w-1/2"}
                type={"email"}
              />
            </div>

            <div className="flex gap-4">
              <Input
                type={"date"}
                placeholder={"Kiriting"}
                classNames={"w-1/2"}
              />

              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel id="gender-label">Jins</InputLabel>
                <Select
                  labelId="gender-label"
                  value={gender}
                  label="Jins"
                  onChange={(e) => setGender(e.target.value)}
                >
                  <MenuItem value="male">Erkak</MenuItem>
                  <MenuItem value="female">Ayol</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ minWidth: 200 }}>
                <InputLabel id="rank-label">Razryad</InputLabel>
                <Select
                  labelId="rank-label"
                  value={rank}
                  label="Razryad"
                  onChange={(e) => setRank(e.target.value)}
                >
                  {Array.from({ length: 16 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                      {i + 1}-razryad
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div>
              <p>Адресс</p>
              <textarea className="w-full h-[75px] border border-gray-400 rounded-[5px] p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 "></textarea>
            </div>

            <FormControl fullWidth sx={{ marginBottom: "10px" }}>
              <InputLabel id="education-label">Степень образования </InputLabel>
              <Select
                labelId="education-label"
                value={education}
                label="Степень образования "
                onChange={(e) => setEducation(e.target.value)}
              >
                {educationLevels.map((level, index) => (
                  <MenuItem key={index} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {education === "Bakalavr" && (
              <Input
                type={"text"}
                label={"Место образование"}
                placeholder={"Kiriting"}
              />
            )}

            <Input label={"Работа отдел"} placeholder={"Kiriting"} />

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
