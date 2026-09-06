import { describe, it, expect } from "vitest";
import { analyzeSupportText } from "./engine";

describe("OCD Support Engine", () => {
  it("escalates crisis text to CRISIS with 1925 hotline", () => {
    const res = analyzeSupportText("我好痛苦，真的不想活了，想了結生命");
    expect(res.detectedType).toBe("CRISIS");
    expect(res.recommendedAction).toBe("CRISIS_ESCALATE");
    expect(res.options.some((o) => o.id === "call_1925")).toBe(true);
  });

  it("identifies reassurance seeking without giving false reassurance", () => {
    const res = analyzeSupportText("我剛剛碰到門把洗了三次手，這樣到底會不會感染生病？請保證我沒事");
    expect(res.detectedType).toBe("REASSURANCE_SEEKING");
    expect(res.recommendedAction).toBe("EMPATHY_SHIELD");
    expect(res.message).toContain("IOCDF");
    expect(res.options.some((o) => o.actionType === "URGE_SURFING")).toBe(true);
  });

  it("identifies checking compulsion loop and provides loop education", () => {
    const res = analyzeSupportText("出門後我一直重複回去檢查瓦斯跟門鎖好幾次，拍了照片還是不放心");
    expect(res.detectedType).toBe("COMPULSION_LOOP");
    expect(res.recommendedAction).toBe("LOOP_EDUCATION");
    expect(res.title).toContain("反覆檢查行為");
  });

  it("classifies healthy peer support as neutral empathy", () => {
    const res = analyzeSupportText("今天雖然還是有點焦慮，但我依然去了圖書館把報告寫完了，感到踏實");
    expect(res.detectedType).toBe("NEUTRAL");
    expect(res.recommendedAction).toBe("EMPATHY_SHIELD");
  });
});
