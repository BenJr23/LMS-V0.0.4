// app/teacher/teaching-sections/page.tsx
'use client';
import Image from 'next/image';
import { Users, Plus, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getSubjects } from '@/app/_actions/subject';
import { createSubjectInstance, getSubjectInstances } from '@/app/_actions/subjectInstance';
import { uploadIcon, getImageUrl } from '@/app/_actions/uploadIcon';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type SubjectInstance = {
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
};

export default function TeachingSectionsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [subjectInstances, setSubjectInstances] = useState<SubjectInstance[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    teacherName: '',
    subjectId: '',
    grade: '',
    section: '',
    enrollment: 1,
    icon: '',
    enrolmentCode: Math.floor(1000 + Math.random() * 9000),
  });
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const sectionOptions = ['A', 'B', 'C'];
  const gradeOptions = [7, 8, 9, 10];

  const fetchSubjectInstances = async () => {
    try {
      const instancesData = await getSubjectInstances();
      setSubjectInstances(instancesData || []);
    } catch (error) {
      console.error('Failed to fetch subject instances:', error);
      toast.error('Failed to load subject instances');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsData, instancesData] = await Promise.all([
          getSubjects(),
          getSubjectInstances()
        ]);
        
        if (!subjectsData) {
          toast.error('Failed to load subjects');
          return;
        }
        
        setSubjects(subjectsData);
        setSubjectInstances(instancesData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const filteredInstances = subjectInstances.filter((instance) => {
    if (!instance || !instance.subject) return false;
    return (
      instance.subject.name?.toLowerCase().includes(search.toLowerCase()) ||
      instance.subject.code?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const result = await uploadIcon(file);

      if (!result.success || !result.path) {
        throw new Error(result.error || 'Upload failed');
      }

      // Get the signed URL for the uploaded image
      const url = await getImageUrl(result.path);
      if (!url) {
        throw new Error('Failed to get image URL');
      }

      // Update the form with the new icon path and cache the URL
      setForm(prev => ({ ...prev, icon: result.path }));
      setImageUrls(prev => ({ ...prev, [result.path]: url }));
      toast.success('Icon uploaded successfully');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  const resetForm = () => {
    setForm({
      teacherName: '',
      subjectId: '',
      grade: '',
      section: '',
      enrollment: 1,
      icon: '',
      enrolmentCode: Math.floor(1000 + Math.random() * 9000),
    });
    setSubjectSearch('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Update image URLs when instances change
  useEffect(() => {
    const updateImageUrls = async () => {
      const newUrls: Record<string, string> = {};
      for (const instance of subjectInstances) {
        if (instance.icon && !imageUrls[instance.icon]) {
          const url = await getImageUrl(instance.icon);
          if (url) {
            newUrls[instance.icon] = url;
          }
        }
      }
      if (Object.keys(newUrls).length > 0) {
        setImageUrls(prev => ({ ...prev, ...newUrls }));
      }
    };

    updateImageUrls();
  }, [subjectInstances, imageUrls]);

  return (
    <div className="p-6">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-[#800000]">Add Subject Instance</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Teacher Name</label>
                <input
                  type="text"
                  placeholder="Enter teacher name"
                  value={form.teacherName}
                  onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                  className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 placeholder-gray-400 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search subject..."
                    value={subjectSearch}
                    onChange={(e) => {
                      setSubjectSearch(e.target.value);
                      setShowSubjectDropdown(true);
                    }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 placeholder-gray-400 bg-white"
                  />
                  {showSubjectDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {subjects.map((subject) => (
                        <div
                          key={subject.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                          onClick={() => {
                            setForm(prev => ({ ...prev, subjectId: subject.id }));
                            setSubjectSearch(`${subject.name} - ${subject.code}`);
                            setShowSubjectDropdown(false);
                          }}
                        >
                          {subject.name} - {subject.code}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select grade"
                    value={form.grade}
                    readOnly
                    onFocus={() => setShowGradeDropdown(true)}
                    className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 placeholder-gray-400 bg-white cursor-pointer"
                  />
                  {showGradeDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {gradeOptions.map((grade) => (
                        <div
                          key={grade}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                          onClick={() => {
                            setForm(prev => ({ ...prev, grade: grade.toString() }));
                            setShowGradeDropdown(false);
                          }}
                        >
                          {grade}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Select section"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    onFocus={() => setShowSectionDropdown(true)}
                    className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 placeholder-gray-400 bg-white"
                  />
                  {showSectionDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {sectionOptions.map((section) => (
                        <div
                          key={section}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-800"
                          onClick={() => {
                            setForm(prev => ({ ...prev, section }));
                            setShowSectionDropdown(false);
                          }}
                        >
                          {section}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Enrollment Status</label>
                <select
                  value={form.enrollment}
                  onChange={(e) => setForm({ ...form, enrollment: parseInt(e.target.value) })}
                  className="w-full border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800000] text-gray-800 bg-white"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Enrollment Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.enrolmentCode}
                    disabled
                    className="w-full border rounded px-4 py-2 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    placeholder="Auto-generated code"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(1000 + Math.random() * 9000);
                      setForm(prev => ({ ...prev, enrolmentCode: newCode }));
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    Regenerate
                  </button>
                </div>
                <p className="text-xs text-gray-500">This code will be used for student enrollment</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleIconUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Icon
                    </button>
                  </div>
                  <div className="h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {form.icon ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imageUrls[form.icon] || '/course1.jpg'}
                          alt="Section icon"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No icon selected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!form.subjectId) {
                      toast.error('Please select a subject');
                      return;
                    }
                    if (!form.teacherName || !form.grade || !form.section) {
                      toast.error('Please fill in all required fields');
                      return;
                    }

                    await createSubjectInstance(form);
                    toast.success('Subject instance created successfully!');
                    handleCloseModal();
                    // Refetch subject instances after successful creation
                    await fetchSubjectInstances();
                  } catch (error) {
                    console.error(error);
                    toast.error('Failed to create subject instance');
                  }
                }}
                className="px-4 py-2 rounded bg-[#800000] text-white hover:bg-[#600000] transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#800000]">My Teaching Sections</h2>
          <p className="text-gray-600">Welcome back! Here are your teaching assignments.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm shadow-sm bg-white text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInstances.map((instance) => {
          if (!instance || !instance.subject) return null;
          
          return (
            <div
              key={instance.id}
              onClick={() => router.push(`/faculty/dashboard/${instance.id}`)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform cursor-pointer"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={imageUrls[instance.icon] || '/course1.jpg'}
                  alt={instance.subject.name || 'Subject'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="bg-pink-100 text-[#800000] px-2 py-0.5 rounded font-medium">
                    {instance.subject.code || 'No Code'}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                    Section {instance.section || 'N/A'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  {instance.subject.name || 'Unnamed Subject'}
                </h3>
                <p className="text-sm text-gray-600">Grade {instance.grade || 'N/A'}</p>
                <p className="text-sm text-gray-600">Teacher: {instance.teacherName || 'Unassigned'}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-700 gap-1">
                    <Users className="w-4 h-4 text-[#800000]" />
                    {instance.enrollment === 1 ? 'Active' : 'Inactive'}
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                    Code: {instance.enrolmentCode}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredInstances.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No sections found.
          </div>
        )}
      </div>
    </div>
  );
}