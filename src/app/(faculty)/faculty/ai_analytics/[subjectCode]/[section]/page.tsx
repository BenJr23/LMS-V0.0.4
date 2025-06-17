'use client';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

// Mock data for demonstration (should match dashboard mock structure)
const mockDataBySubject: Record<string, { students: { name: string; score: number; level: string }[] }> = {
  '9793': {
    students: [
      { name: 'Alice Santos', score: 92, level: 'High' },
      { name: 'Ben Cruz', score: 75, level: 'Medium' },
      { name: 'Carla Reyes', score: 60, level: 'Medium' },
      { name: 'David Lee', score: 40, level: 'Low' },
      { name: 'Ella Garcia', score: 85, level: 'High' },
    ],
  },
  '3568': {
    students: [
      { name: 'Fiona Lim', score: 88, level: 'High' },
      { name: 'George Tan', score: 55, level: 'Medium' },
      { name: 'Hannah Yu', score: 35, level: 'Low' },
      { name: 'Ivan Cruz', score: 70, level: 'Medium' },
      { name: 'Jessa Ong', score: 95, level: 'High' },
    ],
  },
  '3856': {
    students: [
      { name: 'Ulysses Ong', score: 60, level: 'Medium' },
      { name: 'Vera Cruz', score: 70, level: 'Medium' },
      { name: 'Wendy Yu', score: 80, level: 'High' },
      { name: 'Xander Lee', score: 50, level: 'Low' },
      { name: 'Yana Santos', score: 90, level: 'High' },
    ],
  },
};

function getLevelColor(level: string) {
  switch (level) {
    case 'High':
      return 'text-red-600 font-bold';
    case 'Medium':
      return 'text-yellow-600 font-semibold';
    case 'Low':
      return 'text-green-600 font-semibold';
    default:
      return '';
  }
}

const mockPerformanceData = [
  { name: 'Alice Santos', assignment: 90, exam: 88, participation: 95, history: [88, 90, 92] },
  { name: 'Ben Cruz', assignment: 75, exam: 70, participation: 80, history: [70, 75, 78] },
  { name: 'Carla Reyes', assignment: 60, exam: 65, participation: 70, history: [60, 62, 65] },
];

const mockEngagementData = [
  { name: 'Alice Santos', present: 18, absent: 2, late: 0, participation: 15 },
  { name: 'Ben Cruz', present: 15, absent: 5, late: 1, participation: 12 },
  { name: 'Carla Reyes', present: 12, absent: 8, late: 2, participation: 10 },
];

export default function AnalyticsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { subjectCode, section } = params as { subjectCode: string; section: string };
  const [activeTab, setActiveTab] = useState<'performance' | 'engagement'>('performance');
  const [search, setSearch] = useState('');
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<any>(null);
  const [showHistoryIdx, setShowHistoryIdx] = useState<number | null>(null);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Academic Performance state
  const [performance, setPerformance] = useState(mockPerformanceData);
  // Student Engagement state
  const [engagement, setEngagement] = useState(mockEngagementData);
  const [engEditIdx, setEngEditIdx] = useState<number | null>(null);
  const [engEditRow, setEngEditRow] = useState<any>(null);
  const [engAuditLog, setEngAuditLog] = useState<string[]>([]);
  const [engLastUpdated, setEngLastUpdated] = useState<Date | null>(null);
  const [engSearch, setEngSearch] = useState('');

  // State for engagement chart filters
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('2024');
  const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr'];
  const years = ['2024', '2023'];

  const filtered = performance.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  function handleEdit(idx: number) {
    setEditIdx(idx);
    setEditRow({ ...performance[idx] });
  }
  function handleSave(idx: number) {
    if (!editRow.name.trim()) {
      toast.error('Student name cannot be empty.');
      return;
    }
    if (editRow.assignment < 0 || editRow.exam < 0 || editRow.participation < 0) {
      toast.error('Grades cannot be negative.');
      return;
    }
    const updated = [...performance];
    updated[idx] = { ...editRow, history: [...updated[idx].history, editRow.assignment] };
    setPerformance(updated);
    setEditIdx(null);
    setEditRow(null);
    setAuditLog([`[${new Date().toLocaleString()}] Edited/Added grades for ${updated[idx].name}.`, ...auditLog]);
    setLastUpdated(new Date());
    toast.success('Grade updated successfully!');
  }
  function handleCancel() {
    setEditIdx(null);
    setEditRow(null);
  }
  function handleExport() {
    // Mock export: just alert
    toast.success('Exported as CSV (mock)');
  }

  function handleEngEdit(idx: number) {
    setEngEditIdx(idx);
    setEngEditRow({ ...engagement[idx] });
  }
  function handleEngSave(idx: number) {
    if (!engEditRow.name.trim()) {
      toast.error('Student name cannot be empty.');
      return;
    }
    if (engEditRow.present < 0 || engEditRow.absent < 0 || engEditRow.late < 0 || engEditRow.participation < 0) {
      toast.error('Values cannot be negative.');
      return;
    }
    const updated = [...engagement];
    updated[idx] = { ...engEditRow };
    setEngagement(updated);
    setEngEditIdx(null);
    setEngEditRow(null);
    setEngAuditLog([`[${new Date().toLocaleString()}] Edited/Added engagement for ${updated[idx].name}.`, ...engAuditLog]);
    setEngLastUpdated(new Date());
    toast.success('Engagement updated successfully!');
  }
  function handleEngCancel() {
    setEngEditIdx(null);
    setEngEditRow(null);
  }
  function handleEngExport() {
    toast.success('Engagement exported as CSV (mock)');
  }

  if (section === 'student-data') {
    return (
      <div className="p-8">
        <button
          className="mb-6 text-[#800000] underline hover:text-[#a52a2a]"
          onClick={() => router.push('/faculty/ai_analytics')}
        >
          ← Back to Analytics Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-4">Student Data Collection</h1>
        <div className="mb-6 flex gap-4 border-b">
          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'performance' ? 'border-[#800000] text-[#800000]' : 'border-transparent text-gray-600 hover:text-[#800000]'}`}
            onClick={() => setActiveTab('performance')}
          >
            Academic Performance
          </button>
          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'engagement' ? 'border-[#800000] text-[#800000]' : 'border-transparent text-gray-600 hover:text-[#800000]'}`}
            onClick={() => setActiveTab('engagement')}
          >
            Student Engagement
          </button>
        </div>
        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border rounded px-3 py-2 text-gray-800 w-full max-w-xs"
                />
              </div>
              <div className="flex gap-2 items-center mt-2 md:mt-0">
                <button
                  onClick={handleExport}
                  className="bg-[#800000] text-white px-3 py-2 rounded hover:bg-[#a52a2a] transition text-sm"
                >
                  Export CSV
                </button>
              </div>
              {lastUpdated && (
                <div className="text-xs text-gray-500 mt-2 md:mt-0">Last updated: {lastUpdated.toLocaleString()}</div>
              )}
            </div>
            <table className="min-w-full text-sm bg-white rounded-lg shadow">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-black">Student Name</th>
                  <th className="text-left py-2 px-2 text-black">Assignment</th>
                  <th className="text-left py-2 px-2 text-black">Exam</th>
                  <th className="text-left py-2 px-2 text-black">Participation</th>
                  <th className="text-left py-2 px-2 text-black">Total</th>
                  <th className="text-left py-2 px-2 text-black">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 text-center text-gray-500 italic">No students found.</td></tr>
                ) : (
                  filtered.map((student, idx) => (
                    <tr key={idx} className="border-b last:border-0 text-black">
                      <td className="py-2 px-2">
                        {editIdx === idx ? (
                          <input
                            type="text"
                            value={editRow.name}
                            onChange={e => setEditRow({ ...editRow, name: e.target.value })}
                            className="border rounded px-2 py-1 w-32"
                          />
                        ) : student.name}
                      </td>
                      <td className="py-2 px-2">
                        {editIdx === idx ? (
                          <input
                            type="number"
                            value={editRow.assignment}
                            onChange={e => setEditRow({ ...editRow, assignment: Number(e.target.value) })}
                            className="border rounded px-2 py-1 w-16"
                          />
                        ) : student.assignment}
                      </td>
                      <td className="py-2 px-2">
                        {editIdx === idx ? (
                          <input
                            type="number"
                            value={editRow.exam}
                            onChange={e => setEditRow({ ...editRow, exam: Number(e.target.value) })}
                            className="border rounded px-2 py-1 w-16"
                          />
                        ) : student.exam}
                      </td>
                      <td className="py-2 px-2">
                        {editIdx === idx ? (
                          <input
                            type="number"
                            value={editRow.participation}
                            onChange={e => setEditRow({ ...editRow, participation: Number(e.target.value) })}
                            className="border rounded px-2 py-1 w-16"
                          />
                        ) : student.participation}
                      </td>
                      <td className="py-2 px-2 font-bold">{Math.round((student.assignment + student.exam + student.participation) / 3)}</td>
                      <td className="py-2 px-2 flex gap-2">
                        {editIdx === idx ? (
                          <>
                            <button
                              onClick={() => handleSave(idx)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >Save</button>
                            <button
                              onClick={handleCancel}
                              className="bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-400"
                            >Cancel</button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowHistoryIdx(idx)}
                            className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-300"
                          >View History</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Academic Performance Chart (moved below table) */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-black">Grade Trends</h3>
              <Line
                data={{
                  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                  datasets: [
                    {
                      label: 'Average Grade',
                      data: [85, 88, 82, 90],
                      borderColor: '#4caf50',
                      backgroundColor: 'rgba(76, 175, 80, 0.2)',
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false, labels: { color: 'black', font: { size: 10 } } },
                    title: { display: false },
                  },
                  scales: {
                    x: { title: { display: true, text: 'Quarter', color: 'black', font: { size: 10 } }, ticks: { color: 'black', font: { size: 10 } } },
                    y: { title: { display: true, text: 'Grade', color: 'black', font: { size: 10 } }, beginAtZero: true, max: 100, ticks: { color: 'black', font: { size: 10 } } },
                  },
                }}
                height={120}
              />
            </div>
            {/* History Modal */}
            {showHistoryIdx !== null && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                    onClick={() => setShowHistoryIdx(null)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h3 className="text-2xl font-bold mb-4 text-black">All Students Grade History</h3>
                  <table className="min-w-full text-sm bg-white rounded-lg shadow">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 text-black">Student Name</th>
                        <th className="text-left py-2 px-2 text-black">Grade History</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.map((student, idx) => (
                        <tr key={idx} className="border-b last:border-0 text-black">
                          <td className="py-2 px-2 font-semibold">{student.name}</td>
                          <td className="py-2 px-2">
                            {student.history && student.history.length > 0 ? (
                              <ul className="list-disc pl-4">
                                {student.history.map((grade, i) => (
                                  <li key={i}>Grade: <span className="font-semibold">{grade}</span></li>
                                ))}
                              </ul>
                            ) : (
                              <span className="italic text-gray-400">No history</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'engagement' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={engSearch}
                  onChange={e => setEngSearch(e.target.value)}
                  className="border rounded px-3 py-2 text-gray-800 w-full max-w-xs"
                />
              </div>
              <div className="flex gap-2 items-center mt-2 md:mt-0">
                <button
                  onClick={handleEngExport}
                  className="bg-[#800000] text-white px-3 py-2 rounded hover:bg-[#a52a2a] transition text-sm"
                >
                  Export CSV
                </button>
              </div>
              {engLastUpdated && (
                <div className="text-xs text-gray-500 mt-2 md:mt-0">Last updated: {engLastUpdated.toLocaleString()}</div>
              )}
            </div>
            <table className="min-w-full text-sm bg-white rounded-lg shadow mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-black">Student Name</th>
                  <th className="text-left py-2 px-2 text-black">Present</th>
                  <th className="text-left py-2 px-2 text-black">Absent</th>
                  <th className="text-left py-2 px-2 text-black">Late</th>
                  <th className="text-left py-2 px-2 text-black">Participation</th>
                </tr>
              </thead>
              <tbody>
                {engagement.filter(row => row.name.toLowerCase().includes(engSearch.toLowerCase())).map((row, idx) => (
                  <tr key={idx} className="border-b last:border-0 text-black">
                    <td className="py-2 px-2">
                      {engEditIdx === idx ? (
                        <input
                          type="text"
                          value={engEditRow.name}
                          onChange={e => setEngEditRow({ ...engEditRow, name: e.target.value })}
                          className="border rounded px-2 py-1 w-32"
                        />
                      ) : row.name}
                    </td>
                    <td className="py-2 px-2">
                      {engEditIdx === idx ? (
                        <input
                          type="number"
                          value={engEditRow.present}
                          onChange={e => setEngEditRow({ ...engEditRow, present: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-16"
                        />
                      ) : row.present}
                    </td>
                    <td className="py-2 px-2">
                      {engEditIdx === idx ? (
                        <input
                          type="number"
                          value={engEditRow.absent}
                          onChange={e => setEngEditRow({ ...engEditRow, absent: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-16"
                        />
                      ) : row.absent}
                    </td>
                    <td className="py-2 px-2">
                      {engEditIdx === idx ? (
                        <input
                          type="number"
                          value={engEditRow.late}
                          onChange={e => setEngEditRow({ ...engEditRow, late: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-16"
                        />
                      ) : row.late}
                    </td>
                    <td className="py-2 px-2">
                      {engEditIdx === idx ? (
                        <input
                          type="number"
                          value={engEditRow.participation}
                          onChange={e => setEngEditRow({ ...engEditRow, participation: Number(e.target.value) })}
                          className="border rounded px-2 py-1 w-16"
                        />
                      ) : row.participation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Chart for days with their respective months */}
            <div className="mt-8">
              <div className="flex gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Month</label>
                  <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-2 py-1 text-black">
                    {months.map(month => <option key={month} value={month}>{month}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">Year</label>
                  <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-2 py-1 text-black">
                    {years.map(year => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-4 text-black">Attendance by Day and Month</h3>
              <Bar
                data={{
                  labels: [
                    'Jan 1', 'Jan 2', 'Jan 3', 'Feb 1', 'Feb 2', 'Feb 3',
                    'Mar 1', 'Mar 2', 'Mar 3', 'Apr 1', 'Apr 2', 'Apr 3'
                  ].filter(label => (selectedMonth === 'All' || label.startsWith(selectedMonth)) && (selectedYear === '2024')), // mock filter
                  datasets: [
                    {
                      label: 'Present',
                      data: [18, 17, 19, 20, 18, 17, 19, 18, 20, 21, 20, 19].slice(0, selectedMonth === 'All' ? 12 : 3),
                      backgroundColor: '#4caf50',
                    },
                    {
                      label: 'Absent',
                      data: [2, 3, 1, 0, 2, 3, 1, 2, 0, 1, 2, 1].slice(0, selectedMonth === 'All' ? 12 : 3),
                      backgroundColor: '#f44336',
                    },
                    {
                      label: 'Late',
                      data: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1].slice(0, selectedMonth === 'All' ? 12 : 3),
                      backgroundColor: '#ff9800',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: 'black', font: { size: 10 } } },
                    title: { display: false },
                  },
                  scales: {
                    x: { title: { display: true, text: 'Day', color: 'black', font: { size: 10 } }, ticks: { color: 'black', font: { size: 10 } } },
                    y: { title: { display: true, text: 'Count', color: 'black', font: { size: 10 } }, beginAtZero: true, ticks: { color: 'black', font: { size: 10 } } },
                  },
                }}
                height={120}
              />
            </div>
            <button
              onClick={() => toast.success('Engagement report generated (mock)!')}
              className="bg-[#800000] text-white px-3 py-2 rounded hover:bg-[#a52a2a] transition text-sm mt-6"
            >
              Generate Engagement Report
            </button>
          </div>
        )}
      </div>
    );
  }

  if (section === 'risk-scores') {
    const students = mockDataBySubject[subjectCode]?.students || [];
    return (
      <div className="p-8">
        <button
          className="mb-6 text-[#800000] underline hover:text-[#a52a2a]"
          onClick={() => router.push('/faculty/ai_analytics')}
        >
          ← Back to Analytics Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-4">Student Risk Scores</h1>
        <table className="min-w-full text-sm bg-white rounded-lg shadow">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Student Name</th>
              <th className="text-left py-2 px-2">Risk Score</th>
              <th className="text-left py-2 px-2">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="py-2 px-2">{student.name}</td>
                <td className="py-2 px-2">{student.score}</td>
                <td className={`py-2 px-2 ${getLevelColor(student.level)}`}>{student.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Placeholder for other sections
  return (
    <div className="p-8">
      <button
        className="mb-6 text-[#800000] underline hover:text-[#a52a2a]"
        onClick={() => router.push('/faculty/ai_analytics')}
      >
        ← Back to Analytics Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-4">Analytics Detail View</h1>
      <p className="text-lg text-gray-700 mb-2">Subject Code: <span className="font-mono">{subjectCode}</span></p>
      <p className="text-lg text-gray-700 mb-8">Section: <span className="font-mono">{section}</span></p>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">This is a placeholder for the <span className="font-semibold">{section}</span> analytics of subject <span className="font-semibold">{subjectCode}</span>.</p>
        <p className="text-gray-500 mt-2">You can build out detailed charts, tables, and actions here.</p>
      </div>
    </div>
  );
} 