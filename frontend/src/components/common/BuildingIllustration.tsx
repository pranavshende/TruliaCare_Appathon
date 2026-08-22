function WindowGrid({ x, y, cols, rows, w, h, gap, litIndexes = [] }: {
  x: number; y: number; cols: number; rows: number; w: number; h: number; gap: number; litIndexes?: number[];
}) {
  const cells = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = litIndexes.includes(idx);
      cells.push(
        <rect
          key={idx}
          x={x + c * (w + gap)}
          y={y + r * (h + gap)}
          width={w}
          height={h}
          rx={0.5}
          fill={lit ? '#fbbf24' : '#3b5a8a'}
          opacity={lit ? 0.9 : 0.5}
        />
      );
      idx++;
    }
  }
  return <>{cells}</>;
}

export function BuildingIllustration() {
  return (
    <svg viewBox="0 0 440 260" className="w-full h-full block" preserveAspectRatio="xMidYMax slice">
      {/* ground */}
      <rect x="0" y="245" width="440" height="15" fill="#0f2147" />

      {/* trees */}
      {[30, 60, 340, 380, 410].map((tx, i) => (
        <g key={i}>
          <rect x={tx - 1.5} y={232} width={3} height={14} fill="#14532d" />
          <circle cx={tx} cy={226} r={9} fill="#16a34a" opacity={0.85} />
        </g>
      ))}

      {/* building A (left, mid height) */}
      <rect x="60" y="120" width="90" height="126" rx="2" fill="#16294f" />
      <WindowGrid x={68} y={130} cols={4} rows={9} w={8} h={9} gap={4.2} litIndexes={[3, 10, 17, 24]} />

      {/* building B (center, tallest) */}
      <polygon points="160,60 170,40 180,60" fill="#1c3868" />
      <rect x="155" y="60" width="60" height="186" rx="2" fill="#1c3868" />
      <WindowGrid x={161} y={70} cols={3} rows={13} w={7.5} h={8} gap={4} litIndexes={[2, 9, 15, 22, 30, 35]} />

      {/* small shield watermark on tallest tower */}
      <g transform="translate(178,44)" opacity="0.9">
        <path
          d="M6 0l6 2.2v3.6C12 10.4 9.4 13 6 14 2.6 13 0 10.4 0 5.8V2.2L6 0z"
          fill="#3b82f6"
        />
      </g>

      {/* building C (right, medium-tall) */}
      <rect x="225" y="85" width="75" height="161" rx="2" fill="#16294f" />
      <WindowGrid x={232} y={95} cols={4} rows={11} w={7} h={8} gap={4} litIndexes={[1, 8, 14, 20, 27, 33]} />

      {/* building D (far right, short) */}
      <rect x="310" y="150" width="70" height="96" rx="2" fill="#1c3868" />
      <WindowGrid x={317} y={158} cols={4} rows={6} w={7} h={8} gap={4} litIndexes={[2, 9, 15]} />
    </svg>
  );
}
