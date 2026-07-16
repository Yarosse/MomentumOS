"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { initialState, normalizeMomentumState, storageKey, type MomentumState } from "@/lib/momentum";
import { rankMissions, recommendedMission } from "@/lib/decision-engine";

const copyInitialState = (): MomentumState => JSON.parse(JSON.stringify(initialState));

export default function OperatorPage() {
  const [state, setState] = useState<MomentumState>(copyInitialState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const saved = localStorage.getItem(storageKey); if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState)); setHydrated(true); }, []);
  const recommendation = useMemo(() => recommendedMission(state), [state]);
  const ranked = useMemo(() => rankMissions(state), [state]);
  if (!hydrated) return <main className="min-h-screen px-5 py-10">Завантажую Оператора…</main>;
  return <main className="min-h-screen px-5 py-10 sm:px-8"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-cyan-700 underline underline-offset-4">← Сьогодні</Link><p className="mt-9 text-xs font-bold tracking-[.22em] text-cyan-700">MOMENTUM OS · LOCAL OPERATOR</p><h1 className="mt-3 text-3xl font-semibold text-slate-900">Чому система обрала саме це.</h1><p className="mt-3 text-slate-600">Поки без AI: рекомендація будується за прозорими правилами, які ми зможемо перевірити й змінити.</p>{recommendation ? <section className="mt-8 rounded-3xl border p-6"><p className="text-sm font-semibold text-cyan-700">Рекомендована дія</p><h2 className="mt-2 text-2xl font-semibold text-slate-900">{recommendation.mission.title}</h2><p className="mt-3 text-slate-600">{recommendation.engine.name} · {recommendation.mission.minutes} хв</p><ul className="mt-5 space-y-2 text-sm text-slate-700">{recommendation.reasons.map((reason) => <li key={reason}>— {reason}</li>)}</ul><p className="mt-5 text-sm text-slate-600">Вузьке місце: {recommendation.engine.bottleneck}</p></section> : <section className="mt-8 rounded-3xl border p-6"><h2 className="text-xl font-semibold text-slate-900">Немає валідної місії.</h2><p className="mt-2 text-slate-600">Додай місію для активної машини або Validate-місію для експерименту.</p></section>}<section className="mt-5 rounded-3xl border p-6"><h2 className="text-lg font-semibold text-slate-900">Що відсіяно</h2><p className="mt-2 text-sm text-slate-600">Призупинені машини не потрапляють у рекомендацію. Для експериментів система приймає лише Validate-місії — до появи доказу попиту.</p><p className="mt-4 text-sm text-slate-600">Валідних кандидатів: {ranked.length}</p></section></div></main>;
}
