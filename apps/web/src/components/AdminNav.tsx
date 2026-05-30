import Link from "next/link";

export function AdminNav() {
  return (
    <aside className="admin-nav">
      <Link className="brand" href="/admin">
        未来之星后台
      </Link>
      <nav>
        <Link href="/admin/players">球员管理</Link>
        <Link href="/admin/events">赛事管理</Link>
        <Link href="/admin/submissions">提交审核</Link>
      </nav>
      <form action="/api/admin/logout" method="post">
        <button className="button secondary" type="submit">
          退出
        </button>
      </form>
    </aside>
  );
}
