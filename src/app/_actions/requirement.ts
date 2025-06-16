'use server';

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

type CreateRequirementInput = {
  subjectInstanceId: string;
  title: string;
  content: string;
  scoreBase: number;
  deadline: Date;
  type: 'FORUMS' | 'QUIZZES' | 'ASSIGNMENTS' | 'ACTIVITIES';
};

export async function createRequirement(data: CreateRequirementInput) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Validate required fields
    if (!data.subjectInstanceId || !data.title || !data.content || !data.scoreBase || !data.deadline || !data.type) {
      throw new Error('All fields are required.');
    }

    // Check if subject instance exists and belongs to the user
    const subjectInstance = await prisma.subjectInstance.findUnique({
      where: {
        id: data.subjectInstanceId,
        userId: user.id
      }
    });

    if (!subjectInstance) {
      throw new Error('Subject instance not found or you do not have permission to add requirements.');
    }

    // Get the latest requirement number for this subject instance
    const latestRequirement = await prisma.requirement.findFirst({
      where: {
        subjectInstanceId: data.subjectInstanceId,
        type: data.type
      },
      orderBy: {
        requirementNumber: 'desc'
      }
    });

    // Create the requirement
    const requirement = await prisma.requirement.create({
      data: {
        subjectInstanceId: data.subjectInstanceId,
        title: data.title,
        content: data.content,
        scoreBase: data.scoreBase,
        deadline: data.deadline,
        type: data.type,
        requirementNumber: (latestRequirement?.requirementNumber || 0) + 1
      }
    });

    return {
      success: true,
      data: requirement
    };
  } catch (error) {
    console.error('Error creating requirement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create requirement'
    };
  }
}

export async function getRequirements(subjectInstanceId: string) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Check if subject instance exists and belongs to the user
    const subjectInstance = await prisma.subjectInstance.findUnique({
      where: {
        id: subjectInstanceId,
        userId: user.id
      }
    });

    if (!subjectInstance) {
      throw new Error('Subject instance not found or you do not have permission to view requirements.');
    }

    // Get all requirements for this subject instance
    const requirements = await prisma.requirement.findMany({
      where: {
        subjectInstanceId: subjectInstanceId
      },
      orderBy: [
        { type: 'asc' },
        { requirementNumber: 'asc' }
      ]
    });

    return {
      success: true,
      data: requirements
    };
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch requirements'
    };
  }
}

export async function getStudentRequirements(subjectInstanceId: string) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Get the student's enrollment for this subject instance
    const enrollment = await prisma.enrolment.findFirst({
      where: {
        subjectInstanceId: subjectInstanceId,
        studentId: user.id
      }
    });

    if (!enrollment) {
      throw new Error('You are not enrolled in this subject.');
    }

    // Get all requirements with submissions for this subject instance
    const requirements = await prisma.requirement.findMany({
      where: {
        subjectInstanceId: subjectInstanceId
      },
      include: {
        submissions: {
          where: {
            enrollmentId: enrollment.id
          },
          select: {
            id: true,
            title: true,
            content: true,
            filePath: true,
            graded: true,
            score: true,
            feedback: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: [
        { type: 'asc' },
        { requirementNumber: 'asc' }
      ]
    });

    // Transform the data to include submission status
    const requirementsWithStatus = requirements.map(req => {
      const submission = req.submissions[0]; // Get the first submission if exists
      let submissionStatus: 'GRADED' | 'SUBMITTED' | 'NOT_SUBMITTED' = 'NOT_SUBMITTED';
      
      if (submission) {
        submissionStatus = submission.graded ? 'GRADED' : 'SUBMITTED';
      }

      return {
        ...req,
        submissionStatus,
        submission: submission || null
      };
    });

    return {
      success: true,
      data: requirementsWithStatus
    };
  } catch (error) {
    console.error('Error fetching student requirements:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch requirements'
    };
  }
}
