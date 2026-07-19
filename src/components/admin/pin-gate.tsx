"use client";

import { useState, type FormEvent } from "react";
import { ADMIN_PIN_HASH } from "@/data/site-config";
import { AinMark } from "../ain-mark";

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The lock on the desk drawer. The PIN only opens the interface;
 * publishing rights come from the GitHub token in الإعدادات.
 */
export function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [checking, setChecking] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (checking || !pin) return;
    setChecking(true);
    try {
      const hash = await sha256Hex(pin);
      if (hash === ADMIN_PIN_HASH) {
        try {
          window.sessionStorage.setItem("ain-admin-unlocked", "1");
        } catch {
          /* storage unavailable — unlock still holds for this render */
        }
        onUnlock();
        return;
      }
      setPin("");
      setError("الرمز غير صحيح — حاول مرة أخرى");
      setShaking(true);
      window.setTimeout(() => setShaking(false), 500);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <style>{`@keyframes admin-gate-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
      <form
        onSubmit={submit}
        className="paper-dark w-full max-w-sm rounded-2xl border p-8 text-center"
        style={{
          borderColor: "var(--line)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          animation: shaking ? "admin-gate-shake 0.45s ease" : undefined
        }}
      >
        <div className="mb-4 flex justify-center" style={{ color: "var(--bronze)" }}>
          <AinMark variant="a" size={48} eye eyeColor="var(--accent)" />
        </div>
        <h1 className="font-display m-0 text-3xl text-parchment">المكتب السري</h1>
        <p className="mt-2 mb-6 text-sm text-warm-gray">أدخل رمز المكتب لفتح الدرج.</p>

        <input
          dir="ltr"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={pin}
          onChange={(event) => {
            setPin(event.target.value);
            setError("");
          }}
          aria-label="رمز الدخول إلى المكتب"
          className="w-full rounded-lg border bg-transparent px-4 py-3 text-center text-xl text-parchment"
          style={{ borderColor: "var(--line)", letterSpacing: "0.5em" }}
        />

        {error ? (
          <p role="alert" className="mt-3 mb-0 text-sm" style={{ color: "var(--accent-soft)" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={checking || !pin}
          aria-label="افتح المكتب"
          className="mt-5 w-full rounded-full px-5 py-2.5 font-bold transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--ink)", border: "none", font: "inherit", fontWeight: 700 }}
        >
          {checking ? "يُفتح…" : "افتح المكتب"}
        </button>

        <p className="mt-5 mb-0 text-xs leading-relaxed text-warm-gray" style={{ opacity: 0.8 }}>
          هذا الرمز يفتح المكتب فقط؛ النشر نفسه يتطلب رمز GitHub من الإعدادات.
        </p>
      </form>
    </div>
  );
}
