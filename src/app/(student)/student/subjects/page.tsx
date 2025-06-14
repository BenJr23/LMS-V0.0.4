'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getAvailableSubjects } from '@/app/_actions/availableSubjects';
import { getImageUrl } from '@/app/_actions/uploadIcon';
import { Users } from 'lucide-react';
import EnrolmentModal from './EnrolmentModal';
import { toast } from 'react-hot-toast';

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
}

export default function SubjectsPage() {
  const [availableSubjects, setAvailableSubjects] = useState<SubjectInstance[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<SubjectInstance[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectInstance | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gradeOptions = ['all', '7', '8', '9', '10'];

  const fetchSubjects = async () => {
    try {
      const result = await getAvailableSubjects();
      if (result.success && result.data) {
        setAvailableSubjects(result.data);
        setFilteredSubjects(result.data);
      } else {
        setError(result.error || 'Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Failed to fetch subject instances:', error);
      setError('An error occurred while fetching subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Update image URLs when instances change
  useEffect(() => {
    const updateImageUrls = async () => {
      setIsImageLoading(true);
      try {
        const newUrls: Record<string, string> = {};
        for (const instance of availableSubjects) {
          if (instance.icon && !imageUrls[instance.icon]) {
            try {
              const url = await getImageUrl(instance.icon);
              if (url) {
                newUrls[instance.icon] = url;
              }
            } catch (error) {
              console.error(`Failed to load image for ${instance.subject.name}:`, error);
            }
          }
        }
        if (Object.keys(newUrls).length > 0) {
          setImageUrls(prev => ({ ...prev, ...newUrls }));
        }
      } catch (error) {
        console.error('Failed to update image URLs:', error);
      } finally {
        setIsImageLoading(false);
      }
    };

    updateImageUrls();
  }, [availableSubjects, imageUrls]);

  // Filter subjects
  useEffect(() => {
    let filtered = [...availableSubjects];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.subject.name.toLowerCase().includes(query) ||
        subject.subject.code.toLowerCase().includes(query) ||
        subject.teacherName.toLowerCase().includes(query)
      );
    }

    // Apply grade filter
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(subject => subject.grade === selectedGrade);
    }

    setFilteredSubjects(filtered);
  }, [availableSubjects, searchQuery, selectedGrade]);

  const handleEnrollClick = (instance: SubjectInstance) => {
    setSelectedSubject(instance);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-8 p-6 transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        {/* Available Subjects Section */}
        <section>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#800000]">Available Subjects</h2>
              <p className="text-gray-600">Enroll in these subjects to start learning.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm shadow-sm bg-white text-gray-800 placeholder-gray-400"
              />
              <div className="relative">
                <button
                  onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                  className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] text-sm shadow-sm bg-white text-gray-800 hover:bg-gray-50"
                >
                  Grade {selectedGrade === 'all' ? 'All' : selectedGrade}
                </button>
                {showGradeDropdown && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border rounded-md shadow-lg z-10">
                    {gradeOptions.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => {
                          setSelectedGrade(grade);
                          setShowGradeDropdown(false);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedGrade === grade ? 'bg-[#800000] text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSubjects.map((instance) => {
              if (!instance || !instance.subject) return null;
              
              return (
                <div
                  key={instance.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform cursor-pointer"
                >
                  <div className="relative h-40 w-full">
                    {isImageLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#800000]"></div>
                      </div>
                    ) : (
                      <Image
                        src={imageUrls[instance.icon] || '/course1.jpg'}
                        alt={instance.subject.name || 'Subject'}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/course1.jpg';
                        }}
                      />
                    )}
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

                    <div className="flex items-center text-sm">
                      <div className="flex items-center text-gray-700 gap-1">
                        <Users className="w-4 h-4 text-[#800000]" />
                        {instance.enrollment === 1 ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleEnrollClick(instance)}
                      className="block w-full text-center bg-[#800000] text-white py-2 rounded-md hover:bg-[#600000] transition-colors mt-2"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredSubjects.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                {searchQuery || selectedGrade !== 'all' ? 'No subjects found matching your criteria.' : 'No available subjects found.'}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Enrollment Modal */}
      {selectedSubject && (
        <EnrolmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSubject(null);
          }}
          subjectInstanceId={selectedSubject.id}
          subjectName={selectedSubject.subject.name}
          onSuccess={() => {
            toast.success('Successfully enrolled in the subject!');
            setIsModalOpen(false);
            setSelectedSubject(null);
            // Refetch subjects after successful enrollment
            fetchSubjects();
          }}
        />
      )}
    </>
  );
}
