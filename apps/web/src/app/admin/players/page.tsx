import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/db";
import { parseTraits } from "@/lib/serializers";

export default async function AdminPlayersPage() {
  const players = await prisma.player.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <AdminShell>
      <section>
        <h1>球员管理</h1>
        <div className="table-list">
          {players.map((player) => (
            <article className="card row" key={player.id}>
              <span>
                <strong>{player.name}</strong>
                <br />
                <span className="muted">
                  {player.ageGroup} · {player.position} · {player.teamName} · {parseTraits(player.traitsJson).join(" / ")}
                </span>
              </span>
              <span className="status">{player.isPublished ? "已上架" : "未上架"}</span>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
