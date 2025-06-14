'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Users, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnrolledSubject {
  id: string;
  hasNewContent: boolean;
  subjectInstance: {
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
  };
  createdAt: Date;
}

// Mock data for development
const mockEnrolledSubjects: EnrolledSubject[] = [
  {
    id: '1',
    hasNewContent: true,
    subjectInstance: {
      id: '1',
      teacherName: 'John Doe',
      grade: '11',
      section: 'A',
      enrollment: 1,
      icon: '/course1.jpg',
      subject: {
        id: '1',
        name: 'Mathematics',
        code: 'MATH101'
      }
    },
    createdAt: new Date()
  },
  {
    id: '2',
    hasNewContent: false,
    subjectInstance: {
      id: '2',
      teacherName: 'Jane Smith',
      grade: '11',
      section: 'A',
      enrollment: 1,
      icon: '/course2.jpg',
      subject: {
        id: '2',
        name: 'Science',
        code: 'SCI101'
      }
    },
    createdAt: new Date()
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [enrolledSubjects] = useState<EnrolledSubject[]>(mockEnrolledSubjects);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleSubjectClick = (enrollment: EnrolledSubject) => {
    router.push(`/student/dashboard/${enrollment.subjectInstance.id}`);
  };

  return (
    <div className="space-y-8 p-6">
      {/* Enrolled Courses Section */}
      <section>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#800000]">My Courses</h2>
            <p className="text-gray-600">View and manage your enrolled courses.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledSubjects.map((enrollment) => {
            const instance = enrollment.subjectInstance;
            if (!instance || !instance.subject) return null;
            
            return (
              <div
                key={enrollment.id}
                onClick={() => handleSubjectClick(enrollment)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] transform cursor-pointer relative"
              >
                {enrollment.hasNewContent && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse z-10"></div>
                )}
                <div className="relative h-40 w-full">
                  {isImageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#800000]"></div>
                    </div>
                  ) : (
                    <Image
                      src={instance.icon}
                      alt={instance.subject.name}
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
                      {instance.subject.code}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">
                      Section {instance.section}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {instance.subject.name}
                  </h3>
                  <p className="text-sm text-gray-600">Grade {instance.grade}</p>
                  <p className="text-sm text-gray-600">Teacher: {instance.teacherName}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-700 gap-1">
                      <Users className="w-4 h-4 text-[#800000]" />
                      {instance.enrollment === 1 ? 'Active' : 'Inactive'}
                    </div>
                    <div className="flex items-center text-gray-700 gap-1">
                      <Clock className="w-4 h-4 text-[#800000]" />
                      Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Course Progress</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#800000] h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {enrolledSubjects.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              You haven&apos;t enrolled in any courses yet. Visit the Subjects page to enroll in courses.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
