import { z } from "zod";
import { detectSafetyCrisis } from "../safety/crisis";
import { detectReassurance } from "../reassurance/detector";
import { detectOcdLoop } from "../loop/detector";
import type { SupportContext } from "@/lib/support/context";

export const SemanticCategorySchema = z.enum([
  "REASSURANCE_SEEKING",
  "COMPULSION_LOOP",
  "CRISIS",
  "NEUTRAL",
]);

export type SemanticCategory = z.infer<typeof SemanticCategorySchema>;

export const SemanticClassificationSchema = z.object({
  category: SemanticCategorySchema,
  score: z.number().min(0).max(1),
  evidence: z.array(z.string()),
  uncertainty: z.number().min(0).max(1),
});

export type SemanticClassificationResult = z.infer<
  typeof SemanticClassificationSchema
>;

/**
 * Deterministic baseline mapping
 */
function getDeterministicClassification(
  text: string
): SemanticClassificationResult {
  const safety = detectSafetyCrisis(text);
  if (safety.isCrisis) {
    return {
      category: "CRISIS",
      score: safety.score,
      evidence: safety.evidence,
      uncertainty: safety.uncertainty,
    };
  }

  const reassurance = detectReassurance(text);
  if (reassurance.isReassurance) {
    return {
      category: "REASSURANCE_SEEKING",
      score: reassurance.score,
      evidence: reassurance.evidence,
      uncertainty: reassurance.uncertainty,
    };
  }

  const loop = detectOcdLoop(text);
  if (loop.hasLoopPattern) {
    return {
      category: "COMPULSION_LOOP",
      score: loop.score,
      evidence: loop.evidence,
      uncertainty: loop.uncertainty,
    };
  }

  return {
    category: "NEUTRAL",
    score: 0.8,
    evidence: ["無顯著危機、再保證尋求或強迫循環特徵"],
    uncertainty: 0.1,
  };
}

/**
 * Determines if deterministic classification is ambiguous enough to query semantic adapter
 */
function isAmbiguous(
  deterministic: SemanticClassificationResult,
  text: string
): boolean {
  if (deterministic.category === "CRISIS") {
    // Safety check is conclusive deterministically; do not outsource crisis
    return false;
  }

  // If uncertainty is notably high or score is borderline
  if (deterministic.uncertainty >= 0.35) return true;
  if (deterministic.score >= 0.55 && deterministic.score <= 0.72) return true;

  // Short and vague text with questioning tone
  if (text.trim().length >= 6 && text.trim().length < 50 && deterministic.category === "NEUTRAL") {
    return /[?？會不會是不是怎麼辦算不算]/.test(text);
  }
  return false;
}

/**
 * Classify support text using deterministic rules first,
 * with optional semantic LLM classification for ambiguous cases.
 */
export async function classifySupportText(
  text: string,
  context?: SupportContext
): Promise<SemanticClassificationResult> {
  const clean = (text ?? "").trim();
  const deterministic = getDeterministicClassification(clean);

  // Deterministic rule layer first
  if (!isAmbiguous(deterministic, clean)) {
    return deterministic;
  }

  // If ambiguous, check if LLM API is configured
  const apiKey =
    process.env.SEMANTIC_CLASSIFIER_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.AI_API_KEY;

  if (!apiKey) {
    // API key not set -> fallback to deterministic result smoothly
    return deterministic;
  }

  try {
    const endpoint =
      process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/chat/completions";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second strict budget

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.SEMANTIC_CLASSIFIER_MODEL || "gpt-4o-mini",
        temperature: 0,
        messages: [
          {
            role: "system",
            content: `You are an OCD support classification classifier. 
Classify the given text into ONE category: REASSURANCE_SEEKING, COMPULSION_LOOP, CRISIS, NEUTRAL.
STRICT RULES:
1. Classification ONLY. NEVER provide therapeutic suggestions, medical diagnosis, or advice.
2. NEVER give reassurance (do not say "you are fine").
3. Return JSON object with keys: category, score (0 to 1), evidence (array of short strings), uncertainty (0 to 1).`,
          },
          {
            role: "user",
            content: JSON.stringify({ text: clean, context }),
          },
        ],
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return deterministic;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) return deterministic;

    const parsedJson = JSON.parse(rawContent);
    const validation = SemanticClassificationSchema.safeParse(parsedJson);

    if (!validation.success) {
      return deterministic;
    }

    const llmResult = validation.data;

    // Safety constraint: LLM cannot downgrade deterministic crisis
    if (deterministic.category === "CRISIS" && llmResult.category !== "CRISIS") {
      return deterministic;
    }

    return llmResult;
  } catch {
    // Network / timeout / parse error -> fallback smoothly
    return deterministic;
  }
}
