/**
 * The ع identity mark, traced from Ali's two letterform sketches.
 *
 * Variant "a" — the compact medial form: diagonal stroke + body with the
 * eye-shaped counter. Variant "b" — the final form with the descending tail.
 *
 * `eye` describes the ellipse that sits inside the letter's counter (the
 * white notch), used for the animated-eye treatment: a pupil that tracks the
 * pointer and an eyelid that blinks.
 */
export type AinVariant = "a" | "b";

export type AinShape = {
  viewBox: string;
  width: number;
  height: number;
  path: string;
  eye: { cx: number; cy: number; rx: number; ry: number; rotate: number };
};

export const AIN: Record<AinVariant, AinShape> = {
  a: {
    viewBox: "0 0 411 699",
    width: 411,
    height: 699,
    path: "M9.9 473.6 L0.0 467.5 L9.8 445.5 L168.0 135.5 L232.9 12.6 L239.9 0.9 L242.9 0.3 L251.7 5.5 L249.4 12.5 L26.2 446.5 L13.9 469.2 L9.9 473.6 Z M137.9 698.9 L126.9 694.1 L127.8 688.5 L166.9 603.7 L192.3 553.5 L191.9 552.4 L154.9 556.8 L132.9 554.1 L110.9 544.5 L102.7 538.5 L95.8 530.5 L90.4 519.5 L85.5 503.5 L83.0 481.5 L83.8 466.5 L87.6 446.5 L98.6 412.5 L110.9 385.6 L199.9 212.1 L215.7 187.5 L244.9 152.8 L262.2 135.5 L278.9 123.0 L293.9 114.4 L311.9 108.4 L326.9 105.2 L342.9 104.5 L357.9 107.0 L379.9 114.3 L399.9 126.1 L410.6 136.5 L410.3 138.5 L317.2 320.5 L314.9 321.0 L305.9 316.7 L295.9 307.4 L285.9 302.0 L266.9 296.1 L253.9 294.7 L236.9 296.4 L215.9 302.3 L203.9 307.9 L189.9 317.6 L192.7 332.5 L198.5 347.5 L205.9 356.8 L215.9 362.7 L230.9 365.9 L250.9 365.8 L276.9 362.0 L298.9 354.1 L308.9 359.0 L309.5 362.5 L137.9 698.9 Z",
    eye: { cx: 247, cy: 329, rx: 56, ry: 31, rotate: -11 }
  },
  b: {
    viewBox: "0 0 537 756",
    width: 537,
    height: 756,
    path: "M137.0 473.5 L129.0 470.0 L126.3 467.1 L134.9 448.1 L295.7 133.1 L357.9 15.1 L366.2 1.1 L370.0 0.8 L378.1 5.1 L374.5 15.1 L205.2 345.1 L150.2 451.1 L137.0 473.5 Z M224.0 755.4 L180.0 753.0 L89.0 751.7 L24.0 745.5 L10.0 742.6 L1.0 738.1 L0.0 736.1 L94.0 552.5 L119.0 556.4 L188.0 562.4 L263.0 562.7 L302.0 565.2 L308.9 564.1 L313.7 555.1 L313.0 553.4 L291.0 556.4 L274.0 556.6 L259.0 554.2 L245.6 549.1 L228.5 538.1 L217.7 522.1 L210.4 496.1 L210.2 467.1 L217.5 433.1 L229.9 401.1 L326.0 212.7 L347.0 181.1 L380.0 143.7 L392.0 132.7 L414.0 117.7 L427.0 112.0 L446.0 106.7 L462.0 104.6 L479.0 105.9 L509.0 115.7 L527.0 127.0 L536.6 136.1 L536.7 138.1 L443.0 321.0 L432.0 316.6 L421.9 307.1 L412.0 302.0 L393.0 296.1 L380.0 294.8 L363.0 296.5 L342.0 302.6 L330.0 308.1 L316.1 318.1 L319.3 333.1 L326.4 350.1 L333.0 357.6 L342.0 362.7 L357.0 366.0 L375.0 366.2 L403.0 362.2 L425.0 354.4 L435.0 358.9 L435.7 363.1 L246.4 733.1 L234.0 751.9 L224.0 755.4 Z",
    eye: { cx: 374, cy: 330, rx: 56, ry: 31, rotate: -11 }
  }
};

export const AIN_VARIANT_STORAGE_KEY = "ain-variant";
export const DEFAULT_AIN_VARIANT: AinVariant = "a";
