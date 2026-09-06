"use client";

import { useState } from "react";
import { SupportPreferenceItem, updateSupportPreference } from "@/app/actions/preferences";
import { COMMON_TOPICS } from "@/lib/preference-topics";

export function SupportPreferenceForm({
  initialPreference,
}: {
  initialPreference: SupportPreferenceItem;
}) {
  const [prefMode, setPrefMode] = useState(
    initialPreference.preferredSupportMode || "EMPATHY"
  );
  const [hideSensitive, setHideSensitive] = useState(
    initialPreference.hideSensitiveTopics || false
  );
  const [hiddenTopics, setHiddenTopics] = useState<string[]>(
    initialPreference.preferredTopics || []
  );
  const [allowMatching, setAllowMatching] = useState(
    initialPreference.allowPeerMatching ?? true
  );
  const [showPrompts, setShowPrompts] = useState(
    initialPreference.showRecoveryPrompts ?? true
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setHiddenTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((t) => t !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const fd = new FormData();
    fd.set("preferredSupportMode", prefMode);
    if (hideSensitive) fd.set("hideSensitiveTopics", "1");
    if (allowMatching) fd.set("allowPeerMatching", "1");
    if (showPrompts) fd.set("showRecoveryPrompts", "1");

    for (const t of hiddenTopics) {
      fd.append("hiddenTopics", t);
    }

    try {
      const res = await updateSupportPreference(fd);
      if (res.ok) {
        setMessage("✨ 偏好設定已成功更新！");
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(res.message || "更新失敗");
      }
    } catch {
      setMessage("連線異常，請稍候再試");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="p-2.5 rounded-lg bg-accent-soft text-accent text-xs font-medium">
          {message}
        </div>
      )}

      {/* 1. 我不想看到哪些主題？ */}
      <div className="space-y-2">
        <label className="block font-semibold text-xs text-fg">
          🛡️ 我不想看到哪些主題？（觸發防護過濾）
        </label>
        <p className="text-[0.75rem] text-muted leading-relaxed">
          勾選容易引發你強烈焦慮或強迫循環的主題，平台會為你弱化或折疊相關內容。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {COMMON_TOPICS.map((topic) => {
            const isSelected = hiddenTopics.includes(topic.id);
            return (
              <label
                key={topic.id}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                  isSelected
                    ? "bg-warning-soft/60 border-warning text-fg font-medium"
                    : "bg-surface border-line text-muted hover:border-line-strong"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTopic(topic.id)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span>{topic.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. 偏好支持模式 */}
      <div className="space-y-2 pt-2 border-t border-line/50">
        <label className="block font-semibold text-xs text-fg">
          💬 我的預設支持模式
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: "EMPATHY", label: "我只想被理解", desc: "純抒發，不給答案" },
            { id: "SHARE_EXPERIENCE", label: "分享經歷", desc: "日常進展微步" },
            { id: "FACING_OCD", label: "面對強迫中", desc: "抗壓陪伴" },
            { id: "LOOKING_FOR_EXPERIENCE", label: "尋找經驗", desc: "參考康復案例" },
          ].map((m) => (
            <label
              key={m.id}
              className={`p-2 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-colors ${
                prefMode === m.id
                  ? "bg-accent-soft border-accent text-accent font-medium"
                  : "bg-surface border-line text-muted hover:border-line-strong"
              }`}
            >
              <input
                type="radio"
                name="prefMode"
                value={m.id}
                checked={prefMode === m.id}
                onChange={(e) => setPrefMode(e.target.value as typeof prefMode)}
                className="sr-only"
              />
              <span className="font-semibold">{m.label}</span>
              <span className="text-[0.65rem] mt-0.5">{m.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Toggles */}
      <div className="space-y-2 pt-2 border-t border-line/50 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideSensitive}
            onChange={(e) => setHideSensitive(e.target.checked)}
            className="rounded border-line text-accent focus:ring-accent"
          />
          <span>主動折疊社群高敏感或危機字詞貼文</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPrompts}
            onChange={(e) => setShowPrompts(e.target.checked)}
            className="rounded border-line text-accent focus:ring-accent"
          />
          <span>在首頁與發文時提示「非強迫日記」與「衝動衝浪練習」</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allowMatching}
            onChange={(e) => setAllowMatching(e.target.checked)}
            className="rounded border-line text-accent focus:ring-accent"
          />
          <span>允許在互助大廳與類似症狀經歷的病友相互看見</span>
        </label>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-sm px-4"
        >
          {saving ? "儲存中…" : "儲存偏好設定"}
        </button>
      </div>
    </form>
  );
}
