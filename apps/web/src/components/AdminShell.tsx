import type { ReactNode } from "react";
import { AdminNav } from "@/components/AdminNav";
import { requireAdminPage } from "@/lib/auth";

export async function AdminShell({ children }: { children: ReactNode }) {
  await requireAdminPage();

  return (
    <div className="admin-shell">
      <AdminNav />
      <main className="admin-main">{children}</main>
    </div>
  );
}
