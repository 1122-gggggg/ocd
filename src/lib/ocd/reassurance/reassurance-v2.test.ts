import { describe, it, expect } from "vitest";
import { detectReassurance } from "./detector";

describe("Reassurance Detector V2 (Phase 7)", () => {
  it("returns structured result with evidence, score, uncertainty, and matchedRuleIds", () => {
    const res = detectReassurance(
      "你可以保證我不會害人嗎？求大家告訴我沒事"
    );

    expect(res.isReassurance).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(0.7);
    expect(res.uncertainty).toBeLessThanOrEqual(0.5);
    expect(res.matchedRuleIds.length).toBeGreaterThan(0);
    expect(res.evidence.length).toBeGreaterThan(0);
    expect(res.subtypes.length).toBeGreaterThan(0);
  });

  it("detects existential reassurance", () => {
    const res = detectReassurance(
      "這世界真的存在嗎？我的意識會不會只是唯我論的幻覺？請告訴我這是真實的！"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("EXISTENTIAL");
  });

  it("detects scrupulosity moral checking", () => {
    const res = detectReassurance(
      "我腦中閃過這個念頭，我是不是個罪人？神會不會懲罰我？"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("SCRUPULOSITY");
  });

  it("detects false memory reassurance seeking", () => {
    const res = detectReassurance(
      "我昨天開車過去那條路，剛才一直怕自己撞到人，大家可以幫我確認剛才那條路有沒有車禍嗎？"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("FALSE_MEMORY");
  });

  it("detects body checking reassurance", () => {
    const res = detectReassurance(
      "量了心跳一分鐘85下到底有沒有危險？照鏡子檢查皮膚這樣算正常嗎？"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("BODY_CHECKING");
  });

  it("detects relationship checking (ROCD)", () => {
    const res = detectReassurance(
      "我是不是真的不愛我伴侶？看到別人覺得帥算不算不愛？要不要分手？"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("RELATIONSHIP_CHECKING");
  });

  it("detects mental checking (Pure O)", () => {
    const res = detectReassurance(
      "腦中跳出這個髒話念頭是不是代表我想做？大家也會這樣想嗎？"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("MENTAL_CHECKING");
  });

  it("detects Google reassurance loops", () => {
    const res = detectReassurance(
      "Google 搜尋查了整整一下午，網路說會致癌，越查越害怕但還是忍不住查，請大家幫我確認"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("GOOGLE_REASSURANCE");
  });

  it("detects AI reassurance requests", () => {
    const res = detectReassurance(
      "問了 ChatGPT 好多次它說我很正常，但我還是想要你保證，你可以承諾我不會生病嗎？"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("AI_REASSURANCE");
  });

  it("detects reassurance via partner / family", () => {
    const res = detectReassurance(
      "我今天一直逼問老公我有沒有做錯事，問了他十遍他有沒有生氣"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("PARTNER_REASSURANCE");
  });

  it("detects reassurance via repeated testing", () => {
    const res = detectReassurance(
      "快篩做了三次都陰性，可是會不會不準？我還是好怕，請大家替我確認"
    );
    expect(res.isReassurance).toBe(true);
    expect(res.subtypes).toContain("REPEATED_TESTING");
  });

  it("correctly handles recovery statements as non-reassurance (negation / resistance)", () => {
    const res = detectReassurance(
      "我今天終於沒有查 Google，成功抵抗了想要確認的衝動！"
    );
    expect(res.isReassurance).toBe(false);
    expect(res.score).toBeLessThan(0.3);
  });
});
