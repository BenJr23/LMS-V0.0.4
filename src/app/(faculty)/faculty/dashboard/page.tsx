// app/teacher/teaching-sections/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Search, X, Upload, RefreshCw } from 'lucide-react';

type SubjectInstance = {
  subjectId: string;
  teacherName: string;
  grade: string;
  section: string;
  enrolmentCode: number;
  photo?: File;
};

export default function FacultyDashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSection, setNewSection] = useState<SubjectInstance>({
    subjectId: '',
    teacherName: '',
    grade: '',
    section: '',
    enrolmentCode: generateEnrollmentCode(),
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function generateEnrollmentCode(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }

  const handleRegenerateCode = () => {
    setNewSection(prev => ({ ...prev, enrolmentCode: generateEnrollmentCode() }));
  };

  useEffect(() => {
    if (isLoaded && !user) {
      toast.error('Please sign in to access the dashboard');
      router.push('/faculty-login');
    }
  }, [isLoaded, user, router]);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewSection({
      subjectId: '',
      teacherName: '',
      grade: '',
      section: '',
      enrolmentCode: generateEnrollmentCode(),
    });
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSection(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSection = async () => {
    try {
      setIsCreating(true);
      // TODO: Implement create section functionality
      toast.error('Create section functionality coming soon');
      handleModalClose();
    } catch {
      toast.error('Failed to create section');
    } finally {
      setIsCreating(false);
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
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Welcome, {user.firstName || 'Faculty Member'}!</h1>
          <p className="text-gray-600">This is your faculty dashboard. More features coming soon.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Teaching Sections</h2>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search sections..."
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
                  Add Section
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center">No sections found. Add your first teaching section to get started.</p>
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Add New Section</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subjectId"
                      value={newSection.subjectId}
                      onChange={(e) => setNewSection(prev => ({ ...prev, subjectId: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">Select a subject</option>
                      {/* TODO: Add subject options */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      id="teacherName"
                      value={newSection.teacherName}
                      onChange={(e) => setNewSection(prev => ({ ...prev, teacherName: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Enter teacher name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                        Grade
                      </label>
                      <input
                        type="text"
                        id="grade"
                        value={newSection.grade}
                        onChange={(e) => setNewSection(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                        placeholder="Enter grade"
                      />
                    </div>
                    <div>
                      <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        id="section"
                        value={newSection.section}
                        onChange={(e) => setNewSection(prev => ({ ...prev, section: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                        placeholder="Enter section"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="enrolmentCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Enrollment Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="enrolmentCode"
                        value={newSection.enrolmentCode}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-lg text-center"
                      />
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
                        title="Generate new code"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      This code will be used by students to enroll in this section
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Photo
                  </label>
                  <div className="h-full flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="mx-auto h-48 w-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoPreview(null);
                              setNewSection(prev => ({ ...prev, photo: undefined }));
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors duration-200"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-16 w-16 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="photo-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-red-800 hover:text-red-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-800"
                            >
                              <span>Upload a photo</span>
                              <input
                                id="photo-upload"
                                name="photo-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handlePhotoChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
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
                onClick={handleCreateSection}
                disabled={!newSection.subjectId || !newSection.teacherName || !newSection.grade || !newSection.section || !newSection.photo || isCreating}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Section'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}