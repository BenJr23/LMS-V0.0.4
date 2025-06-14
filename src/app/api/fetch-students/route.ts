import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../src/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const encodedEmail = searchParams.get('email');

  if (!encodedEmail) {
    return NextResponse.json({ error: 'Missing email parameter' }, { status: 400 });
  }

  const email = decodeURIComponent(encodedEmail);
  const rawBody = JSON.stringify({ email });
  const timestamp = Date.now().toString();
  const secret = process.env.SJSFI_SHARED_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Generate HMAC signature (body + timestamp)
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(rawBody + timestamp)
  );

  // Convert signature to hex string
  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  try {
    console.log('Fetching student data for email:', email);
    
    const response = await fetch('https://sjsfi-sis.vercel.app/api/xr/getStudent', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SJSFI_LMS_API_KEY}`,
        'Content-Type': 'application/json',
        "x-timestamp": timestamp,
        "x-signature": signature,
      },
      body: rawBody
    });

    if (!response.ok) {
      console.error('Failed to fetch student data. Status:', response.status);
      return NextResponse.json({ error: 'Failed to fetch student data' }, { status: response.status });
    }

    const data = await response.json();
    
    // Log the complete student data
    console.log('Student Data Retrieved:', {
      timestamp: new Date().toISOString(),
      email: email,
      data: data
    });

    // Assuming userId is obtained from the authentication context or request headers
    const userId = req.headers.get('x-user-id'); // Example: Get user ID from headers

    if (!userId) {
      console.error('User ID not found in request headers');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const studentData = {
      fetchID: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      gradeLevel: data.grade_level,
      status: data.status,
      studentNumber: data.studentNumber,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      guardianName: data.guardianName,
      guardianContact: data.guardianContact,
      address: data.address
    };

    const existingStudent = await prisma.student.findUnique({
      where: { email: studentData.email }
    });

    if (existingStudent) {
      // Check if data has changed
      if (
        existingStudent.name !== studentData.name ||
        existingStudent.role !== studentData.role ||
        existingStudent.gradeLevel !== studentData.gradeLevel ||
        existingStudent.status !== studentData.status ||
        existingStudent.studentNumber !== studentData.studentNumber ||
        existingStudent.dateOfBirth.getTime() !== studentData.dateOfBirth.getTime() ||
        existingStudent.gender !== studentData.gender ||
        existingStudent.guardianName !== studentData.guardianName ||
        existingStudent.guardianContact !== studentData.guardianContact ||
        existingStudent.address !== studentData.address
      ) {
        // Update the student data
        await prisma.student.update({
          where: { email: studentData.email },
          data: studentData
        });
        console.log('Student data updated in database');
      } else {
        console.log('Student data unchanged, no update needed');
      }
    } else {
      // Create new student record
      await prisma.student.create({
        data: studentData
      });
      console.log('New student data stored in database');
    }
    
    return NextResponse.json({
      id: data.id,
      full_name: data.name,
      email: data.email,
      role: data.role,
      grade_level: data.grade_level,
      enrollment_status: data.enrollment_status,
      status: data.status,
      studentNumber: data.studentNumber,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      guardianName: data.guardianName,
      guardianContact: data.guardianContact,
      address: data.address
    }, { status: 200 });
    

  } catch (error) {
    console.error('Error fetching student data:', {
      error: error,
      email: email,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
