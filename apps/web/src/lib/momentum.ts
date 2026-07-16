export type EngineStatus = "active" | "experiment" | "paused" | "retired";
export type MissionStatus = "planned" | "active" | "completed";

export type Engine = { id: string; name: string; status: EngineStatus; stage: string; bottleneck: string; objective: string; lastProof?: string };
export type Mission = { id: string; title: string; engineId: string; whyNow: string; minutes: number; status: MissionStatus; proof?: string };
export type Review = { id: string; createdAt: string; answers: string[] };
export type MomentumState = { engines: Engine[]; missions: Mission[]; todayBoundary: string[]; reviews: Review[] };

export const initialState: MomentumState = {
  engines: [
    { id: "scalping", name: "Scalping", status: "active", stage: "Зібрати статистику за правилами", bottleneck: "Немає перевіреної дисципліни та статистики угод", objective: "20 угод за чек-листом із журналом" },
    { id: "community", name: "Arbitrage community", status: "active", stage: "Зробити онбординг самостійним", bottleneck: "Нових людей не можна масштабувати без ручних пояснень", objective: "Один новачок проходить онбординг без допомоги" },
    { id: "telegram", name: "Telegram game", status: "experiment", stage: "Підтвердити попит", bottleneck: "Немає доказу, що гравці перейдуть на нову платформу", objective: "Отримати якісні інтерв'ю або тест попиту" },
    { id: "doors", name: "Doors", status: "experiment", stage: "Підтвердити канал дилерів", bottleneck: "Немає першого підтвердженого дилерського контакту", objective: "Провести одну предметну розмову з потенційним дилером" },
  ],
  missions: [
    { id: "community-onboarding", title: "Перевірити, чи новачок проходить онбординг без моєї допомоги", engineId: "community", whyNow: "Це зменшує ручну підтримку й відкриває шлях до масштабування ком'юніті.", minutes: 45, status: "planned" },
    { id: "scalping-checklist", title: "Описати чек-лист для наступної угоди й зафіксувати його в журналі", engineId: "scalping", whyNow: "Без однакових правил статистика скальпінгу не має цінності.", minutes: 35, status: "planned" },
    { id: "telegram-interviews", title: "Скласти 5 запитань для розмови з потенційними гравцями в деберц", engineId: "telegram", whyNow: "Спочатку потрібен доказ попиту, а не код.", minutes: 30, status: "planned" },
  ],
  todayBoundary: ["Не починати новий продукт.", "Не кодити Telegram-гру до перевірки попиту.", "Не відкривати угоду через нудьгу."],
  reviews: [],
};

export const storageKey = "momentum-os-v1";
