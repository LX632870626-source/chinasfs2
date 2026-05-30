import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { matches: { orderBy: { startsAt: "asc" } } },
    orderBy: { startsAt: "asc" }
  });

  return (
    <AdminShell>
      <section>
        <h1>赛事管理</h1>
        <div className="table-list">
          {events.map((event) => (
            <article className="card" key={event.id}>
              <div className="row">
                <span>
                  <strong>{event.name}</strong>
                  <br />
                  <span className="muted">
                    {event.ageGroup} · {event.region} · {event.location}
                  </span>
                </span>
                <span className="status">{event.isPublished ? "已上架" : "未上架"}</span>
              </div>
              <p className="muted">赛程 {event.matches.length} 场</p>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
