'use client';

import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { getSubjectInstances } from '@/app/_actions/subjectInstance';
import Link from 'next/link';

// Local type for subject instance
interface SubjectInstance {
  id: string;
  subjectId: string;
  teacherName: string;
  grade: string;
  section: string;
  enrollment: number;
  enrolmentCode: number;
  icon: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

export default function AIAnalyticsPage() {
  const [subjects, setSubjects] = useState<SubjectInstance[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      setLoadingSubjects(true);
      try {
        const res = await getSubjectInstances();
        if (res.success && res.data) {
          setSubjects(res.data as SubjectInstance[]);
          if (res.data.length > 0) setSelectedSubjectId(res.data[0].subject.id);
        } else {
          setSubjects([]);
        }
      } catch {
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  // Mock data for demonstration, keyed by subjectId
  const selectedSubject = subjects.find(s => s.subject.id === selectedSubjectId);
  const subjectCode = selectedSubject ? String(selectedSubject.enrolmentCode) : '';

  const getDetailsLink = (module: string) => `/faculty/ai_analytics/${subjectCode}/${module}`;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">AI Predictive Analytics</h1>
      <p className="text-lg text-gray-700 mb-8">
        This dashboard provides predictive analytics to help faculty identify at-risk students and make data-driven decisions.
      </p>
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Subject:</label>
        {loadingSubjects ? (
          <span>Loading subjects...</span>
        ) : (
          <select
            className="border rounded px-3 py-2 text-gray-800"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.subject.id} value={s.subject.id}>
                {s.subject.name} ({s.grade}-{s.section}) - Code: {s.enrolmentCode}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="grid grid-cols-1 gap-6">
        {/* Student Data Collection Widget */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block bg-blue-100 text-blue-700 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0H3" /></svg>
            </span>
            Student Data Collection
          </h2>
          <p className="text-gray-600 mb-4">View and analyze academic performance and student engagement data.</p>
          {/* Preview: Show first 3 students */}
          <div className="bg-blue-50 rounded p-3 mb-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 px-2">Student Name</th>
                  <th className="text-left py-1 px-2">Grade</th>
                </tr>
              </thead>
              <tbody>
                {selectedSubject && [
                  { name: 'Alice Santos', grade: 92 },
                  { name: 'Ben Cruz', grade: 75 },
                  { name: 'Carla Reyes', grade: 60 },
                ].map((student, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-1 px-2">{student.name}</td>
                    <td className="py-1 px-2">{student.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center">
            <Link
              href={getDetailsLink('student-data')}
              className="bg-[#800000] text-white px-3 py-2 rounded hover:bg-[#a52a2a] transition text-center max-w-xs w-full"
            >
              View Details
            </Link>
          </div>
        </div>
        {/* Predictive Analytics Widget */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block bg-yellow-100 text-yellow-700 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /><circle cx="12" cy="12" r="9" /></svg>
            </span>
            Predictive Analytics
          </h2>
          <p className="text-gray-600 mb-4">Access risk assessment and early warning alerts for students.</p>
          {/* Preview: Show first 2 alerts */}
          <div className="bg-yellow-50 rounded p-3 mb-4">
            <ul className="space-y-1">
              {selectedSubject && [
                { name: 'Alice Santos', reason: 'Low attendance', level: 'High' },
                { name: 'Ben Cruz', reason: 'Low grades', level: 'Medium' },
              ].map((alert, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-[#800000]">{alert.name}</span>
                  <span className="text-gray-700">{alert.reason}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${alert.level === 'High' ? 'bg-red-200 text-red-800' : alert.level === 'Medium' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>{alert.level}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <Link
              href={getDetailsLink('predictive-analytics')}
              className="bg-[#800000] text-white px-3 py-2 rounded hover:bg-[#a52a2a] transition text-center max-w-xs w-full"
            >
              View Details
            </Link>
          </div>
        </div>
        {/* Data Visualization & Reporting Widget */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="inline-block bg-green-100 text-green-700 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l4-4 4 4" /></svg>
            </span>
            Data Visualization & Reporting
          </h2>
          <p className="text-gray-600 mb-4">Explore dashboards, trends, and generate reports.</p>
          {/* Preview: Show a summary */}
          <div className="bg-green-50 rounded p-3 mb-4 text-sm text-gray-700">
            <div>Recent Average Grade: <span className="font-bold">85</span></div>
            <div>Attendance Rate: <span className="font-bold">92%</span></div>
            <div>Reports Generated: <span className="font-bold">3</span></div>
          </div>
          <div className="flex justify-center">
            <Link
              href={getDetailsLink('visualization-reporting')}
              className="bg-[#800000] text-white px-3 py-2 rounded hover:bg-[#a52a2a] transition text-center max-w-xs w-full"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 