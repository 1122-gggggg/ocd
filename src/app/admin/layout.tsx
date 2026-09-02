import { AdminNav } from "@/components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">管理後台</h1>
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
