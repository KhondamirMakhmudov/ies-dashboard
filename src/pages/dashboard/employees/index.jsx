import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import EnhancedTable from "@/components/table";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import { useState } from "react";
import HalfModal from "@/components/modal/half-modal";
import Input from "@/components/input";
import Image from "next/image";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  TextField,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { employees } from "@/dummy-data/employees";
import EmployeeDetailsTabs from "@/components/tab";
import {motion} from "framer-motion";
import ImageUploader from "@/components/image-uploader";

const Index = () => {
  const [modal, setModal] = useState(false);
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [rank, setRank] = useState("");
  const [education, setEducation] = useState("");
  const [showDropdownMain, setShowDropdownMain] = useState(false);
  const [showDropdownLabor, setShowDropDownLabor] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleOpen = (employee) => {
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleCloseEmployeeModal = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };
  const handleClose = () => setModal(false);
  const columns = [
    { id: "fullName", label: "ФИО" },
    { id: "position", label: "Должность" },
    { id: "department", label: "Отдел" },
  ];

  const handleChange = (event) => {
    setCategory(event.target.value);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",

    bgcolor: "#F4F7FE",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

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

            <div className="flex gap-2">
              <button className="flex gap-x-[10px] bg-[#00733B] hover:bg-[#00733bf1] scale-100 active:scale-90  lg:py-[9px] py-[10px] lg:px-[15px] px-[10px] items-center rounded-[8px] transform-all duration-200">
                <Image
                  src={"/icons/excel.svg"}
                  alt="excel"
                  width={20}
                  height={20}
                  className=""
                />
                <p className="text-xs lg:text-sm font-gilroy text-white ">
                  Excel
                </p>
              </button>

              <button className="flex gap-x-[10px] bg-[#F73E2E] hover:bg-[#E43A2A] scale-100 active:scale-90  lg:py-[9px] py-[10px] lg:px-[15px] px-[10px] items-center rounded-[8px] transform-all duration-200">
                <PictureAsPdfRoundedIcon sx={{ color: "white" }} />
                <p className="text-xs lg:text-sm font-gilroy text-white ">
                  PDF
                </p>
              </button>

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
                  borderRadius: "8px",
                }}
                variant="contained"
              >
                <PersonAddAlt1Icon sx={{ fontSize: "18px" }} />
                <p>Добавить</p>
              </Button>
            </div>
          </div>
          <div className="col-span-12 flex justify-end"></div>
          <div className="col-span-12">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "600" }}>ФИО</TableCell>
                    <TableCell sx={{ fontWeight: "600" }}>Должность</TableCell>
                    <TableCell sx={{ fontWeight: "600" }}>Отдел</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "600" }}>
                      Действие
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell sx={{ fontFamily: "DM Sans, sans-serif" }}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Image
                            src="/images/emloyee.png"
                            alt="profile"
                            width={30}
                            height={30}
                            style={{ borderRadius: "50%" }}
                          />
                          <Typography variant="body1">
                            {emp.fullName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontFamily: "DM Sans, sans-serif" }}>
                        {emp.position}
                      </TableCell>
                      <TableCell sx={{ fontFamily: "DM Sans, sans-serif" }}>
                        {emp.department}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpen(emp)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={handleCloseEmployeeModal}>
        <Box sx={style}>
          {selectedEmployee && (
            <div className="grid grid-cols-12 gap-3 w-[1200px]">
              <div className="col-span-3 rounded-md bg-white p-5 flex flex-col gap-5 items-center justify-center">
                <Image
                  src="/images/employee-img.png"
                  alt="profile"
                  width={203}
                  height={203}
                />
                <TextField
                  fullWidth
                  label="Имя"
                  value=" Наубетов Дастан Ниятович"
                />

                <TextField
                  fullWidth
                  label="Телефоный номер"
                  value="+998(90)-232-23-23"
                />

                <TextField
                  fullWidth
                  label="Электронная почта"
                  value="example@gmail.com"
                />
              </div>
              <div className="col-span-9 rounded-md bg-white p-2 flex items-center justify-center">
                <EmployeeDetailsTabs />
              </div>
            </div>
          )}
        </Box>
      </Modal>

      {modal && (
        <HalfModal width="w-1/3" isOpen={modal} onClose={handleClose}>
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

          <form className="space-y-[20px] py-[30px]">
            {/* Asosiy ma'lumotlar */}
            <div className="border border-[#E9E9E9] p-3 rounded-xl">
              <div onClick={() => setShowDropdownMain(!showDropdownMain)} className="flex justify-between items-center cursor-pointer">
                <Typography variant="h7">Основные данные</Typography>
                
                <IconButton>
                  <KeyboardArrowDownIcon/>
                </IconButton>
              </div>

              {!showDropdownMain &&               
                <motion.div initial={{ opacity: 0, translateY: "-30px" }} animate={{ opacity: 1, translateY: 0 }} className="cursor-pointer">
                  <Input
                    label="Имя"
                    placeholder="Имя пользователя"
                    classNames="w-full my-[10px]"
                    inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                    labelClass="text-sm"
                  />

                  <Input
                    label="Фамилия"
                    placeholder="Фамилия пользователя"
                    classNames="w-full my-[10px]"
                    inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                    labelClass="text-sm"
                  />

                  <Input
                    label="Отчество"
                    placeholder="Отчество пользователя"
                    classNames="w-full my-[10px]"
                    inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                    labelClass="text-sm"
                  />

                  <Input
                    label="Телефон номер"
                    placeholder="Введите номер телефона"
                    classNames="w-full my-[10px]"
                    inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                    labelClass="text-sm"
                    type="tel"
                  />

                  <Input
                    label="Электронная почта"
                    placeholder="example@mail.ru"
                    classNames="w-full my-[10px]"
                    inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                    labelClass="text-sm"
                    type="email"
                  />

                  <Input
                    type="date"
                    label="Дата рождения"
                    placeholder="Выберите дату рождения"
                    classNames="w-full my-[10px]"
                    inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                    labelClass="text-sm"
                  />

                  <FormControl fullWidth sx={{ minWidth: 200 }}>
                    <InputLabel                       sx={{
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        px: "4px",
                        mx: "4px",
                      }} id="gender-label">Jins</InputLabel>
                    <Select
                                          sx={{
                        height: "45px",
                        borderRadius: "5px",
                        backgroundColor: "#fff",
                       
                        fontSize: "14px",
                        "& fieldset": {
                          border: "1px solid #E9E9E9", // border style
                          borderRadius: "8px",         // radius
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: "8px",
                          },
                        },
                      }}
                      labelId="gender-label"
                      value={gender}
                      label="Jins"
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <MenuItem value="male">Erkak</MenuItem>
                      <MenuItem value="female">Ayol</MenuItem>
                    </Select>
                </FormControl>
                </motion.div>
              }
            </div>

            {/* Ishlash joyi va o'qigan joyi */}
            <div className="border border-[#E9E9E9] p-3 rounded-xl">
                <div onClick={() => setShowDropDownLabor(!showDropdownLabor)} className="flex justify-between items-center cursor-pointer">
                  <Typography variant="h7">Место учебы и место работы</Typography>
                  
                  <IconButton>
                    <KeyboardArrowDownIcon/>
                  </IconButton>


              </div>
                {showDropdownLabor && 
                <motion.div initial={{ opacity: 0, translateY: "-30px" }} animate={{ opacity: 1, translateY: 0 }} className="mt-[15px]">
                  <FormControl fullWidth sx={{ mb: "10px" }}>
                    <InputLabel
                      id="education-label"
                      sx={{
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        px: "4px",
                        mx: "4px",
                      }}
                    >
                      Степень образования
                    </InputLabel>

                    <Select
                      labelId="education-label"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      label="Степень образования"
                      sx={{
                        height: "45px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontSize: "14px",
                        "& fieldset": {
                          border: "1px solid #E9E9E9", // border style
                          borderRadius: "8px",         // radius
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            borderRadius: "8px",
                          },
                        },
                      }}
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
                          classNames="w-full my-[10px]"
                          inputClass="!h-[40px] text-sm !border-[#E9E9E9]"
                          labelClass="text-sm"
                      />
                    )}

                  <FormControl fullWidth sx={{ my: "10px" }}>
                    <InputLabel 
                      id="rank-label"
                      sx={{
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        px: "4px",
                        mx: "3px",
                      }}
                    >Razryad</InputLabel>
                    <Select
                      labelId="rank-label"
                      value={rank}
                      label="Razryad"
                      sx={{
                        height: "45px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontSize: "14px",
                        "& fieldset": {
                          border: "1px solid #E9E9E9", // border style
                          borderRadius: "8px",         // radius
                        },
                      }}
                      onChange={(e) => setRank(e.target.value)}
                    >
                      {Array.from({ length: 16 }, (_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}-razryad
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>
                }
            </div>

            <div>
              <ImageUploader/>
            </div>


            {/* <div>
              <p>Адресс</p>
              <textarea className="w-full h-[75px] border border-gray-400 rounded-[5px] p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 "></textarea>
            </div>



            <Input label={"Работа отдел"} placeholder={"Kiriting"} /> */}

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
