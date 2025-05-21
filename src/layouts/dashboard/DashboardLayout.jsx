// layouts/DashboardLayout.tsx
import Sidebar from "@/components/dashboard/sidebar";
import MainContentHeader from "@/components/dashboard/mainContentHeader";
import { useState } from "react";
export default function DashboardLayout({ children, headerTitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <div className="flex w-full h-screen">
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex-1 p-6 bg-[#F4F7FEFF] overflow-auto">
        <MainContentHeader toggleSidebar={toggleSidebar}>
          {headerTitle}
        </MainContentHeader>
        {children}
      </main>
    </div>
  );
}
