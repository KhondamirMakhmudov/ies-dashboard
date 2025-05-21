import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import EnhancedTable from "@/components/table";
const Index = () => {
  const columns = [
    { id: "name", label: "Nomi" },
    { id: "category", label: "Kategoriya" },
    { id: "price", label: "Narxi" },
  ];

  const rows = [
    { name: "Kompyuter", category: "Texnika", price: "1200$" },
    { name: "Printer", category: "Ofis", price: "300$" },
    { name: "Monitor", category: "Texnika", price: "400$" },
    { name: "Telefon", category: "Aloqa", price: "700$" },
    { name: "Proyektor", category: "Ofis", price: "600$" },
    { name: "Avtomobil", category: "Transport", price: "15000$" },
  ];
  return (
    <DashboardLayout headerTitle={"Umumiy jadval"}>
      <div className="bg-white p-[12px] my-[50px] rounded-md">
        <div className="grid grid-cols-12 gap-[12px]">
          <div className="col-span-12">
            <EnhancedTable columns={columns} rows={rows} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
