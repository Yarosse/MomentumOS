"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildCOOContextPack, contextCacheKey, type COOPlan, type COOPlanItem, validateCOOPlan } from "@/lib/coo-context";
import { initialState, normalizeMomentumState, storageKey, type Mission, type MomentumState } from "@/lib/momentum";

type Log = { date: string; done: string; blocker: string; insight: string; energy: number };
type Update = { id: string; engine: string; amount: number; note: string; date: string; kind?: string };
const logsKey = "momentum-daily-logs-v1";
const updatesKey = "momentum-engine-updates-v1";
const backlogKey = "momentum-backlog-v1";
const decisionsKey = "momentum-decisions-v1";
const copyInitialState = (): MomentumState => JSON.parse(JSON.stringify(initialState));

export default function COOPage() {
  const [state, setState] = useState<MomentumState>(copyInitialState);
  const [logs, setLogs] = useState<Log[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [backlog, setBacklog] = useState<unknown[]>([]);
  const [decisions, setDecisions] = useState<unknown[]>([]);
  const [rules, setRules] = useState<unknown[]>([]);
  const [message, setMessage] = useState("");
  const [plan, setPlan] = useState<COOPlan | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState));
    setLogs(JSON.parse(localStorage.getItem(logsKey) ?? "[]") as Log[]);
    setUpdates(JSON.parse(localStorage.getItem(updatesKey) ?? "[]") as Update[]);
    setBacklog(JSON.parse(localStorage.getItem(backlogKey) ?? "[]") as unknown[]);
    setDecisions(JSON.parse(localStorage.getItem(decisionsKey) ?? "[]") as unknown[]);
    setRules(JSON.parse(localStorage.getItem("momentum-rules-v1") ?? "[]") as unknown[]);
    setHydrated(true);
  }, []);

  const context = useMemo(
    () => buildCOOContextPack({ state, question: message, rules, logs, updates, backlog, decisions }),
    [backlog, decisions, logs, message, rules, state, updates],
  );

  const run = async () => {
    setLoading(true);
    setError("");
    setPlan(null);
    setApplied(false);
    try {
      const cacheKey = contextCacheKey(message, context);
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setPlan(JSON.parse(cached) as COOPlan);
        return;
      }
      const response = await fetch("/api/coo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context }),
      });
      const data = await response.json() as { plan?: unknown; error?: string };
      if (!response.ok || !data.plan) throw new Error(data.error ?? "Не вдалося отримати відповідь COO.");
      const safePlan = validateCOOPlan(data.plan, context);
      sessionStorage.setItem(cacheKey, JSON.stringify(safePlan));
      setPlan(safePlan);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не вдалося отримати відповідь COO.");
    } finally {
      setLoading(false);
    }
  };

  const applyPlan = () => {
    if (!plan) return;
    const items = [plan.mainMission, ...plan.alternatives].filter((item): item is COOPlanItem => Boolean(item)).slice(0, 3);
    setState((current) => {
      const missions: Mission[] = items.map((item, index) => ({
        id: crypto.randomUUID(), title: item.title, engineId: item.engineId, whyNow: item.whyNow,
        minutes: item.minutes, status: "planned", kind: item.kind, leverage: item.leverage,
        priority: index === 0 ? "primary" : "secondary",
      }));
      const next = {
        ...current,
        missions: [...current.missions.map((mission) => mission.priority === "primary" && mission.status === "planned" ? { ...mission, priority: "normal" as const } : mission), ...missions],
      };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setApplied(true);
  };

  if (!hydrated) return <main className="min-h-screen px-5 py-10">Завантажую COO…</main>;

  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-3xl">
    <Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link>
    <p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · AI COO</p>
    <h1 className="mt-3 text-3xl font-semibold text-slate-900">Одна сильна дія, а не ще один список.</h1>
    <p className="mt-3 text-slate-600">COO отримує короткий актуальний стан і лише релевантні факти. Правила та обмеження перевіряє система.</p>
    <section className="mt-8 rounded-3xl border p-6"><label className="text-sm font-medium text-slate-700">Що потрібно вирішити або побудувати?
      <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Наприклад: у мене є 60 хвилин — що найкраще зробити?" className="mt-2 min-h-32 w-full rounded-xl border p-3 text-slate-800" />
    </label><button onClick={run} disabled={loading} className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? "COO аналізує…" : "Запитати COO"}</button></section>
    {error && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
    {plan && <section className="mt-5 space-y-5"><article className="rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Висновок COO</h2><p className="mt-3 whitespace-pre-wrap text-slate-700">{plan.message}</p>
      {plan.mainMission && <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><p className="text-sm font-semibold text-cyan-800">Головна місія</p><h3 className="mt-2 text-xl font-semibold text-slate-900">{plan.mainMission.title}</h3><p className="mt-2 text-sm text-slate-700">{plan.mainMission.whyNow}</p><p className="mt-3 text-sm text-slate-600">{plan.mainMission.minutes} хв · важіль {plan.mainMission.leverage}/5</p></div>}
      {plan.alternatives.map((item) => <div key={`${item.title}-${item.engineId}`} className="mt-3 rounded-2xl border p-4"><p className="text-sm font-semibold text-slate-700">Альтернатива</p><p className="mt-1 font-medium text-slate-900">{item.title}</p></div>)}
      {plan.warnings.length > 0 && <div className="mt-5"><p className="text-sm font-semibold text-amber-800">Попередження</p><ul className="mt-2 space-y-1 text-sm text-amber-900">{plan.warnings.map((warning) => <li key={warning}>— {warning}</li>)}</ul></div>}
      {plan.backlog.length > 0 && <div className="mt-5"><p className="text-sm font-semibold text-slate-700">У Backlog</p><ul className="mt-2 space-y-1 text-sm text-slate-600">{plan.backlog.map((idea) => <li key={idea}>— {idea}</li>)}</ul></div>}
      {!applied ? <button onClick={applyPlan} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Додати запропоновані місії в чергу</button> : <p className="mt-6 text-sm font-medium text-emerald-700">Місії додано. За потреби зміни їх у черзі.</p>}
    </article></section>}
  </div></main>;
}
