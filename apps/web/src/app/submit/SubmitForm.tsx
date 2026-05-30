"use client";

import { useState } from "react";

export function SubmitForm() {
  const [type, setType] = useState("PLAYER");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedPhone = contactPhone.trim();
    const trimmedContent = content.trim();

    if (!trimmedName) {
      setMessage("请填写联系人。");
      return;
    }
    if (trimmedPhone.length < 5) {
      setMessage("请填写有效联系方式。");
      return;
    }
    if (trimmedContent.length < 10) {
      setMessage("请至少填写 10 个字的线索说明。");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    const response = await fetch("/api/public/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type,
        contactName: trimmedName,
        contactPhone: trimmedPhone,
        content: trimmedContent
      })
    });
    setIsSubmitting(false);

    if (!response.ok) {
      setMessage("提交失败，请检查内容后重试。");
      return;
    }

    setContactName("");
    setContactPhone("");
    setContent("");
    setMessage("已提交审核，我们会先核实资料再公开展示。");
  }

  return (
    <form className="panel" onSubmit={submit}>
      <label className="field">
        提交类型
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="PLAYER">球员线索</option>
          <option value="EVENT">赛事线索</option>
        </select>
      </label>
      <label className="field">
        联系人
        <input value={contactName} onChange={(event) => setContactName(event.target.value)} />
      </label>
      <label className="field">
        联系方式
        <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
      </label>
      <label className="field">
        线索说明
        <textarea rows={6} value={content} onChange={(event) => setContent(event.target.value)} />
      </label>
      <div className="toolbar">
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "提交中" : "提交审核"}
        </button>
        {message ? <span className="muted">{message}</span> : null}
      </div>
    </form>
  );
}
