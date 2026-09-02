import { registerUser } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-[#E5E0D5] p-6 space-y-4">
      <h1 className="text-xl font-bold">註冊</h1>
      <form action={registerUser as any} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input name="email" type="email" required className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">密碼（至少 8 字）</label>
          <input name="password" type="password" required minLength={8} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">暱稱（2–24 字）</label>
          <input name="nickname" required minLength={2} maxLength={24} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">身分</label>
          <select name="memberType" className="mt-1 w-full border rounded px-3 py-2">
            <option value="PATIENT">病友</option>
            <option value="FAMILY">家屬</option>
            <option value="CLINICIAN">臨床者</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">臨床者需另行驗證，註冊後請至「臨床申請」提交證明。</p>
        </div>
        <button type="submit" className="w-full py-2 rounded bg-[#2F6F6A] text-white hover:bg-[#255A55]">
          註冊並登入
        </button>
      </form>
      <div className="text-sm text-center">
        已有帳號？{" "}
        <Link href="/login" className="underline text-[#2F6F6A]">
          登入
        </Link>
      </div>
    </div>
  );
}
