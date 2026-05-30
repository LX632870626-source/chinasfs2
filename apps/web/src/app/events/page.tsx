import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { prisma } from "@/lib/db";
import { serializePublicEvent } from "@/lib/serializers";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startsAt: "asc" }
  });

  return (
    <main>
      <PublicNav />
      <section className="page">
        <h1>青少年比赛日历</h1>
        <div className="table-list">
          {events.map(serializePublicEvent).map((event) => (
            <Link className="card row" href={`/events/${event.id}`} key={event.id}>
              <span>
                <strong>{event.name}</strong>
                <br />
                <span className="muted">
                  {event.ageGroup} · {event.region} · {event.location}
                </span>
              </span>
              <span>{new Date(event.startsAt).toLocaleDateString("zh-CN")}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
