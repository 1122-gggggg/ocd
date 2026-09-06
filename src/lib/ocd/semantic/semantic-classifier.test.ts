import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  classifySupportText,
  SemanticClassificationSchema,
} from "./classifier";

describe("Semantic Classifier Adapter (Phase 8)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("validates LLM output against Zod schema", () => {
    const valid = {
      category: "REASSURANCE_SEEKING",
      score: 0.92,
      evidence: ["尋求特定事件是否正常的確認"],
      uncertainty: 0.1,
    };

    const parsed = SemanticClassificationSchema.safeParse(valid);
    expect(parsed.success).toBe(true);

    const invalid = {
      category: "SOMETHING_ELSE",
      score: 2.5,
    };
    expect(SemanticClassificationSchema.safeParse(invalid).success).toBe(false);
  });

  it("resolves deterministically when no API key is set", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.SEMANTIC_CLASSIFIER_API_KEY;
    delete process.env.AI_API_KEY;

    const res = await classifySupportText(
      "你可以保證我不會害人嗎？我很擔心"
    );

    expect(res.category).toBe("REASSURANCE_SEEKING");
    expect(res.score).toBeGreaterThan(0.7);
  });

  it("uses deterministic fast path for crisis without calling LLM", async () => {
    process.env.OPENAI_API_KEY = "mock-key";
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const res = await classifySupportText("我現在要跳了，大家永別了");

    expect(res.category).toBe("CRISIS");
    // Fast path: crisis is handled deterministically, never outsourced
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("invokes mocked LLM adapter for ambiguous cases and parses valid Zod output", async () => {
    process.env.OPENAI_API_KEY = "mock-key";

    const mockLlmResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              category: "REASSURANCE_SEEKING",
              score: 0.78,
              evidence: ["隱晦的確認語氣"],
              uncertainty: 0.22,
            }),
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockLlmResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // Short, ambiguous question
    const res = await classifySupportText("這樣算不算有問題呢？");

    expect(res.category).toBe("REASSURANCE_SEEKING");
    expect(res.score).toBe(0.78);
  });

  it("safely falls back to deterministic result when LLM returns invalid JSON or fails", async () => {
    process.env.OPENAI_API_KEY = "mock-key";

    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network timeout"));

    const res = await classifySupportText("這樣算不算有問題呢？");

    // Falls back gracefully without throwing
    expect(res).toBeDefined();
    expect(["NEUTRAL", "REASSURANCE_SEEKING"]).toContain(res.category);
  });
});
