"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function ExcelButton({ onClick, enableHover = true }) {
  const [isHovering, setIsHovering] = useState(false);

  const hovering = enableHover ? isHovering : true;

  return (
    <motion.button
      onMouseEnter={() => enableHover && setIsHovering(true)}
      onMouseLeave={() => enableHover && setIsHovering(false)}
      onClick={onClick}
      initial={{ width: 44 }}
      animate={{ width: hovering ? 180 : 38 }}
      transition={{ duration: 0.3 }}
      className="flex items-center bg-[#00733B] hover:bg-[#00733bf1] py-[10px] px-[8px] rounded-[8px] overflow-hidden text-white gap-2 cursor-pointer"
    >
      <Image
        src="/icons/excel.svg"
        alt="excel"
        width={20}
        height={20}
        className="min-w-[20px] min-h-[20px]"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-xs lg:text-sm font-gilroy whitespace-nowrap"
      >
        Скачать Excel файл
      </motion.span>
    </motion.button>
  );
}
