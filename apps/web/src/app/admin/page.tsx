import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";

export default async function AdminHomePage() {
  const [players, events, submissions] = await Promise.all([
    prisma.player.count(),
    prisma.event.count(),
    prisma.submission.count({ where: { status: "PENDING" } })
  ]);

  return (
    <AdminShell>
      <section>
        <h1>后台概览</h1>
        <div className="grid section">
          <Link className="card" href="/admin/players">
            <h2>{players}</h2>
            <p>球员资料</p>
          </Link>
          <Link className="card" href="/admin/events">
            <h2>{events}</h2>
            <p>赛事资料</p>
          </Link>
          <Link className="card" href="/admin/submissions">
            <h2>{submissions}</h2>
            <p>待审核提交</p>
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
