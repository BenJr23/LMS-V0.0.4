'use server';

import { PrismaClient } from '../../generated/prisma';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export const getEnrolledSubjects = async () => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: 'User not authenticated.'
      };
    }

    const enrolledSubjects = await prisma.enrolment.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        subjectInstance: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: enrolledSubjects
    };
  } catch (error) {
    console.error("[GET_ENROLLED_SUBJECTS]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch enrolled subjects'
    };
  }
}; 