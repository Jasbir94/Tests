"use server";

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getOrCreateMockUser } from '@/lib/user';

export async function createTest(formData: FormData) {
  try {
    const file = formData.get('pdf') as File | null;
    const testDataStr = formData.get('testData') as string | null;

    if (!file || !testDataStr) {
      throw new Error('Missing file or test data');
    }

    const testData = JSON.parse(testDataStr);
    
    // Save PDF locally (public/uploads)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    
    const pdfUrl = `/uploads/${fileName}`;

    // Get Mock User
    const user = await getOrCreateMockUser();

    // Create Test in DB
    const test = await prisma.test.create({
      data: {
        userId: user.id,
        title: testData.testName,
        pdfUrl: pdfUrl,
        duration: testData.duration,
        totalQuestions: testData.totalQuestions,
        answerKeys: {
          create: Object.entries(testData.answerKey).map(([qNum, data]: [string, any]) => ({
            questionNumber: parseInt(qNum, 10),
            questionType: data.type,
            correctOption: data.key,
            marks: data.marks,
          }))
        }
      }
    });

    return { success: true, testId: test.id, pdfUrl: test.pdfUrl };
  } catch (error) {
    console.error('Error creating test:', error);
    return { success: false, error: 'Failed to create test' };
  }
}
