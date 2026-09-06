import { describe, it, expect } from "vitest";
import { detectOcdLoop } from "./detector";

describe("OCD Loop & Compulsion Detector V2 (Phase 10)", () => {
  it("outputs structured stages for OCD Cycle visualization", () => {
    const res = detectOcdLoop(
      "出門後看到瓦斯爐，突然懷疑會不會釀成火災，焦慮到極點，折返回去檢查了三次門窗拍照存證"
    );

    expect(res.hasLoopPattern).toBe(true);
    expect(res.stages.trigger).toBeDefined();
    expect(res.stages.obsession).toBeDefined();
    expect(res.stages.anxiety).toBeDefined();
    expect(res.stages.compulsion).toBeDefined();
    expect(res.stages.temporaryRelief).toBeDefined();
    expect(res.compulsions.length).toBeGreaterThan(0);
    expect(res.compulsions[0]?.category).toBe("CHECKING");
  });

  it("detects multiple compulsions within a single description", () => {
    const res = detectOcdLoop(
      "出門折返回去檢查了三次門鎖，回家後又在心裡默念七次佛號來抵銷壞念頭，接著上網狂查病徵"
    );

    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.length).toBeGreaterThanOrEqual(2);
    const categories = res.compulsions.map((c) => c.category);
    expect(categories).toContain("CHECKING");
    expect(categories).toContain("PRAYER");
  });

  it("detects AVOIDANCE compulsion", () => {
    const res = detectOcdLoop("因為害怕特定數字，我繞路走了兩倍遠，不敢摸所有門把");
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "AVOIDANCE")).toBe(true);
  });

  it("detects GOOGLE_SEARCH compulsion", () => {
    const res = detectOcdLoop(
      "上網狂查醫學期刊跟論壇直到清晨四點，非要把每一種罕見病的症狀都一一比對完才敢睡"
    );
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "GOOGLE_SEARCH")).toBe(true);
  });

  it("detects BODY_CHECKING compulsion", () => {
    const res = detectOcdLoop(
      "坐在沙發上一整晚，一直按著脖子量脈搏心跳，還拿著小鏡子檢查皮膚"
    );
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "BODY_CHECKING")).toBe(true);
  });

  it("detects MENTAL_REPLAY compulsion", () => {
    const res = detectOcdLoop(
      "我剛剛一直回想剛才有沒有講錯話，在腦中把一小時前的對話逐字倒帶了四次"
    );
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "MENTAL_REPLAY")).toBe(true);
  });

  it("detects PRAYER / neutralizing rituals", () => {
    const res = detectOcdLoop(
      "腦中一出現壞念頭，我就必須在心裡默念七次『阿彌陀佛保佑我不是壞人』來抵銷消除它"
    );
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "PRAYER")).toBe(true);
  });

  it("detects COUNTING compulsion", () => {
    const res = detectOcdLoop("每次開燈必須連續敲三下開關，數到10才覺得平衡安全");
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "COUNTING")).toBe(true);
  });

  it("detects MENTAL_COMPULSION (pure mental neutralizer)", () => {
    const res = detectOcdLoop("在心裡想像一個好畫面來蓋過壞念頭，在大腦裡抵銷剛才的景象");
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "MENTAL_COMPULSION")).toBe(true);
  });

  it("detects CONFIRMATION seeking compulsion", () => {
    const res = detectOcdLoop("開車經過路口後，問身邊人「剛才有沒有撞到人」問了好幾遍");
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "CONFIRMATION")).toBe(true);
  });

  it("detects REPEATED_TESTING compulsion", () => {
    const res = detectOcdLoop("這週已經反覆快篩了五次，換了三個醫生重複做檢查");
    expect(res.hasLoopPattern).toBe(true);
    expect(res.compulsions.some((c) => c.category === "REPEATED_TESTING")).toBe(true);
  });
});
