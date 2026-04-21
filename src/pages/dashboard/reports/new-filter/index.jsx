import React from "react";
import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import FilterBuilder from "@/components/filter-form";

const Index = () => {
  const [filters, setFilters] = React.useState({
    employeeIds: [],
    type: "",
    timeFrom: "",
    timeTo: "",
    eventType: "",
    logic: "AND",
  });

  return (
    <DashboardLayout headerTitle="Новый фильтр">
      <div className="py-5">
        <FilterBuilder />
      </div>
    </DashboardLayout>
  );
};

export default Index;
