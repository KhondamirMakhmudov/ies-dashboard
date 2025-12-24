import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useState, useEffect } from "react";
import Input from "@/components/input";
import { Typography } from "@mui/material";
import ImageUploader from "@/components/image-uploader";
import CustomSelect from "@/components/select";
import MethodModal from "@/components/modal/method-modal";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { config } from "@/config";
import { genderOptions } from "@/constants/static-data";
import { educationLevelOptions } from "@/constants/static-data";
import { razryadOptions } from "@/constants/static-data";
import { get, isEmpty } from "lodash";
import PhoneInputUz from "@/components/input/phone-input";
import toast from "react-hot-toast";
import CustomTable from "@/components/table";
import dayjs from "dayjs";
import { useQueryClient } from "@tanstack/react-query";
import ContentLoader from "@/components/loader";
import BirthDateInput from "@/components/input/birthdate-input";
import NoData from "@/components/no-data";
import ExcelButton from "@/components/button/excel-button";
import { exportToExcel } from "@/utils/exportToExcelStyled";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import PrimaryButton from "@/components/button/primary-button";
import Link from "next/link";
import { Search, FilterList, Close } from "@mui/icons-material";
import useAppTheme from "@/hooks/useAppTheme";
import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
const Index = () => {
  const { isDark, bg, text, border } = useAppTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [level1Id, setLevel1Id] = useState(null);
  const [selectUnitCode, setSelectUnitCode] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    gender: "",
    level: "",
    education_degree: "",
    hire_date_from: "",
    hire_date_to: "",
  });

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

  // Debounce search with loading state
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Build query params based on filters and search
  const buildQueryParams = () => {
    const params = {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };

    // Add search term to BOTH first_name and last_name
    if (debouncedSearch) {
      params.first_name = debouncedSearch;
    }

    // Add other filters
    if (filters.gender) params.gender = filters.gender;
    if (filters.level) params.level = filters.level;
    if (filters.education_degree)
      params.education_degree = filters.education_degree;
    if (filters.hire_date_from) params.hire_date_from = filters.hire_date_from;
    if (filters.hire_date_to) params.hire_date_to = filters.hire_date_to;

    return params;
  };

  // Employee data query with optimized loading states
  const {
    data: employee,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: [KEYS.employees, currentPage, debouncedSearch, filters],
    url: URLS.employees,
    enabled: true,
    keepPreviousData: true,
    staleTime: 30000,
    params: buildQueryParams(),
  });

  // Organization units
  const { data: level1List, isLoading: isLoadingLevel1 } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    params: { is_root: true, limit: 150 },
  });

  // Workplace data
  const { data: workplaceData, isLoading: isLoadingWorkplace } =
    useGetPythonQuery({
      key: [KEYS.workplace, selectUnitCode],
      url: URLS.workplace,
      params: {
        limit: 150,
        unit_code: selectUnitCode ? +selectUnitCode : undefined,
        is_vacant: true,
      },
      enabled: !!selectUnitCode,
    });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    if (value.trim()) {
      setIsSearching(true);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      gender: "",
      level: "",
      education_degree: "",
      hire_date_from: "",
      hire_date_to: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return (
      filters.gender ||
      filters.level ||
      filters.education_degree ||
      filters.hire_date_from ||
      filters.hire_date_to ||
      searchTerm
    );
  };

  // Employee creation POST
  const onSubmitCreateEmployee = async () => {
    try {
      const form = new FormData();

      for (const key in formData) {
        const value = formData[key];
        if (value !== null && value !== undefined && value !== "") {
          if (typeof value === "string" && value.trim() === "") {
            continue;
          }
          form.append(key, value);
        }
      }

      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}`,
        {
          method: "POST",
          body: form,
        }
      );
      const result = await response.json();
      if (!response.ok) {
        if (result?.detail && typeof result.detail === "object") {
          setErrors(result.detail);
          toast.error("Iltimos, kiritilgan ma'lumotlarni tekshiring.");
          return;
        }
        toast.error("Xatolik yuz berdi.");
        return;
      }
      toast.success("Xodim muvaffaqiyatli qo'shildi!");
      setErrors({});
      setStep(1);
      setFormData({
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
      queryClient.invalidateQueries(KEYS.employees);
      setOpen(false);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Tarmoqda xatolik yuz berdi.");
    }
  };

  const handlePhotoChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  const steps = [
    "Asosiy ma'lumotlar",
    "Qo'shimcha ma'lumotlar",
    "Rasm va yakun",
  ];

  const columns = [
    {
      header: "№",
      cell: ({ row }) => {
        return (currentPage - 1) * pageSize + (row.index + 1);
      },
    },
    {
      accessorKey: "last_name",
      header: "Имя сотрудника",
      cell: ({ row }) => {
        const { first_name, last_name, middle_name } = row.original;
        return (
          <div className="font-medium flex items-center gap-2">
            <div className=" border rounded-full  p-0.5 text-sm">
              <PersonIcon />
            </div>
            <p>
              {" "}
              {last_name} {first_name} {middle_name}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "tabel_number",
      header: "Табельный номер",
      cell: ({ row }) => {
        return (
          <span className="font-medium">№{row?.original?.tabel_number}</span>
        );
      },
    },
    {
      accessorKey: "workplace.position.name",
      header: "Должность",
    },
    {
      accessorKey: "hire_date",
      header: "Дата приема на работу",
      cell: ({ row }) => {
        return (
          <span className="font-medium">
            {row?.original?.hire_date
              ? dayjs(row.original.hire_date).format("DD.MM.YYYY")
              : "Дата приема не указана"}
          </span>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className="my-2">
          <Link
            href={`employees/${row.original.id}`}
            className={
              bg("bg-blue-500", "bg-blue-600") +
              " hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md px-4 py-2"
            }
          >
            <span>Подробнее</span>
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Link>
        </div>
      ),
      enableSorting: false,
    },
  ];

  const fetchAllEmployeesForExport = async () => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}?limit=10000`
      );
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching all employees:", error);
      toast.error("Ошибка при загрузке данных для экспорта");
      return [];
    }
  };

  if (isLoading && !employee) {
    return (
      <DashboardLayout>
        <ContentLoader />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout headerTitle={"Сотрудники"}>
      <div
        className=" p-[15px] mt-[10px] rounded-md border border-[#E9E9E9]"
        style={{
          background: bg("white", "#1E1E1E"),
          borderColor: border("#d1d5db", "#4b5563"),
        }}
      >
        <div className="col-span-12 flex justify-between items-center ">
          <Typography variant="h6" fontWeight={"600"}>
            Просмотр и управление сотрудниками
          </Typography>

          <div className="flex gap-2 items-center">
            <ExcelButton
              onClick={async () => {
                const loadingToast = toast.loading("Загрузка данных...");
                const allEmployees = await fetchAllEmployeesForExport();
                toast.dismiss(loadingToast);

                if (allEmployees.length > 0) {
                  exportToExcel(allEmployees);
                  toast.success(
                    `Экспортировано ${allEmployees.length} сотрудников`
                  );
                } else {
                  toast.error("Нет данных для экспорта");
                }
              }}
            />

            <PrimaryButton onClick={() => setOpen(true)}>
              Добавить
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div
        className="bg-white p-4 mt-3 rounded-md border border-gray-200"
        style={{
          background: bg("white", "#1E1E1E"),
          borderColor: border("#d1d5db", "#4b5563"),
        }}
      >
        <div className="flex gap-3 items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Поиск по имени"
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full pl-10 pr-4 py-2.5 ${
                !isDark
                  ? "border border-gray-300 text-gray-800"
                  : "border border-gray-700 text-gray-400"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400 `}
            />

            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              showFilters || hasActiveFilters()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FilterList className="w-5 h-5" />
            Фильтры
            {hasActiveFilters() && (
              <span className="bg-white text-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gender Filter */}
              <div>
                <CustomSelect
                  label={"Пол"}
                  options={genderOptions}
                  value={filters.gender}
                  placeholder="Выберите пол"
                  onChange={(val) =>
                    setFilters((prev) => ({
                      ...prev,
                      gender: val,
                    }))
                  }
                  // required
                  returnObject={false}
                />
              </div>

              {/* Level Filter */}
              <CustomSelect
                label={"Выберите разряд"}
                options={razryadOptions}
                value={filters.level}
                placeholder="Выберите разряд"
                onChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    level: val,
                  }))
                }
                sortOptions={false}
                returnObject={false}
              />

              {/* Education Filter */}
              <CustomSelect
                options={educationLevelOptions}
                value={filters.education_degree}
                label="Степень образования"
                placeholder="Выберите уровень образования"
                onChange={(val) =>
                  setFilters((prev) => ({
                    ...prev,
                    education_degree: val,
                  }))
                }
                // required
                returnObject={false}
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className={`flex items-center gap-2 px-4 py-2 ${
                    !isDark
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-red-600 text-red-50 hover:bg-red-700"
                  } rounded-lg  transition-all font-medium cursor-pointer`}
                >
                  <Close className="w-4 h-4" />
                  Очистить фильтры
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div
          className={`${
            !isDark
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-blue-900 border border-blue-700"
          } p-3 mt-3 rounded-md `}
        >
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium ">Активные фильтры:</span>
            {searchTerm && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Поиск: {searchTerm}
              </span>
            )}
            {filters.gender && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Пол:{" "}
                {genderOptions.find((o) => o.value === filters.gender)?.label ||
                  filters.gender}
              </span>
            )}
            {filters.level && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Разряд:{" "}
                {razryadOptions.find((o) => o.value === filters.level)?.label ||
                  filters.level}
              </span>
            )}
            {filters.education_degree && (
              <span
                className={`px-3 py-1 ${
                  !isDark ? "bg-blue-100" : "bg-blue-500"
                }  rounded-full text-sm`}
              >
                Образование:{" "}
                {educationLevelOptions.find(
                  (o) => o.value === filters.education_degree
                )?.label || filters.education_degree}
              </span>
            )}
            {filters.hire_date_from && (
              <span className="px-3 py-1 bg-blue-100 rounded-full text-sm">
                От: {dayjs(filters.hire_date_from).format("DD.MM.YYYY")}
              </span>
            )}
            {filters.hire_date_to && (
              <span className="px-3 py-1 bg-blue-100 rounded-full text-sm">
                До: {dayjs(filters.hire_date_to).format("DD.MM.YYYY")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table with smooth loading states */}
      {isSearching && isFetching ? (
        <div className="bg-white p-4 mt-3 rounded-md border border-gray-200">
          <ContentLoader />
        </div>
      ) : isEmpty(get(employee, "data.data", [])) ? (
        <NoData onCreate={() => setOpen(true)} />
      ) : (
        <div
          className="p-[12px] mt-[10px] mb-[50px] rounded-md border border-[#E9E9E9]"
          style={{
            backgroundColor: bg("#ffffff", "#1e1e1e"),
            borderColor: border("#e5e7eb", "#333333"),
          }}
        >
          <div className="grid grid-cols-12 gap-[12px] p-2">
            <div className="col-span-12">
              <CustomTable
                data={get(employee, "data.data", [])}
                columns={columns}
                pagination={{
                  currentPage,
                  pageSize,
                  total: get(employee, "data.count", 0),
                  onPaginationChange: ({ page }) => setCurrentPage(page),
                }}
              />

              {isFetching && (
                <div className="flex justify-center py-2 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    Обновление данных...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MethodModal
        open={open}
        closeClick={() => {
          setOpen(false);
          setStep(1);
          setFormData({
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
        }}
        title={"Добавить нового сотрудника"}
        showCloseIcon={true}
      >
        <div className="flex items-center justify-between my-6">
          {steps.map((_, index) => {
            const current = index + 1;
            const isActive = step === current;
            const isCompleted = step > current;

            return (
              <div
                key={index}
                className="flex items-center w-full cursor-pointer"
                onClick={() => setStep(current)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[15px] font-bold transition-colors
                    ${
                      isActive
                        ? "bg-blue-600"
                        : isCompleted
                        ? "bg-green-500 hover:bg-green-600"
                        : `${
                            isDark
                              ? "bg-gray-600 hover:bg-gray-500"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`
                    }`}
                >
                  {current}
                </div>

                {index !== steps.length - 1 && (
                  <div
                    className={`flex-1 h-[2px] ${
                      isDark ? "bg-gray-600" : "bg-gray-300"
                    } mx-2 relative`}
                  >
                    <div
                      className={`absolute top-0 left-0 h-full transition-all ${
                        step > current ? "bg-green-500 w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-3">
            <Input
              label={"Имя сотрудника"}
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Имя"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
              error={errors.first_name}
            />
            <Input
              label={"Фамилия сотрудника"}
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Фамилия"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
            />
            <Input
              label={"Отчество сотрудника"}
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              placeholder="Отчество"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
            />

            <Input
              label={"Электронная почта"}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Электронная почта"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
              error={errors.email}
            />
            <PhoneInputUz
              label={"Телефон номер сотрудника"}
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Телефонный номер"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
              error={errors.phone_number}
            />

            <div className="flex gap-2">
              <BirthDateInput
                value={formData.date_of_birth}
                onChange={handleChange}
                error={errors.date_of_birth}
                inputClass={`!h-[45px] border ${
                  isDark ? "!border-gray-800" : "!border-gray-300"
                }`}
              />

              <CustomSelect
                label={"Пол"}
                options={genderOptions}
                value={formData.gender}
                placeholder="Выберите пол"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: val,
                  }))
                }
                returnObject={false}
              />
            </div>

            <Input
              name="address"
              value={formData.address}
              label={"Адрес проживания"}
              onChange={handleChange}
              placeholder="Введите адрес"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
            />
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-3">
            <CustomSelect
              options={educationLevelOptions}
              value={formData.education_degree}
              label="Степень образования"
              placeholder="Выберите уровень образования"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  education_degree: val,
                }))
              }
              returnObject={false}
            />

            <Input
              name="education_place"
              value={formData.education_place}
              onChange={handleChange}
              placeholder={"Введите"}
              label="Место получения образования"
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
            />
            <div className="flex gap-2 ">
              <Input
                name="tabel_number"
                label={"Табельный номер"}
                value={formData.tabel_number}
                onChange={handleChange}
                placeholder="Введите"
                inputClass={`!h-[45px] border ${
                  isDark ? "!border-gray-800" : "!border-gray-300"
                }`}
                error={errors.tabel_number}
              />

              <CustomSelect
                label={"Выберите разряд"}
                options={razryadOptions}
                value={formData.level}
                placeholder="Выберите разряд"
                onChange={(val) =>
                  setFormData((prev) => ({
                    ...prev,
                    level: val,
                  }))
                }
                sortOptions={false}
                returnObject={false}
              />
            </div>
            <Input
              name="hire_date"
              type="date"
              label={"Дата приема на работу"}
              value={formData.hire_date}
              onChange={handleChange}
              inputClass={`!h-[45px] border ${
                isDark ? "!border-gray-800" : "!border-gray-300"
              }`}
              error={errors.hire_date}
            />

            {/* LEVEL 1 */}
            <CustomSelect
              options={get(level1List, "data", []).map((i) => ({
                value: i.unit_code,
                label: i.name,
              }))}
              value={level1Id}
              placeholder="Выберите"
              onChange={(val) => {
                setLevel1Id(val);
                setSelectUnitCode(val);
              }}
              returnObject={false}
            />

            <CustomSelect
              options={get(workplaceData, "data", []).map((w) => ({
                value: w.id,
                label: `${w.organizational_unit.name} - ${w.position.name}`,
              }))}
              value={formData.workplace_id}
              placeholder="Выберите рабочее место"
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  workplace_id: val,
                }))
              }
              isLoading={isLoadingWorkplace}
              returnObject={false}
            />
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-3">
            <div
              className={`${
                isDark
                  ? "bg-blue-900/30 border-blue-500"
                  : "bg-blue-50 border-blue-400"
              } border-l-4 p-3 mb-8 rounded-r-lg`}
            >
              <div
                className={`text-[16px] font-semibold ${
                  isDark ? "text-blue-300" : "text-blue-800"
                } mb-4 items-center flex gap-1`}
              >
                <ReportGmailerrorredIcon />
                <h2>Требования к фотографии</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div
                    className={`w-2 h-2 ${
                      isDark ? "bg-blue-500" : "bg-blue-400"
                    } rounded-full mt-2 mr-3 flex-shrink-0`}
                  ></div>
                  <div>
                    <span
                      className={`font-medium ${
                        isDark ? "text-blue-300" : "text-blue-800"
                      }`}
                    >
                      Размер файла:
                    </span>
                    <span
                      className={isDark ? "text-blue-200" : "text-blue-700"}
                    >
                      {" "}
                      Максимум 10МБ
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div
                    className={`w-2 h-2 ${
                      isDark ? "bg-blue-500" : "bg-blue-400"
                    } rounded-full mt-2 mr-3 flex-shrink-0`}
                  ></div>
                  <div>
                    <span
                      className={`font-medium ${
                        isDark ? "text-blue-300" : "text-blue-800"
                      }`}
                    >
                      Положение лица:
                    </span>
                    <span
                      className={isDark ? "text-blue-200" : "text-blue-700"}
                    >
                      {" "}
                      Ваше лицо должно быть в центре фотографии
                    </span>
                  </div>
                </div>
                <div className="flex items-start">
                  <div
                    className={`w-2 h-2 ${
                      isDark ? "bg-blue-500" : "bg-blue-400"
                    } rounded-full mt-2 mr-3 flex-shrink-0`}
                  ></div>
                  <div>
                    <span
                      className={`font-medium ${
                        isDark ? "text-blue-300" : "text-blue-800"
                      }`}
                    >
                      Качество изображения:
                    </span>
                    <span
                      className={isDark ? "text-blue-200" : "text-blue-700"}
                    >
                      {" "}
                      Четкое, хорошо освещенное фото с резким фокусом
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ImageUploader
                image={formData.photo}
                onFileChange={handlePhotoChange}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          {step > 1 ? (
            <PrimaryButton
              onClick={handlePrev}
              backgroundColor={isDark ? "#374151" : "#EDEDF2"}
              color={isDark ? "white" : "black"}
            >
              Назад
            </PrimaryButton>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <PrimaryButton onClick={handleNext}>Вперёд</PrimaryButton>
          ) : (
            <PrimaryButton onClick={onSubmitCreateEmployee}>
              Закончить
            </PrimaryButton>
          )}
        </div>
      </MethodModal>
    </DashboardLayout>
  );
};

export default Index;
