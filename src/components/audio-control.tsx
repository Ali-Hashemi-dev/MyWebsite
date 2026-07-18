"use client";

import { useEffect, useRef, useState } from "react";
import { ambience, AMBIENCE_STORAGE_KEY } from "@/lib/ambience";

type Stored = { on: boolean; volume: number };

function readStored(): Stored {
  try {
    const raw = window.localStorage.getItem(AMBIENCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Stored>;
      return {
        on: Boolean(parsed.on),
        volume: typeof parsed.volume === "number" ? Math.min(1, Math.max(0, parsed.volume)) : 0.6
      };
    }
  } catch {
    /* fall through to defaults */
  }
  return { on: false, volume: 0.6 };
}

/**
 * The ambience lantern: a small fixed control that turns the library's
 * soundscape on or off and adjusts its volume. Preference is remembered;
 * if it was on, the sound resumes on the first click or key press of the
 * next visit (browsers require a gesture before audio).
 */
export function AudioControl() {
  const [on, setOn] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [open, setOpen] = useState(false);
  const armedRef = useRef(false);

  /* restore preference; if it was on, arm a one-time resume gesture */
  useEffect(() => {
    const stored = readStored();
    setVolume(stored.volume);
    if (!stored.on) return;

    setOn(true);
    const resume = () => {
      if (!armedRef.current) return;
      armedRef.current = false;
      ambience.start(readStored().volume);
    };
    armedRef.current = true;
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      armedRef.current = false;
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  /* whisper ticks on hover over anything interactive, while ambience is on */
  useEffect(() => {
    if (!on) return;
    let lastTick = 0;
    function onOver(event: PointerEvent) {
      const target = event.target as Element | null;
      if (!target?.closest?.("a, button, [role='button'], [data-cursor='pointer']")) return;
      const now = performance.now();
      if (now - lastTick < 140) return;
      lastTick = now;
      ambience.playHover();
    }
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => window.removeEventListener("pointerover", onOver);
  }, [on]);

  function persist(next: Partial<Stored>) {
    const current = readStored();
    window.localStorage.setItem(AMBIENCE_STORAGE_KEY, JSON.stringify({ ...current, ...next }));
  }

  function toggle() {
    armedRef.current = false;
    if (on) {
      ambience.stop();
      setOn(false);
      persist({ on: false });
    } else {
      ambience.start(volume);
      ambience.playChime(293.7);
      setOn(true);
      persist({ on: true });
    }
  }

  function onVolume(next: number) {
    setVolume(next);
    ambience.setVolume(next);
    persist({ volume: next });
  }

  return (
    <div
      className="fixed bottom-5 left-5 z-[95] flex items-center gap-3"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={toggle}
        onFocus={() => setOpen(true)}
        aria-pressed={on}
        aria-label={on ? "أطفئ صوت المكتبة" : "شغّل صوت المكتبة"}
        title={on ? "أطفئ صوت المكتبة" : "شغّل صوت المكتبة"}
        className="grid h-12 w-12 place-items-center rounded-full border transition-all duration-300"
        style={{
          borderColor: on ? "var(--accent)" : "var(--line)",
          background: "rgba(18, 13, 9, 0.82)",
          color: on ? "var(--accent)" : "var(--warm-gray)",
          boxShadow: on ? "0 0 24px rgba(255,106,0,0.25)" : "0 8px 24px rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)"
        }}
      >
        {/* lantern flame / sound waves */}
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            d="M12 4 C12 4 7.5 9.2 7.5 13 A4.5 4.5 0 0 0 16.5 13 C16.5 9.2 12 4 12 4 Z"
            fill={on ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
          >
            {on ? (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1 1;1.06 0.97;0.97 1.05;1 1"
                keyTimes="0;0.3;0.7;1"
                dur="2.6s"
                repeatCount="indefinite"
                additive="sum"
              />
            ) : null}
          </path>
          <line x1="12" y1="17.5" x2="12" y2="20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className="flex items-center gap-2 overflow-hidden rounded-full border px-3 transition-all duration-500"
        style={{
          borderColor: "var(--line)",
          background: "rgba(18, 13, 9, 0.82)",
          backdropFilter: "blur(8px)",
          width: open || on ? "9.5rem" : 0,
          opacity: open || on ? 1 : 0,
          paddingTop: "0.55rem",
          paddingBottom: "0.55rem",
          borderWidth: open || on ? 1 : 0
        }}
        aria-hidden={!(open || on)}
      >
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(event) => onVolume(Number(event.target.value) / 100)}
          aria-label="مستوى صوت المكتبة"
          dir="ltr"
          style={{ width: "100%", accentColor: "var(--accent)" }}
          tabIndex={open || on ? 0 : -1}
        />
      </div>
    </div>
  );
}
