"use server";

import prisma from '@/lib/prisma';
import { getOrCreateMockUser } from '@/lib/user';

export async function startAttempt(testId: string) {
  try {
    const user = await getOrCreateMockUser();
    
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        testId: testId,
        startedAt: new Date()
      }
    });

    return { success: true, attemptId: attempt.id };
  } catch (error) {
    console.error('Error starting attempt:', error);
    return { success: false, error: 'Failed to start attempt' };
  }
}

export async function submitAttempt(
  attemptId: string, 
  userAnswers: Record<number, string>, 
  timeTaken: number
) {
  try {
    // Get the attempt and its associated test's answer key
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        test: {
          include: {
            answerKeys: true
          }
        }
      }
    });

    if (!attempt) throw new Error('Attempt not found');

    const answerKeys = attempt.test.answerKeys;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const answerRecords = [];

    // Evaluate answers
    for (const key of answerKeys) {
      const selectedOption = userAnswers[key.questionNumber];
      const isAnswered = selectedOption !== undefined && selectedOption !== null;
      
      let marksAwarded = 0;

      if (!isAnswered) {
        skipped++;
      } else if (selectedOption === key.correctOption) {
        correct++;
        marksAwarded = key.marks;
        score += marksAwarded;
      } else {
        wrong++;
        // Assuming 0 marks for wrong, or could implement negative marking here
      }

      answerRecords.push({
        attemptId: attempt.id,
        questionNumber: key.questionNumber,
        selectedOption: selectedOption || null,
        correctOption: key.correctOption,
        marks: marksAwarded
      });
    }

    // Save individual answers
    await prisma.answer.createMany({
      data: answerRecords
    });

    // Update Attempt with results
    const updatedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        submittedAt: new Date(),
        score,
        correct,
        wrong,
        skipped,
        timeTaken
      }
    });

    return { success: true, attempt: updatedAttempt };
  } catch (error) {
    console.error('Error submitting attempt:', error);
    return { success: false, error: 'Failed to submit attempt' };
  }
}
