import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, PageHeader } from "@/components/ui";
import type { ClinicRegion } from "@/data/clinics";
import { entries as clinicsNorth } from "@/data/learn/clinics-north";
import { entries as clinicsCentral } from "@/data/learn/clinics-central";
import { entries as clinicsSouth } from "@/data/learn/clinics-south";
import { entries as clinicsEast } from "@/data/learn/clinics-east";

export const metadata: Metadata = {
  title: "全台診療名錄",
  description: "依北、中、南、東分區整理的強迫症診療單位名錄，僅供參考。",
};

type RegionFilter = ClinicRegion | "all";

const REGIONS: { key: RegionFilter; label: string; href: string }[] = [
  { key: "all", label: "全部", href: "/learn/clinics" },
  { key: "north", label: "北部", href: "/learn/clinics?region=north" },
  { key: "central", label: "中部", href: "/learn/clinics?region=central" },
  { key: "south", label: "南部", href: "/learn/clinics?region=south" },
  { key: "east", label: "東部", href: "/learn/clinics?region=east" },
];

const byRegion = {
  north: clinicsNorth,
  central: clinicsCentral,
  south: clinicsSouth,
  east: clinicsEast,
} as const;

export default async function ClinicsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const sp = await searchParams;
  const requested = sp?.region;
  const region: RegionFilter =
    requested === "north" ||
    requested === "central" ||
    requested === "south" ||
    requested === "east"
      ? requested
      : "all";

  const visible =
    region === "all"
      ? [...clinicsNorth, ...clinicsCentral, ...clinicsSouth, ...clinicsEast]
      : byRegion[region];

  const total =
    clinicsNorth.length +
    clinicsCentral.length +
    clinicsSouth.length +
    clinicsEast.length;
  const counts: Record<RegionFilter, number> = {
    all: total,
    north: clinicsNorth.length,
    central: clinicsCentral.length,
    south: clinicsSouth.length,
    east: clinicsEast.length,
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "首頁", href: "/" },
          { label: "學習資源區", href: "/learn" },
          { label: "全台診療名錄" },
        ]}
      />
      <PageHeader
        title="全台診療名錄"
        description={`共收錄 ${total} 間官網可驗證的診療單位，依分區整理。`}
      />

      <div role="note" className="card card-pad space-y-1">
        <p className="text-sm font-medium text-fg">使用前請先了解</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted leading-relaxed">
          <li>本名錄僅供參考，排序不具任何推薦意涵。</li>
          <li>門診時間與掛號方式可能變動，就醫前請自行向各單位確認。</li>
          <li>只收錄官網可查的市話或掛號專線，不收錄私人聯絡方式。</li>
        </ul>
      </div>

      <nav aria-label="分區" className="flex flex-wrap gap-2">
        {REGIONS.map((tab) => {
          const active = tab.key === region;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={active ? "btn btn-primary" : "btn btn-secondary"}
            >
              {tab.label}（{counts[tab.key]}）
            </Link>
          );
        })}
      </nav>

      <ul className="grid gap-3 sm:grid-cols-2">
        {visible.map((clinic) => (
          <li key={clinic.name} className="card card-pad space-y-2">
            <p className="font-medium text-fg">{clinic.name}</p>
            <p className="text-xs text-subtle">{clinic.county}</p>
            {clinic.address && (
              <p className="text-sm text-muted leading-relaxed">
                {clinic.address}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {clinic.phone && (
                <a
                  href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                  className="text-accent underline underline-offset-2"
                >
                  {clinic.phone}
                </a>
              )}
              <a
                href={clinic.url}
                target="_blank"
                rel="noopener"
                className="text-accent underline underline-offset-2 break-all"
              >
                官網
              </a>
            </div>
            {clinic.features.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {clinic.features.map((feature) => (
                  <li key={feature} className="badge">
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            {clinic.note && (
              <p className="text-xs text-subtle leading-relaxed">
                {clinic.note}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
