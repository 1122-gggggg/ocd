import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <nav className="flex gap-4 text-sm border-b pb-3">
        <Link href="/admin" className="underline">
          總覽
        </Link>
        <Link href="/admin/boards" className="underline">
          版區說明
        </Link>
        <Link href="/admin/applications" className="underline">
          開版申請
        </Link>
        <Link href="/admin/clinicians" className="underline">
          臨床申請
        </Link>
        <Link href="/admin/reports" className="underline">
          舉報
        </Link>
      </nav>
      {children}
    </div>
  );
}
