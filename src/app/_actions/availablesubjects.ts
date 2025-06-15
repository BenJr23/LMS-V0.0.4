'use server';

import { PrismaClient } from '../../generated/prisma';
import { currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export const getActiveSubjectInstances = async () => {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: 'User not authenticated.'
      };
    }

    // Get all active subject instances
    const activeInstances = await prisma.subjectInstance.findMany({
      where: {
        enrollment: 1, // Get only active instances
      },
      include: {
        subject: true, // Include the parent subject information
        enrolments: {
          where: {
            studentId: user.id
          }
        }
      },
    });

    // Filter out subjects that the user is already enrolled in
    const availableInstances = activeInstances.filter(instance => instance.enrolments.length === 0);

    return {
      success: true,
      data: availableInstances
    };
  } catch (error) {
    console.error("[GET_ACTIVE_SUBJECT_INSTANCES]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch active subject instances'
    };
  }
};
