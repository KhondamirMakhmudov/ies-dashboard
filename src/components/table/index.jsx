import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  ChevronLeft,
  ChevronRight,
  MoreHoriz,
} from "@mui/icons-material";

// ✅ Helper: sahifalarni hisoblab beradi (ellipsis bilan)
const getPaginationRange = (currentPage, totalPages, siblingCount = 1) => {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalPageNumbers) {
    return [...Array(totalPages).keys()].map((n) => n + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = [...Array(3 + 2 * siblingCount).keys()].map((n) => n + 1);
    return [...leftRange, "...", totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = [...Array(3 + 2 * siblingCount).keys()].map(
      (n) => totalPages - (3 + 2 * siblingCount) + n + 1
    );
    return [1, "...", ...rightRange];
  }

  if (showLeftDots && showRightDots) {
    return [
      1,
      "...",
      ...Array(rightSibling - leftSibling + 1)
        .fill(0)
        .map((_, i) => leftSibling + i),
      "...",
      totalPages,
    ];
  }

  return [];
};

const CustomTable = ({ data, columns, pagination, tableClassName }) => {
  const {
    currentPage = 1,
    pageSize = 10,
    total = 0,
    onPaginationChange = () => {},
  } = pagination || {};

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage) {
      onPaginationChange({
        page,
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
    }
  };

  return (
    <div className={`${tableClassName}`}>
      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-semibold text-gray-700 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-200/50 group"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium tracking-wide">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <div className="flex flex-col">
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUpward
                              sx={{ fontSize: 16 }}
                              className="text-blue-500"
                            />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDownward
                              sx={{ fontSize: 16 }}
                              className="text-blue-500"
                            />
                          ) : (
                            <UnfoldMore
                              sx={{ fontSize: 16 }}
                              className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <motion.tbody layout className="bg-white">
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    layout
                    key={row.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 text-gray-700">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>

        {/* Pagination & Info */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            {/* Results Info */}
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Показано{" "}
              <span className="font-semibold text-gray-800">
                {startItem}-{endItem}
              </span>{" "}
              из <span className="font-semibold text-gray-800">{total}</span>{" "}
              записей
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                onClick={() =>
                  currentPage > 1 && handlePageClick(currentPage - 1)
                }
                disabled={currentPage === 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition-all duration-200"
              >
                <ChevronLeft sx={{ fontSize: 20 }} />
              </button>

              {/* Page Numbers */}
              {getPaginationRange(currentPage, totalPages).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePageClick(p)}
                  disabled={p === "..."}
                  className={`flex items-center justify-center min-w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    p === currentPage
                      ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                      : p === "..."
                      ? "border-transparent text-gray-500 cursor-default"
                      : "border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 hover:shadow-sm"
                  }`}
                >
                  {p === "..." ? <MoreHoriz sx={{ fontSize: 18 }} /> : p}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() =>
                  currentPage < totalPages && handlePageClick(currentPage + 1)
                }
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition-all duration-200"
              >
                <ChevronRight sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UnfoldMore sx={{ fontSize: 32 }} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет данных
            </h3>
            <p className="text-gray-500 max-w-sm">
              Данные для отображения не найдены. Попробуйте изменить параметры
              фильтрации.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomTable;
