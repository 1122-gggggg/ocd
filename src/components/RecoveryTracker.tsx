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

  // 5-step guided Recovery Log inputs
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [trigger, setTrigger] = useState("");
  const [urge, setUrge] = useState("");
  const [compulsion, setCompulsion] = useState("");
  const [response, setResponse] = useState("");
  const [resisted, setResisted] = useState(true);
  const [returnedToActivity, setReturnedToActivity] = useState(true);
  const [toleratedUncertainty, setToleratedUncertainty] = useState(true);
  const [difficultyBefore, setDifficultyBefore] = useState<number>(7);
  const [difficultyAfter, setDifficultyAfter] = useState<number>(4);
  const [delayedMinutes, setDelayedMinutes] = useState<number>(5);

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
    if (!trigger.trim() || savingLog) return;

    setSavingLog(true);
    setLogError(null);
    setLogSuccess(false);

    try {
      const durationSeconds = delayedMinutes > 0 ? delayedMinutes * 60 : null;

      // Compose rich response summary that includes recovery dimensions
      const recoveryTags: string[] = [];
      if (resisted) recoveryTags.push("成功抵抗強迫");
      if (returnedToActivity) recoveryTags.push("重回當下生活");
      if (toleratedUncertainty) recoveryTags.push("接納耐受不確定");

      const fullResponse = [
        response.trim(),
        recoveryTags.length > 0 ? `【復原實踐：${recoveryTags.join("・")}】` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const res = await createRecoveryLog({
        goalId: selectedGoalId || undefined,
        situation: trigger.trim(),
        trigger: trigger.trim(),
        urge: urge.trim() || undefined,
        compulsion: compulsion.trim() || undefined,
        response: fullResponse || undefined,
        difficultyBefore,
        difficultyAfter,
        durationSeconds: durationSeconds || undefined,
        compulsionResisted: resisted,
      });

      if (!res.ok) {
        setLogError(res.message || "記錄失敗");
      } else {
        setLogSuccess(true);
        const newLog: RecoveryLogItem = {
          id: String(Date.now()),
          goalId: selectedGoalId || null,
          situation: trigger.trim(),
          trigger: trigger.trim(),
          urge: urge.trim() || null,
          compulsion: compulsion.trim() || null,
          response: fullResponse || null,
          difficulty: difficultyBefore,
          difficultyBefore,
          difficultyAfter,
          durationSeconds: durationSeconds || null,
          compulsionResisted: resisted,
          createdAt: new Date().toISOString(),
          goalTitle: goals.find((g) => g.id === selectedGoalId)?.title,
        };
        setLogs((prev) => [newLog, ...prev]);
        setTrigger("");
        setUrge("");
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

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekStart = (() => {
    const now = new Date();
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - mondayOffset);
    return monday;
  })();
  const activeWeekDays = new Set<number>(
    logs
      .map((l) => {
        const d = new Date(l.createdAt);
        if (Number.isNaN(d.getTime())) return -1;
        d.setHours(0, 0, 0, 0);
        return Math.round((d.getTime() - weekStart.getTime()) / 86400000);
      })
      .filter((diff) => diff >= 0 && diff < 7)
  );

  return (
    <div className="space-y-8">
      {/* 本週抵抗分佈：7 格點陣，有 log 即亮 */}
      <section className="card card-pad space-y-2" aria-label="本週抵抗分佈">
        <h2 className="text-sm font-bold text-fg">本週抵抗分佈</h2>
        <div className="flex gap-1.5">
          {weekLabels.map((label, idx) => {
            const active = activeWeekDays.has(idx);
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <span
                  title={label}
                  aria-label={`${label}${active ? "有紀錄" : "無紀錄"}`}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[0.7rem] font-semibold ${
                    active
                      ? "bg-accent text-white border-accent"
                      : "bg-surface-3 text-muted border-line"
                  }`}
                >
                  {label.slice(0, 1)}
                </span>
                <span className="text-[0.65rem] text-muted">{label}</span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted">不追求全勤，中斷也沒關係。</p>
      </section>
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

        <form onSubmit={handleAddGoal} className="space-y-2 pt-2">
          {goalError && <p className="text-xs text-danger">{goalError}</p>}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="目標名稱 (例：出門鎖門後不折返檢查、摸門把後正常吃飯)"
              className="input text-xs sm:text-sm flex-1"
              required
              maxLength={100}
            />
            <input
              type="text"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              placeholder="具體行動 (例：每天練習一次衝動衝浪 2 分鐘)"
              className="input text-xs sm:text-sm flex-1"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={savingGoal || !newGoalTitle.trim()}
              className="btn btn-primary btn-sm shrink-0"
            >
              {savingGoal ? "新增中…" : "新增目標"}
            </button>
          </div>
        </form>

        <div className="space-y-2 pt-2">
          {goals.length === 0 ? (
            <p className="text-xs text-muted">目前尚無進行中的復原目標。</p>
          ) : (
            goals.map((g) => (
              <div
                key={g.id}
                className={`card p-3 flex items-center justify-between gap-2 border ${
                  g.active
                    ? "bg-surface border-line"
                    : "bg-surface-2/60 border-line/40 opacity-75"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        g.active ? "text-fg" : "text-muted line-through"
                      }`}
                    >
                      {g.title}
                    </span>
                    <span
                      className={`text-[0.7rem] px-1.5 py-0.5 rounded-full font-medium ${
                        g.active
                          ? "bg-accent-soft text-accent"
                          : "bg-surface-3 text-muted"
                      }`}
                    >
                      {g.active ? "進行中" : "已達成 / 暫停"}
                    </span>
                  </div>
                  {g.target && (
                    <p className="text-xs text-muted">{g.target}</p>
                  )}
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

      {/* 2. Structured Recovery Flow V2 */}
      <section className="card card-pad space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-fg flex items-center gap-2">
              <span>📝 每日非強迫日記 (Exposure & Response Prevention Log)</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
              V2 五步奪回生活法
            </span>
          </div>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            復原的成功標準不是「焦慮有沒有下降」，而是「即使懷疑還在，你有沒有忍住強迫、耐受不確定並重回生活」。
          </p>
        </div>

        <form onSubmit={handleAddLog} className="space-y-4 pt-2">
          {logError && <p className="text-xs text-danger">{logError}</p>}
          {logSuccess && (
            <p className="text-xs text-accent font-medium">✨ 記錄成功！為每一次奪回生活的選擇感到驕傲！</p>
          )}

          {goals.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-fg mb-1">對應復原目標（選填）</label>
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

          {/* Step 1 */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-fg">
              1. 今天發生了什麼？（誘發情境 / 刺激） <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="例：出門鎖上門後走下樓梯、碰了外面的門把、腦中突然閃過一個傷害別人的畫面…"
              className="input text-xs sm:text-sm"
              required
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-fg">
              2. 我產生了什麼衝動？（大腦強迫警報）
            </label>
            <input
              type="text"
              value={urge}
              onChange={(e) => setUrge(e.target.value)}
              placeholder="例：大腦瘋狂叫囂「門沒鎖好會遭小偷！現在馬上回頭看五次拍照存證！」"
              className="input text-xs sm:text-sm"
            />
          </div>

          {/* Step 3 */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-fg">
              3. 我原本想做什麼強迫行為？（習慣性迴避或核對）
            </label>
            <input
              type="text"
              value={compulsion}
              onChange={(e) => setCompulsion(e.target.value)}
              placeholder="例：折返回家推拉門把 3 次、瘋狂 Google「這症狀會不會死」、逼問另一半我愛不愛他…"
              className="input text-xs sm:text-sm"
            />
          </div>

          {/* Step 4 */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-fg">
              4. 我做了什麼不同的選擇？（非強迫應對 / 衝浪練習）
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="例：啟動衝動衝浪練習，握著拳頭繼續走向公車站，允許心跳加速與不確定性存在，沒有回頭檢查。"
              rows={2}
              className="input text-xs sm:text-sm py-1.5 resize-none"
            />
          </div>

          {/* Step 5 */}
          <div className="space-y-2 p-3 bg-surface-2/60 rounded-xl border border-line">
            <span className="block text-xs font-semibold text-fg">
              5. 過了一段時間後怎樣？（復原成功指標評估）
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-surface p-2 rounded-lg border border-line">
                <input
                  type="checkbox"
                  checked={resisted}
                  onChange={(e) => setResisted(e.target.checked)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span className="font-medium">🛡️ 成功抵抗強迫行為</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-surface p-2 rounded-lg border border-line">
                <input
                  type="checkbox"
                  checked={returnedToActivity}
                  onChange={(e) => setReturnedToActivity(e.target.checked)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span className="font-medium">🌱 帶著焦慮重回生活</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-surface p-2 rounded-lg border border-line">
                <input
                  type="checkbox"
                  checked={toleratedUncertainty}
                  onChange={(e) => setToleratedUncertainty(e.target.checked)}
                  className="rounded border-line text-accent focus:ring-accent"
                />
                <span className="font-medium">🌊 耐受不確定性</span>
              </label>
            </div>

            {/* Slider comparison & delay time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[0.7rem] text-muted">
                  <span>剛觸發時困難度</span>
                  <span className="font-mono font-bold text-accent">{difficultyBefore} 分</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={difficultyBefore}
                  onChange={(e) => setDifficultyBefore(parseInt(e.target.value, 10))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[0.7rem] text-muted">
                  <span>耐受一段時間後感受</span>
                  <span className="font-mono font-bold text-accent">{difficultyAfter} 分</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={difficultyAfter}
                  onChange={(e) => setDifficultyAfter(parseInt(e.target.value, 10))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[0.7rem] text-muted">
                  <span>延遲或耐受時間</span>
                  <span className="font-mono font-bold text-accent">{delayedMinutes} 分鐘</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  step="1"
                  value={delayedMinutes}
                  onChange={(e) => setDelayedMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-accent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingLog || !trigger.trim()}
              className="btn btn-primary btn-sm px-5"
            >
              {savingLog ? "儲存中…" : "儲存今日復原日記"}
            </button>
          </div>
        </form>

        {/* History log entries */}
        <div className="space-y-3 pt-4 border-t border-line">
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
            歷史紀錄（共 {logs.length} 筆）
          </h3>
          {logs.length === 0 ? (
            <p className="text-xs text-muted">目前尚無日記，寫下你的第一筆吧。</p>
          ) : (
            logs.map((l) => (
              <div
                key={l.id}
                className="card p-3 bg-surface border border-line space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between text-muted border-b border-line/40 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-fg">
                      {l.goalTitle ? `🎯 ${l.goalTitle}` : "🌱 復原微步"}
                    </span>
                    {l.compulsionResisted && (
                      <span className="px-1.5 py-0.5 rounded-full bg-accent-soft text-accent text-[0.7rem] font-medium">
                        🛡️ 抵抗強迫成功
                      </span>
                    )}
                    {l.difficultyBefore && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-3 text-[0.7rem] text-muted font-mono">
                        難度 {l.difficultyBefore} → {l.difficultyAfter ?? l.difficulty ?? "?"} / 10
                      </span>
                    )}
                    {l.durationSeconds && (
                      <span className="px-1.5 py-0.5 rounded bg-surface-3 text-[0.7rem] text-muted font-mono">
                        ⏳ 耐受 {Math.round(l.durationSeconds / 60)} 分鐘
                      </span>
                    )}
                  </div>
                  <time className="text-[0.7rem]">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-muted block text-[0.7rem]">1. 觸發情境</span>
                    <p className="text-fg mt-0.5 font-medium">{l.trigger || l.situation}</p>
                  </div>
                  {l.urge && (
                    <div>
                      <span className="text-muted block text-[0.7rem]">2. 強迫衝動</span>
                      <p className="text-danger mt-0.5">{l.urge}</p>
                    </div>
                  )}
                  {l.compulsion && (
                    <div>
                      <span className="text-muted block text-[0.7rem]">3. 原想做的行為</span>
                      <p className="text-muted mt-0.5 line-through">{l.compulsion}</p>
                    </div>
                  )}
                  {l.response && (
                    <div className="sm:col-span-1">
                      <span className="text-muted block text-[0.7rem]">4. 我的不同選擇</span>
                      <p className="text-accent font-medium mt-0.5 whitespace-pre-wrap">{l.response}</p>
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
