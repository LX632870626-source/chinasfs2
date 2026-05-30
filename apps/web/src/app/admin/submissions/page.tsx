import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { SubmissionActions } from "./SubmissionActions";

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminShell>
      <section>
        <h1>提交审核</h1>
        <div className="table-list">
          {submissions.map((submission) => (
            <article className="card" key={submission.id}>
              <div className="row">
                <span>
                  <strong>{submission.type === "PLAYER" ? "球员线索" : "赛事线索"}</strong>
                  <br />
                  <span className="muted">
                    {submission.contactName} · {submission.contactPhone} · {new Date(submission.createdAt).toLocaleString("zh-CN")}
                  </span>
                </span>
                <span className="status">{submission.status}</span>
              </div>
              <p>{submission.content}</p>
              <SubmissionActions id={submission.id} />
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
