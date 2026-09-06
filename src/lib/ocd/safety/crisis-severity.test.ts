import { describe, it, expect } from "vitest";
import { detectSafetyCrisis } from "./crisis";

describe("Crisis Safety V2 Severity Classification (Phase 9)", () => {
  it("detects IMMINENT_DANGER with emergency guidance and high confidence", () => {
    const res = detectSafetyCrisis(
      "我現在已經準備結束生命，遺書寫好了，大家永別了"
    );

    expect(res.severity).toBe("IMMINENT_DANGER");
    expect(res.isCrisis).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(0.95);
    expect(res.helpText).toContain("1925");
    expect(res.guidanceText).toContain("119");
    expect(res.guidanceText).not.toContain("你怎麼可以");
  });

  it("detects ACTIVE_RISK with professional helpline prompt", () => {
    const res = detectSafetyCrisis("我好痛苦真的好想死，想要了結生命");

    expect(res.severity).toBe("ACTIVE_RISK");
    expect(res.isCrisis).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(0.85);
    expect(res.helpText).toContain("1925");
  });

  it("detects PASSIVE_IDEATION without alarmist or shaming language", () => {
    const res = detectSafetyCrisis(
      "活著好累，真希望能睡著就再也不要醒來，消失在這個世界上"
    );

    expect(res.severity).toBe("PASSIVE_IDEATION");
    expect(res.isCrisis).toBe(true);
    expect(res.guidanceText).toContain("在這裡，你的疲累被理解與接納");
  });

  it("differentiates news or third-person mention from active personal crisis", () => {
    const res = detectSafetyCrisis(
      "我昨天看到新聞提到有人跳樓自殺，覺得很令人難過"
    );

    expect(res.severity).toBe("NONE");
    expect(res.isCrisis).toBe(false);
    expect(res.score).toBeLessThan(0.3);
  });

  it("differentiates past event recovery reflection from current crisis", () => {
    const res = detectSafetyCrisis(
      "以前我常常想死，但走過來之後，我很慶幸自己當初有堅持接受治療"
    );

    expect(res.severity).toBe("NONE");
    expect(res.isCrisis).toBe(false);
  });

  it("differentiates direct negation from active crisis", () => {
    const res = detectSafetyCrisis("我並沒有想自殺或尋死，大家請放心");

    expect(res.severity).toBe("NONE");
    expect(res.isCrisis).toBe(false);
  });

  it("detects emotional DISTRESS without suicidal ideation", () => {
    const res = detectSafetyCrisis(
      "今天工作被主管罵慘了，真的好崩潰好絕望，痛苦到快窒息"
    );

    expect(res.severity).toBe("DISTRESS");
    expect(res.isCrisis).toBe(false);
    expect(res.guidanceText).toContain("陪你一起耐受這份情緒浪潮");
  });
});
