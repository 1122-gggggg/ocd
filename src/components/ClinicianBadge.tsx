export function ClinicianBadge({ status }: { status: string }) {
  if (status === "VERIFIED") {
    return <span className="badge badge-success">✓ 驗證臨床人員</span>;
  }
  if (status === "PENDING") {
    return <span className="badge">審核中</span>;
  }
  return null;
}
