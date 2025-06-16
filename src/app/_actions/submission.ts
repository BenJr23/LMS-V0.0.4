'use server';

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '../../generated/prisma';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

interface CreateSubmissionData {
  requirementId: string;
  title: string;
  content: string;
  filePath: string;
}

interface UpdateSubmissionStatusData {
  submissionId: string;
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

export async function updateSubmissionStatus(data: UpdateSubmissionStatusData) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Get the submission
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      include: {
        requirement: {
          include: {
            subjectInstance: true
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

    // Update the status
    const updatedSubmission = await prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        status: data.status
      }
    });

    revalidatePath(`/student/dashboard/${submission.requirement.subjectInstanceId}/requirements/${submission.requirementId}`);
    revalidatePath(`/student/dashboard/${submission.requirement.subjectInstanceId}`);

    return {
      success: true,
      data: updatedSubmission
    };
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
