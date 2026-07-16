import type { Engine, Mission, MomentumState } from "@/lib/momentum";

export type RankedMission = { mission: Mission; engine: Engine; score: number; reasons: string[] };

const kindScore: Record<NonNullable<Mission["kind"]>, number> = { earn: 55, validate: 45, build: 35, improve: 25 };
const priorityScore: Record<NonNullable<Mission["priority"]>, number> = { primary: 50, secondary: 20, normal: 0 };

export const rankMissions = (state: MomentumState): RankedMission[] => state.missions
  .filter((mission) => mission.status === "planned")
  .flatMap((mission, index) => {
    const engine = state.engines.find((item) => item.id === mission.engineId);
    if (!engine || engine.status === "paused" || engine.status === "retired") return [];
    if (engine.status === "experiment" && mission.kind !== "validate") return [];
    const reasons = [
      engine.status === "active" ? "активна машина" : "перевірка гіпотези",
      `тип: ${mission.kind === "earn" ? "заробити" : mission.kind === "validate" ? "перевірити" : mission.kind === "build" ? "побудувати" : "покращити"}`,
      `важіль: ${mission.leverage ?? 3}/5`,
    ];
    const score = (engine.status === "active" ? 30 : 10) + kindScore[mission.kind ?? "improve"] + priorityScore[mission.priority ?? "normal"] + (mission.leverage ?? 3) * 6 - index / 100;
    return [{ mission, engine, score, reasons }];
  })
  .sort((a, b) => b.score - a.score);

export const recommendedMission = (state: MomentumState): RankedMission | undefined => {
  const active = state.missions.find((mission) => mission.status === "active");
  if (active) {
    const engine = state.engines.find((item) => item.id === active.engineId);
    if (engine) return { mission: active, engine, score: Number.POSITIVE_INFINITY, reasons: ["вже розпочата місія"] };
  }
  return rankMissions(state)[0];
};
