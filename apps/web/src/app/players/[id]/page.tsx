import { notFound } from "next/navigation";
import { PublicNav } from "@/components/PublicNav";
import { prisma } from "@/lib/db";
import { parseFeaturedPlayerIds, serializePublicMatch, serializePublicPlayer } from "@/lib/serializers";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const playerRecord = await prisma.player.findFirst({ where: { id, isPublished: true } });
  if (!playerRecord) {
    notFound();
  }

  const player = serializePublicPlayer(playerRecord);
  const matches = await prisma.match.findMany({
    where: { event: { isPublished: true } },
    orderBy: { startsAt: "desc" }
  });
  const relatedMatches = matches
    .filter((match) => parseFeaturedPlayerIds(match.featuredPlayerIdsJson).includes(player.id))
    .map(serializePublicMatch);

  return (
    <main>
      <PublicNav />
      <section className="page">
        <div className="panel">
          <h1>{player.name}</h1>
          <p className="muted">
            {player.ageGroup} · {player.position} · {player.teamName} · {player.region}
          </p>
          <p>{player.bio}</p>
          <p>{player.traits.join(" / ")}</p>
          {player.publicVideoUrl ? (
            <p>
              <a href={player.publicVideoUrl} target="_blank" rel="noreferrer">
                公开视频链接
              </a>
            </p>
          ) : null}
        </div>
        <div className="section">
          <h2>重要参赛记录</h2>
          <div className="table-list">
            {relatedMatches.map((match) => (
              <div className="card" key={match.id}>
                <strong>
                  {match.homeTeam} vs {match.awayTeam}
                </strong>
                <p className="muted">
                  {new Date(match.startsAt).toLocaleString("zh-CN")} · {match.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
