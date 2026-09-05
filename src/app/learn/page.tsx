import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import { entries as symptomsA } from "@/data/learn/symptoms-a";
import { entries as symptomsB } from "@/data/learn/symptoms-b";
import { entries as symptomsC } from "@/data/learn/symptoms-c";
import { entries as treatmentsA } from "@/data/learn/treatments-a";
import { entries as treatmentsB } from "@/data/learn/treatments-b";
import { entries as treatmentsC } from "@/data/learn/treatments-c";
import { entries as clinicsNorth } from "@/data/learn/clinics-north";
import { entries as clinicsCentral } from "@/data/learn/clinics-central";
import { entries as clinicsSouth } from "@/data/learn/clinics-south";
import { entries as clinicsEast } from "@/data/learn/clinics-east";

export const metadata: Metadata = {
  title: "學習資源區",
  description: "用溫和的方式認識強迫症的常見表現與實證解法，並找到全台診療名錄。",
};

const symptoms = [...symptomsA, ...symptomsB, ...symptomsC].filter(
  (e) => e.group === "SYMPTOM",
);
const treatments = [...treatmentsA, ...treatmentsB, ...treatmentsC].filter(
  (e) => e.group === "TREATMENT",
);
const clinicCount =
  clinicsNorth.length +
  clinicsCentral.length +
  clinicsSouth.length +
  clinicsEast.length;

function excerpt(text: string, max = 72): string {
  const flat = text.replace(/\s+/g, "");
  return flat.length > max ? `${flat.slice(0, max)}……` : flat;
}

export default function LearnIndexPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "首頁", href: "/" }, { label: "學習資源區" }]}
      />
      <PageHeader
        title="學習資源區"
        description="用溫和、不帶評價的方式，認識強迫症的常見表現、具實證基礎的解法，以及可以求助的地方。"
      />
      <p className="text-xs text-subtle leading-relaxed">
        本區內容僅供學習與經驗交流，不是醫療診斷或處方；若困擾持續影響生活，請諮詢精神科、身心科或心理專業人員。
      </p>

      <section aria-labelledby="learn-symptoms" className="space-y-3">
        <h2 id="learn-symptoms" className="section-title">
          症狀認識
          <span className="text-xs font-normal text-subtle">
            {symptoms.length} 篇
          </span>
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {symptoms.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/learn/${entry.slug}`}
                className="card card-pad card-link space-y-1.5"
              >
                <p className="font-medium text-fg">{entry.condition}</p>
                <p className="text-sm text-muted leading-relaxed">
                  {excerpt(entry.overview)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learn-treatments" className="space-y-3">
        <h2 id="learn-treatments" className="section-title">
          治療解法
          <span className="text-xs font-normal text-subtle">
            {treatments.length} 篇
          </span>
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {treatments.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/learn/${entry.slug}`}
                className="card card-pad card-link space-y-1.5"
              >
                <p className="font-medium text-fg">{entry.condition}</p>
                <p className="text-sm text-muted leading-relaxed">
                  {excerpt(entry.overview)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learn-clinics" className="space-y-3">
        <h2 id="learn-clinics" className="section-title">
          求助管道
        </h2>
        <Link
          href="/learn/clinics"
          className="card card-pad card-link flex flex-wrap items-center justify-between gap-3"
        >
          <span className="space-y-1">
            <span className="block font-medium text-fg">
              全台診療名錄
              <span className="badge ml-2">{clinicCount} 間</span>
            </span>
            <span className="block text-sm text-muted leading-relaxed">
              依北、中、南、東分區整理官網可驗證的診療單位，找離你近的協助。
            </span>
          </span>
          <span aria-hidden="true" className="text-accent">
            →
          </span>
        </Link>
      </section>
    </div>
  );
}
