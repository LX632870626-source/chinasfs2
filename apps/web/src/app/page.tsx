import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { prisma } from "@/lib/db";
import { serializePublicEvent, serializePublicPlayer } from "@/lib/serializers";

export default async function HomePage() {
  const [players, events] = await Promise.all([
    prisma.player.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: [{ featureOrder: "asc" }, { updatedAt: "desc" }],
      take: 6
    }),
    prisma.event.findMany({
      where: { isPublished: true, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 4
    })
  ]);
  const featuredPlayers = players.map(serializePublicPlayer);
  const upcomingEvents = events.map(serializePublicEvent);

  return (
    <main>
      <PublicNav />
      <section className="hero">
        <h1>中国足球未来之星</h1>
        <p>发现小球员，追踪青少年赛程，记录中国足球的下一批名字。</p>
        <div>
          <Link className="button" href="/players">
            查看未来之星
          </Link>
        </div>
      </section>
      <section className="page">
        <div className="section">
          <h2>本周未来之星</h2>
          <div className="grid">
            {featuredPlayers.map((player) => (
              <Link className="card" href={`/players/${player.id}`} key={player.id}>
                <h3>{player.name}</h3>
                <p className="muted">
                  {player.ageGroup} · {player.position} · {player.teamName}
                </p>
                <p>{player.traits.join(" / ")}</p>
              </Link>
            ))}
          </div>
          <p>
            <Link href="/players">查看更多球员</Link>
          </p>
        </div>
        <div className="section">
          <h2>即将开赛</h2>
          <div className="grid">
            {upcomingEvents.map((event) => (
              <Link className="card" href={`/events/${event.id}`} key={event.id}>
                <h3>{event.name}</h3>
                <p className="muted">
                  {event.ageGroup} · {event.region} · {event.location}
                </p>
                <p>{new Date(event.startsAt).toLocaleString("zh-CN")}</p>
              </Link>
            ))}
          </div>
          <p>
            <Link href="/events">查看更多赛程</Link>
          </p>
        </div>
        <div className="section panel">
          <h2>有球员或赛事线索？</h2>
          <p className="muted">家长、教练和球迷都可以提交资料，审核后再公开展示。</p>
          <Link className="button" href="/submit">
            提交资料
          </Link>
        </div>
      </section>
    </main>
  );
}
