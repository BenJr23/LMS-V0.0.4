"use client";

import { useState } from "react";
import Link from "next/link";

const TABS = [
  { id: "announcements", label: "Announcements" },
  { id: "modules", label: "Modules" },
  { id: "requirements", label: "Requirements" },
];

export default function SubjectInstancePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("announcements");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link href="/faculty/dashboard" className="text-blue-700 hover:underline">&larr; Back to Dashboard</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Subject Instance: {params.id}</h1>
      <div className="flex gap-4 border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`py-2 px-4 -mb-px border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? "border-blue-700 text-blue-700 font-semibold"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded shadow p-6 min-h-[200px]">
        {activeTab === "announcements" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Announcements</h2>
            <p className="text-gray-600">No announcements yet.</p>
          </div>
        )}
        {activeTab === "modules" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Modules</h2>
            <p className="text-gray-600">No modules yet.</p>
          </div>
        )}
        {activeTab === "requirements" && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Requirements</h2>
            <p className="text-gray-600">No requirements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
