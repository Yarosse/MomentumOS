import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Ти — COO Momentum OS для Ярослава. Твоя мета: зменшити когнітивне навантаження та запропонувати найкращу наступну дію на 30–90 хвилин, а не надихати або додавати задачі.

Правила:
- Працюй тільки з фактами з контексту. Якщо фактів мало — прямо скажи, чого бракує.
- Одна головна місія, максимум дві альтернативи.
- Місія має прибирати одне вузьке місце конкретної машини.
- Для експерименту пропонуй тільки validate-місії, доки немає доказу попиту.
- Поважай Capacity: якщо фокус вичерпано або енергія низька, можеш рекомендувати зупинитися, а mainMission постав null.
- Нова ідея без proof має піти в backlog, а не ставати місією.
- Не давай торгових сигналів, не рекомендуй відкривати угоди, не радь ризикувати коштами й не обіцяй доходу.
- Пиши українською, коротко й прямо.

Поверни ВИКЛЮЧНО валідний JSON такого вигляду:
{
  "message": "коротке пояснення",
  "mainMission": {"title":"","engineId":"scalping|community|telegram|doors","whyNow":"","minutes":45,"kind":"earn|validate|build|improve","leverage":3} або null,
  "alternatives": [{"title":"","engineId":"","whyNow":"","minutes":45,"kind":"","leverage":3}],
  "warnings": [""],
  "backlog": [""]
}`;

type ParsedPlan = {
  message?: string;
  mainMission?: unknown;
  alternatives?: unknown;
  warnings?: unknown;
  backlog?: unknown;
};

const planSchema = {
  type: "object",
  additionalProperties: false,
  required: ["message", "mainMission", "alternatives", "warnings", "backlog"],
  properties: {
    message: { type: "string" },
    mainMission: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["title", "engineId", "whyNow", "minutes", "kind", "leverage"],
          properties: {
            title: { type: "string" }, engineId: { type: "string" }, whyNow: { type: "string" },
            minutes: { type: "number" }, kind: { type: "string" }, leverage: { type: "number" },
          },
        },
      ],
    },
    alternatives: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "engineId", "whyNow", "minutes", "kind", "leverage"],
        properties: {
          title: { type: "string" }, engineId: { type: "string" }, whyNow: { type: "string" },
          minutes: { type: "number" }, kind: { type: "string" }, leverage: { type: "number" },
        },
      },
    },
    warnings: { type: "array", items: { type: "string" } },
    backlog: { type: "array", items: { type: "string" } },
  },
};

const parsePlan = (content: string) => {
  try { return JSON.parse(content) as ParsedPlan; } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("invalid_json");
    return JSON.parse(match[0]) as ParsedPlan;
  }
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "COO ще не підключено. Додай OPENAI_API_KEY у apps/web/.env.local — ключ не потрібно надсилати в чат.", code: "missing_api_key" }, { status: 503 });

  const body = await request.json().catch(() => null) as { message?: unknown; context?: unknown } | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Некоректний запит." }, { status: 400 });
  const message = typeof body.message === "string" ? body.message.slice(0, 4000) : "";
  const context = body.context ?? {};
  const maxOutputTokens = Math.max(250, Math.min(800, Number(process.env.OPENAI_COO_MAX_OUTPUT_TOKENS) || 600));
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({ userRequest: message, context }),
      max_output_tokens: maxOutputTokens,
      text: { format: { type: "json_schema", name: "momentum_coo_plan", strict: true, schema: planSchema } },
    }),
  });
  const payload = await response.json() as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    error?: { message?: string };
  };
  if (!response.ok) return NextResponse.json({ error: payload.error?.message ?? "COO тимчасово недоступний." }, { status: response.status });
  try {
    const outputText = payload.output_text ?? payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text ?? "";
    const plan = parsePlan(outputText);
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ error: "COO повернув відповідь у неправильному форматі. Спробуй ще раз." }, { status: 502 });
  }
}
