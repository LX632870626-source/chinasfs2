"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage("登录失败，请检查账号和密码。");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="panel" onSubmit={login}>
      <label className="field">
        管理员账号
        <input value={username} onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label className="field">
        密码
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
      </label>
      <div className="toolbar">
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "登录中" : "登录"}
        </button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
    </form>
  );
}
