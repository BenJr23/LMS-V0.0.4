'use server';

import { PrismaClient, Prisma } from '../../generated/prisma';

const prisma = new PrismaClient();

export async function getSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw new Error('Failed to fetch subjects');
  }
}

export async function createSubject(data: { name: string; code: string; createdById: string }) {
  try {
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        createdById: data.createdById,
      },
    });
    
    return subject;
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('A subject with this code already exists');
    }
    throw new Error('Failed to create subject');
  }
}

export async function updateSubject(data: { id: string; name: string; code: string }) {
  try {
    // Check if another subject with the same code exists
    const existingSubject = await prisma.subject.findFirst({
      where: {
        code: data.code,
        id: {
          not: data.id
        }
      }
    });

    if (existingSubject) {
      throw new Error('A subject with this code already exists');
    }

    const subject = await prisma.subject.update({
      where: {
        id: data.id
      },
      data: {
        name: data.name,
        code: data.code,
      },
    });
    
    return subject;
  } catch (error) {
    console.error('Error updating subject:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('A subject with this code already exists');
      }
      if (error.code === 'P2025') {
        throw new Error('Subject not found');
      }
    }
    throw error instanceof Error ? error : new Error('Failed to update subject');
  }
}

export async function deleteSubject(id: string) {
  try {
    // First check if the subject exists
    const subject = await prisma.subject.findUnique({
      where: { id }
    });

    if (!subject) {
      throw new Error('Subject not found');
    }

    // Delete the subject
    await prisma.subject.delete({
      where: { id }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting subject:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new Error('Subject not found');
      }
    }
    throw error instanceof Error ? error : new Error('Failed to delete subject');
  }
}
