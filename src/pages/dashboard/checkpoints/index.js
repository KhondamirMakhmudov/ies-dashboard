import DashboardLayout from "@/layouts/dashboard/DashboardLayout";

const Index = () => {
  return (
    <DashboardLayout headerTitle={"Контрольные точки"}>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Контрольные точки</h1>
        <p className="text-gray-500 mt-4">
          Здесь будут отображаться контрольные точки.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Index;
