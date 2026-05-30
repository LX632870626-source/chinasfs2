import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { prisma } from "@/lib/db";
import { serializePublicPlayer } from "@/lib/serializers";

type PageProps = {
  searchParams: Promise<{ search?: string; position?: string; region?: string }>;
};

export default async function PlayersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const position = params.position?.trim() ?? "";
  const region = params.region?.trim() ?? "";
  const players = await prisma.player.findMany({
    where: {
      isPublished: true,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      ...(position ? { position } : {}),
      ...(region ? { region } : {})
    },
    orderBy: [{ isFeatured: "desc" }, { featureOrder: "asc" }, { updatedAt: "desc" }]
  });

  return (
    <main>
      <PublicNav />
      <section className="page">
        <h1>未来之星</h1>
        <form className="toolbar">
          <label className="field">
            搜索
            <input name="search" defaultValue={search} placeholder="球员姓名" />
          </label>
          <label className="field">
            位置
            <input name="position" defaultValue={position} placeholder="中场 / 前锋" />
          </label>
          <label className="field">
            地区
            <input name="region" defaultValue={region} placeholder="上海" />
          </label>
          <button className="button" type="submit">
            筛选
          </button>
        </form>
        <div className="grid section">
          {players.map(serializePublicPlayer).map((player) => (
            <Link className="card" href={`/players/${player.id}`} key={player.id}>
              <h2>{player.name}</h2>
              <p className="muted">
                {player.ageGroup} · {player.position} · {player.region}
              </p>
              <p>{player.traits.join(" / ")}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
