import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { canCreatePost } from "@/lib/permissions";
import { createPost } from "@/app/actions/posts";
import { PostForm } from "@/components/PostForm";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "發表新文" };

export default async function NewPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const board = await prisma.board.findUnique({ where: { slug } });
  if (!board || board.status !== "ACTIVE") notFound();

  const session = (await auth()) as unknown as {
    user?: { id: string; role: string; clinicianStatus: string };
  } | null;
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/b/${slug}/new`);
  }

  const can = canCreatePost(session.user, { status: board.status, slug: board.slug });
  if (!can) {
    return (
      <div className="container-narrow card card-pad text-center space-y-3">
        <p className="font-medium">你目前無法在「{board.name}」發文</p>
        <p className="text-sm text-muted">
          這個版區限定特定身分發文，例如需要通過臨床身分驗證。
        </p>
        <div className="flex justify-center gap-2 pt-1">
          <Link href={`/b/${slug}`} className="btn btn-secondary">
            返回版區
          </Link>
          <Link href="/clinician/apply" className="btn btn-ghost">
            臨床身分驗證
          </Link>
        </div>
      </div>
    );
  }

  const boundAction = createPost.bind(null, slug);

  return (
    <div className="space-y-5">
      <nav className="text-xs text-subtle" aria-label="麵包屑">
        <Link href="/" className="hover:text-accent">
          首頁
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={`/b/${slug}`} className="hover:text-accent">
          {board.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-muted">發表新文</span>
      </nav>

      <div className="card card-pad space-y-5">
        <header className="space-y-1">
          <div className="text-xs font-medium text-accent">{board.name}</div>
          <h1 className="text-2xl font-bold tracking-tight">發表新文</h1>
          <p className="text-sm text-muted">
            寫下你想分享的經驗。不確定怎麼開頭也沒關係，慢慢說就好。
          </p>
        </header>

        <PostForm
          boardSlug={slug}
          action={boundAction as unknown as (formData: FormData) => Promise<void>}
        />

        <p className="hint border-t border-line pt-3">
          小提醒：本站僅供經驗交流，不是醫療建議。求助資源 — 安心專線 1925（24 小時）｜{" "}
          <a
            href="https://www.iasp.info/suicidalthoughts/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            IASP
          </a>
        </p>
      </div>
    </div>
  );
}
