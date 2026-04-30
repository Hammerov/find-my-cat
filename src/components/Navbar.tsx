"use client";

import { Plus } from "lucide-react";

type NavbarProps = {
  onReportClick: () => void;
};

export default function Navbar({ onReportClick }: NavbarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-10 p-4">
      <h1 className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/30 px-5 py-2 text-lg font-semibold text-gray-900 shadow backdrop-blur-md">
        Find My Cat
      </h1>
      <button
        type="button"
        onClick={onReportClick}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow"
      >
        <Plus size={18} />
        Report
      </button>
    </div>
  );
}
