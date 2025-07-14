import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import {
  Button,
  Typography,
  Modal,
  TextField,
  Box,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";

const Index = () => {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState([
    { id: 1, name: "Администрация" },
    { id: 2, name: "Инженерный отдел" },
    { id: 3, name: "Отдел кадров" },
  ]);
  const [editingDept, setEditingDept] = useState(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [departmentsOpen, setDepartmentsOpen] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const toggleDepartments = () => {
    setDepartmentsOpen(!departmentsOpen);
  };

  const filteredEmployees = selectedDepartmentId
    ? employees.filter((emp) => emp.departmentId === selectedDepartmentId)
    : [];

  const handleOpenModal = (dept = null) => {
    setEditingDept(dept);
    setNewDeptName(dept?.name || "");
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setEditingDept(null);
    setNewDeptName("");
  };

  const handleSave = () => {
    if (newDeptName.trim() === "") return;

    if (editingDept) {
      // Edit
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDept.id ? { ...d, name: newDeptName } : d
        )
      );
    } else {
      // Add
      const newDept = {
        id: Date.now(),
        name: newDeptName,
      };
      setDepartments((prev) => [...prev, newDept]);
    }

    handleCloseModal();
  };
  return (
    <DashboardLayout headerTitle={"Структура организации"}>
      <div className="grid grid-cols-12 gap-4 my-[50px]">
        <motion.div
          initial={{ opacity: 0, translateY: "-30px" }}
          animate={{ opacity: 1, translateY: 0 }}
          className="col-span-3 self-start bg-white p-[24px] rounded-md "
        >
          <div>
            <div className="flex justify-between">
              <Typography variant="h6" className="mb-4">
                Отделы
              </Typography>

              <Button
                onClick={() => handleOpenModal()}
                variant="text"
                sx={{
                  borderRadius: "100%",
                  padding: 0,
                  minWidth: 0,
                  width: "32px",
                  height: "32px",

                  transform: departmentsOpen ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.2s ease-in-out",
                }}
              >
                <AddIcon />
              </Button>
            </div>

            {!departmentsOpen && (
              <ul className="space-y-2 mt-[20px]">
                {departments.map((dept) => (
                  <li
                    key={dept.id}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <span>{dept.name}</span>
                    <IconButton
                      onClick={() => handleOpenModal(dept)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, translateY: "30px" }}
          animate={{ opacity: 1, translateY: 0 }}
          className="col-span-9 bg-white p-[24px] rounded-md "
        >
          <Typography variant="h6" className="mb-4">
            Список сотрудников
          </Typography>

          <div className=" mt-[20px]">
            {filteredEmployees.length > 0 ? (
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2 border-b">№</th>
                    <th className="p-2 border-b">ФИО</th>
                    <th className="p-2 border-b">Должность</th>
                    <th className="p-2 border-b">Телефон</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-gray-50">
                      <td className="p-2 border-b">{index + 1}</td>
                      <td className="p-2 border-b">{emp.fullName}</td>
                      <td className="p-2 border-b">{emp.position}</td>
                      <td className="p-2 border-b">{emp.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : selectedDepartmentId ? (
              <p>Сотрудники не найдены для выбранного отдела.</p>
            ) : (
              <p>Пожалуйста, выберите отдел.</p>
            )}
          </div>
        </motion.div>
      </div>
      {/* <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between"></div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">No organizations found.</p>
        </div>
      </div> */}

      <Modal open={open} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" gutterBottom>
            {editingDept ? "Изменить отдел" : "Добавить отдел"}
          </Typography>
          <TextField
            fullWidth
            label="Название отдела"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={handleCloseModal}>Отмена</Button>
            <Button onClick={handleSave} variant="contained">
              Сохранить
            </Button>
          </div>
        </Box>
      </Modal>
    </DashboardLayout>
  );
};

export default Index;
