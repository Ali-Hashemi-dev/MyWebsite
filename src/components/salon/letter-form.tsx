"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { CONTACT_EMAIL, PEN_NAME, SITE_TITLE } from "@/data/site-config";

const fieldStyle: CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  borderColor: "var(--line)",
  color: "var(--parchment)",
  font: "inherit"
};

/**
 * رسالة إلى عين — a zero-backend letter. Submitting opens the reader's own
 * mail client via mailto:, so nothing ever passes through a server.
 */
export function LetterForm() {
  const [name, setName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pseudonym = name.trim();
    const text = message.trim();
    if (!pseudonym || !text) return;

    const lines = [`الاسم المستعار: ${pseudonym}`];
    const reply = replyTo.trim();
    if (reply) lines.push(`البريد للرد: ${reply}`);
    lines.push("", text);

    const subject = encodeURIComponent(`رسالة من ${pseudonym} — ${SITE_TITLE}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <form dir="rtl" onSubmit={handleSubmit} className="space-y-5" aria-label={`رسالة خاصة إلى ${PEN_NAME}`}>
      {/* accent focus ring for the letter fields */}
      <style>{`.salon-field:focus{outline:2px solid var(--accent);outline-offset:1px}`}</style>

      <div>
        <label htmlFor="letter-name" className="mb-2 block text-sm text-parchment-dim">
          الاسم المستعار
        </label>
        <input
          id="letter-name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="كما تحب أن تُنادى"
          className="salon-field w-full rounded-lg border px-4 py-3 text-sm"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="letter-reply" className="mb-2 block text-sm text-parchment-dim">
          البريد للرد <span className="text-xs" style={{ color: "var(--warm-gray)" }}>(اختياري)</span>
        </label>
        <input
          id="letter-reply"
          type="email"
          dir="ltr"
          value={replyTo}
          onChange={(event) => setReplyTo(event.target.value)}
          placeholder="you@example.com"
          className="salon-field w-full rounded-lg border px-4 py-3 text-left text-sm"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="letter-message" className="mb-2 block text-sm text-parchment-dim">
          الرسالة
        </label>
        <textarea
          id="letter-message"
          required
          rows={7}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="اكتب ما لا يُقال في العلن…"
          className="salon-field w-full resize-y rounded-lg border px-4 py-3 text-sm leading-loose"
          style={fieldStyle}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          className="salon-field rounded-full border px-8 py-3 text-sm tracking-wider transition-colors hover:text-accent"
          style={{
            borderColor: "rgba(201,168,106,0.4)",
            background: "none",
            color: "var(--gold)",
            font: "inherit",
            cursor: "pointer"
          }}
        >
          أرسل الرسالة
        </button>
        <p className="m-0 text-xs font-light" style={{ color: "var(--warm-gray)" }}>
          الرسالة تُرسَل من بريدك أنت مباشرة؛ لا خوادم بيننا.
        </p>
      </div>
    </form>
  );
}
