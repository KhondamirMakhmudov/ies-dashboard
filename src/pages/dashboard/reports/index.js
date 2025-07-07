import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const Index = () => {
  return (
    <DashboardLayout headerTitle={"Отчеты"}>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Отчеты</h1>
        <p className="text-gray-500 mt-4">Здесь будут отображаться отчеты.</p>
      </div>
    </DashboardLayout>
  );
};

export default Index;
