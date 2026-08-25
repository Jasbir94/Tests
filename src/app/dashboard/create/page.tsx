import { Wizard } from "@/components/create-test/Wizard";

export default function CreateTestPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Mock Test</h1>
        <p className="text-muted-foreground">Follow the steps to set up your test from a PDF.</p>
      </div>
      <Wizard />
    </div>
  );
}
