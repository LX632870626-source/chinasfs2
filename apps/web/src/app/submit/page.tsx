import { PublicNav } from "@/components/PublicNav";
import { SubmitForm } from "./SubmitForm";

export default function SubmitPage() {
  return (
    <main>
      <PublicNav />
      <section className="page">
        <h1>提交资料</h1>
        <p className="muted">提交内容不会直接公开，管理员审核后才会进入正式资料库。</p>
        <SubmitForm />
      </section>
    </main>
  );
}
