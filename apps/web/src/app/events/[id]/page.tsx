import { notFound } from "next/navigation";
import { PublicNav } from "@/components/PublicNav";
import { prisma } from "@/lib/db";
import { serializePublicEvent, serializePublicMatch } from "@/lib/serializers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const eventRecord = await prisma.event.findFirst({
    where: { id, isPublished: true },
    include: { matches: { orderBy: { startsAt: "asc" } } }
  });
  if (!eventRecord) {
    notFound();
  }

  const event = serializePublicEvent(eventRecord);
  const matches = eventRecord.matches.map(serializePublicMatch);

  return (
    <main>
      <PublicNav />
      <section className="page">
        <div className="panel">
          <h1>{event.name}</h1>
          <p className="muted">
            {event.ageGroup} · {event.region} · {event.location}
          </p>
          <p>{event.summary}</p>
          {event.officialUrl ? (
            <p>
              <a href={event.officialUrl} target="_blank" rel="noreferrer">
                官方链接
              </a>
            </p>
          ) : null}
        </div>
        <div className="section">
          <h2>赛程</h2>
          <div className="table-list">
            {matches.map((match) => (
              <div className="card row" key={match.id}>
                <span>
                  <strong>
                    {match.homeTeam} vs {match.awayTeam}
                  </strong>
                  <br />
                  <span className="muted">{match.status}</span>
                </span>
                <span>{new Date(match.startsAt).toLocaleString("zh-CN")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
