"use client"; // agar Next.js app router bo'lsa

import Sidebar from "@/components/dashboard/sidebar";
import Head from "next/head";
import MainContentHeader from "@/components/dashboard/mainContentHeader";
import { useState, useRef } from "react";
import ScrollToTopButton from "@/components/scroll-on-top";

export default function DashboardLayout({ children, headerTitle }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const mainRef = useRef(null);

  return (
    <div className="flex w-full h-screen">
      <Head>
        <title>{headerTitle} | СКУД</title>
      </Head>
      <Sidebar isOpen={isSidebarOpen} />

      <main
        ref={mainRef}
        className="flex-1 p-6 bg-[#F4F7FEFF] overflow-auto relative"
      >
        <MainContentHeader toggleSidebar={toggleSidebar}>
          {headerTitle}
        </MainContentHeader>

        {children}

        {/* Scroll button */}
        <ScrollToTopButton containerRef={mainRef} />
      </main>
    </div>
  );
}
