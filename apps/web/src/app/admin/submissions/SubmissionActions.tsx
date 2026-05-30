"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubmissionActions({ id }: { id: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function review(status: "ADOPTED" | "REJECTED") {
    setIsSubmitting(true);
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div className="toolbar">
      <button className="button" disabled={isSubmitting} onClick={() => void review("ADOPTED")} type="button">
        采纳
      </button>
      <button className="button secondary" disabled={isSubmitting} onClick={() => void review("REJECTED")} type="button">
        拒绝
      </button>
    </div>
  );
}
