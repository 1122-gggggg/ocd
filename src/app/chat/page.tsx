import { auth } from "@/auth";
import { getChatMessages } from "@/app/actions/chat";
import { ChatRoom } from "@/components/ChatRoom";
import { Breadcrumbs } from "@/components/ui";

export const metadata = {
  title: "互助陪伴大廳 | 強迫症互助坊",
  description:
    "強迫症病友即時互助陪伴空間。遵循「支持 ≠ 保證」原則，提供同理、陪伴與當下不求答案練習。",
};

export default async function ChatPage() {
  const session = (await auth()) as unknown as {
    user?: {
      id: string;
      nickname: string;
      memberType: string;
      role: string;
    };
  } | null;

  const messages = await getChatMessages("general", 50);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "互助陪伴大廳", href: "/chat" },
        ]}
      />

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-fg tracking-tight flex items-center gap-2">
          <span>💬 即時互助陪伴大廳</span>
        </h1>
        <p className="text-sm text-muted">
          「我懂你被腦袋逼著確認的感覺，你不是孤單一人。」這裡沒有批判，只有真誠的同行。
        </p>
      </div>

      <ChatRoom
        initialMessages={messages}
        user={
          session?.user
            ? {
                id: session.user.id,
                nickname: session.user.nickname,
                memberType: session.user.memberType,
              }
            : null
        }
      />

      <div className="card card-pad bg-surface-2/60 border border-line text-xs text-muted space-y-2">
        <h2 className="font-semibold text-fg text-sm flex items-center gap-1.5">
          <span>💡 陪伴守則：為什麼我們不說「放心，你一定沒事」？</span>
        </h2>
        <p className="leading-relaxed">
          國際強迫症基金會（IOCDF）指出，反覆詢問「我這樣會不會有事？」與他人給予的「你絕對沒事啦」保證（Reassurance），
          會短暫緩解焦慮，但長期會向大腦發出「這個懷疑真的很危險，必須透過確認來消除」的信號，進一步加劇強迫循環。
        </p>
        <p className="leading-relaxed">
          在這裡，我們練習用<strong>「我懂這種痛苦」</strong>、<strong>「我陪你耐受當下的不確定感」</strong>取代尋找完美答案。
        </p>
      </div>
    </div>
  );
}
