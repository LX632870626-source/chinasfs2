import { useEffect, useState } from "react";
import { adminGet, adminPatch } from "./api";

type Player = {
  id: string;
  name: string;
  ageGroup: string;
  position: string;
  teamName?: string;
  region?: string;
  isPublished: boolean;
  isFeatured: boolean;
};

type EventItem = {
  id: string;
  name: string;
  ageGroup: string;
  region: string;
  location?: string;
  startsAt: string;
  isPublished: boolean;
};

type SubmissionStatus = "PENDING" | "ADOPTED" | "REJECTED";

type Submission = {
  id: string;
  type: string;
  contactName: string;
  contactPhone: string;
  content: string;
  status: SubmissionStatus;
  createdAt?: string;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function statusLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    PENDING: "待审核",
    ADOPTED: "已采纳",
    REJECTED: "已拒绝"
  };

  return labels[status];
}

export function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  async function load() {
    setError(null);
    const [playerData, eventData, submissionData] = await Promise.all([
      adminGet<{ players: Player[] }>("/players"),
      adminGet<{ events: EventItem[] }>("/events"),
      adminGet<{ submissions: Submission[] }>("/submissions")
    ]);

    setPlayers(playerData.players);
    setEvents(eventData.events);
    setSubmissions(submissionData.submissions);
  }

  useEffect(() => {
    void load()
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : "后台数据加载失败");
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function reviewSubmission(id: string, status: "ADOPTED" | "REJECTED") {
    setReviewingId(id);
    setError(null);

    try {
      await adminPatch(`/submissions/${id}`, { status });
      await load();
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "提交审核失败");
    } finally {
      setReviewingId(null);
    }
  }

  async function refresh() {
    setIsLoading(true);

    try {
      await load();
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "后台数据刷新失败");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="layout">
      <header className="topbar">
        <div>
          <h1>中国足球未来之星后台</h1>
          <p>轻量运营台</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void refresh()}>
          刷新
        </button>
      </header>

      {error ? <div className="notice">操作提示：{error}</div> : null}
      {isLoading ? <div className="notice">正在加载后台数据...</div> : null}

      <section className="grid" aria-label="后台管理面板">
        <div className="panel">
          <div className="panel-heading">
            <h2>球员管理</h2>
            <span>{players.length} 人</span>
          </div>
          {players.length === 0 ? <p className="empty">暂无球员数据</p> : null}
          {players.map((player) => (
            <article className="row" key={player.id}>
              <strong>{player.name}</strong>
              <span>
                {player.ageGroup} / {player.position}
                {player.teamName ? ` / ${player.teamName}` : ""}
              </span>
              <span>
                {player.isPublished ? "已上架" : "未上架"} / {player.isFeatured ? "首页推荐" : "普通"}
              </span>
            </article>
          ))}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>赛事管理</h2>
            <span>{events.length} 场</span>
          </div>
          {events.length === 0 ? <p className="empty">暂无赛事数据</p> : null}
          {events.map((event) => (
            <article className="row" key={event.id}>
              <strong>{event.name}</strong>
              <span>
                {event.ageGroup} / {event.region}
                {event.location ? ` / ${event.location}` : ""}
              </span>
              <span>
                {formatDateTime(event.startsAt)} / {event.isPublished ? "已发布" : "未发布"}
              </span>
            </article>
          ))}
        </div>

        <div className="panel wide">
          <div className="panel-heading">
            <h2>提交审核</h2>
            <span>{submissions.length} 条</span>
          </div>
          {submissions.length === 0 ? <p className="empty">暂无待处理提交</p> : null}
          {submissions.map((submission) => (
            <article className="submission" key={submission.id}>
              <div>
                <div className="submission-title">
                  <strong>{submission.type}</strong>
                  <span className={`badge badge-${submission.status.toLowerCase()}`}>
                    {statusLabel(submission.status)}
                  </span>
                </div>
                <p>{submission.content}</p>
                <span>
                  {submission.contactName} / {submission.contactPhone}
                  {submission.createdAt ? ` / ${formatDateTime(submission.createdAt)}` : ""}
                </span>
              </div>
              <div className="actions">
                <button
                  type="button"
                  disabled={reviewingId === submission.id}
                  onClick={() => reviewSubmission(submission.id, "ADOPTED")}
                >
                  采纳
                </button>
                <button
                  className="danger-button"
                  type="button"
                  disabled={reviewingId === submission.id}
                  onClick={() => reviewSubmission(submission.id, "REJECTED")}
                >
                  拒绝
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
