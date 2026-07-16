import { rankMissions } from "@/lib/decision-engine";
import type { Mission, MomentumState } from "@/lib/momentum";

export type COOLog = { date: string; done: string; blocker: string; insight: string; energy: number };
export type COOUpdate = { id: string; engine: string; amount: number; note: string; date: string; kind?: string };
export type COOTextItem = { title?: string; text?: string; note?: string; createdAt?: string; date?: string };

export type COOContextPack = {
  version: 1;
  rules: string[];
  currentState: {
    capacityRemainingMinutes: number;
    energy?: number;
    activeExperimentId?: string;
    engines: Array<{ id: string; name: string; status: string; stage: string; bottleneck: string; objective: string; targetMonthly?: number; lastProof?: string }>;
    nextMissions: Array<{ id: string; title: string; engineId: string; kind: string; priority: string; leverage: number; minutes: number; whyNow: string }>;
  };
  relevantMemory: string[];
};

const compact = (value: unknown, limit = 220) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
const words = (value: string) => new Set(value.toLocaleLowerCase("uk-UA").match(/[\p{L}\p{N}]{3,}/gu) ?? []);

const textOf = (item: unknown) => {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";
  return Object.values(item as Record<string, unknown>).map((value) => typeof value === "string" || typeof value === "number" ? String(value) : "").join(" ");
};

const relevant = (question: string, entries: Array<{ label: string; text: string }>, limit: number) => {
  const terms = words(question);
  return entries
    .map((entry, index) => ({ entry, index, score: [...terms].reduce((score, term) => score + (entry.text.toLocaleLowerCase("uk-UA").includes(term) ? 4 : 0), 0) + Math.max(0, 2 - index / 10) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ entry }) => `${entry.label}: ${compact(entry.text)}`)
    .filter((item) => item.length > 3);
};

export const buildCOOContextPack = ({
  state,
  question,
  rules,
  logs,
  updates,
  backlog,
  decisions,
}: {
  state: MomentumState;
  question: string;
  rules: unknown[];
  logs: COOLog[];
  updates: COOUpdate[];
  backlog: unknown[];
  decisions: unknown[];
}): COOContextPack => {
  const ranked = rankMissions(state).slice(0, 5);
  const entries = [
    ...updates.map((update) => ({ label: `Факт ${update.date}`, text: `${update.kind ?? "оновлення"}; машина ${update.engine}; ${update.amount}; ${update.note}` })),
    ...logs.map((log) => ({ label: `Щоденник ${log.date}`, text: `зробив: ${log.done}; блокер: ${log.blocker}; висновок: ${log.insight}; енергія: ${log.energy}` })),
    ...state.reviews.map((review) => ({ label: `Review ${review.createdAt.slice(0, 10)}`, text: `${review.answers.join("; ")}; межа: ${review.boundary ?? ""}` })),
    ...decisions.map((decision) => ({ label: "Рішення", text: textOf(decision) })),
    ...backlog.map((idea) => ({ label: "Backlog", text: textOf(idea) })),
  ];

  return {
    version: 1,
    rules: [...state.todayBoundary, ...rules.map(textOf)].map((rule) => compact(rule, 180)).filter(Boolean).slice(0, 10),
    currentState: {
      capacityRemainingMinutes: Math.max(0, state.player.capacityMinutes - state.player.focusMinutes),
      energy: state.player.energy,
      activeExperimentId: state.experimentFocusId,
      engines: state.engines.map((engine) => ({
        id: engine.id,
        name: compact(engine.name, 80),
        status: engine.status,
        stage: compact(engine.stage),
        bottleneck: compact(engine.bottleneck),
        objective: compact(engine.objective),
        targetMonthly: engine.targetMonthly,
        lastProof: compact(engine.lastProof, 180) || undefined,
      })),
      nextMissions: ranked.map(({ mission }) => ({
        id: mission.id,
        title: compact(mission.title),
        engineId: mission.engineId,
        kind: mission.kind ?? "improve",
        priority: mission.priority ?? "normal",
        leverage: mission.leverage ?? 3,
        minutes: mission.minutes,
        whyNow: compact(mission.whyNow),
      })),
    },
    relevantMemory: relevant(question, entries, 5),
  };
};

export type COOPlanItem = { title: string; engineId: string; whyNow: string; minutes: number; kind: NonNullable<Mission["kind"]>; leverage: number };
export type COOPlan = { message: string; mainMission: COOPlanItem | null; alternatives: COOPlanItem[]; warnings: string[]; backlog: string[] };

const normalizeItem = (item: unknown, context: COOContextPack): COOPlanItem | null => {
  if (!item || typeof item !== "object") return null;
  const value = item as Record<string, unknown>;
  const engine = context.currentState.engines.find((candidate) => candidate.id === value.engineId);
  const kind = value.kind;
  const minutes = Number(value.minutes);
  if (!engine || typeof value.title !== "string" || typeof value.whyNow !== "string" || !["earn", "validate", "build", "improve"].includes(String(kind)) || minutes < 30 || minutes > 90) return null;
  if (context.currentState.capacityRemainingMinutes < 30) return null;
  if (engine.status === "experiment" && (kind !== "validate" || engine.id !== context.currentState.activeExperimentId)) return null;
  return { title: compact(value.title, 160), engineId: engine.id, whyNow: compact(value.whyNow, 240), minutes, kind: kind as COOPlanItem["kind"], leverage: Math.max(1, Math.min(5, Number(value.leverage) || 3)) };
};

export const validateCOOPlan = (raw: unknown, context: COOContextPack): COOPlan => {
  const plan = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const mainMission = normalizeItem(plan.mainMission, context);
  const alternatives = Array.isArray(plan.alternatives) ? plan.alternatives.map((item) => normalizeItem(item, context)).filter((item): item is COOPlanItem => Boolean(item)).slice(0, 2) : [];
  return {
    message: compact(plan.message, 700) || "COO не зміг сформувати достатньо надійний план. Показую лише дозволені варіанти.",
    mainMission,
    alternatives,
    warnings: Array.isArray(plan.warnings) ? plan.warnings.map((item) => compact(item, 180)).filter(Boolean).slice(0, 3) : [],
    backlog: Array.isArray(plan.backlog) ? plan.backlog.map((item) => compact(item, 160)).filter(Boolean).slice(0, 3) : [],
  };
};

export const contextCacheKey = (question: string, context: COOContextPack) => {
  const source = JSON.stringify({ question: compact(question, 1000), context });
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) hash = Math.imul(hash ^ source.charCodeAt(index), 16777619);
  return `coo-v1-${(hash >>> 0).toString(36)}`;
};
