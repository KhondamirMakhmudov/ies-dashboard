import React from "react";
import Link from "next/link";
import useAppTheme from "@/hooks/useAppTheme";

// Custom SVG Icons
const HomeIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ChevronRightIcon = ({ size = 16, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// Breadcrumb Component
const Breadcrumb = ({ paths = [] }) => {
  const { isDark, text } = useAppTheme();

  return (
    <nav
      className="flex items-center space-x-1 text-sm"
      aria-label="Breadcrumb"
    >
      {/* Home Icon */}
      <Link
        href="/"
        className="flex items-center transition-colors duration-200"
        style={{ color: text("#6b7280", "#9ca3af") }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = text("#374151", "#d1d5db");
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = text("#6b7280", "#9ca3af");
        }}
      >
        <HomeIcon size={18} />
      </Link>

      {/* Breadcrumb Items */}
      {paths.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon
            size={16}
            style={{ color: text("#9ca3af", "#6b7280") }}
          />

          {crumb.isCurrent ? (
            <span
              className="font-medium"
              style={{ color: text("#111827", "#f3f4f6") }}
            >
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="transition-colors duration-200"
              style={{ color: text("#6b7280", "#9ca3af") }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = text("#374151", "#d1d5db");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = text("#6b7280", "#9ca3af");
              }}
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
