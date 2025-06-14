'use client';

import { useState, useEffect, use } from 'react';
import { Bell, FileText, ClipboardList, File, FileText as FileTextIcon, UserCircle2, Calendar, MessageSquare, HelpCircle, Users } from 'lucide-react';
import { getSubjectInstanceDetails } from '@/app/_actions/subjectInstance';
import { getStudentRequirements } from '@/app/_actions/requirement';
import toast from 'react-hot-toast';

interface Submission {
  id: string;
  title: string | null;
  content: string | null;
  filePath: string | null;
  graded: boolean;
  score: number | null;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Requirement {
  id: string;
  requirementNumber: number;
  title: string | null;
  content: string | null;
  scoreBase: number;
  deadline: Date;
  type: string;
  submissionStatus: 'GRADED' | 'SUBMITTED' | 'NOT_SUBMITTED';
  submission: Submission | null;
}

interface SubjectInstance {
  id: string;
  teacherName: string;
  grade: string;
  section: string;
  enrollment: number;
  icon: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  moduleFolders: Array<{
    id: string;
    folderName: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  uploadedContents: Array<{
    id: string;
    fileName: string;
    filePath: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState('announcements');
  const [subjectInstance, setSubjectInstance] = useState<SubjectInstance | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  const REQUIREMENT_TYPES = [
    { key: 'FORUMS', label: 'FORUMS', icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'QUIZZES', label: 'QUIZZES', icon: <HelpCircle className="w-5 h-5" /> },
    { key: 'ASSIGNMENTS', label: 'ASSIGNMENTS', icon: <FileText className="w-5 h-5" /> },
    { key: 'ACTIVITIES', label: 'ACTIVITIES', icon: <Users className="w-5 h-5" /> }
  ];

  const fetchData = async () => {
    try {
      console.log('Fetching data for subject:', resolvedParams.id);
      
      const [instanceData, requirementsData] = await Promise.all([
        getSubjectInstanceDetails(resolvedParams.id),
        getStudentRequirements(resolvedParams.id)
      ]);

      console.log('Instance Data:', instanceData);
      console.log('Requirements Data:', requirementsData);

      if (instanceData) {
        setSubjectInstance(instanceData);
      }

      if (requirementsData.success && requirementsData.data) {
        console.log('Setting requirements:', requirementsData.data);
        setRequirements(requirementsData.data);
      } else {
        console.log('No requirements data found or error:', requirementsData.error);
        setRequirements([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [resolvedParams.id]);

  const tabs = [
    { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4 mr-1" /> },
    { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4 mr-1" /> },
    { id: 'requirements', label: 'Requirements', icon: <ClipboardList className="w-4 h-4 mr-1" /> },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  if (!subjectInstance) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Subject not found</h2>
        <p className="text-gray-600 mt-2">The requested subject could not be found.</p>
      </div>
    );
  }

  const groupedRequirements = requirements.reduce((acc, req) => {
    const key = req.type.toUpperCase() + 'S';
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {} as Record<string, Requirement[]>);

  return (
    <div className="p-0 md:p-6">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-pink-100 via-white to-pink-50 rounded-lg shadow-md mb-6 overflow-hidden flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 p-6 border border-pink-200">
        <div className="flex-shrink-0 flex flex-col items-center md:items-start">
          <div className="bg-[#800000]/10 rounded-full p-3 mb-2">
            <UserCircle2 className="text-[#800000] w-12 h-12" />
          </div>
          <span className="bg-pink-200 text-[#800000] px-3 py-1 rounded font-bold text-sm tracking-widest shadow-sm mb-1">
            {subjectInstance.subject.code}
          </span>
        </div>
        <div className="flex-1">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1 leading-tight">
              {subjectInstance.subject.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-base text-gray-700 mt-1">
              <span className="flex items-center gap-1">
                <UserCircle2 className="w-5 h-5 text-[#800000]" />
                {subjectInstance.teacherName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-5 h-5 text-[#800000]" />
                Grade {subjectInstance.grade} - Section {subjectInstance.section}
              </span>
            </div>
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
          <h3 className="text-lg font-bold text-[#800000] mb-2 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Announcements
          </h3>
          {subjectInstance.announcements.length > 0 ? (
            subjectInstance.announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-lg p-5 shadow flex gap-4 border-l-4 border-[#800000]/80">
                <div className="flex flex-col items-center pt-1">
                  <Bell className="text-[#800000] w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-[#800000] text-lg">{announcement.title}</h4>
                  <p className="text-xs text-gray-500 mb-1">
                    {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-gray-800 text-sm">{announcement.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No announcements available.
            </div>
          )}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#800000] mb-2 flex items-center gap-2">
            <FileTextIcon className="w-5 h-5" /> Course Files
          </h3>
          {subjectInstance.moduleFolders.length > 0 ? (
            subjectInstance.moduleFolders.map((folder) => (
              <div key={folder.id} className="bg-white rounded-lg p-4 shadow border border-pink-100">
                <h4 className="font-medium text-gray-900 mb-2">{folder.folderName}</h4>
                <div className="mt-2 space-y-2">
                  {subjectInstance.uploadedContents
                    .filter(content => content.fileName.includes(folder.folderName))
                    .map((file) => (
                      <div key={file.id} className="flex items-center justify-between text-sm text-gray-700 border-b pb-1 last:border-b-0">
                        <span className="flex items-center gap-2">
                          {file.fileName.endsWith('.pdf') ? (
                            <FileText className="w-4 h-4 text-red-500" />
                          ) : file.fileName.endsWith('.pptx') ? (
                            <FileText className="w-4 h-4 text-orange-500" />
                          ) : (
                            <File className="w-4 h-4 text-gray-400" />
                          )}
                          {file.fileName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No files available.
            </div>
          )}
        </div>
      )}

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div>
          {REQUIREMENT_TYPES.map(({ key, label, icon }) => (
            <div key={key} className="mb-8">
              <h4 className="text-lg font-bold text-[#800000] uppercase tracking-wide flex items-center gap-2 mb-3">
                <ClipboardList className="w-5 h-5" />
                {label}
              </h4>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-pink-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-pink-50 border-b border-pink-100">
                        <th className="p-4 text-left font-semibold text-[#800000] w-[15%]">Requirement</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[30%]">Title</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[20%]">Due Date</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[15%]">Points</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[20%]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {groupedRequirements[key]?.length > 0 ? (
                        groupedRequirements[key].map((req) => {
                          const isOverdue = new Date(req.deadline) < new Date() && req.submissionStatus === 'NOT_SUBMITTED';
                          const statusColor = req.submissionStatus === 'GRADED' 
                            ? 'bg-green-100 text-green-800'
                            : req.submissionStatus === 'SUBMITTED'
                            ? 'bg-blue-100 text-blue-800'
                            : isOverdue
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800';

                          return (
                            <tr key={req.id} className="hover:bg-pink-50/50 transition-colors duration-150">
                              <td className="p-4 text-gray-800 font-medium">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-pink-100 text-[#800000]">
                                  {req.type}# {req.requirementNumber}
                                </span>
                              </td>
                              <td className="p-4 text-gray-800 font-medium">
                                <div className="flex items-center gap-2">
                                  {req.type === 'Forum' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                                  {req.type === 'Quiz' && <HelpCircle className="w-4 h-4 text-purple-500" />}
                                  {req.type === 'Assignment' && <FileText className="w-4 h-4 text-orange-500" />}
                                  {req.type === 'Activity' && <Users className="w-4 h-4 text-green-500" />}
                                  <span className="line-clamp-2">{req.title || 'Untitled'}</span>
                                </div>
                              </td>
                              <td className="p-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {new Date(req.deadline).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    hour12: true
                                  })}
                                </div>
                              </td>
                              <td className="p-4 text-gray-600 font-medium">{req.scoreBase} pts</td>
                              <td className="p-4">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                                  {req.submissionStatus === 'GRADED' 
                                    ? `Graded (${req.submission?.score}/${req.scoreBase})`
                                    : req.submissionStatus === 'SUBMITTED'
                                    ? 'Submitted'
                                    : isOverdue
                                    ? 'Overdue'
                                    : 'Not Submitted'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-500 italic">
                            No {label.toLowerCase()} available yet.
                          </td>
                        </tr>
                      )}
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