'use server';

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

type CreateSubjectInstanceInput = {
  subjectId: string;
  teacherName: string;
  grade: string;
  section: string;
  enrolmentCode: number;
  icon: string;
  enrollment: number;
};

export async function getSubjectInstances() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    const subjectInstances = await prisma.subjectInstance.findMany({
      where: {
        userId: user.id
      },
      include: {
        subject: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: subjectInstances
    };
  } catch (error) {
    console.error('Error fetching subject instances:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch subject instances'
    };
  }
}

export async function createSubjectInstance(data: CreateSubjectInstanceInput) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    // Validate required fields
    if (!data.subjectId || !data.teacherName || !data.grade || !data.section || !data.enrolmentCode || !data.icon) {
      throw new Error('All fields are required.');
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId }
    });

    if (!subject) {
      throw new Error('Subject not found.');
    }

    // Create the subject instance
    const subjectInstance = await prisma.subjectInstance.create({
      data: {
        subjectId: data.subjectId,
        userId: user.id,
        teacherName: data.teacherName,
        grade: data.grade,
        section: data.section,
        enrolmentCode: data.enrolmentCode,
        icon: data.icon,
        enrollment: data.enrollment || 1, // Default to 1 (active) if not provided
      },
      include: {
        subject: true
      }
    });

    return { 
      success: true, 
      data: subjectInstance 
    };
  } catch (error) {
    console.error('Error creating subject instance:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create subject instance' 
    };
  }
}

export async function getSubjectInstance(id: string) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      throw new Error('User not authenticated.');
    }

    const subjectInstance = await prisma.subjectInstance.findUnique({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        subject: true,
        announcements: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        moduleFolders: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        uploadedContents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!subjectInstance) {
      throw new Error('Subject instance not found.');
    }

    return subjectInstance;
  } catch (error) {
    console.error('Error fetching subject instance:', error);
    throw error;
  }
}
