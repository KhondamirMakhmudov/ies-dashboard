import React, { useState } from "react";

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
      <a
        href="/"
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <HomeIcon size={18} />
      </a>

      {/* Breadcrumb Items */}
      {paths.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRightIcon size={16} className="text-gray-400" />

          {crumb.isCurrent ? (
            <span className="text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <a
              href={crumb.href}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {crumb.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Demo Component
const BreadcrumbDemo = () => {
  const [selectedExample, setSelectedExample] = useState("dashboard-access");

  const examples = {
    home: {
      name: "Home Only",
      path: "/",
      breadcrumbs: [],
    },
    about: {
      name: "About",
      path: "/about",
      breadcrumbs: [{ label: "About", href: "/about", isCurrent: true }],
    },
    "about-detail": {
      name: "About / Company Info",
      path: "/about/company-info",
      breadcrumbs: [
        { label: "About", href: "/about", isCurrent: false },
        { label: "Company Info", href: "/about/company-info", isCurrent: true },
      ],
    },
    dashboard: {
      name: "Dashboard",
      path: "/dashboard",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard", isCurrent: true },
      ],
    },
    "dashboard-access": {
      name: "Dashboard / Access Points",
      path: "/dashboard/access-points",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard", isCurrent: false },
        {
          label: "Access Points",
          href: "/dashboard/access-points",
          isCurrent: true,
        },
      ],
    },
    "dashboard-access-detail": {
      name: "Dashboard / Access Points / #12345",
      path: "/dashboard/access-points/12345",
      breadcrumbs: [
        { label: "Dashboard", href: "/dashboard", isCurrent: false },
        {
          label: "Access Points",
          href: "/dashboard/access-points",
          isCurrent: false,
        },
        {
          label: "Access Point #12345",
          href: "/dashboard/access-points/12345",
          isCurrent: true,
        },
      ],
    },
    products: {
      name: "Products / Electronics / Laptops",
      path: "/products/electronics/laptops",
      breadcrumbs: [
        { label: "Products", href: "/products", isCurrent: false },
        {
          label: "Electronics",
          href: "/products/electronics",
          isCurrent: false,
        },
        {
          label: "Laptops",
          href: "/products/electronics/laptops",
          isCurrent: true,
        },
      ],
    },
  };

  const currentExample = examples[selectedExample];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Breadcrumb Component
          </h1>
          <p className="text-gray-600">
            Minimalist navigation component with custom SVG icons and Tailwind
            CSS
          </p>
        </div>

        {/* Current Breadcrumb Display */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Current Path:{" "}
            <span className="font-mono text-blue-600">
              {currentExample.path}
            </span>
          </h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Breadcrumb paths={currentExample.breadcrumbs} />
          </div>
        </div>

        {/* Path Examples */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Try Different Paths
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(examples).map(([key, example]) => (
              <button
                key={key}
                onClick={() => setSelectedExample(key)}
                className={`px-4 py-3 rounded-lg text-left text-sm transition-all ${
                  selectedExample === key
                    ? "bg-blue-50 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium">{example.name}</div>
                <div className="text-xs text-gray-500 font-mono mt-1">
                  {example.path}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Usage Code */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Usage Example
          </h2>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            {`import Breadcrumb from '@/components/Breadcrumb';

// Simple usage
<Breadcrumb 
  paths={[
    { label: 'Dashboard', href: '/dashboard', isCurrent: false },
    { label: 'Access Points', href: '/dashboard/access-points', isCurrent: true }
  ]}
/>

// More complex example
<Breadcrumb 
  paths={[
    { label: 'Home', href: '/', isCurrent: false },
    { label: 'Products', href: '/products', isCurrent: false },
    { label: 'Electronics', href: '/products/electronics', isCurrent: false },
    { label: 'Laptops', href: '/products/electronics/laptops', isCurrent: true }
  ]}
/>`}
          </pre>
        </div>

        {/* Current Example Data */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Current Example Data
          </h2>
          <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(currentExample.breadcrumbs, null, 2)}
          </pre>
        </div>

        {/* Icon Customization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Custom SVG Icons
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            The component uses custom SVG icons that can be easily customized by
            modifying the icon components:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HomeIcon size={24} className="text-blue-600" />
                <span className="font-medium text-sm">Home Icon</span>
              </div>
              <p className="text-xs text-gray-600">SVG house icon</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ChevronRightIcon size={24} className="text-blue-600" />
                <span className="font-medium text-sm">Chevron Icon</span>
              </div>
              <p className="text-xs text-gray-600">SVG right arrow</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Features</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>No external icon dependencies</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Custom SVG icons (easily customizable)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Minimalist design with Tailwind CSS</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Hover effects and smooth transitions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Current page highlighted in bold</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Flexible paths configuration</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Accessible navigation markup</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Lightweight and fast</span>
            </li>
          </ul>
        </div>

        {/* Integration Guide */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-3">
            💡 Integration with Next.js Router
          </h2>
          <p className="text-sm text-blue-800 mb-3">
            To auto-generate breadcrumbs from your Next.js route, you can create
            a helper function:
          </p>
          <pre className="text-xs text-blue-900 bg-white p-4 rounded-lg overflow-x-auto">
            {`import { useRouter } from 'next/router';

const useBreadcrumbs = () => {
  const router = useRouter();
  const pathArray = router.pathname.split('/').filter(path => path);
  
  return pathArray.map((path, index) => {
    const href = '/' + pathArray.slice(0, index + 1).join('/');
    const label = path.charAt(0).toUpperCase() + path.slice(1);
    const isCurrent = index === pathArray.length - 1;
    
    return { label, href, isCurrent };
  });
};

// Then use it in your component:
const breadcrumbs = useBreadcrumbs();
<Breadcrumb paths={breadcrumbs} />`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbDemo;
