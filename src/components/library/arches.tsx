/**
 * Background architecture: a colonnade of pointed arches drawn in thin
 * bronze light, with hinted rows of distant books. Pure SVG, no assets.
 */
export function Arches({ className }: { className?: string }) {
  const arches = [
    { x: 10, scale: 0.82, opacity: 0.35 },
    { x: 30, scale: 0.94, opacity: 0.55 },
    { x: 50, scale: 1, opacity: 0.75 },
    { x: 70, scale: 0.94, opacity: 0.55 },
    { x: 90, scale: 0.82, opacity: 0.35 }
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 1000 620"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="arch-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9a86a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8a6b45" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="arch-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8c1a" stopOpacity="0.10" />
          <stop offset="1" stopColor="#ff6a00" stopOpacity="0" />
        </linearGradient>
      </defs>
      {arches.map(({ x, scale, opacity }, i) => {
        const w = 150 * scale;
        const h = 420 * scale;
        const cx = x * 10;
        const top = 620 - h;
        return (
          <g key={i} opacity={opacity}>
            {/* pointed horseshoe arch */}
            <path
              d={`M ${cx - w / 2} 620
                  L ${cx - w / 2} ${top + h * 0.42}
                  C ${cx - w / 2} ${top + h * 0.12}, ${cx - w * 0.28} ${top}, ${cx} ${top}
                  C ${cx + w * 0.28} ${top}, ${cx + w / 2} ${top + h * 0.12}, ${cx + w / 2} ${top + h * 0.42}
                  L ${cx + w / 2} 620`}
              fill="url(#arch-glow)"
              stroke="url(#arch-stroke)"
              strokeWidth={2.2 * scale}
            />
            {/* inner arch line */}
            <path
              d={`M ${cx - w / 2 + 14 * scale} 620
                  L ${cx - w / 2 + 14 * scale} ${top + h * 0.44}
                  C ${cx - w / 2 + 14 * scale} ${top + h * 0.18}, ${cx - w * 0.24} ${top + 16 * scale}, ${cx} ${top + 16 * scale}
                  C ${cx + w * 0.24} ${top + 16 * scale}, ${cx + w / 2 - 14 * scale} ${top + h * 0.18}, ${cx + w / 2 - 14 * scale} ${top + h * 0.44}
                  L ${cx + w / 2 - 14 * scale} 620`}
              fill="none"
              stroke="url(#arch-stroke)"
              strokeWidth={1.1 * scale}
              opacity={0.6}
            />
            {/* distant shelf rows inside the arch */}
            {[0.55, 0.68, 0.81].map((ry) => (
              <g key={ry}>
                <line
                  x1={cx - w * 0.32}
                  y1={top + h * ry}
                  x2={cx + w * 0.32}
                  y2={top + h * ry}
                  stroke="#8a6b45"
                  strokeOpacity={0.35}
                  strokeWidth={2 * scale}
                />
                {Array.from({ length: 9 }, (_, b) => {
                  const bx = cx - w * 0.29 + b * w * 0.072;
                  const bh = (10 + ((b * 7 + ry * 100) % 9)) * scale;
                  return (
                    <rect
                      key={b}
                      x={bx}
                      y={top + h * ry - bh}
                      width={w * 0.045}
                      height={bh}
                      fill="#8a6b45"
                      opacity={0.22}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
