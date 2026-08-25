"use client";

import { useTestCreationStore } from "@/store/useTestCreationStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Step3Configure() {
  const { testName, duration, setTestConfig, nextStep, prevStep } = useTestCreationStore();

  const isFormValid = testName.trim().length > 0 && duration > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configure Test</h2>
        <p className="text-muted-foreground">Set the exam duration and name.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              placeholder="e.g. GATE CSE 2025 Mock Test 1"
              value={testName}
              onChange={(e) => setTestConfig({ testName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setTestConfig({ duration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={prevStep} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={nextStep} disabled={!isFormValid} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
