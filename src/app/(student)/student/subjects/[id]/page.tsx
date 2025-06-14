'use client';

import { useState, use } from 'react';
import { CalendarDays, Bell, FileText, ClipboardList, File, FileText as FileTextIcon, UserCircle2, MessageSquare, HelpCircle, Users, Eye, MoreVertical, Calendar } from 'lucide-react';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState('announcements');
  const { id } = use(params);
  const courseId = id.toUpperCase(); // show CS101 instead of cs101

  // You could fetch course data based on ID here in real projects

  const courseInfo = {
    title: 'Introduction to Computer Science',
    professor: 'Dr. Alan Turing',
    schedule: 'Mon, Wed 10:00 AM – 11:30 AM'
  };

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4 mr-1" /> },
    { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4 mr-1" /> },
    { id: 'requirements', label: 'Requirements', icon: <ClipboardList className="w-4 h-4 mr-1" /> },
  ];

  const announcements = [
    {
      title: 'Assignment #1 Posted',
      author: courseInfo.professor,
      timeAgo: 'over 1 year ago',
      content: 'The first assignment has been posted. Please check the Requirements tab for details. Due date is September 15th.'
    },
    {
      title: 'Welcome to ' + courseId,
      author: courseInfo.professor,
      timeAgo: 'almost 2 years ago',
      content: `Welcome to ${courseInfo.title}! This course will cover the fundamentals of programming and computer science concepts.`
    }
  ];

  const files = [
    {
      module: 'Module 1: Introduction to Programming',
      items: [
        { name: 'Course Syllabus.pdf', size: '1.2 MB' },
        { name: 'Introduction to Programming.pptx', size: '3.5 MB' }
      ]
    },
    {
      module: 'Module 2: Variables and Data Types',
      items: []
    }
  ];

  const requirements = [
    { type: 'Forum', title: 'Discussion: Why Computer Science?', due: 'Sep 9, 2023 7:59 AM', status: 'Not Started', points: '25 pts' },
    { type: 'Quiz', title: 'Quiz #1: Introduction to Programming', due: 'Sep 11, 2023 7:59 AM', status: 'Not Started', points: '50 pts' },
    { type: 'Assignment', title: 'Assignment #1: Programming Basics', due: 'Sep 16, 2023 7:59 AM', status: 'Not Submitted', points: '100 pts' },
    { type: 'Activity', title: 'Group Project: Algorithm Design', due: 'Sep 20, 2023 7:59 AM', status: 'Not Started', points: '150 pts' }
  ];

  // Group requirements by type
  const groupedRequirements = requirements.reduce((acc, req) => {
    const key = req.type.toUpperCase() + 'S';
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {} as Record<string, typeof requirements>);

  return (
    <div className="p-0 md:p-6">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-pink-100 via-white to-pink-50 rounded-lg shadow-md mb-6 overflow-hidden flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 p-6 border border-pink-200">
        <div className="flex-shrink-0 flex flex-col items-center md:items-start">
          <div className="bg-[#800000]/10 rounded-full p-3 mb-2">
            <UserCircle2 className="text-[#800000] w-12 h-12" />
          </div>
          <span className="bg-pink-200 text-[#800000] px-3 py-1 rounded font-bold text-sm tracking-widest shadow-sm mb-1">{courseId}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1 leading-tight">{courseInfo.title}</h2>
          <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 mt-1">
            <span className="flex items-center gap-1"><UserCircle2 className="w-5 h-5 text-[#800000]" /> {courseInfo.professor}</span>
            <span className="flex items-center gap-1"><CalendarDays className="w-5 h-5 text-[#800000]" /> {courseInfo.schedule}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6 text-base font-semibold text-gray-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 border-b-2 transition-all duration-150 rounded-t-md focus:outline-none
              ${activeTab === tab.id
                ? 'border-[#800000] text-[#800000] bg-pink-50 shadow-sm'
                : 'border-transparent hover:text-[#800000] hover:bg-pink-100'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Announcements Tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#800000] mb-2 flex items-center gap-2"><Bell className="w-5 h-5" /> Announcements</h3>
          {announcements.map((item, i) => (
            <div key={i} className="bg-white rounded-lg p-5 shadow flex gap-4 border-l-4 border-[#800000]/80">
              <div className="flex flex-col items-center pt-1">
                <Bell className="text-[#800000] w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#800000] text-lg">{item.title}</h4>
                <p className="text-xs text-gray-500 mb-1">{item.author} • {item.timeAgo}</p>
                <p className="mt-1 text-gray-800 text-sm">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#800000] mb-2 flex items-center gap-2"><FileTextIcon className="w-5 h-5" /> Course Files</h3>
          {files.map((mod, i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow border border-pink-100">
              <h4 className="font-medium text-gray-900 mb-2">{mod.module}</h4>
              {mod.items.length === 0 ? (
                <div className="text-gray-400 italic text-sm">No files available for this module.</div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {mod.items.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm text-gray-700 border-b pb-1 last:border-b-0">
                      <span className="flex items-center gap-2">
                        {file.name.endsWith('.pdf') ? <FileText className="w-4 h-4 text-red-500" /> : file.name.endsWith('.pptx') ? <FileText className="w-4 h-4 text-orange-500" /> : <File className="w-4 h-4 text-gray-400" />}
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">{file.size}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div>
          {Object.entries(groupedRequirements).map(([section, items]) => (
            <div key={section} className="mb-8">
              <h4 className="text-lg font-bold text-[#800000] mb-3 uppercase tracking-wide flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {section}
              </h4>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-pink-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-pink-50 border-b border-pink-100">
                        <th className="p-4 text-left font-semibold text-[#800000] w-[35%]">Title</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[20%]">Due Date</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[15%]">Status</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[10%]">Points</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[20%]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {items.map((req, i) => (
                        <tr key={i} className="hover:bg-pink-50/50 transition-colors duration-150">
                          <td className="p-4 text-gray-800 font-medium">
                            <div className="flex items-center gap-2">
                              {req.type === 'Forum' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                              {req.type === 'Quiz' && <HelpCircle className="w-4 h-4 text-purple-500" />}
                              {req.type === 'Assignment' && <FileText className="w-4 h-4 text-orange-500" />}
                              {req.type === 'Activity' && <Users className="w-4 h-4 text-green-500" />}
                              <span className="line-clamp-2">{req.title}</span>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {req.due}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                              ${req.status === 'Not Started' ? 'bg-yellow-100 text-yellow-800' : 
                                req.status === 'Not Submitted' ? 'bg-red-100 text-red-700' : 
                                'bg-green-100 text-green-700'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 font-medium">{req.points}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button className="px-3 py-1.5 rounded-md bg-[#800000] text-white text-xs font-semibold shadow-sm hover:bg-[#a52a2a] transition-colors duration-200 flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button className="p-1.5 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}