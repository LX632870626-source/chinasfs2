import Link from "next/link";

export function PublicNav() {
  return (
    <header className="public-nav">
      <Link className="brand" href="/">
        中国足球未来之星
      </Link>
      <nav>
        <Link href="/players">未来之星</Link>
        <Link href="/events">赛程</Link>
        <Link href="/submit">提交资料</Link>
        <Link href="/admin">后台</Link>
      </nav>
    </header>
  );
}
