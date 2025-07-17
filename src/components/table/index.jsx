import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const CustomTable = ({ data, columns, pagination }) => {
  const hasPagination = !!pagination;
  const {
    currentPage = 1,
    pageSize = 10,
    onPaginationChange = () => {},
  } = pagination || {};

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPaginationChange({
        page: currentPage - 1,
        offset: (currentPage - 2) * pageSize,
        limit: pageSize,
      });
    }
  };

  const handleNext = () => {
    // Ma’lumot kelmay qolgan holatda tugmani yashirishingiz mumkin
    onPaginationChange({
      page: currentPage + 1,
      offset: currentPage * pageSize,
      limit: pageSize,
    });
  };

  return (
    <div className="overflow-x-auto border-none rounded-lg">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-[#F4F7FE]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 font-medium cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : header.column.getIsSorted() === "desc" ? (
                      <ArrowDownwardIcon fontSize="small" />
                    ) : (
                      <UnfoldMoreIcon
                        fontSize="small"
                        className="text-gray-400"
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <motion.tbody layout>
          <AnimatePresence>
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                layout
                key={row.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 border-t border-t-[#E9E9E9]"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </motion.tbody>
      </table>

      {/* Pagination tugmalari */}
      {hasPagination && (
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`px-4 py-1 rounded border text-sm ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            ←
          </button>
          <span className="text-sm pt-1">{currentPage}</span>
          <button
            onClick={handleNext}
            disabled={data.length < pageSize}
            className={`px-4 py-1 rounded border text-sm ${
              data.length < pageSize
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white border-gray-300 hover:bg-gray-100"
            }`}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
