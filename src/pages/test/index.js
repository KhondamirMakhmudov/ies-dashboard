import { useState } from "react";

import { Button, Typography } from "@mui/material"; // O'zingizning button komponentingiz
import MethodModal from "@/components/modal/method-modal";

export default function AddEmployeeModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone_number: "",
    level: 1,
    hire_date: "",
    date_of_birth: "",
    tabel_number: "",
    gender: "",
    address: "",
    education_degree: "школа",
    education_place: "",
    workplace_id: "",
    photo: null,
  });

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = () => {
    console.log("Yuborilayotgan ma'lumot:", formData);
    // API ga yuborish logikasi bu yerda bo'ladi
    onClose();
  };

  return (
    <MethodModal open={isOpen} onClose={onClose} className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-xl rounded-lg p-6 space-y-4">
          <Typography variant="h6" className="text-xl font-bold">
            Yangi Ishchi Qo‘shish
          </Typography>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-3">
              <input
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ism"
                className="input"
              />
              <input
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Familiya"
                className="input"
              />
              <input
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                placeholder="Otasining ismi"
                className="input"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="input"
              />
              <input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Telefon raqam"
                className="input"
              />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-3">
              <input
                name="tabel_number"
                value={formData.tabel_number}
                onChange={handleChange}
                placeholder="Tabel raqami"
                className="input"
              />
              <input
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleChange}
                className="input"
              />
              <input
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="input"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input"
              >
                <option value="">Jinsi</option>
                <option value="Мужской">Erkak</option>
                <option value="Женский">Ayol</option>
              </select>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Yashash manzili"
                className="input"
              />
              <select
                name="education_degree"
                value={formData.education_degree}
                onChange={handleChange}
                className="input"
              >
                <option value="школа">Maktab</option>
                <option value="колледж">Kollej</option>
                <option value="вуз">OTM</option>
              </select>
              <input
                name="education_place"
                value={formData.education_place}
                onChange={handleChange}
                placeholder="Ta'lim muassasasi"
                className="input"
              />
              <input
                name="workplace_id"
                value={formData.workplace_id}
                onChange={handleChange}
                placeholder="Lavozim ID"
                className="input"
              />
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="input"
              >
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}-razryad
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-3">
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleChange}
                className="input"
              />
              <p className="text-sm text-gray-500">Rasm tanlang va yuboring</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button onClick={handlePrev} variant="secondary">
                Ortga
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button onClick={handleNext}>Keyingi</Button>
            ) : (
              <Button onClick={handleSubmit}>Yuborish</Button>
            )}
          </div>
        </div>
      </div>
    </MethodModal>
  );
}
