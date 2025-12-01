"use client";

import useAppTheme from "@/hooks/useAppTheme";
import Sidebar from "@/components/dashboard/sidebar";
import MainContentHeader from "@/components/dashboard/mainContentHeader";
import { useState, useRef, useEffect } from "react";
import ScrollToTopButton from "@/components/scroll-on-top";

export default function DashboardLayout({ children, headerTitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const { bg } = useAppTheme();
  const mainRef = useRef(null);

  // Update document title on client side
  useEffect(() => {
    // Ensure headerTitle is a string
    const titleText =
      typeof headerTitle === "string" ? `${headerTitle} | СКУД` : "СКУД";

    document.title = titleText;
  }, [headerTitle]);

  return (
    <div
      className="flex w-full h-screen"
      style={{ backgroundColor: bg("#fff", "#0a0a0a") }}
    >
      {/* Remove the Head component entirely */}

      <Sidebar isOpen={isSidebarOpen} />

      <main
        ref={mainRef}
        className="flex-1 p-6 overflow-auto relative transition-colors duration-200"
        style={{ backgroundColor: bg("#F4F7FEFF", "#121212") }}
      >
        <MainContentHeader toggleSidebar={toggleSidebar}>
          {headerTitle}
        </MainContentHeader>

        {children}

        <ScrollToTopButton containerRef={mainRef} />
      </main>
    </div>
  );
}
