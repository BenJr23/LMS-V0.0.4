'use server';

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '../../generated/prisma';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

interface CreateSubmissionData {
  requirementId: string;
  title: string;
  content: string;
  filePath: string;
}

interface UpdateSubmissionStatusData {
  id: string;
  studentId: string;
  status: number;
}

export async function createSubmission(data: CreateSubmissionData) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Get the user's enrollment for this requirement
    const requirement = await prisma.requirement.findUnique({
      where: { id: data.requirementId },
      include: {
        subjectInstance: {
          include: {
            enrolments: {
              where: {
                studentId: user.id
              }
            }
          }
        }
      }
    });

    if (!requirement) {
      throw new Error('Requirement not found');
    }

    const enrollment = requirement.subjectInstance.enrolments[0];
    if (!enrollment) {
      throw new Error('You are not enrolled in this subject');
    }

    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        requirementId: data.requirementId,
        enrollmentId: enrollment.id
      }
    });

    if (existingSubmission) {
      throw new Error('You have already created a submission for this requirement');
    }

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        requirementId: data.requirementId,
        enrollmentId: enrollment.id,
        userId: user.id,
        title: data.title,
        content: data.content,
        filePath: data.filePath,
        status: 0 // Start as draft
      }
    });

    revalidatePath(`/student/dashboard/${requirement.subjectInstanceId}/requirements/${data.requirementId}`);
    revalidatePath(`/student/dashboard/${requirement.subjectInstanceId}`);

    return {
      success: true,
      data: submission
    };
  } catch (error) {
    console.error('Error creating submission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create submission'
    };
  }
}

// Basic text similarity check function
async function checkTextSimilarity(text: string): Promise<{ success: boolean; score?: number; error?: string }> {
  try {
    // This is a placeholder for a more sophisticated similarity check
    // In a real implementation, you might want to:
    // 1. Compare against a database of known sources
    // 2. Use NLP techniques to detect paraphrasing
    // 3. Implement fuzzy matching algorithms
    
    // For now, we'll return a mock score
    const mockScore = Math.random() * 10; // Random score between 0-10%
    
    return {
      success: true,
      score: mockScore
    };
  } catch (error) {
    console.error('Similarity check error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check similarity'
    };
  }
}

export async function updateSubmissionStatus(data: UpdateSubmissionStatusData) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the current submission
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', data.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Check if user is authorized to update this submission
    if (submission.studentId !== data.studentId) {
      throw new Error('Unauthorized');
    }

    // If completing submission, check for similarity
    if (data.status === 1 && submission.filePath) {
      // For now, we'll just log that we're skipping the similarity check
      console.log('Skipping similarity check - using mock implementation');
      
      // In a real implementation, you would:
      // 1. Read the file content
      // 2. Perform similarity analysis
      // 3. Return appropriate results
      
      // Example of how we would use the similarity check:
      // const similarityCheck = await checkTextSimilarity(fileContent);
      // if (!similarityCheck.success || (similarityCheck.score && similarityCheck.score > 20)) {
      //   throw new Error('Similarity check failed or score too high');
      // }
    }

    // Update the status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: data.status })
      .eq('id', data.id);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating submission status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update submission status'
    };
  }
}

export async function getSubmission(submissionId: string) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        requirement: {
          include: {
            subjectInstance: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Verify ownership
    if (submission.userId !== user.id) {
      throw new Error('Unauthorized');
    }

    return {
      success: true,
      data: submission
    };
  } catch (error) {
    console.error('Error fetching submission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch submission'
    };
  }
}
