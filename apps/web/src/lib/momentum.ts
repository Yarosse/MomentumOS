export type EngineStatus = "active" | "experiment" | "paused" | "retired";
export type MissionStatus = "planned" | "active" | "completed";
export type MissionKind = "earn" | "validate" | "build" | "improve";
export type MissionPriority = "primary" | "secondary" | "normal";

export type Engine = { id: string; name: string; status: EngineStatus; stage: string; bottleneck: string; objective: string; targetMonthly?: number; lastProof?: string };
export type Mission = { id: string; title: string; engineId: string; whyNow: string; minutes: number; status: MissionStatus; kind?: MissionKind; leverage?: number; priority?: MissionPriority; proof?: string };
export type Review = { id: string; createdAt: string; answers: string[]; priorityEngineId?: string; bottleneckEngineId?: string; nextBottleneck?: string; boundary?: string };
export type MomentumState = { engines: Engine[]; missions: Mission[]; todayBoundary: string[]; reviews: Review[] };

export const initialState: MomentumState = {
  engines: [
    { id: "scalping", name: "Скальпінг", status: "active", stage: "Зібрати статистику за правилами", bottleneck: "Немає перевіреної дисципліни та статистики угод", objective: "20 угод за чек-листом із журналом", targetMonthly: 4000 },
    { id: "community", name: "Арбітражне ком'юніті", status: "active", stage: "Зробити онбординг самостійним", bottleneck: "Нових людей не можна масштабувати без ручних пояснень", objective: "Один новачок проходить онбординг без допомоги", targetMonthly: 1000 },
    { id: "telegram", name: "Telegram-гра", status: "experiment", stage: "Підтвердити попит", bottleneck: "Немає доказу, що гравці перейдуть на нову платформу", objective: "Отримати якісні інтерв'ю або тест попиту", targetMonthly: 750 },
    { id: "doors", name: "Doors", status: "experiment", stage: "Підтвердити канал дилерів", bottleneck: "Немає першого підтвердженого дилерського контакту", objective: "Провести одну предметну розмову з потенційним дилером" },
  ],
  missions: [
    { id: "community-onboarding", title: "Перевірити, чи новачок проходить онбординг без моєї допомоги", engineId: "community", whyNow: "Це зменшує ручну підтримку й відкриває шлях до масштабування ком'юніті.", minutes: 45, status: "planned", kind: "build", leverage: 5, priority: "primary" },
    { id: "scalping-checklist", title: "Описати чек-лист для наступної угоди й зафіксувати його в журналі", engineId: "scalping", whyNow: "Без однакових правил статистика скальпінгу не має цінності.", minutes: 35, status: "planned", kind: "improve", leverage: 4, priority: "secondary" },
    { id: "telegram-interviews", title: "Скласти 5 запитань для розмови з потенційними гравцями в деберц", engineId: "telegram", whyNow: "Спочатку потрібен доказ попиту, а не код.", minutes: 30, status: "planned", kind: "validate", leverage: 3, priority: "normal" },
  ],
  todayBoundary: ["Не починати новий продукт.", "Не кодити Telegram-гру до перевірки попиту.", "Не відкривати угоду через нудьгу."],
  reviews: [],
};

export const storageKey = "momentum-os-v1";

export const normalizeMomentumState = (saved: MomentumState): MomentumState => ({
  ...initialState,
  ...saved,
  engines: initialState.engines.map((defaultEngine) => ({ ...defaultEngine, ...saved.engines.find((engine) => engine.id === defaultEngine.id), name: defaultEngine.name })),
  missions: (saved.missions ?? initialState.missions).map((mission, index) => ({
    ...mission,
    kind: mission.kind ?? (saved.engines.find((engine) => engine.id === mission.engineId)?.status === "experiment" ? "validate" : "improve"),
    leverage: mission.leverage ?? 3,
    priority: mission.priority ?? (index === 0 ? "primary" : "normal"),
  })),
  todayBoundary: saved.todayBoundary ?? initialState.todayBoundary,
  reviews: saved.reviews ?? [],
});
