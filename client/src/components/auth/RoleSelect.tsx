import React from "react";

export type UserRole = "tenant" | "landlord";

interface RoleSelectProps {
  value: UserRole | null;
  onChange: (role: UserRole) => void;
}

import { Home, Building } from "lucide-react";

export const RoleSelect: React.FC<RoleSelectProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-4 items-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Get started by choosing your role</h2>
      <div className="flex gap-8">
        {/* Tenant Card */}
        <button
          className={`group relative flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 hover:scale-105 active:scale-100 cursor-pointer
            ${value === "tenant"
              ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-100"
              : "border-gray-200 bg-white hover:border-blue-400"}
          `}
          onClick={() => onChange("tenant")}
          type="button"
          aria-pressed={value === "tenant"}
        >
          <span className={`rounded-full p-3 mb-3 transition-all ${value === "tenant" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"}`}>
            <Home className="w-8 h-8" />
          </span>
          <span className="font-semibold text-lg mb-1">Tenant</span>
          <span className="text-xs text-gray-500 px-2 text-center">
            Find, apply for, and manage your rental properties.
          </span>
          {value === "tenant" && (
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
          )}
        </button>

        {/* Landlord Card */}
        <button
          className={`group relative flex flex-col items-center justify-center w-48 h-44 rounded-2xl border-2 shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400/60 hover:scale-105 active:scale-100 cursor-pointer
            ${value === "landlord"
              ? "border-green-600 bg-gradient-to-br from-green-50 to-green-100 shadow-green-100"
              : "border-gray-200 bg-white hover:border-green-400"}
          `}
          onClick={() => onChange("landlord")}
          type="button"
          aria-pressed={value === "landlord"}
        >
          <span className={`rounded-full p-3 mb-3 transition-all ${value === "landlord" ? "bg-green-600 text-white" : "bg-green-100 text-green-600 group-hover:bg-green-200"}`}>
            <Building className="w-8 h-8" />
          </span>
          <span className="font-semibold text-lg mb-1">Landlord</span>
          <span className="text-xs text-gray-500 px-2 text-center">
            List properties, manage tenants, and track payments.
          </span>
          {value === "landlord" && (
            <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
          )}
        </button>
      </div>
    </div>
  );
};
