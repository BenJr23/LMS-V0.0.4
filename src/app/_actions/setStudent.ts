import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function setStudentMetadata() {
  const session = await auth();

  if (!session.userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.json({ error: 'Clerk secret key is not configured' }, { status: 500 });
  }

  try {
    const clerk = await clerkClient();
    // Get the user's email from Clerk
    const user = await clerk.users.getUser(session.userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Find the student in the database
    const student = await prisma.student.findUnique({
      where: { email: userEmail }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Set private metadata
    await clerk.users.updateUser(session.userId, {
      privateMetadata: {
        studentId: student.id,
        fetchID: student.fetchID,
        role: student.role,
        status: student.status,
        studentNumber: student.studentNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        guardianName: student.guardianName,
        guardianContact: student.guardianContact,
        address: student.address
      }
    });

    // Set public metadata
    await clerk.users.updateUser(session.userId, {
      publicMetadata: {
        name: student.name,
        email: student.email,
        gradeLevel: student.gradeLevel
      }
    });

    return NextResponse.json({ message: 'Student metadata set successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error setting student metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
