export function DeskIllustration() {
  return (
    <svg viewBox="0 0 300 180" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* faint skyline */}
      <g opacity="0.6">
        <rect x="6" y="70" width="22" height="90" fill="#dbeafe" />
        <rect x="34" y="50" width="22" height="110" fill="#bfdbfe" />
        <rect x="252" y="58" width="22" height="102" fill="#bfdbfe" />
        <rect x="274" y="80" width="18" height="80" fill="#dbeafe" />
      </g>

      {/* monitor */}
      <rect x="88" y="34" width="124" height="82" rx="6" fill="#1e293b" />
      <rect x="97" y="43" width="106" height="63" rx="2" fill="#e2e8f0" />
      <rect x="139" y="116" width="22" height="16" fill="#334155" />
      <rect x="118" y="132" width="64" height="7" rx="3.5" fill="#334155" />

      {/* wrench across the screen */}
      <g transform="translate(150,74) rotate(40)">
        <rect x="-6.5" y="-34" width="13" height="52" rx="5" fill="#3b82f6" />
        <circle cx="0" cy="-36" r="11" fill="none" stroke="#3b82f6" strokeWidth="7" />
      </g>

      {/* potted plant */}
      <g transform="translate(232,96)">
        <path d="M0 42 L-11 10 M0 42 L0 4 M0 42 L11 12" stroke="#16a34a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M-15 42 h30 l-4 22 h-22 z" fill="#f59e0b" />
      </g>
    </svg>
  );
}
