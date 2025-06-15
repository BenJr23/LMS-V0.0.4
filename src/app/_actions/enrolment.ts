'use server';

import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function enrollInSubject(subjectInstanceId: string, enrollmentCode: number) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return {
        success: false,
        error: 'User not authenticated.'
      };
    }

    // Check if subject instance exists and is active
    const subjectInstance = await prisma.subjectInstance.findFirst({
      where: {
        id: subjectInstanceId,
        enrollment: 1, // Check if enrollment is active
        enrolmentCode: enrollmentCode
      }
    });

    if (!subjectInstance) {
      return {
        success: false,
        error: 'Invalid enrollment code or subject is not available for enrollment.'
      };
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrolment.findFirst({
      where: {
        subjectInstanceId: subjectInstanceId,
        studentId: user.id
      }
    });

    if (existingEnrollment) {
      return {
        success: false,
        error: 'You are already enrolled in this subject.'
      };
    }

    // Create enrollment
    const enrollment = await prisma.enrolment.create({
      data: {
        subjectInstanceId: subjectInstanceId,
        studentId: user.id,
        email: user.emailAddresses[0].emailAddress,
        code: enrollmentCode,
        hasNewContent: false
      }
    });

    return {
      success: true,
      data: enrollment
    };
  } catch (error) {
    console.error('Error enrolling in subject:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll in subject'
    };
  }
}
