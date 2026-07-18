"use client";

import { useEffect } from "react";
import { AIN, AIN_TIP_X, type AinVariant } from "@/lib/ain";
import { useAinVariant } from "./identity-provider";

/**
 * The ع as a native CSS cursor: rendered by the OS, so it sits exactly on
 * the pointer with zero lag. Two states — parchment with an ink outline for
 * rest, neon orange over anything interactive. Falls back to the system
 * cursor wherever SVG cursors are unsupported, and stays out of the way on
 * touch devices.
 */

const CURSOR_HEIGHT = 30;

function cursorUri(variant: AinVariant, fill: string, outline: string) {
  const shape = AIN[variant];
  const width = Math.round((shape.width / shape.height) * CURSOR_HEIGHT);
  // stroke in viewBox units so the outline survives downscaling
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${shape.width} ${shape.height}" width="${width}" height="${CURSOR_HEIGHT}">` +
    `<path d="${shape.path}" fill="${fill}" stroke="${outline}" stroke-width="22" paint-order="stroke" fill-rule="evenodd"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function hotspot(variant: AinVariant) {
  const shape = AIN[variant];
  const scale = CURSOR_HEIGHT / shape.height;
  return { x: Math.round(AIN_TIP_X[variant] * scale), y: 1 };
}

export function AinCursor() {
  const { variant } = useAinVariant();

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const rest = cursorUri(variant, "#ecdfc7", "#14100b");
    const hot = cursorUri(variant, "#ff6a00", "#14100b");
    const { x, y } = hotspot(variant);

    const style = document.createElement("style");
    style.setAttribute("data-ain-cursor", "");
    style.textContent = `
      html, body {
        cursor: ${rest} ${x} ${y}, auto;
      }
      a, button, [role="button"], input, select, textarea, summary, label, [data-cursor="pointer"] {
        cursor: ${hot} ${x} ${y}, pointer;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [variant]);

  return null;
}
