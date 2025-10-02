import React from "react";
import Link from "next/link";
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
  return (
    <nav
      className="flex items-center space-x-1 text-sm"
      aria-label="Breadcrumb"
    >
      {/* Home Icon */}
      <Link
        href="/"
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <HomeIcon size={18} />
      </Link>

      {/* Breadcrumb Items */}
      {paths.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon size={16} className="text-gray-400" />

          {crumb.isCurrent ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
