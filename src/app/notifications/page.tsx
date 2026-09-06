import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getNotifications, markAllRead } from "@/app/actions/notifications";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { EmptyState } from "@/components/ui";
import { formatDateTime, formatRelative } from "@/lib/format";

export const metadata: Metadata = { title: "通知" };

const KIND_LABEL: Record<string, string> = {
  REPLY: "新回覆",
  SOLVED: "問題已解決",
  HELPFUL: "收到有幫助標記",
  MENTION: "有人提及你",
  CLINICIAN_APPROVED: "臨床身分已通過驗證",
  CLINICIAN_REJECTED: "臨床身分審核結果",
  REPORT_RESOLVED: "舉報處理結果",
};

type NotificationRow = {
  id: string;
  kind: string;
  postId: string | null;
  replyId: string | null;
  readAt: Date | null;
  createdAt: Date;
  post?: { id: string; title: string; board: { slug: string } | null } | null;
};

export default async function NotificationsPage() {
  const session = (await auth()) as unknown as { user?: { id: string } } | null;
  if (!session?.user?.id) redirect("/login?callbackUrl=/notifications");

  const items = (await getNotifications()) as unknown as NotificationRow[];
  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="section-title">
            通知
            <span className="text-xs font-normal text-subtle">
              {items.length} 則{unreadCount > 0 && `（${unreadCount} 則未讀）`}
            </span>
          </h2>
          {unreadCount > 0 && (
            <form action={markAllRead}>
              <ConfirmSubmitButton
                confirmMessage="確定要將全部通知標為已讀嗎？"
                className="btn btn-secondary btn-sm"
              >
                全部標為已讀
              </ConfirmSubmitButton>
            </form>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyState title="沒有通知" description="有人回覆你的文章或標記有幫助時，會顯示在這裡。" />
        ) : (
          <ul className="space-y-2">
            {items.map((n) => {
              const unread = !n.readAt;
              const boardSlug = n.post?.board?.slug;
              const href =
                n.postId && boardSlug ? `/b/${boardSlug}/p/${n.postId}` : null;
              const title = n.post?.title ?? "（文章已刪除或無法顯示）";
              return (
                <li
                  key={n.id}
                  className="card p-3 flex items-start gap-2 text-sm"
                >
                  <span
                    aria-label={unread ? "未讀" : "已讀"}
                    title={unread ? "未讀" : "已讀"}
                    className={
                      unread
                        ? "mt-1.5 inline-block size-2 shrink-0 rounded-full bg-blue-500"
                        : "mt-1.5 inline-block size-2 shrink-0 rounded-full bg-transparent border border-line"
                    }
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={unread ? "badge badge-accent" : "badge"}>
                        {unread ? "未讀" : "已讀"}
                      </span>
                      <span className="text-xs text-subtle">
                        {KIND_LABEL[n.kind] ?? n.kind}
                      </span>
                      <span
                        className="text-xs text-subtle"
                        title={formatDateTime(n.createdAt)}
                      >
                        {formatRelative(n.createdAt)}
                      </span>
                    </div>
                    {href ? (
                      <Link
                        href={href}
                        className="block font-medium name-clip hover:underline"
                      >
                        {title}
                      </Link>
                    ) : (
                      <span className="block text-muted name-clip">{title}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
