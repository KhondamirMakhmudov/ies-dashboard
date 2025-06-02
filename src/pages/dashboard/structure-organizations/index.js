import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const Index = () => {
  return (
    <DashboardLayout headerTitle={"Структура организации"}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between"></div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">No organizations found.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
