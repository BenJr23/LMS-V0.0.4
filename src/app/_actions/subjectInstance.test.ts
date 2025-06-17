/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { 
  getSubjectInstances, 
  createSubjectInstance, 
  getSubjectInstance, 
  deleteSubjectInstance, 
  getStudentSubjectInstance 
} from './subjectInstance';

import { prisma } from '../../lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    subjectInstance: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    subject: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
    submission: {
      deleteMany: vi.fn(),
    },
    requirement: {
      deleteMany: vi.fn(),
    },
    uploadedContent: {
      deleteMany: vi.fn(),
    },
    moduleFolder: {
      deleteMany: vi.fn(),
    },
    announcement: {
      deleteMany: vi.fn(),
    },
    enrolment: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn(),
}));

describe('subjectInstance actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSubjectInstances', () => {
    it('should return subject instances for authenticated user', async () => {
      (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user1' });
      (prisma.subjectInstance.findMany as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: 'si1' }]);

      const result = await getSubjectInstances();

      expect(currentUser).toHaveBeenCalled();
      expect(prisma.subjectInstance.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: { subject: true },
        orderBy: { createdAt: 'desc' }
      });
      expect(result).toEqual({ success: true, data: [{ id: 'si1' }] });
    });

    it('should retry on prepared statement error and succeed', async () => {
      (currentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'user1' });

      const error = new Error('prepared statement already exists');
      (error as any).code = '42P05';

      const mockFindMany = prisma.subjectInstance.findMany as unknown as ReturnType<typeof vi.fn>;

      // First two calls throw error, third call succeeds
      mockFindMany
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue([{ id: 'si2' }]);

      const result = await getSubjectInstances();

      expect(mockFindMany).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true, data: [{ id: 'si2' }] });
    });

    it('should return error if user not authenticated', async () => {
      (currentUser as Mock).mockResolvedValue(null);

      const result = await getSubjectInstances();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated.');
    });
  });

  describe('createSubjectInstance', () => {
    const validData = {
      subjectId: 'sub1',
      teacherName: 'Teacher',
      grade: 'A',
      section: '1',
      enrolmentCode: 123,
      icon: 'icon.png',
      enrollment: 1
    };

    it('should create subject instance with valid data and authenticated user', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });
      (prisma.subject.findUnique as Mock).mockResolvedValue({ id: 'sub1' });
      (prisma.subjectInstance.create as Mock).mockResolvedValue({ id: 'si1', ...validData });

      const result = await createSubjectInstance(validData);

      expect(prisma.subject.findUnique).toHaveBeenCalledWith({ where: { id: 'sub1' } });
      expect(prisma.subjectInstance.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('si1');
    });

    it('should return error if user not authenticated', async () => {
      (currentUser as Mock).mockResolvedValue(null);

      const result = await createSubjectInstance(validData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated.');
    });

    it('should return error if required fields missing', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });

      const incompleteData = { ...validData, teacherName: '' };

      const result = await createSubjectInstance(incompleteData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('should return error if subject not found', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });
      (prisma.subject.findUnique as Mock).mockResolvedValue(null);

      const result = await createSubjectInstance(validData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Subject not found.');
    });
  });

  describe('getSubjectInstance', () => {
    it('should return subject instance for authenticated user', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });
      (prisma.subjectInstance.findUnique as Mock).mockResolvedValue({ id: 'si1' });

      const result = await getSubjectInstance('si1');

      expect(prisma.subjectInstance.findUnique).toHaveBeenCalledWith({
        where: { id: 'si1', userId: 'user1' },
        include: {
          subject: true,
          announcements: { orderBy: { createdAt: 'desc' } },
          moduleFolders: { orderBy: { createdAt: 'desc' } },
          uploadedContents: { orderBy: { createdAt: 'desc' } }
        }
      });
      expect(result).toEqual({ id: 'si1' });
    });

    it('should throw error if user not authenticated', async () => {
      (currentUser as Mock).mockResolvedValue(null);

      await expect(getSubjectInstance('si1')).rejects.toThrow('User not authenticated.');
    });

    it('should throw error if subject instance not found', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });
      (prisma.subjectInstance.findUnique as Mock).mockResolvedValue(null);

      await expect(getSubjectInstance('si1')).rejects.toThrow('Subject instance not found.');
    });
  });

  describe('deleteSubjectInstance', () => {
    it('should delete subject instance and related data for authenticated user', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });
      (prisma.subjectInstance.findUnique as Mock).mockResolvedValue({
        id: 'si1',
        requirements: [{ id: 'r1' }],
        announcements: [{}],
        moduleFolders: [{ id: 'mf1' }],
        uploadedContents: [{}],
        enrolments: [{}]
      });
      (prisma.$transaction as Mock).mockImplementation(async (cb: (prismaClient: typeof prisma) => Promise<any>) => cb(prisma));

      (prisma.submission.deleteMany as Mock).mockResolvedValue({});
      (prisma.requirement.deleteMany as Mock).mockResolvedValue({});
      (prisma.uploadedContent.deleteMany as Mock).mockResolvedValue({});
      (prisma.moduleFolder.deleteMany as Mock).mockResolvedValue({});
      (prisma.announcement.deleteMany as Mock).mockResolvedValue({});
      (prisma.enrolment.deleteMany as Mock).mockResolvedValue({});
      (prisma.subjectInstance.delete as Mock).mockResolvedValue({});

      const result = await deleteSubjectInstance('si1');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subject instance and all related data deleted successfully');
    });

    it('should return error if user not authenticated', async () => {
      (currentUser as Mock).mockResolvedValue(null);

      const result = await deleteSubjectInstance('si1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated.');
    });

    it('should return error if subject instance not found or no permission', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'user1' });
      (prisma.subjectInstance.findUnique as Mock).mockResolvedValue(null);

      const result = await deleteSubjectInstance('si1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Subject instance not found or you do not have permission to delete it.');
    });
  });

  describe('getStudentSubjectInstance', () => {
    it('should return subject instance for enrolled student', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'student1' });
      (prisma.enrolment.findFirst as Mock).mockResolvedValue({ id: 'en1' });
      (prisma.subjectInstance.findUnique as Mock).mockResolvedValue({ id: 'si1' });

      const result = await getStudentSubjectInstance('si1');

      expect(prisma.enrolment.findFirst).toHaveBeenCalledWith({
        where: { subjectInstanceId: 'si1', studentId: 'student1' }
      });
      expect(result).toEqual({ id: 'si1' });
    });

    it('should throw error if user not authenticated', async () => {
      (currentUser as Mock).mockResolvedValue(null);

      await expect(getStudentSubjectInstance('si1')).rejects.toThrow('User not authenticated.');
    });

    it('should throw error if student not enrolled', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'student1' });
      (prisma.enrolment.findFirst as Mock).mockResolvedValue(null);

      await expect(getStudentSubjectInstance('si1')).rejects.toThrow('You are not enrolled in this subject.');
    });

    it('should throw error if subject instance not found', async () => {
      (currentUser as Mock).mockResolvedValue({ id: 'student1' });
      (prisma.enrolment.findFirst as Mock).mockResolvedValue({ id: 'en1' });
      (prisma.subjectInstance.findUnique as Mock).mockResolvedValue(null);

      await expect(getStudentSubjectInstance('si1')).rejects.toThrow('Subject instance not found.');
    });
  });
});
