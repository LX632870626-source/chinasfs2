import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="page">
      <h1>管理员登录</h1>
      <p className="muted">登录后可以维护球员、赛事和提交审核。</p>
      <LoginForm />
    </main>
  );
}
