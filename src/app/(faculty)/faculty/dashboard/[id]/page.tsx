'use client';

import { useState, useEffect, use } from 'react';
import { Bell, FileText, ClipboardList, File, FileText as FileTextIcon, UserCircle2, Settings, MessageSquare, HelpCircle, Users, Eye, MoreVertical, Calendar, Plus } from 'lucide-react';
import { getSubjectInstance, updateSubjectInstance } from '@/app/_actions/subjectInstance';
import { getRequirements } from '@/app/_actions/requirement';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import { createRequirement } from '@/app/_actions/requirement';

interface SubjectInstance {
  id: string;
  teacherName: string;
  grade: string;
  section: string;
  enrollment: number;
  icon: string;
  enrolmentCode: number;
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

interface Requirement {
  id: string;
  requirementNumber: number;
  title: string | null;
  content: string | null;
  scoreBase: number;
  deadline: Date;
  type: string;
  subjectInstanceId: string;
  createdAt: Date;
  updatedAt: Date;
  submissions: Array<{
    id: string;
    title: string;
    content: string;
    filePath: string | null;
    graded: boolean;
    score: number | null;
    feedback: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState('announcements');
  const [subjectInstance, setSubjectInstance] = useState<SubjectInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [editForm, setEditForm] = useState({
    teacherName: '',
    grade: '',
    section: '',
    enrollment: 1
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    content: '',
    deadline: '',
    baseScore: '',
    type: 'Assignment'
  });

  const fetchData = async () => {
    try {
      const [instanceData, requirementsData] = await Promise.all([
        getSubjectInstance(resolvedParams.id),
        getRequirements(resolvedParams.id)
      ]);

      if (instanceData) {
        setSubjectInstance(instanceData);
      }

      if (requirementsData.success && requirementsData.data) {
        setRequirements(requirementsData.data);
      } else {
        setRequirements([]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load course details');
      setRequirements([]);
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

  const announcements = [
    {
      title: 'Welcome to ' + subjectInstance?.subject.code,
      author: subjectInstance?.teacherName,
      timeAgo: 'Just now',
      content: `Welcome to ${subjectInstance?.subject.name}! This course will cover the fundamentals of the subject.`
    }
  ];

  const files = [
    {
      module: 'Module 1: Introduction',
      items: [
        { name: 'Course Syllabus.pdf', size: '1.2 MB' },
        { name: 'Introduction.pptx', size: '3.5 MB' }
      ]
    },
    {
      module: 'Module 2: Basic Concepts',
      items: []
    }
  ];

  // Group requirements by type
  const groupedRequirements = requirements.reduce((acc, req) => {
    const key = req.type.toUpperCase() + 'S';
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {} as Record<string, Requirement[]>);

  const handleOpenEditModal = () => {
    if (subjectInstance) {
      setEditForm({
        teacherName: subjectInstance.teacherName,
        grade: subjectInstance.grade,
        section: subjectInstance.section,
        enrollment: subjectInstance.enrollment
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!subjectInstance) return;

      const updatedInstance = await updateSubjectInstance(subjectInstance.id, editForm);
      setSubjectInstance(updatedInstance);
      setIsEditModalOpen(false);
      toast.success('Subject instance updated successfully');
    } catch (error) {
      console.error('Failed to update subject instance:', error);
      toast.error('Failed to update subject instance');
    }
  };

  const handleOpenAddModal = (type: string) => {
    // Convert the type to proper case (e.g., "FORUM" -> "Forum")
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    
    setAssignmentForm({
      title: '',
      content: '',
      deadline: '',
      baseScore: '',
      type: formattedType
    });
    setIsAddAssignmentModalOpen(true);
  };

  const handleAddAssignment = async () => {
    try {
      // Get the current requirements of the same type
      const currentTypeRequirements = groupedRequirements[`${assignmentForm.type.toUpperCase()}S`] || [];
      
      // Calculate the next requirement number
      const nextRequirementNumber = currentTypeRequirements.length + 1;

      const result = await createRequirement({
        requirementNumber: nextRequirementNumber,
        title: assignmentForm.title,
        content: assignmentForm.content,
        scoreBase: parseInt(assignmentForm.baseScore),
        deadline: new Date(assignmentForm.deadline),
        type: assignmentForm.type as 'Forum' | 'Assignment' | 'Activity' | 'Quiz',
        subjectInstanceId: resolvedParams.id
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setIsAddAssignmentModalOpen(false);
      toast.success(`${assignmentForm.type} created successfully`);
      
      // Reset form
      setAssignmentForm({
        title: '',
        content: '',
        deadline: '',
        baseScore: '',
        type: 'Assignment'
      });

      // Refresh the requirements data
      await fetchData();
    } catch (error) {
      console.error('Failed to create requirement:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create requirement');
    }
  };

  // Add this constant at the top level of your component
  const REQUIREMENT_TYPES = [
    { key: 'FORUMS', label: 'FORUMS', icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'QUIZZES', label: 'QUIZZES', icon: <HelpCircle className="w-5 h-5" /> },
    { key: 'ASSIGNMENTS', label: 'ASSIGNMENTS', icon: <FileText className="w-5 h-5" /> },
    { key: 'ACTIVITIES', label: 'ACTIVITIES', icon: <Users className="w-5 h-5" /> }
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
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="text-gray-600 mt-2">The requested course could not be found.</p>
      </div>
    );
  }

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
          <div className="flex justify-between items-start">
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
            <button
              onClick={handleOpenEditModal}
              className="p-2 hover:bg-pink-100 rounded-full transition-colors duration-200"
            >
              <Settings className="w-5 h-5 text-[#800000]" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-[#800000] mb-4">Edit Subject Instance</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                <input
                  type="text"
                  value={editForm.teacherName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, teacherName: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  value={editForm.grade}
                  onChange={(e) => setEditForm(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 bg-white"
                >
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={editForm.section}
                  onChange={(e) => setEditForm(prev => ({ ...prev, section: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 bg-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Status</label>
                <select
                  value={editForm.enrollment}
                  onChange={(e) => setEditForm(prev => ({ ...prev, enrollment: parseInt(e.target.value) }))}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 bg-white"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded bg-[#800000] text-white hover:bg-[#600000] transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Requirement Modal */}
      {isAddAssignmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold text-[#800000]">Create New {assignmentForm.type}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {assignmentForm.type === 'Forum' ? 'Create a new discussion forum for students to engage in topic-related conversations.' :
                 assignmentForm.type === 'Quiz' ? 'Create a new quiz to assess student understanding of the course material.' :
                 assignmentForm.type === 'Activity' ? 'Create a new activity to encourage student participation and learning.' :
                 'Create a new assignment for students to complete and submit.'}
              </p>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              {/* Title Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {assignmentForm.type === 'Forum' ? 'Discussion Topic' :
                   assignmentForm.type === 'Quiz' ? 'Quiz Title' :
                   assignmentForm.type === 'Activity' ? 'Activity Title' :
                   'Assignment Title'}
                </label>
                <input
                  type="text"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent text-gray-800 transition-all duration-200"
                  placeholder={`Enter ${assignmentForm.type.toLowerCase()} title`}
                />
              </div>

              {/* Content Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {assignmentForm.type === 'Forum' ? 'Discussion Guidelines' :
                   assignmentForm.type === 'Quiz' ? 'Quiz Instructions' :
                   assignmentForm.type === 'Activity' ? 'Activity Description' :
                   'Assignment Instructions'}
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  {assignmentForm.type === 'Forum' ? 'Provide guidelines and topics for discussion. Students will be able to post their responses and engage with others.' :
                   assignmentForm.type === 'Quiz' ? 'Provide clear instructions and any specific requirements for the quiz.' :
                   assignmentForm.type === 'Activity' ? 'Describe the activity, its objectives, and what students need to do to complete it.' :
                   'Provide detailed instructions and requirements for the assignment.'}
                </p>
                <RichTextEditor
                  content={assignmentForm.content}
                  onChange={(content) => setAssignmentForm(prev => ({ ...prev, content }))}
                  placeholder={`Enter ${assignmentForm.type.toLowerCase()} instructions here...`}
                  minHeight="300px"
                  maxHeight="600px"
                />
              </div>

              {/* Deadline and Score Section */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {assignmentForm.type === 'Forum' ? 'Discussion End Date' :
                     assignmentForm.type === 'Quiz' ? 'Quiz Deadline' :
                     assignmentForm.type === 'Activity' ? 'Activity Deadline' :
                     'Submission Deadline'}
                  </label>
                  <input
                    type="datetime-local"
                    value={assignmentForm.deadline}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent text-gray-800 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {assignmentForm.type === 'Forum' ? 'Participation Points' :
                     assignmentForm.type === 'Quiz' ? 'Quiz Points' :
                     assignmentForm.type === 'Activity' ? 'Activity Points' :
                     'Maximum Points'}
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.baseScore}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, baseScore: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent text-gray-800 transition-all duration-200"
                    placeholder={`Enter ${assignmentForm.type.toLowerCase()} points`}
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl sticky bottom-0">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAssignment}
                  className="px-4 py-2 rounded-lg bg-[#800000] text-white hover:bg-[#600000] transition-colors duration-200 font-medium shadow-sm"
                >
                  {assignmentForm.type === 'Forum' ? 'Create Discussion' :
                   assignmentForm.type === 'Quiz' ? 'Create Quiz' :
                   assignmentForm.type === 'Activity' ? 'Create Activity' :
                   'Create Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <h3 className="text-lg font-bold text-[#800000] mb-2 flex items-center gap-2">
            <FileTextIcon className="w-5 h-5" /> Course Files
          </h3>
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
          {REQUIREMENT_TYPES.map(({ key, label }) => (
            <div key={key} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-lg font-bold text-[#800000] uppercase tracking-wide flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  {label}
                </h4>
                <button
                  onClick={() => handleOpenAddModal(key.slice(0, -1))}
                  className="p-1.5 rounded-md bg-[#800000] text-white hover:bg-[#a52a2a] transition-colors duration-200 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-pink-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-pink-50 border-b border-pink-100">
                        <th className="p-4 text-left font-semibold text-[#800000] w-[15%]">Requirement</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[30%]">Title</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[20%]">Due Date</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[15%]">Points</th>
                        <th className="p-4 text-left font-semibold text-[#800000] w-[20%]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-50">
                      {groupedRequirements[key]?.length > 0 ? (
                        groupedRequirements[key].map((req) => (
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
                                <span className="line-clamp-2">{req.title}</span>
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-gray-500 italic">
                            No {label.toLowerCase()} available yet. Click the + button to add one.
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