"use client";

import { useEffect, useRef } from "react";
import { useAttemptStore } from "@/store/useAttemptStore";
import { Clock } from "lucide-react";

export function Timer() {
  // Use selectors to only subscribe to timer-specific state
  const timeRemaining = useAttemptStore((s) => s.timeRemaining);
  const setTimeRemaining = useAttemptStore((s) => s.setTimeRemaining);
  const submitTest = useAttemptStore((s) => s.submitTest);
  const isSubmitted = useAttemptStore((s) => s.isSubmitted);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSubmitted || timeRemaining <= 0) {
      if (timeRemaining === 0 && !isSubmitted) {
        submitTest();
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const current = useAttemptStore.getState().timeRemaining;
      if (current <= 1) {
        useAttemptStore.getState().submitTest();
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        useAttemptStore.setState({ timeRemaining: current - 1 });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSubmitted]); // Only restart interval when submission state changes

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isUrgent = timeRemaining < 600 && timeRemaining > 0; // Less than 10 mins

  return (
    <div className={`flex items-center gap-2 font-mono text-lg font-bold p-2 rounded-md ${isUrgent ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted'}`}>
      <Clock className="h-5 w-5" />
      <span>{formattedTime}</span>
    </div>
  );
}
