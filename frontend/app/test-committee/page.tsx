// app/test-committee/page.tsx
"use client";
 
import { useState } from "react";
import createCommittee from "@/app/actions/internship/createCommittee";
 
export default function TestCommitteePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
 
  const handleCreate = async () => {
    setLoading(true);
    try {
      const committeeData = {
        name: "test_committee",
        displayName: "Test Committee", 
        description: "A test committee for development"
      };
      
      const response = await createCommittee(committeeData);
      setResult(response);
    } catch (error) {
      setResult({ success: false, error: (error as Error).message });
    }
    setLoading(false);
  };
 
  return (
    <div className="p-8">
      <h1>Test createCommittee Action</h1>
      <button 
        onClick={handleCreate} 
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {loading ? "Creating..." : "Create Test Committee"}
      </button>
      
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}