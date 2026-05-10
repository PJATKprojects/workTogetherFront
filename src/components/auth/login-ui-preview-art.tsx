/**
 * Abstract “product preview” — dot field + mini dashboard + avatar stack.
 */
export function LoginUiPreviewArt({
  title,
  className,
}: Readonly<{ title: string; className?: string }>) {
  return (
    <svg viewBox="0 0 400 280" className={className} role="img" aria-label={title}>
      <title>{title}</title>
      <defs>
        <pattern id="login-dot-grid" width={14} height={14} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={3} r={1.05} fill="rgb(255 255 255 / 0.11)" />
        </pattern>
        <linearGradient id="login-window-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgb(255 255 255 / 0.09)" />
          <stop offset="100%" stopColor="rgb(255 255 255 / 0.03)" />
        </linearGradient>
        <radialGradient id="login-vignette" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="rgb(255 255 255 / 0.06)" />
          <stop offset="100%" stopColor="rgb(255 255 255 / 0)" />
        </radialGradient>
        <filter id="login-win-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      <rect width={400} height={280} fill="url(#login-dot-grid)" opacity={0.55} />
      <rect width={400} height={280} fill="url(#login-vignette)" />

      <g transform="translate(52, 44)" filter="url(#login-win-shadow)">
        <rect
          x={0}
          y={0}
          width={296}
          height={192}
          rx={20}
          fill="url(#login-window-bg)"
          stroke="rgb(255 255 255 / 0.14)"
          strokeWidth={1.5}
        />
        <rect x={16} y={16} width={264} height={14} rx={4} fill="rgb(255 255 255 / 0.06)" />
        <circle cx={28} cy={23} r={4} fill="#fb7185" opacity={0.88} />
        <circle cx={42} cy={23} r={4} fill="#fbbf24" opacity={0.88} />
        <circle cx={56} cy={23} r={4} fill="#34d399" opacity={0.88} />

        <rect x={16} y={44} width={52} height={128} rx={10} fill="rgb(0 0 0 / 0.24)" />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={26}
            y={56 + i * 22}
            width={32}
            height={8}
            rx={3}
            fill="rgb(255 255 255 / 0.07)"
          />
        ))}

        <rect x={78} y={44} width={202} height={18} rx={6} fill="rgb(255 255 255 / 0.09)" />
        <rect x={78} y={72} width={160} height={10} rx={4} fill="rgb(52 211 153 / 0.38)" />
        <rect x={78} y={90} width={184} height={8} rx={3} fill="rgb(255 255 255 / 0.055)" />
        <rect x={78} y={104} width={176} height={8} rx={3} fill="rgb(255 255 255 / 0.05)" />
        <rect x={78} y={118} width={140} height={8} rx={3} fill="rgb(255 255 255 / 0.04)" />

        <rect
          x={78}
          y={138}
          width={92}
          height={44}
          rx={10}
          fill="rgb(99 102 241 / 0.2)"
          stroke="rgb(255 255 255 / 0.09)"
        />
        <rect
          x={178}
          y={138}
          width={102}
          height={44}
          rx={10}
          fill="rgb(45 212 191 / 0.16)"
          stroke="rgb(255 255 255 / 0.09)"
        />

        <g transform="translate(236, 54)">
          <circle cx={0} cy={0} r={14} fill="#6366f1" stroke="rgb(15 23 42)" strokeWidth={2} />
          <circle cx={22} cy={0} r={14} fill="#f472b6" stroke="rgb(15 23 42)" strokeWidth={2} />
          <circle cx={44} cy={0} r={14} fill="#34d399" stroke="rgb(15 23 42)" strokeWidth={2} />
        </g>
      </g>

      <circle
        cx={320}
        cy={220}
        r={52}
        fill="none"
        stroke="rgb(52 211 153 / 0.14)"
        strokeWidth={1}
        strokeDasharray="6 10"
      />
    </svg>
  );
}
