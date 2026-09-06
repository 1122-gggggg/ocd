import { GOLDEN_DATASET, GoldenCase, GoldenCategory } from "./golden-dataset";
import { runSupportPipeline } from "@/lib/support/pipeline";

export interface EvaluationItemResult {
  id: string;
  text: string;
  expected: GoldenCategory;
  predicted: GoldenCategory;
  isCorrect: boolean;
  score: number;
  uncertainty: number;
  evidence: string[];
}

export interface CategoryMetric {
  category: GoldenCategory;
  totalExpected: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface EvaluationReport {
  totalCases: number;
  correctCases: number;
  accuracy: number;
  categoryMetrics: Record<GoldenCategory, CategoryMetric>;
  misclassified: EvaluationItemResult[];
}

function derivePipelineCategory(
  safetyCrisis: boolean,
  isReassurance: boolean,
  hasLoop: boolean
): GoldenCategory {
  if (safetyCrisis) return "CRISIS";
  if (isReassurance) return "REASSURANCE";
  if (hasLoop) return "COMPULSION";
  return "NEUTRAL";
}

export async function evaluatePipeline(
  dataset: readonly GoldenCase[] = GOLDEN_DATASET
): Promise<EvaluationReport> {
  const itemResults: EvaluationItemResult[] = [];

  const categories: GoldenCategory[] = [
    "REASSURANCE",
    "COMPULSION",
    "CRISIS",
    "NEUTRAL",
  ];

  const metricsMap: Record<GoldenCategory, CategoryMetric> = {
    REASSURANCE: {
      category: "REASSURANCE",
      totalExpected: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      f1: 0,
    },
    COMPULSION: {
      category: "COMPULSION",
      totalExpected: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      f1: 0,
    },
    CRISIS: {
      category: "CRISIS",
      totalExpected: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      f1: 0,
    },
    NEUTRAL: {
      category: "NEUTRAL",
      totalExpected: 0,
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      precision: 0,
      recall: 0,
      f1: 0,
    },
  };

  for (const item of dataset) {
    metricsMap[item.expectedCategory].totalExpected++;

    const pipeline = await runSupportPipeline({
      sourceType: "POST",
      text: item.text,
      logInteraction: false,
    });

    const predicted = derivePipelineCategory(
      pipeline.safety.isCrisis,
      pipeline.reassurance.isReassurance,
      pipeline.loop.hasLoopPattern
    );

    const isCorrect = predicted === item.expectedCategory;

    if (isCorrect) {
      metricsMap[predicted].truePositives++;
    } else {
      metricsMap[predicted].falsePositives++;
      metricsMap[item.expectedCategory].falseNegatives++;
    }

    const evidence = [
      ...pipeline.safety.evidence,
      ...pipeline.reassurance.evidence,
      ...pipeline.loop.evidence,
    ];

    itemResults.push({
      id: item.id,
      text: item.text,
      expected: item.expectedCategory,
      predicted,
      isCorrect,
      score: pipeline.safety.isCrisis
        ? pipeline.safety.score
        : pipeline.reassurance.isReassurance
        ? pipeline.reassurance.score
        : pipeline.loop.score,
      uncertainty: pipeline.safety.isCrisis
        ? pipeline.safety.uncertainty
        : pipeline.reassurance.uncertainty,
      evidence,
    });
  }

  // Compute Precision, Recall, F1 for each category
  for (const cat of categories) {
    const m = metricsMap[cat];
    const prec =
      m.truePositives + m.falsePositives > 0
        ? m.truePositives / (m.truePositives + m.falsePositives)
        : 0;
    const rec =
      m.totalExpected > 0 ? m.truePositives / m.totalExpected : 0;
    const f1 = prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;

    m.precision = Math.round(prec * 100) / 100;
    m.recall = Math.round(rec * 100) / 100;
    m.f1 = Math.round(f1 * 100) / 100;
  }

  const correctCases = itemResults.filter((r) => r.isCorrect).length;
  const accuracy =
    dataset.length > 0
      ? Math.round((correctCases / dataset.length) * 100) / 100
      : 1;

  const misclassified = itemResults.filter((r) => !r.isCorrect);

  return {
    totalCases: dataset.length,
    correctCases,
    accuracy,
    categoryMetrics: metricsMap,
    misclassified,
  };
}
