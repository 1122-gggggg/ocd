import { describe, it, expect } from "vitest";
import { evaluatePipeline } from "./evaluator";
import { GOLDEN_DATASET } from "./golden-dataset";

describe("Golden Dataset Automated Evaluation (Phase 18)", () => {
  it("dataset satisfies size and distribution constraints", () => {
    expect(GOLDEN_DATASET.length).toBeGreaterThanOrEqual(30);

    const counts = {
      REASSURANCE: 0,
      COMPULSION: 0,
      CRISIS: 0,
      NEUTRAL: 0,
    };

    for (const c of GOLDEN_DATASET) {
      counts[c.expectedCategory]++;
    }

    expect(counts.REASSURANCE).toBeGreaterThanOrEqual(8);
    expect(counts.COMPULSION).toBeGreaterThanOrEqual(8);
    expect(counts.CRISIS).toBeGreaterThanOrEqual(8);
    expect(counts.NEUTRAL).toBeGreaterThanOrEqual(8);
  });

  it("evaluates pipeline against golden dataset with high accuracy", async () => {
    const report = await evaluatePipeline(GOLDEN_DATASET);

    if (report.misclassified.length > 0) {
      console.log(
        "Misclassified cases:",
        report.misclassified.map((m) => ({
          id: m.id,
          expected: m.expected,
          predicted: m.predicted,
          text: m.text,
        }))
      );
    }

    expect(report.totalCases).toBe(GOLDEN_DATASET.length);
    // Expect at least 85% accuracy across all diverse colloquial, negation, news, and English cases
    expect(report.accuracy).toBeGreaterThanOrEqual(0.85);

    // Crisis recall should be 100% (Safety critical)
    const crisisMetrics = report.categoryMetrics.CRISIS;
    expect(crisisMetrics.recall).toBe(1.0);
  });
});
