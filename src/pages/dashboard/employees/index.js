import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import { useState, useEffect, useMemo } from "react";
import { Typography } from "@mui/material";
import useGetPythonQuery from "@/hooks/python/useGetQuery";
import { URLS } from "@/constants/url";
import { KEYS } from "@/constants/key";
import { config } from "@/config";
import { get } from "lodash";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import ContentLoader from "@/components/loader";
import ExcelButton from "@/components/button/excel-button";
import { exportToExcel } from "@/utils/exportToExcelStyled";
import PrimaryButton from "@/components/button/primary-button";
import useAppTheme from "@/hooks/useAppTheme";
import { canUserDo } from "@/utils/checkpermission";
import { useSession } from "next-auth/react";
import EmployeesTable from "@/components/employees/EmployeesTable";
import EmployeesFilters from "@/components/employees/EmployeesFilters";
import EmployeeCreateModal from "@/components/employees/EmployeeCreateModal";

const initialFormData = {
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
};

const fieldLabels = {
  first_name: "Имя",
  last_name: "Фамилия",
  middle_name: "Отчество",
  email: "Электронная почта",
  phone_number: "Телефон",
  date_of_birth: "Дата рождения",
  tabel_number: "Табельный номер",
  gender: "Пол",
  address: "Адрес",
  education_degree: "Степень образования",
  education_place: "Место получения образования",
  workplace_id: "Рабочее место",
  hire_date: "Дата приема на работу",
};

const Index = () => {
  const { data: session } = useSession();
  const { isDark, bg, border } = useAppTheme();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [open, setOpen] = useState(false);
  const [level1Id, setLevel1Id] = useState(null);
  const [selectUnitCode, setSelectUnitCode] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    gender: "",
    level: "",
    education_degree: "",
    hire_date_from: "",
    hire_date_to: "",
  });

  const [formData, setFormData] = useState(initialFormData);

  const canCreate = canUserDo(session?.user, "employee", "create");
  const canReadEmployee = canUserDo(session?.user, "employee", "all-read");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const buildQueryParams = () => {
    const params = {
      limit: 10000,
      offset: 0,
    };

    if (filters.gender) params.gender = filters.gender;
    if (filters.level) params.level = filters.level;
    if (filters.education_degree)
      params.education_degree = filters.education_degree;
    if (filters.hire_date_from) params.hire_date_from = filters.hire_date_from;
    if (filters.hire_date_to) params.hire_date_to = filters.hire_date_to;

    return params;
  };

  const {
    data: employee,
    isLoading,
    isFetching,
  } = useGetPythonQuery({
    key: [KEYS.employees, filters],
    url: URLS.employees,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      Accept: "application/json",
    },
    enabled: !!session?.accessToken,
    keepPreviousData: true,
    staleTime: 30000,
    params: buildQueryParams(),
  });

  const filteredEmployees = useMemo(() => {
    let data = get(employee, "data.data", []);

    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      data = data.filter((emp) => {
        const fullName =
          `${emp.first_name || ""} ${emp.last_name || ""} ${emp.middle_name || ""}`.toLowerCase();
        return fullName.includes(searchLower);
      });
    }

    return data;
  }, [employee, debouncedSearch]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, pageSize]);

  const { data: level1List } = useGetPythonQuery({
    key: KEYS.organizationalUnits,
    url: URLS.organizationalUnits,
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
    },
    params: { is_root: true, limit: 150 },
    enabled: !!session?.accessToken,
  });

  const { data: workplaceData, isLoading: isLoadingWorkplace } =
    useGetPythonQuery({
      key: [KEYS.workplace, selectUnitCode],
      url: URLS.workplace,
      params: {
        limit: 150,
        unit_code: selectUnitCode ? +selectUnitCode : undefined,
        is_vacant: true,
      },
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
      enabled: !!selectUnitCode && !!session?.accessToken,
    });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const normalizeValidationErrors = (detail) => {
    if (!Array.isArray(detail)) return { fieldErrors: {}, summary: "" };

    const fieldErrors = {};
    const missingFields = [];

    detail.forEach((item) => {
      const field = Array.isArray(item?.loc)
        ? item.loc[item.loc.length - 1]
        : item?.loc;
      const rawMsg = item?.msg || "Некорректное значение";
      const isRequired =
        rawMsg === "Field required" || item?.type === "missing";
      const label = fieldLabels[field] || field;

      fieldErrors[field] = isRequired ? "Обязательное поле" : rawMsg;

      if (isRequired && label) {
        missingFields.push(label);
      }
    });

    const summary = missingFields.length
      ? `Заполните обязательные поля: ${missingFields.join(", ")}`
      : "Проверьте корректность заполнения полей.";

    return { fieldErrors, summary };
  };

  const handlePhotoChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));
    setErrors((prev) => ({
      ...prev,
      photo: undefined,
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

  const hasActiveFilters =
    !!filters.gender ||
    !!filters.level ||
    !!filters.education_degree ||
    !!filters.hire_date_from ||
    !!filters.hire_date_to ||
    !!searchTerm;

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setLevel1Id(null);
    setSelectUnitCode(null);
  };

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
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        },
      );
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 403 && result?.detail) {
          toast.error(result.detail);
          return;
        }

        // Handle new error format with errors array
        if (result?.errors && Array.isArray(result.errors)) {
          const errorMap = {};
          result.errors.forEach((error) => {
            // Translate "Field required" to Russian
            const message = error.message === "Field required" 
              ? "Обязательное поле" 
              : error.message;
            errorMap[error.field] = message;
          });
          setErrors(errorMap);
          toast.error("Пожалуйста, проверьте введённые данные.");
          return;
        }

        if (result?.detail && typeof result.detail === "object") {
          const { fieldErrors, summary } = normalizeValidationErrors(
            result.detail,
          );
          setErrors(fieldErrors);
          toast.error(summary);
          return;
        }
        toast.error("Произошла ошибка.");
        return;
      }
      toast.success("Сотрудник успешно добавлен!");
      setStep(1);
      resetForm();
      queryClient.invalidateQueries(KEYS.employees);
      setOpen(false);
    } catch (error) {
      console.log("Ошибка:", error);
      toast.error("Ошибка сети.");
    }
  };

  const fetchAllEmployeesForExport = async () => {
    try {
      const response = await fetch(
        `${config.PYTHON_API_URL}${URLS.employees}?limit=10000`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
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
      {canReadEmployee && (
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
                      `Экспортировано ${allEmployees.length} сотрудников`,
                    );
                  } else {
                    toast.error("Нет данных для экспорта");
                  }
                }}
              />

              {canCreate && (
                <PrimaryButton onClick={() => setOpen(true)}>
                  Добавить
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      )}

      <EmployeesFilters
        canReadEmployee={canReadEmployee}
        bg={bg}
        border={border}
        isDark={isDark}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        isSearching={isSearching}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        filters={filters}
        setFilters={setFilters}
      />

      <EmployeesTable
        paginatedEmployees={paginatedEmployees}
        filteredEmployees={filteredEmployees}
        currentPage={currentPage}
        pageSize={pageSize}
        setCurrentPage={setCurrentPage}
        isSearching={isSearching}
        isFetching={isFetching}
        onCreate={() => setOpen(true)}
        bg={bg}
        border={border}
      />

      <EmployeeCreateModal
        open={open}
        setOpen={setOpen}
        step={step}
        setStep={setStep}
        isDark={isDark}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        handleChange={handleChange}
        handlePhotoChange={handlePhotoChange}
        onSubmitCreateEmployee={onSubmitCreateEmployee}
        level1List={level1List}
        workplaceData={workplaceData}
        isLoadingWorkplace={isLoadingWorkplace}
        level1Id={level1Id}
        setLevel1Id={setLevel1Id}
        setSelectUnitCode={setSelectUnitCode}
        resetForm={resetForm}
      />
    </DashboardLayout>
  );
};

export default Index;
