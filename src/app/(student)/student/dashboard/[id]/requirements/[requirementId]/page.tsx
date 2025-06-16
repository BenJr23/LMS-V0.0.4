'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, FileText, Calendar, Award, MessageSquare, Upload } from 'lucide-react';
import { getStudentRequirementDetail } from '@/app/_actions/requirement';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface RequirementDetail {
  id: string;
  title: string;
  content: string;
  scoreBase: number;
  deadline: Date;
  type: string;
  requirementNumber: number;
  createdAt: Date;
  updatedAt: Date;
  subjectInstanceId: string;
  submissionStatus: 'GRADED' | 'SUBMITTED' | 'NOT_SUBMITTED';
  submission: {
    id: string;
    title: string;
    content: string;
    filePath: string;
    status: number;
    graded: boolean;
    score: number | null;
    feedback: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  subjectInstance: {
    subject: {
      name: string;
      code: string;
    };
  };
}

export default function RequirementDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string; requirementId: string }> 
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [requirement, setRequirement] = useState<RequirementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        setLoading(true);
        const response = await getStudentRequirementDetail(resolvedParams.requirementId);
        
        if (response.success && response.data) {
          setRequirement(response.data);
        } else {
          toast.error('Failed to load requirement details');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching requirement:', error);
        toast.error('Failed to load requirement details');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [resolvedParams.requirementId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#800000] mb-2">Requirement Not Found</h2>
          <p className="text-gray-600">The requested requirement could not be found.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'bg-green-100 text-green-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'NOT_SUBMITTED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusText = (submission: RequirementDetail['submission']) => {
    if (!submission) return 'Not Submitted';
    if (submission.graded) return `Graded (${submission.score}/${requirement.scoreBase})`;
    if (submission.status === 1) return 'Submitted';
    return 'Draft';
  };

  const getSubmissionStatusColor = (submission: RequirementDetail['submission']) => {
    if (!submission) return 'bg-gray-100 text-gray-800';
    if (submission.graded) return 'bg-green-100 text-green-800';
    if (submission.status === 1) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-[#800000] hover:text-[#800000]/80 mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="text-lg">Back to Requirements</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-pink-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {requirement.title}
            </h1>
            <p className="text-base text-gray-600">
              {requirement.subjectInstance.subject.code} - {requirement.subjectInstance.subject.name}
            </p>
          </div>
          <span className={`px-5 py-2.5 text-base font-semibold rounded-full ${getSubmissionStatusColor(requirement.submission)}`}>
            {getSubmissionStatusText(requirement.submission)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6 bg-pink-50/50 rounded-xl">
          <div className="flex items-center text-gray-700">
            <FileText className="w-6 h-6 text-[#800000] mr-3" />
            <span className="text-base">{requirement.type} {requirement.requirementNumber}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar className="w-6 h-6 text-[#800000] mr-3" />
            <span className="text-base">Due: {new Date(requirement.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Award className="w-6 h-6 text-[#800000] mr-3" />
            <span className="text-base">{requirement.scoreBase} points</span>
          </div>
        </div>

        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Description</h3>
          <div 
            className="text-gray-700 prose prose-lg mx-auto [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-[#800000] [&>blockquote]:pl-6 [&>blockquote]:italic [&>pre]:bg-gray-100 [&>pre]:p-6 [&>pre]:rounded-lg [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>a]:text-[#800000] [&>a]:underline [&>a]:font-medium"
            dangerouslySetInnerHTML={{ __html: requirement.content }}
          />
        </div>
      </div>

      {/* Submission Section */}
      {requirement.submission ? (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Upload className="w-6 h-6 mr-3 text-[#800000]" />
            Your Submission
          </h2>
          
          <div className="space-y-8">
            <div className="p-6 bg-pink-50/50 rounded-xl">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Status</h3>
              <p className="text-gray-600 text-lg">
                {requirement.submission.status === 1 ? 'Complete' : 'Draft'}
              </p>
            </div>

            <div className="p-6 bg-pink-50/50 rounded-xl">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Submitted On</h3>
              <p className="text-gray-600 text-lg">
                {new Date(requirement.submission.createdAt).toLocaleString()}
              </p>
            </div>

            {requirement.submission.filePath && (
              <div className="p-6 bg-pink-50/50 rounded-xl">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Attached File</h3>
                <a 
                  href={requirement.submission.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 bg-[#800000] text-white rounded-lg hover:bg-[#800000]/90 transition-colors text-base"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  View Submission
                </a>
              </div>
            )}

            {requirement.submission.content && (
              <div className="p-6 bg-pink-50/50 rounded-xl">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Submission Content</h3>
                <div 
                  className="text-gray-600 prose prose-lg mx-auto [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-[#800000] [&>blockquote]:pl-6 [&>blockquote]:italic [&>pre]:bg-gray-100 [&>pre]:p-6 [&>pre]:rounded-lg [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>a]:text-[#800000] [&>a]:underline [&>a]:font-medium"
                  dangerouslySetInnerHTML={{ __html: requirement.submission.content }}
                />
              </div>
            )}

            {requirement.submission.graded && (
              <div className="space-y-6">
                <div className="p-6 bg-green-50 rounded-xl">
                  <h3 className="text-base font-semibold text-gray-700 mb-2">Score</h3>
                  <p className="text-gray-600 text-2xl font-semibold">
                    {requirement.submission.score} / {requirement.scoreBase}
                  </p>
                </div>

                {requirement.submission.feedback && (
                  <div className="p-6 bg-blue-50 rounded-xl">
                    <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Feedback
                    </h3>
                    <div 
                      className="text-gray-600 prose prose-lg mx-auto [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-[#800000] [&>blockquote]:pl-6 [&>blockquote]:italic [&>pre]:bg-gray-100 [&>pre]:p-6 [&>pre]:rounded-lg [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>a]:text-[#800000] [&>a]:underline [&>a]:font-medium"
                      dangerouslySetInnerHTML={{ __html: requirement.submission.feedback }}
                    />
                  </div>
                )}
              </div>
            )}

            {!requirement.submission.graded && requirement.submission.status === 0 && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    // TODO: Implement complete submission functionality
                    console.log('Complete submission:', requirement.submission?.id);
                  }}
                  className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#800000]/90 transition-colors text-lg font-medium"
                >
                  Complete Submission
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
          <div className="text-center py-12">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Submission Yet</h3>
            <p className="text-gray-600 text-lg mb-6">You haven&apos;t submitted your work for this requirement.</p>
            <button
              onClick={() => {
                // TODO: Implement submission functionality
                console.log('Submit requirement:', requirement.id);
              }}
              className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#800000]/90 transition-colors text-lg font-medium"
            >
              Start Submission
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 