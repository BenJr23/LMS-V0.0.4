'use server';

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function getTeacherRequirementDetail(requirementId: string) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Get the requirement with its subject instance and all submissions
    const requirement = await prisma.requirement.findUnique({
      where: {
        id: requirementId
      },
      include: {
        subjectInstance: {
          include: {
            subject: true
          }
        },
        submissions: {
          include: {
            enrollment: {
              select: {
                studentId: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!requirement) {
      throw new Error('Requirement not found.');
    }

    // Verify that the user is the teacher of this subject instance
    if (requirement.subjectInstance.userId !== user.id) {
      throw new Error('You do not have permission to view this requirement.');
    }

    // Transform the data to include submission status and student info
    const requirementWithDetails = {
      ...requirement,
      submissions: requirement.submissions.map(submission => ({
        ...submission,
        studentEmail: submission.enrollment.email,
        status: submission.status === 1 ? 'complete' : 'draft',
        enrollment: {
          studentId: submission.enrollment.studentId,
          email: submission.enrollment.email
        }
      }))
    };

    return {
      success: true,
      data: requirementWithDetails
    };
  } catch (error) {
    console.error('Error fetching requirement detail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch requirement detail'
    };
  }
}

export async function submitGrade(submissionId: string, score: number, feedback: string) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Get the submission with its requirement and subject instance
    const submission = await prisma.submission.findUnique({
      where: {
        id: submissionId
      },
      include: {
        requirement: {
          include: {
            subjectInstance: true
          }
        }
      }
    });

    if (!submission) {
      throw new Error('Submission not found.');
    }

    // Verify that the user is the teacher of this subject instance
    if (submission.requirement.subjectInstance.userId !== user.id) {
      throw new Error('You do not have permission to grade this submission.');
    }

    // Update the submission with grade and feedback
    const updatedSubmission = await prisma.submission.update({
      where: {
        id: submissionId
      },
      data: {
        score: score,
        feedback: feedback,
        graded: true
      }
    });

    return {
      success: true,
      data: updatedSubmission
    };
  } catch (error) {
    console.error('Error submitting grade:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit grade'
    };
  }
}
