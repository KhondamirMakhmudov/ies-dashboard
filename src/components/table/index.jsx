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
import useAppTheme from "@/hooks/useAppTheme";

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
  const { bg, text, isDark, border } = useAppTheme();
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
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: bg("#ffffff", "#1e1e1e"),
          borderColor: border("#e5e7eb", "#333333"),
        }}
      >
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[15px]">
            <thead
              style={{
                background: isDark
                  ? "linear-gradient(to right, #2a2a2a, #262626)"
                  : "linear-gradient(to right, #f9fafb, rgba(243, 244, 246, 0.8))",
                borderBottom: `1px solid ${border("#e5e7eb", "#333333")}`,
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 font-semibold text-left cursor-pointer transition-colors duration-200 group"
                      style={{
                        color: text("#374151", "#d1d5db"),
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark
                          ? "#333333"
                          : "rgba(229, 231, 235, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: text("#9ca3af", "#6b7280") }}
                            />
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <motion.tbody layout>
              <AnimatePresence>
                {table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    layout
                    key={row.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="border-b transition-colors duration-200"
                    style={{
                      borderColor: border("#f3f4f6", "#2a2a2a"),
                      backgroundColor:
                        index % 2 === 0
                          ? bg(
                              "rgba(249, 250, 251, 0.3)",
                              "rgba(42, 42, 42, 0.3)"
                            )
                          : bg("#ffffff", "#1e1e1e"),
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? "rgba(59, 130, 246, 0.1)"
                        : "rgba(239, 246, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0
                          ? isDark
                            ? "rgba(42, 42, 42, 0.3)"
                            : "rgba(249, 250, 251, 0.3)"
                          : bg("#ffffff", "#1e1e1e");
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4"
                        style={{ color: text("#374151", "#d1d5db") }}
                      >
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
          <div
            className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t"
            style={{
              borderColor: border("#e5e7eb", "#333333"),
              backgroundColor: bg("rgba(249, 250, 251, 0.5)", "#262626"),
            }}
          >
            {/* Results Info */}
            <div
              className="text-sm mb-4 sm:mb-0"
              style={{ color: text("#6b7280", "#9ca3af") }}
            >
              Показано{" "}
              <span
                className="font-semibold"
                style={{ color: text("#1f2937", "#f3f4f6") }}
              >
                {startItem}-{endItem}
              </span>{" "}
              из{" "}
              <span
                className="font-semibold"
                style={{ color: text("#1f2937", "#f3f4f6") }}
              >
                {total}
              </span>{" "}
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
                className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: border("#d1d5db", "#4b5563"),
                  color: text("#6b7280", "#9ca3af"),
                  backgroundColor: bg("#ffffff", "#2a2a2a"),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = bg(
                      "#ffffff",
                      "#333333"
                    );
                    e.currentTarget.style.borderColor = border(
                      "#9ca3af",
                      "#6b7280"
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = bg(
                    "#ffffff",
                    "#2a2a2a"
                  );
                  e.currentTarget.style.borderColor = border(
                    "#d1d5db",
                    "#4b5563"
                  );
                }}
              >
                <ChevronLeft sx={{ fontSize: 20 }} />
              </button>

              {/* Page Numbers */}
              {getPaginationRange(currentPage, totalPages).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePageClick(p)}
                  disabled={p === "..."}
                  className="flex items-center justify-center min-w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor:
                      p === currentPage
                        ? "#3b82f6"
                        : p === "..."
                        ? "transparent"
                        : bg("#ffffff", "#2a2a2a"),
                    borderColor:
                      p === currentPage
                        ? "#3b82f6"
                        : p === "..."
                        ? "transparent"
                        : border("#d1d5db", "#4b5563"),
                    color:
                      p === currentPage
                        ? "#ffffff"
                        : p === "..."
                        ? text("#6b7280", "#6b7280")
                        : text("#6b7280", "#9ca3af"),
                    cursor: p === "..." ? "default" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (p !== "..." && p !== currentPage) {
                      e.currentTarget.style.backgroundColor = bg(
                        "#ffffff",
                        "#333333"
                      );
                      e.currentTarget.style.borderColor = border(
                        "#9ca3af",
                        "#6b7280"
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (p !== "..." && p !== currentPage) {
                      e.currentTarget.style.backgroundColor = bg(
                        "#ffffff",
                        "#2a2a2a"
                      );
                      e.currentTarget.style.borderColor = border(
                        "#d1d5db",
                        "#4b5563"
                      );
                    }
                  }}
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
                className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: border("#d1d5db", "#4b5563"),
                  color: text("#6b7280", "#9ca3af"),
                  backgroundColor: bg("#ffffff", "#2a2a2a"),
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = bg(
                      "#ffffff",
                      "#333333"
                    );
                    e.currentTarget.style.borderColor = border(
                      "#9ca3af",
                      "#6b7280"
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = bg(
                    "#ffffff",
                    "#2a2a2a"
                  );
                  e.currentTarget.style.borderColor = border(
                    "#d1d5db",
                    "#4b5563"
                  );
                }}
              >
                <ChevronRight sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: bg("#f3f4f6", "#2a2a2a") }}
            >
              <UnfoldMore
                sx={{ fontSize: 32 }}
                style={{ color: text("#9ca3af", "#6b7280") }}
              />
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: text("#111827", "#f3f4f6") }}
            >
              Нет данных
            </h3>
            <p
              className="max-w-sm"
              style={{ color: text("#6b7280", "#9ca3af") }}
            >
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
