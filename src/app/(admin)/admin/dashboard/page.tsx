'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '@/app/_actions/subject';
import { Plus, Search, X, CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';

type Subject = {
  id: string;
  name: string;
  code: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: '',
  });
  const [editSubject, setEditSubject] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    if (isLoaded && !user) {
      toast.error('Please sign in to access the dashboard');
      router.push('/admin-login');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (error) {
        toast.error('Failed to fetch subjects');
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
    fetchSubjects();
    }
  }, [user]);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSubject({ name: '', code: '' });
  };

  const handleCreateSubject = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsCreating(true);
      const subject = await createSubject({
        ...newSubject,
        createdById: user.id,
      });
      
      setSubjects(prev => [subject, ...prev]);
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 z-50`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Subject Created Successfully
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {subject.name} has been added to the subjects list.
                </p>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
        style: {
          zIndex: 9999,
        },
      });
      handleModalClose();
    } catch (error) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Error Creating Subject
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {error instanceof Error ? error.message : 'Failed to create subject'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSubject = async () => {
    if (!selectedSubject) return;

    try {
      setIsEditing(true);
      const updatedSubject = await updateSubject({
        id: selectedSubject.id,
        name: editSubject.name,
        code: editSubject.code,
      });
      
      setSubjects(prev => prev.map(subject => 
        subject.id === updatedSubject.id ? updatedSubject : subject
      ));

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 z-50`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Subject Updated Successfully
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {updatedSubject.name} has been updated.
                </p>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });

      setIsEditModalOpen(false);
      setSelectedSubject(null);
      setEditSubject({ name: '', code: '' });
    } catch (error) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Error Updating Subject
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {error instanceof Error ? error.message : 'Failed to update subject'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    try {
      setIsDeleting(true);
      await deleteSubject(selectedSubject.id);
      
      setSubjects(prev => prev.filter(subject => subject.id !== selectedSubject.id));

      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 z-50`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Subject Deleted Successfully
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedSubject.name} has been removed from the subjects list.
                </p>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });

      setIsDeleteModalOpen(false);
      setSelectedSubject(null);
    } catch (error) {
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black/5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Error Deleting Subject
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {error instanceof Error ? error.message : 'Failed to delete subject'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ), {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster
        toastOptions={{
          className: '',
          style: {
            background: '#fff',
            color: '#363636',
            zIndex: 9999,
          },
          success: {
            duration: 5000,
            style: {
              background: '#fff',
              color: '#363636',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#fff',
              color: '#363636',
            },
          },
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Welcome, {user.firstName || 'Admin'}!</h1>
          <p className="text-gray-700">Manage your subjects below.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">Subjects</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent w-full md:w-64 text-gray-900 placeholder-gray-400 bg-gray-50 hover:bg-white transition-colors duration-200"
                    />
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors duration-200 shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                    Add Subject
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{subject.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                          {subject.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{subject.createdById}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(subject.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSubject(subject);
                              setEditSubject({
                                name: subject.name,
                                code: subject.code,
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Edit Subject"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSubject(subject);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete Subject"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-700">
                        {searchQuery ? 'No subjects found matching your search' : 'No subjects found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Subject</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  id="subjectName"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter subject name"
                />
              </div>
              <div>
                <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  id="subjectCode"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter subject code"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleModalClose}
                disabled={isCreating}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubject}
                disabled={!newSubject.name || !newSubject.code || isCreating}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Subject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {isEditModalOpen && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Edit Subject</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedSubject(null);
                  setEditSubject({ name: '', code: '' });
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="editSubjectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  id="editSubjectName"
                  value={editSubject.name}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter subject name"
                />
              </div>
              <div>
                <label htmlFor="editSubjectCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  id="editSubjectCode"
                  value={editSubject.code}
                  onChange={(e) => setEditSubject(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Enter subject code"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleEditSubject}
                disabled={!editSubject.name || !editSubject.code || isEditing}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subject Modal */}
      {isDeleteModalOpen && selectedSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Delete Subject</h3>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedSubject(null);
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Are you sure?</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    This action cannot be undone. This will permanently delete the subject "{selectedSubject.name}".
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleDeleteSubject}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Subject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
