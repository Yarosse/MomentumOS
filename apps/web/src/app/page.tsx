"use client";

import { useEffect, useMemo, useState } from "react";
import { initialState, normalizeMomentumState, storageKey, type Mission, type MomentumState } from "@/lib/momentum";
import Link from "next/link";

const copyInitialState = (): MomentumState => JSON.parse(JSON.stringify(initialState));

export default function Home() {
  const [state, setState] = useState<MomentumState>(copyInitialState);
  const [hydrated, setHydrated] = useState(false);
  const [proof, setProof] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkEngine, setBulkEngine] = useState("community");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) setState(normalizeMomentumState(JSON.parse(saved) as MomentumState));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [hydrated, state]);

  const activeMission = useMemo(() => state.missions.find((mission) => mission.status === "active"), [state.missions]);
  const mainMission = activeMission ?? state.missions.find((mission) => mission.status === "planned");
  const alternatives = state.missions.filter((mission) => mission.status === "planned" && mission.id !== mainMission?.id);
  const engine = state.engines.find((item) => item.id === mainMission?.engineId);
  const lastProof = state.engines.find((item) => item.lastProof)?.lastProof;

  const chooseMission = (mission: Mission) => {
    setProof("");
    setState((current) => ({ ...current, missions: current.missions.map((item) => item.id === mission.id ? { ...item, status: "active" } : item.status === "active" ? { ...item, status: "planned" } : item) }));
  };

  const completeMission = () => {
    const cleanedProof = proof.trim();
    if (!activeMission || !cleanedProof) return;
    setState((current) => ({
      ...current,
      engines: current.engines.map((item) => item.id === activeMission.engineId ? { ...item, lastProof: cleanedProof } : item),
      missions: current.missions.map((item) => item.id === activeMission.id ? { ...item, status: "completed", proof: cleanedProof } : item),
    }));
    setProof("");
  };

  const resetDemo = () => {
    window.localStorage.removeItem(storageKey);
    setProof("");
    setState(copyInitialState());
  };

  const addMissionList = () => {
    const titles = bulkText.split("\n").map((item) => item.trim()).filter(Boolean);
    if (!titles.length) return;
    setState((current) => ({ ...current, missions: [...current.missions, ...titles.map((title) => ({ id: crypto.randomUUID(), title, engineId: bulkEngine, whyNow: "Додано до черги; уточни причину пріоритету перед стартом.", minutes: 45, status: "planned" as const }))] }));
    setBulkText("");
  };

  const moveMission = (missionId: string, direction: -1 | 1) => {
    setState((current) => {
      const missions = [...current.missions];
      const index = missions.findIndex((item) => item.id === missionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= missions.length || missions[index].status !== "planned" || missions[target].status !== "planned") return current;
      [missions[index], missions[target]] = [missions[target], missions[index]];
      return { ...current, missions };
    });
  };

  const editMission = (missionId: string) => {
    const mission = state.missions.find((item) => item.id === missionId);
    if (!mission || mission.status !== "planned") return;
    const title = window.prompt("Результат місії", mission.title);
    if (!title?.trim()) return;
    const whyNow = window.prompt("Чому це важливо зараз?", mission.whyNow);
    if (!whyNow?.trim()) return;
    const minutes = Number(window.prompt("Хвилини (30–90)", String(mission.minutes)));
    if (!Number.isFinite(minutes) || minutes < 30 || minutes > 90) return;
    setState((current) => ({ ...current, missions: current.missions.map((item) => item.id === missionId ? { ...item, title: title.trim(), whyNow: whyNow.trim(), minutes } : item) }));
  };

  const deleteMission = (missionId: string) => {
    const mission = state.missions.find((item) => item.id === missionId);
    if (!mission || mission.status !== "planned") return;
    if (!window.confirm("Прибрати цю місію з черги?")) return;
    setState((current) => ({ ...current, missions: current.missions.filter((item) => item.id !== missionId) }));
  };

  const createMission = () => {
    const title = window.prompt("Який результат має дати місія?");
    if (!title?.trim()) return;
    const engineId = window.prompt(`Engine: ${state.engines.map((item) => item.id).join(", ")}`, "community");
    if (!engineId || !state.engines.some((item) => item.id === engineId)) return;
    const whyNow = window.prompt("Чому це важливо саме зараз?");
    if (!whyNow?.trim()) return;
    const minutes = Number(window.prompt("Хвилини (30–90)", "45"));
    if (!Number.isFinite(minutes) || minutes < 30 || minutes > 90) return;
    setState((current) => ({ ...current, missions: [...current.missions, { id: crypto.randomUUID(), title: title.trim(), engineId, whyNow: whyNow.trim(), minutes, status: "planned" }] }));
  };

  const editEngine = (engineId: string) => {
    const currentEngine = state.engines.find((item) => item.id === engineId);
    if (!currentEngine) return;
    const stage = window.prompt("Поточна стадія", currentEngine.stage);
    if (!stage?.trim()) return;
    const bottleneck = window.prompt("Одне поточне вузьке місце", currentEngine.bottleneck);
    if (!bottleneck?.trim()) return;
    setState((current) => ({ ...current, engines: current.engines.map((item) => item.id === engineId ? { ...item, stage: stage.trim(), bottleneck: bottleneck.trim() } : item) }));
  };

  if (!hydrated) return <main className="min-h-screen bg-[#0b1020] p-8 text-slate-100">Завантажую Momentum OS…</main>;

  return (
    <main className="min-h-screen bg-[#0b1020] px-5 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-col gap-3 border-b border-slate-700 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-2 text-xs font-bold tracking-[0.24em] text-cyan-300">MOMENTUM OS · TODAY</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Одна правильна дія.</h1></div>
          <div className="flex flex-wrap gap-4"><Link href="/updates" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Оновлення машин</Link><Link href="/rules" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Правила</Link><Link href="/decisions" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Рішення</Link><Link href="/backlog" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Backlog</Link><Link href="/log" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Лог дня</Link><Link href="/review" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Щотижневий огляд</Link><Link href="/backup" className="w-fit text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Резервна копія</Link><button onClick={resetDemo} className="w-fit text-sm text-slate-400 underline underline-offset-4 hover:text-slate-200">Скинути демо-дані</button></div>
        </header>

        <section className="mb-5 rounded-2xl p-4"><div className="flex flex-col gap-3 sm:flex-row"><select value={bulkEngine} onChange={(event) => setBulkEngine(event.target.value)} className="rounded-xl border border-slate-300/50 bg-white/60 px-3 py-2 text-slate-800"><option value="scalping">Скальпінг</option><option value="community">Арбітражне ком'юніті</option><option value="telegram">Telegram-гра</option><option value="doors">Двері</option></select><textarea value={bulkText} onChange={(event) => setBulkText(event.target.value)} placeholder="Встав список задач — по одній у рядок" className="min-h-20 flex-1 rounded-xl border border-slate-300/50 bg-white/60 p-3 text-slate-800 placeholder:text-slate-500" /></div><button onClick={addMissionList} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Додати список місій</button></section>

        <div className="mb-5 flex justify-end"><button onClick={createMission} className="rounded-lg border border-cyan-300/50 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-300/10">+ Нова місія</button></div>

        <section className="rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/10 to-indigo-400/10 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-cyan-200">Найкращий наступний крок</p>
          {mainMission && engine ? <>
            <h2 className="max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl">{mainMission.title}</h2>
            <div className="mt-6 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-950/50 px-3 py-1.5 text-slate-200">{engine.name}</span><span className="rounded-full bg-slate-950/50 px-3 py-1.5 text-slate-200">{mainMission.minutes} хв</span><span className="rounded-full bg-amber-300/15 px-3 py-1.5 text-amber-100">Вузьке місце: {engine.bottleneck}</span></div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{mainMission.whyNow}</p>
            {activeMission ? <div className="mt-7 max-w-2xl"><label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="proof">Що стало фактом після місії?</label><textarea id="proof" value={proof} onChange={(event) => setProof(event.target.value)} placeholder="Наприклад: новачок пройшов гайд без мого повідомлення." className="min-h-28 w-full rounded-xl border border-slate-600 bg-slate-950/70 p-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300" /><button onClick={completeMission} disabled={!proof.trim()} className="mt-3 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">Завершити з доказом</button></div> : <button onClick={() => chooseMission(mainMission)} className="mt-7 rounded-xl bg-cyan-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200">Почати {mainMission.minutes}-хв сесію</button>}
          </> : <div><h2 className="text-2xl font-semibold">Активних місій немає.</h2><p className="mt-2 text-slate-300">Наступний крок: визначити одне вузьке місце для активної машини.</p></div>}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="mb-1 text-lg font-semibold">Черга місій</h2><p className="mb-4 text-sm text-slate-500">Перша в списку — головний пріоритет після поточної місії. Можеш змінити, пересунути або прибрати будь-яку заплановану місію.</p><div className="space-y-3">{alternatives.map((mission, index) => { const alternativeEngine = state.engines.find((item) => item.id === mission.engineId); return <div key={mission.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4"><span className="w-6 text-center text-sm font-semibold text-cyan-700">{index + 2}</span><button onClick={() => chooseMission(mission)} disabled={Boolean(activeMission)} className="flex-1 text-left disabled:opacity-50"><p className="text-sm text-cyan-700">{alternativeEngine?.name} · {mission.minutes} хв</p><p className="mt-1 font-medium leading-6">{mission.title}</p></button><div className="flex flex-col"><button onClick={() => moveMission(mission.id, -1)} aria-label="Підняти місію" className="px-2 text-slate-500 hover:text-cyan-700">↑</button><button onClick={() => moveMission(mission.id, 1)} aria-label="Опустити місію" className="px-2 text-slate-500 hover:text-cyan-700">↓</button></div><div className="flex flex-col gap-1 text-xs"><button onClick={() => editMission(mission.id)} className="text-cyan-700 hover:text-cyan-900">Змінити</button><button onClick={() => deleteMission(mission.id)} className="text-rose-600 hover:text-rose-800">Прибрати</button></div></div>; })}</div>
            <h2 className="mb-4 mt-8 text-lg font-semibold">Машини</h2><div className="grid gap-3 sm:grid-cols-2">{state.engines.map((item) => <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{item.name}</h3><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{item.status === "active" ? "активна" : "експеримент"}</span></div><p className="mt-3 text-sm text-cyan-200">{item.stage}</p><p className="mt-2 text-sm leading-5 text-slate-400">{item.bottleneck}</p><div className="mt-4 flex gap-4"><Link href={`/engines/${item.id}`} className="text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Відкрити машину</Link><button onClick={() => editEngine(item.id)} className="text-sm text-cyan-200 underline underline-offset-4 hover:text-cyan-100">Змінити вузьке місце</button></div></article>)}</div>
          </section>
          <aside className="space-y-6"><section className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5"><h2 className="font-semibold text-rose-200">Сьогодні не робимо</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{state.todayBoundary.map((item) => <li key={item}>— {item}</li>)}</ul></section><section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5"><h2 className="font-semibold">Останній доказ</h2><p className="mt-3 text-sm leading-6 text-slate-400">{lastProof ?? "Ще немає. Заверши одну місію з коротким фактом."}</p></section></aside>
        </div>
      </div>
    </main>
  );
}
