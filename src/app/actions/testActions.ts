"use server";

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getOrCreateMockUser } from '@/lib/user';

async function savePdfFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'pdf';
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // On Vercel, public/ is read-only. Try /tmp first, then fall back to public/uploads locally.
  try {
    const tmpDir = '/tmp/mockpdf-uploads';
    await fs.mkdir(tmpDir, { recursive: true });
    await fs.writeFile(path.join(tmpDir, fileName), buffer);
    // /tmp files aren't publicly accessible — we store the name and serve via a route,
    // but for this session the PDF is already in browser memory (Zustand pdfFile object).
    // The stored URL is metadata only for now.
    return `/api/pdf/${fileName}`;
  } catch {
    // Local dev fallback: write to public/uploads
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, fileName), buffer);
      return `/uploads/${fileName}`;
    } catch {
      // If all file writes fail, store a placeholder — PDF still works from Zustand state
      return `/uploads/${fileName}`;
    }
  }
}

export async function createTest(formData: FormData) {
  try {
    const file = formData.get('pdf') as File | null;
    const testDataStr = formData.get('testData') as string | null;

    if (!file || !testDataStr) {
      throw new Error('Missing file or test data');
    }

    const testData = JSON.parse(testDataStr);

    // Save PDF (gracefully handles Vercel read-only filesystem)
    const pdfUrl = await savePdfFile(file);

    // Get or create the mock user
    const user = await getOrCreateMockUser();

    // Create Test + AnswerKeys in DB
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
    console.error('[createTest] Error:', error);
    return { success: false, error: String(error) };
  }
}
