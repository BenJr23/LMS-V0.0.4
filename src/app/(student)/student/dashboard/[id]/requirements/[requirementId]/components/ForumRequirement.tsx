'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, X, Loader2 } from 'lucide-react';
import { getStudentRequirementDetail } from '@/app/_actions/requirement';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import RichTextEditor from '@/components/RichTextEditor';
import { createSubmission, updateSubmissionStatus, editSubmission } from '@/app/_actions/submission';

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

interface ForumPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirementId: string;
  onSuccess: () => void;
  initialData?: { title: string; content: string };
}

function ForumPostModal({ isOpen, onClose, requirementId, onSuccess, initialData }: ForumPostModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = initialData 
        ? await editSubmission({
            submissionId: requirementId,
            title,
            content,
            filePath: ''
          })
        : await createSubmission({
            requirementId,
            title,
            content,
            filePath: ''
          });

      if (response.success) {
        toast.success(initialData ? 'Post updated successfully' : 'Post created successfully');
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error(response.error || (initialData ? 'Failed to update post' : 'Failed to create post'));
      }
    } catch (error) {
      console.error('Error handling post:', error);
      toast.error(initialData ? 'Failed to update post' : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Forum Post' : 'Create Forum Post'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Post Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="Enter post title"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <div className="border border-gray-300 rounded-lg">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your post content..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#800000] text-white rounded-lg hover:bg-[#800000]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {initialData ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                initialData ? 'Update Post' : 'Create Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ForumRequirement({ 
  id,
  requirementId
}: { 
  id: string;
  requirementId: string;
}) {
  const router = useRouter();
  const [requirement, setRequirement] = useState<RequirementDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchRequirement = async () => {
    try {
      setLoading(true);
      const response = await getStudentRequirementDetail(requirementId);
      
      if (response.success && response.data) {
        if (response.data.type !== 'FORUM') {
          router.push(`/student/dashboard/${id}/requirements/${requirementId}`);
          return;
        }
        setRequirement(response.data as RequirementDetail);
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

  useEffect(() => {
    fetchRequirement();
  }, [requirementId, router, id]);

  const handleCompleteSubmission = async () => {
    if (!requirement?.submission) return;

    try {
      const response = await updateSubmissionStatus({
        submissionId: requirement.submission.id,
        status: 1 // Complete
      });

      if (response.success) {
        toast.success('Post completed successfully');
        fetchRequirement();
      } else {
        toast.error(response.error || 'Failed to complete post');
      }
    } catch (error) {
      console.error('Error completing post:', error);
      toast.error('Failed to complete post');
    }
  };

  const handleSubmissionSuccess = () => {
    fetchRequirement();
  };

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
        </div>

        <div className="prose max-w-none">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Description</h3>
          <div 
            className="text-gray-700 prose prose-lg mx-auto [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-[#800000] [&>blockquote]:pl-6 [&>blockquote]:italic [&>pre]:bg-gray-100 [&>pre]:p-6 [&>pre]:rounded-lg [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>a]:text-[#800000] [&>a]:underline [&>a]:font-medium"
            dangerouslySetInnerHTML={{ __html: requirement.content }}
          />
        </div>
      </div>

      {/* Forum Post Section */}
      {requirement.submission ? (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-[#800000]" />
            Your Forum Post
          </h2>
          
          <div className="space-y-8">
            <div className="p-6 bg-pink-50/50 rounded-xl">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Status</h3>
              <p className="text-gray-600 text-lg">
                {requirement.submission.status === 1 ? 'Complete' : 'Draft'}
              </p>
            </div>

            <div className="p-6 bg-pink-50/50 rounded-xl">
              <h3 className="text-base font-semibold text-gray-700 mb-2">Posted On</h3>
              <p className="text-gray-600 text-lg">
                {new Date(requirement.submission.createdAt).toLocaleString()}
              </p>
            </div>

            {requirement.submission.content && (
              <div className="p-6 bg-pink-50/50 rounded-xl">
                <h3 className="text-base font-semibold text-gray-700 mb-3">Post Content</h3>
                <div 
                  className="text-gray-600 prose prose-lg mx-auto [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>p]:mb-6 [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-[#800000] [&>blockquote]:pl-6 [&>blockquote]:italic [&>pre]:bg-gray-100 [&>pre]:p-6 [&>pre]:rounded-lg [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>a]:text-[#800000] [&>a]:underline [&>a]:font-medium"
                  dangerouslySetInnerHTML={{ __html: requirement.submission.content }}
                />
              </div>
            )}

            {!requirement.submission.graded && requirement.submission.status === 0 && (
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-3 border border-[#800000] text-[#800000] rounded-lg hover:bg-pink-50 transition-colors text-lg font-medium"
                >
                  Edit Post
                </button>
                <button
                  onClick={handleCompleteSubmission}
                  className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#800000]/90 transition-colors text-lg font-medium"
                >
                  Complete Post
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-pink-100">
          <div className="text-center py-12">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#800000]/90 transition-colors text-lg font-medium"
            >
              Create Forum Post
            </button>
          </div>
        </div>
      )}

      {/* Add the Forum Post Modal */}
      <ForumPostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        requirementId={requirementId}
        onSuccess={handleSubmissionSuccess}
      />

      {/* Add the Edit Forum Post Modal */}
      <ForumPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        requirementId={requirement.submission?.id || ''}
        onSuccess={handleSubmissionSuccess}
        initialData={requirement.submission ? {
          title: requirement.submission.title,
          content: requirement.submission.content
        } : undefined}
      />
    </div>
  );
} 