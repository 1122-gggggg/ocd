"use client";

import { useState } from "react";
import {
  RecoveryGoalItem,
  RecoveryLogItem,
  createRecoveryGoal,
  toggleRecoveryGoal,
  createRecoveryLog,
} from "@/app/actions/recovery";

export function RecoveryTracker({
  initialGoals,
  initialLogs,
}: {
  initialGoals: RecoveryGoalItem[];
  initialLogs: RecoveryLogItem[];
}) {
  const [goals, setGoals] = useState<RecoveryGoalItem[]>(initialGoals);
  const [logs, setLogs] = useState<RecoveryLogItem[]>(initialLogs);

  // Goal modal/input
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  // Log inputs
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [situation, setSituation] = useState("");
  const [compulsion, setCompulsion] = useState("");
  const [response, setResponse] = useState("");
  const [difficulty, setDifficulty] = useState<number>(5);
  const [savingLog, setSavingLog] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [logSuccess, setLogSuccess] = useState(false);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || savingGoal) return;

    setSavingGoal(true);
    setGoalError(null);

    try {
      const res = await createRecoveryGoal(newGoalTitle, newGoalTarget);
      if (!res.ok) {
        setGoalError(res.message || "建立目標失敗");
      } else if (res.goal) {
        setGoals((prev) => [res.goal!, ...prev]);
        setNewGoalTitle("");
        setNewGoalTarget("");
      }
    } catch {
      setGoalError("連線異常，請稍候重試");
    } finally {
      setSavingGoal(false);
    }
  };

  const handleToggleGoal = async (id: string, active: boolean) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, active: !active } : g))
    );
    await toggleRecoveryGoal(id, !active);
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situation.trim() || savingLog) return;

    setSavingLog(true);
    setLogError(null);
    setLogSuccess(false);

    try {
      const res = await createRecoveryLog({
        goalId: selectedGoalId || undefined,
        situation,
        compulsion,
        response,
        difficulty,
      });

      if (!res.ok) {
        setLogError(res.message || "記錄失敗");
      } else {
        setLogSuccess(true);
        const newLog: RecoveryLogItem = {
          id: String(Date.now()),
          goalId: selectedGoalId || null,
          situation,
          compulsion: compulsion || null,
          response: response || null,
          difficulty,
          createdAt: new Date().toISOString(),
          goalTitle: goals.find((g) => g.id === selectedGoalId)?.title,
        };
        setLogs((prev) => [newLog, ...prev]);
        setSituation("");
        setCompulsion("");
        setResponse("");
        setTimeout(() => setLogSuccess(false), 3000);
      }
    } catch {
      setLogError("連線異常，請稍候重試");
    } finally {
      setSavingLog(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Recovery Goals */}
      <section className="card card-pad space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-lg font-bold text-fg flex items-center gap-2">
              <span>🎯 我的復原目標 (Recovery Goals)</span>
            </h2>
            <p className="text-xs text-muted">
              設定專注於「暴露不反應」或「奪回生活」的具體目標，而不是追求 100% 焦慮歸零。
            </p>
          </div>
        </div>

        {/* Add goal form */}
        <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {goalError && <p className="col-span-full text-xs text-danger">{goalError}</p>}
          <input
            type="text"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="目標名稱（例：出門只確認一次瓦斯）"
            className="input text-xs sm:text-sm"
            disabled={savingGoal}
          />
          <input
            type="text"
            value={newGoalTarget}
            onChange={(e) => setNewGoalTarget(e.target.value)}
            placeholder="期望成果（例：不再錄影與折返）"
            className="input text-xs sm:text-sm"
            disabled={savingGoal}
          />
          <button
            type="submit"
            disabled={savingGoal || !newGoalTitle.trim()}
            className="btn btn-primary btn-sm"
          >
            {savingGoal ? "建立中…" : "新增復原目標"}
          </button>
        </form>

        {/* Goal list */}
        <div className="space-y-2 pt-2">
          {goals.length === 0 ? (
            <p className="text-xs text-muted py-2">尚未建立目標。立下第一個小小的生活奪回目標吧！</p>
          ) : (
            goals.map((g) => (
              <div
                key={g.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  g.active
                    ? "bg-surface border-line"
                    : "bg-surface-2/60 border-line/40 text-muted opacity-60"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${g.active ? "text-fg" : "line-through"}`}>
                      {g.title}
                    </span>
                    <span className="text-[0.7rem] px-2 py-0.5 rounded-full bg-surface-3">
                      {g.active ? "進行中" : "已達成"}
                    </span>
                  </div>
                  {g.target && <p className="text-xs text-muted">{g.target}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleGoal(g.id, g.active)}
                  className={`btn btn-xs ${g.active ? "btn-secondary" : "btn-ghost"}`}
                >
                  {g.active ? "標記完成" : "重新啟用"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. Daily Non-Compulsion Check-in */}
      <section className="card card-pad space-y-4">
        <div>
          <h2 className="text-lg font-bold text-fg flex items-center gap-2">
            <span>📝 每日非強迫日記 (Daily Exposure Log)</span>
          </h2>
          <p className="text-xs text-muted">
            重點不是「今天焦慮幾分」，而是「今天我做了什麼，即使焦慮存在，我仍然繼續生活？」
          </p>
        </div>

        <form onSubmit={handleAddLog} className="space-y-3">
          {logError && <p className="text-xs text-danger">{logError}</p>}
          {logSuccess && (
            <p className="text-xs text-accent font-medium">✨ 記錄成功！為你的堅持感到驕傲！</p>
          )}

          {goals.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-fg mb-1">對應目標（選填）</label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="input text-xs sm:text-sm py-1.5"
              >
                <option value="">-- 無特定目標 / 日常隨記 --</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-fg mb-1">
              1. 今天 OCD 幫我製造了什麼情境或懷疑？ <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="例：出門鎖上門後，腦袋瘋狂大叫「剛才門一定沒鎖好，房子會遭小偷」"
              className="input text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-fg mb-1">
              2. 當時腦袋逼迫我想做的「強迫行為」是什麼？
            </label>
            <input
              type="text"
              value={compulsion}
              onChange={(e) => setCompulsion(e.target.value)}
              placeholder="例：想要立刻折返回去推拉門把 5 次，並拍照存證"
              className="input text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-fg mb-1">
              3. 即使焦慮存在，我最後做了什麼回應？
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="例：我啟動了 2 分鐘衝浪計時，握著拳頭走到公車站，允許心跳加速，沒有回頭確認。"
              rows={2}
              className="input text-xs sm:text-sm py-1.5 resize-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-fg shrink-0">
                面對焦慮的挑戰難度（1-10分）：
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={difficulty}
                  onChange={(e) => setDifficulty(parseInt(e.target.value, 10))}
                  className="accent-accent"
                />
                <span className="font-mono font-bold text-xs text-accent px-2 py-0.5 rounded bg-accent-soft">
                  {difficulty} 分
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingLog || !situation.trim()}
              className="btn btn-primary btn-sm"
            >
              {savingLog ? "儲存中…" : "儲存今日日記"}
            </button>
          </div>
        </form>

        {/* History log entries */}
        <div className="space-y-3 pt-4 border-t border-line">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
            歷史打卡紀錄（共 {logs.length} 筆）
          </h3>
          {logs.length === 0 ? (
            <p className="text-xs text-muted">目前尚無日記，寫下你的第一筆吧。</p>
          ) : (
            logs.map((l) => (
              <div
                key={l.id}
                className="card p-3 bg-surface border border-line space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-muted border-b border-line/40 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-fg">
                      {l.goalTitle ? `🎯 ${l.goalTitle}` : "🌱 日常面對"}
                    </span>
                    {l.difficulty && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-3 text-[0.7rem] text-accent font-medium">
                        難度 {l.difficulty}/10
                      </span>
                    )}
                  </div>
                  <time className="text-[0.7rem]">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted block text-[0.7rem]">觸發懷疑</span>
                    <p className="text-fg mt-0.5">{l.situation}</p>
                  </div>
                  {l.compulsion && (
                    <div>
                      <span className="text-muted block text-[0.7rem]">強迫衝動</span>
                      <p className="text-danger mt-0.5">{l.compulsion}</p>
                    </div>
                  )}
                  {l.response && (
                    <div>
                      <span className="text-muted block text-[0.7rem]">我的應對 (奪回生活)</span>
                      <p className="text-accent font-medium mt-0.5">{l.response}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
