// Talks to a Large Language Model (LLM) using the "OpenAI-style" chat API.
// OpenAI, Google Gemini (free tier), Groq and others all accept this same request shape,
// so switching provider only needs 3 lines changed in .env:  AI_API_KEY, AI_BASE_URL, AI_MODEL.

// ctx = { diet, kcal, maxTime, pantry }  (what the user set on the Chef AI screen)
export function buildSystemPrompt(user, ctx, suggestions) {
  const t = user.targets || {};
  const targetText = t.calories ? ` Macro targets: ${t.protein} g protein, ${t.carbs} g carbs, ${t.fat} g fat.` : '';
  const allergyText = user.allergies?.length ? user.allergies.join(', ') : 'none';
  const recipeText =
    suggestions.length > 0
      ? suggestions.map((r) => `- ${r.name} (${Math.round(r.calories)} kcal, ${Math.round(r.protein)} g protein, ${r.timeMinutes} min, ${r.dietType})`).join('\n')
      : 'none found';

  return `You are Chef AI, a friendly Indian nutrition and diet coach inside the "Eat Desi, Move Faster" app.

RULES
- Give general nutrition guidance only. You are not a doctor or dietitian. For medical conditions, allergies or eating disorders, tell the user to see a doctor or registered dietitian.
- Prefer familiar Indian foods. Respect the user's diet type strictly (e.g. never suggest meat to a vegetarian) and never suggest anything containing their allergens.
- The app shows the recipe cards listed below under your message. Refer to them by exact name; do not repeat their numbers.
- Keep the answer under 90 words, simple English, practical.
- Only talk about food, nutrition, cooking and healthy eating. Politely refuse anything else.
- Never recommend extreme diets or fewer than 1200 kcal per day.

USER SETTINGS
Diet: ${ctx.diet}. Allergies: ${allergyText}. Daily goal: ${ctx.kcal} kcal.${targetText} Max cooking time per dish: ${ctx.maxTime} min.
Pantry (ingredients the user has): ${ctx.pantry.length ? ctx.pantry.join(', ') : 'not provided'}

Recipe cards shown to the user:
${recipeText}`;
}

// Returns the reply text, or null if no API key is configured. Throws if the API call fails.
export async function askAI(systemPrompt, history) {
  const key = process.env.AI_API_KEY;
  if (!key) return null;

  const base = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...history],
      temperature: 0.5,
      max_tokens: 400,
    }),
    signal: AbortSignal.timeout(20000), // give up after 20 seconds
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI service error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}
