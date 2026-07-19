"use client";

import { DEFAULT_AIN_VARIANT, type AinVariant } from "@/lib/ain";

/**
 * The site identity is fixed: the open-eyed ع (variant "c") is the seal
 * everywhere. The old identity lab let visitors switch variants; that
 * choice was retired, but the hook stays so seals and the cursor read the
 * variant from one place.
 */
export function useAinVariant(): { variant: AinVariant } {
  return { variant: DEFAULT_AIN_VARIANT };
}
