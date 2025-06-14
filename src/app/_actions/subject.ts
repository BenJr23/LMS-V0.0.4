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
