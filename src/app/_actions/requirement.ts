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
