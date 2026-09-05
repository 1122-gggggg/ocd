"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, GROUP_LABELS, GROUP_ORDER } from "@/components/ui";

type BoardLink = { slug: string; name: string; group: string };

type HeaderUser = {
  nickname: string;
  isAdmin: boolean;
};

export function SiteHeader({
  boards,
  user,
  signOutAction,
}: {
  boards: BoardLink[];
  user: HeaderUser | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerPanelRef = useRef<HTMLDivElement | null>(null);
  const userButtonRef = useRef<HTMLButtonElement | null>(null);
  const groupButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Any navigation closes every transient surface.
  useEffect(() => {
    setOpenGroup(null);
    setDrawerOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenGroup(null);
        setDrawerOpen(false);
        setUserMenuOpen(false);
      }
    }
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  // The drawer covers the viewport; keep the page behind it from scrolling.
  // On open, move focus into the drawer panel and trap Tab inside it;
  // on close, restore focus to the element that had it before.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = drawerPanelRef.current;
    const firstLink = panel?.querySelector<HTMLElement>("a[href], button:not([disabled])");
    (firstLink ?? panel)?.focus({ preventScroll: true });
    function trapTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !drawerPanelRef.current) return;
      const items = Array.from(
        drawerPanelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        drawerPanelRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trapTab);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", trapTab);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [drawerOpen]);

  function focusFirstMenuItem(key: string) {
    menuRefs.current[key]
      ?.querySelector<HTMLElement>('[role="menuitem"]')
      ?.focus();
  }

  function closeGroupAndRefocus(key: string) {
    setOpenGroup(null);
    groupButtonRefs.current[key]?.focus();
  }

  const grouped = GROUP_ORDER.map((g) => ({
    key: g,
    label: GROUP_LABELS[g],
    items: boards.filter((b) => b.group === g),
  })).filter((g) => g.items.length > 0);

  const isActive = (slug: string) => pathname?.startsWith(`/b/${slug}`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div ref={navRef} className="container-page flex h-14 items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-expanded={drawerOpen}
          aria-controls="mobile-nav"
          aria-label={drawerOpen ? "關閉版區選單" : "開啟版區選單"}
          className="btn btn-ghost btn-sm md:hidden -ml-2"
        >
          <MenuIcon open={drawerOpen} />
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 font-bold text-accent text-[1.05rem] tracking-tight"
        >
          <LogoMark />
          <span className="hidden sm:inline">強迫症互助坊</span>
          <span className="sm:hidden">互助坊</span>
        </Link>

        {/* Desktop board menus */}
        <nav className="hidden md:flex items-center gap-1 ml-2" aria-label="版區">
          {grouped.map((g) => (
            <div key={g.key} className="relative">
              <button
                ref={(el) => {
                  groupButtonRefs.current[g.key] = el;
                }}
                type="button"
                id={`board-menu-button-${g.key}`}
                onClick={() => setOpenGroup((cur) => (cur === g.key ? null : g.key))}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (openGroup !== g.key) setOpenGroup(g.key);
                    requestAnimationFrame(() => focusFirstMenuItem(g.key));
                  } else if (e.key === "Escape") {
                    setOpenGroup(null);
                  }
                }}
                aria-expanded={openGroup === g.key}
                aria-haspopup="menu"
                aria-controls={`board-menu-${g.key}`}
                className={`btn btn-ghost btn-sm ${
                  openGroup === g.key ? "text-fg bg-surface-3" : ""
                }`}
              >
                {g.label}
                <Chevron open={openGroup === g.key} />
              </button>
              {openGroup === g.key && (
                <div
                  ref={(el) => {
                    menuRefs.current[g.key] = el;
                  }}
                  role="menu"
                  id={`board-menu-${g.key}`}
                  aria-labelledby={`board-menu-button-${g.key}`}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      closeGroupAndRefocus(g.key);
                    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const items = Array.from(
                        menuRefs.current[g.key]?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
                      );
                      const i = items.indexOf(document.activeElement as HTMLElement);
                      const next =
                        e.key === "ArrowDown"
                          ? items[(i + 1) % items.length]
                          : items[(i - 1 + items.length) % items.length];
                      next?.focus();
                    }
                  }}
                  className="absolute left-0 top-full mt-1 min-w-[13rem] card p-1.5 fade-in"
                  style={{ boxShadow: "var(--shadow-pop)" }}
                >
                  {g.items.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/b/${b.slug}`}
                      role="menuitem"
                      className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-surface-3 ${
                        isActive(b.slug) ? "text-accent font-medium bg-accent-soft" : "text-fg"
                      }`}
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/learn"
            className={`btn btn-ghost btn-sm ${
              pathname?.startsWith("/learn") ? "text-accent font-medium bg-accent-soft" : ""
            }`}
          >
            學習資源區
          </Link>
          <Link
            href="/self-help"
            className={`btn btn-ghost btn-sm ${
              pathname?.startsWith("/self-help") ? "text-accent font-medium bg-accent-soft" : ""
            }`}
          >
            自救專區
          </Link>
        </nav>
        <div className="flex-1" />

        {/* Account area */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                type="button"
                id="user-menu-button"
                onClick={() => setUserMenuOpen((v) => !v)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!userMenuOpen) setUserMenuOpen(true);
                    requestAnimationFrame(() => {
                      document.querySelector<HTMLElement>('#user-menu [role="menuitem"]')?.focus();
                    });
                  } else if (e.key === "Escape") {
                    setUserMenuOpen(false);
                  }
                }}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-controls="user-menu"
                className="btn btn-ghost btn-sm gap-2 max-w-[12rem]"
              >
                <Avatar name={user.nickname} size="sm" />
                <span className="hidden sm:inline name-clip-1 text-fg">{user.nickname}</span>
                <Chevron open={userMenuOpen} />
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  id="user-menu"
                  aria-labelledby="user-menu-button"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setUserMenuOpen(false);
                      userButtonRef.current?.focus();
                    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const items = Array.from(
                        document.querySelectorAll<HTMLElement>('#user-menu [role="menuitem"]'),
                      );
                      const i = items.indexOf(document.activeElement as HTMLElement);
                      const next =
                        e.key === "ArrowDown"
                          ? items[(i + 1) % items.length]
                          : items[(i - 1 + items.length) % items.length];
                      next?.focus();
                    }
                  }}
                  className="absolute right-0 top-full mt-1 min-w-[12rem] card p-1.5 fade-in"
                  style={{ boxShadow: "var(--shadow-pop)" }}
                >
                  <div className="px-3 py-2 border-b border-line mb-1">
                    <div className="text-xs text-subtle">已登入為</div>
                    <div className="text-sm font-medium name-clip">{user.nickname}</div>
                  </div>
                  <MenuLink href="/settings">帳號設定</MenuLink>
                  <MenuLink href="/boards/apply">申請開版</MenuLink>
                  <MenuLink href="/clinician/apply">臨床身分驗證</MenuLink>
                  {user.isAdmin && <MenuLink href="/admin">管理後台</MenuLink>}
                  <form action={signOutAction} className="mt-1 border-t border-line pt-1">
                    <button
                      type="submit"
                      role="menuitem"
                      className="w-full text-left rounded-md px-3 py-1.5 text-sm text-danger hover:bg-danger-soft transition-colors"
                    >
                      登出
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                登入
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                註冊
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="關閉選單"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 top-14 z-30 bg-black/30"
          />
          <div
            ref={drawerPanelRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="版區選單"
            tabIndex={-1}
            className="absolute inset-x-0 top-full z-40 max-h-[70vh] overflow-y-auto border-b border-line bg-surface shadow-lg fade-in"
          >
            <div className="container-page py-4 space-y-4">
              {grouped.map((g) => (
                <div key={g.key}>
                  <div className="text-xs font-semibold text-subtle mb-2">{g.label}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {g.items.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/b/${b.slug}`}
                        className={`rounded-lg border border-line px-3 py-2 text-sm transition-colors ${
                          isActive(b.slug)
                            ? "bg-accent-soft text-accent border-accent/40 font-medium"
                            : "bg-surface-2 text-fg"
                        }`}
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <div className="border-t border-line pt-3 flex flex-wrap gap-2">
                <Link href="/learn" className="btn btn-secondary btn-sm">
                  學習資源區
                </Link>
                <Link href="/self-help" className="btn btn-secondary btn-sm">
                  自救專區
                </Link>
                <Link href="/boards/apply" className="btn btn-secondary btn-sm">
                  申請開版
                </Link>
                <Link href="/disclaimer" className="btn btn-secondary btn-sm">
                  免責聲明
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="block rounded-md px-3 py-1.5 text-sm text-fg hover:bg-surface-3 transition-colors"
    >
      {children}
    </Link>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className="opacity-60 transition-transform"
      style={{ transform: open ? "rotate(180deg)" : undefined }}
    >
      <path d="M1 3.5 5 7l4-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      {open ? (
        <path d="M4 4l10 10M14 4L4 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M2.5 5h13M2.5 9h13M2.5 13h13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12" />
      <path
        d="M8 13.5c1.2 1.6 2.5 2.4 4 2.4s2.8-.8 4-2.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="9" cy="9.6" r="1.15" fill="currentColor" />
      <circle cx="15" cy="9.6" r="1.15" fill="currentColor" />
    </svg>
  );
}
