"use client";

import { useEffect, useState } from "react";
import { GITHUB } from "@/data/site-config";
import { getStoredToken, setStoredToken, verifyToken } from "@/lib/github";

type TokenStatus =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string }
  | { kind: "cleared" };

const fieldStyle = { borderColor: "var(--line)", background: "rgba(255,255,255,0.02)", font: "inherit" };
const pillButtonClass = "rounded-full border px-4 py-1.5 text-sm transition-colors hover:text-accent disabled:opacity-40";
const pillButtonStyle = { borderColor: "var(--line)", background: "none", color: "var(--warm-gray)", font: "inherit" };

/** GitHub token manager + a reminder of where publishes actually land. */
export function SettingsPanel() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<TokenStatus>({ kind: "idle" });
  const [verifying, setVerifying] = useState(false);

  // Prefill from localStorage after mount; the password input keeps it masked.
  useEffect(() => {
    setToken(getStoredToken());
  }, []);

  async function save() {
    const value = token.trim();
    if (!value) {
      setStatus({ kind: "error", message: "ألصق الرمز أولاً" });
      return;
    }
    setVerifying(true);
    setStatus({ kind: "idle" });
    try {
      const login = await verifyToken(value);
      setStoredToken(value);
      setStatus({ kind: "ok", message: login ? `متصل باسم ${login}` : "تم الاتصال بالمستودع" });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "تعذّر التحقق من الرمز" });
    } finally {
      setVerifying(false);
    }
  }

  function clear() {
    setStoredToken("");
    setToken("");
    setStatus({ kind: "cleared" });
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display m-0 text-2xl text-parchment">مفتاح النشر</h2>
      <p className="mt-2 mb-5 text-sm text-warm-gray">
        كل نشرٍ هو إيداع git حقيقي في المستودع؛ يوقّعه رمز وصول يبقى في هذا المتصفح وحده.
      </p>

      <label className="mb-1 block text-xs tracking-wider text-bronze" htmlFor="admin-token">
        رمز GitHub
      </label>
      <input
        id="admin-token"
        dir="ltr"
        type="password"
        autoComplete="off"
        value={token}
        onChange={(event) => {
          setToken(event.target.value);
          setStatus({ kind: "idle" });
        }}
        placeholder="github_pat_…"
        className="w-full rounded-lg border px-3 py-2 text-parchment"
        style={fieldStyle}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={verifying}
          aria-label="احفظ رمز GitHub بعد التحقق منه"
          className="rounded-full px-5 py-2 font-bold transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--ink)", border: "none", font: "inherit", fontWeight: 700 }}
        >
          {verifying ? "يُتحقق…" : "حفظ"}
        </button>
        <button
          type="button"
          onClick={clear}
          aria-label="امسح رمز GitHub من هذا المتصفح"
          className={pillButtonClass}
          style={pillButtonStyle}
        >
          امسح الرمز
        </button>
        {status.kind === "ok" ? (
          <span role="status" className="text-sm" style={{ color: "var(--gold)" }}>{status.message}</span>
        ) : null}
        {status.kind === "error" ? (
          <span role="alert" className="text-sm" style={{ color: "var(--accent-soft)" }}>{status.message}</span>
        ) : null}
        {status.kind === "cleared" ? (
          <span role="status" className="text-sm text-warm-gray">مُسح الرمز من هذا المتصفح</span>
        ) : null}
      </div>

      {/* setup instructions */}
      <ol className="mt-8 mb-0 list-decimal space-y-2 pr-5 text-sm leading-relaxed text-parchment-dim">
        <li>
          أنشئ من إعدادات GitHub رمز وصول شخصياً دقيق الصلاحيات
          (Developer settings ← Fine-grained personal access tokens).
        </li>
        <li>
          قصر الرمز على هذا المستودع وحده:{" "}
          <span dir="ltr" style={{ color: "var(--gold)" }}>{GITHUB.owner}/{GITHUB.repo}</span>.
        </li>
        <li>
          امنحه صلاحية واحدة فقط: <span dir="ltr">Contents — Read and write</span>، ولا شيء غيرها.
        </li>
        <li>
          ألصق الرمز أعلاه واضغط «حفظ». الرمز لا يغادر هذا المتصفح أبداً — يُخزَّن في localStorage فقط،
          ولا يُودَع في المستودع.
        </li>
        <li>
          لتغيير رمز الدخول إلى المكتب، عدّل <span dir="ltr">ADMIN_PIN_HASH</span> في{" "}
          <span dir="ltr">src/data/site-config.ts</span>.
        </li>
      </ol>

      {/* publish target */}
      <div className="mt-8 rounded-xl border p-5" style={{ borderColor: "var(--line)" }}>
        <h3 className="font-display m-0 mb-3 text-lg text-parchment">وجهة النشر</h3>
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
          <dt className="text-bronze">المستودع</dt>
          <dd className="m-0" dir="ltr" style={{ color: "var(--parchment-dim)", textAlign: "right" }}>
            {GITHUB.owner}/{GITHUB.repo}
          </dd>
          <dt className="text-bronze">الفرع</dt>
          <dd className="m-0" dir="ltr" style={{ color: "var(--parchment-dim)", textAlign: "right" }}>
            {GITHUB.branch}
          </dd>
          <dt className="text-bronze">المجلد</dt>
          <dd className="m-0" dir="ltr" style={{ color: "var(--parchment-dim)", textAlign: "right" }}>
            {GITHUB.contentDir}
          </dd>
        </dl>
      </div>
    </div>
  );
}
