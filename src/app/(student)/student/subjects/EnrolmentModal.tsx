'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createEnrolment } from '@/app/_actions/enrolment';

interface EnrolmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectInstanceId: string;
  subjectName: string;
  onSuccess?: () => void;
}

export default function EnrolmentModal({
  isOpen,
  onClose,
  subjectInstanceId,
  subjectName,
  onSuccess,
}: EnrolmentModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate enrollment code
    const enrollmentCode = parseInt(code);
    if (isNaN(enrollmentCode) || enrollmentCode <= 0) {
      setError('Please enter a valid enrollment code');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createEnrolment(subjectInstanceId, enrollmentCode);

      if (!result.success) {
        throw new Error(result.error || 'Failed to enroll');
      }

      // Call onSuccess callback if provided
      onSuccess?.();
      
      // Close modal and refresh the page
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#800000]">Enroll in Subject</h2>
          <p className="text-gray-600">
            Please enter the enrollment code for <span className="font-medium">{subjectName}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Enrollment Code
              </label>
              <input
                type="number"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Enter the enrollment code"
                maxLength={4}
                min={0}
                max={9999}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#800000] text-white py-2 px-4 rounded-md hover:bg-[#600000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Enrolling...
                  </div>
                ) : (
                  'Enroll Now'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
