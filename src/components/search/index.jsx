import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";

export default function CustomSearch({
  onSearch,
  placeholder = "Поиск...",
  delay = 300,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch?.(searchValue);
    }, delay);

    return () => clearTimeout(timeout); // debounce effect
  }, [searchValue]);

  return (
    <div className="relative w-fit cursor-pointer">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-black focus:outline-none cursor-pointer"
        >
          <SearchIcon size={22} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              placeholder={placeholder}
              className="px-3 py-[6px] border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
