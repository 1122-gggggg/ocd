import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-narrow card card-pad text-center space-y-3 py-12">
      <div className="text-4xl font-bold text-accent">404</div>
      <p className="font-medium">找不到這個頁面</p>
      <p className="text-sm text-muted">
        這篇文章或版區可能已被移除，或者網址打錯了。
      </p>
      <div className="flex justify-center gap-2 pt-2">
        <Link href="/" className="btn btn-primary">
          回到首頁
        </Link>
        <Link href="/disclaimer" className="btn btn-ghost">
          求助資源
        </Link>
      </div>
    </div>
  );
}
