import { forwardRef, useRef, type CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
  className?: string;
};

const Problem2Overlay = forwardRef<HTMLDivElement, Props>(function Problem2Overlay({ style, className = "" }, ref) {
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 20,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-geist-sans, ui-sans-serif, system-ui)",
        ...style,
      }}
    >
      <p style={{
        position: 'absolute',
        top: '32px',
        left: '48px',
        color: 'rgba(255,255,255,0.95)',
        fontSize: '18px',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        margin: 0,
        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}>
        The Problem
      </p>
      <div
        style={{
          width: "min(88vw, 900px)",
          padding: "3rem 3.5rem",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.92) 100%)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "2px solid rgba(30, 58, 138, 0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(6, 182, 212, 0.1)",
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textAlign: "center",
            margin: "0 0 0.6rem 0",
            letterSpacing: "-0.03em",
          }}
        >
          The invisible gap in recovery
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#475569",
            textAlign: "center",
            margin: "0 0 2.5rem 0",
            lineHeight: 1.6,
            fontWeight: 600,
          }}
        >
          Recovery happens every day. But most of it goes unmeasured.
        </p>

        {/* Chart SVG */}
        <svg
          viewBox="0 0 800 360"
          style={{ width: "100%", height: "auto", display: "block" }}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Y axis */}
          <line x1="80" y1="40" x2="80" y2="280" stroke="#1e293b" strokeWidth="1.5" />
          {/* X axis */}
          <line x1="80" y1="280" x2="740" y2="280" stroke="#1e293b" strokeWidth="1.5" />

          {/* Y axis label */}
          <text x="22" y="160" fontSize="10" fill="#1e293b" textAnchor="middle" transform="rotate(-90, 22, 160)" fontWeight="500">
            Recovery function
          </text>

          {/* X axis label */}
          <text x="740" y="305" fontSize="10" fill="#1e293b" textAnchor="end" fontWeight="500">
            Time
          </text>

          {/* X axis arrow */}
          <polygon points="740,280 733,276 733,284" fill="#1e293b" />

          {/* X axis ticks and labels */}
          <line x1="130" y1="280" x2="130" y2="286" stroke="#1e293b" strokeWidth="1.5" />
          <text x="130" y="300" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="600">Day 0</text>

          <line x1="400" y1="280" x2="400" y2="286" stroke="#1e293b" strokeWidth="1.5" />
          <text x="400" y="300" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="600">Days 1–30+</text>

          <line x1="670" y1="280" x2="670" y2="286" stroke="#1e293b" strokeWidth="1.5" />
          <text x="670" y="300" fontSize="10" fill="#0f172a" textAnchor="middle" fontWeight="600">Day 30+</text>

          {/* Vertical dashed lines for gap boundaries */}
          <line x1="185" y1="50" x2="185" y2="280" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="625" y1="50" x2="625" y2="280" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

          {/* Recovery curve - observed start (solid, steep rise) */}
          <path
            d="M 130 250 C 145 235, 165 210, 185 190"
            stroke="#1e3a8a"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Recovery curve - unobserved middle (dashed, FLAT/LINEAR) */}
          <path
            d="M 185 190 L 625 105"
            stroke="#1e3a8a"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="8 6"
            fill="none"
          />

          {/* Recovery curve - observed end (solid) */}
          <path
            d="M 625 105 C 640 100, 655 96, 670 93"
            stroke="#1e3a8a"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Measurement points */}
          <circle cx="130" cy="250" r="6" fill="#1e3a8a" />
          <circle cx="670" cy="93" r="6" fill="#1e3a8a" />

          {/* ===== Calendar icon - Day 0 ===== */}
          <g transform="translate(105, 42)">
            <rect x="0" y="6" width="50" height="44" rx="6" fill="rgba(30,58,138,0.1)" stroke="#1e3a8a" strokeWidth="1.5" />
            <rect x="0" y="6" width="50" height="14" rx="6" fill="#1e3a8a" opacity="0.25" />
            <rect x="0" y="14" width="50" height="6" fill="#1e3a8a" opacity="0.25" />
            <line x1="16" y1="2" x2="16" y2="10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <line x1="34" y1="2" x2="34" y2="10" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14" cy="32" r="2" fill="#334155" />
            <circle cx="25" cy="32" r="2" fill="#334155" />
            <circle cx="36" cy="32" r="2" fill="#334155" />
            <circle cx="14" cy="42" r="2" fill="#334155" />
            <circle cx="25" cy="42" r="2" fill="#334155" />
            <circle cx="36" cy="42" r="2" fill="#334155" />
          </g>
          <text x="130" y="105" fontSize="9.5" fill="#0f172a" textAnchor="middle" fontWeight="600">Clinical visit</text>
          <text x="130" y="117" fontSize="8.5" fill="#475569" textAnchor="middle">Day 0</text>

          {/* ===== Hospital icon - Day 30+ ===== */}
          <g transform="translate(710, 42)">
            <rect x="0" y="6" width="50" height="44" rx="5" fill="rgba(30,58,138,0.1)" stroke="#1e3a8a" strokeWidth="1.5" />
            <rect x="17" y="0" width="16" height="12" rx="3" fill="#1e3a8a" opacity="0.3" stroke="#1e3a8a" strokeWidth="1" />
            <line x1="25" y1="3" x2="25" y2="9" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="6" x2="28" y2="6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
            <rect x="7" y="18" width="8" height="8" rx="1.5" fill="rgba(30,58,138,0.2)" stroke="#334155" strokeWidth="0.8" />
            <rect x="21" y="18" width="8" height="8" rx="1.5" fill="rgba(30,58,138,0.2)" stroke="#334155" strokeWidth="0.8" />
            <rect x="35" y="18" width="8" height="8" rx="1.5" fill="rgba(30,58,138,0.2)" stroke="#334155" strokeWidth="0.8" />
            <rect x="19" y="34" width="12" height="14" rx="2" fill="rgba(30,58,138,0.15)" stroke="#334155" strokeWidth="0.8" />
          </g>
          <text x="735" y="105" fontSize="9.5" fill="#0f172a" textAnchor="middle" fontWeight="600">Next clinical visit</text>
          <text x="735" y="117" fontSize="8.5" fill="#475569" textAnchor="middle">Day 30+</text>

          {/* The invisible gap label - center, below the line */}
          <text x="400" y="195" fontSize="18" fill="#0f172a" textAnchor="middle" fontWeight="700">
            The invisible gap
          </text>
          <text x="400" y="218" fontSize="11.5" fill="#334155" textAnchor="middle">
            No data. No way to know if recovery
          </text>
          <text x="400" y="235" fontSize="11.5" fill="#334155" textAnchor="middle">
            is improving or stalling.
          </text>

          {/* Small down arrow under text */}
          <path d="M 390 245 L 400 255 L 410 245" stroke="#475569" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Legend */}
          <line x1="200" y1="340" x2="225" y2="340" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
          <text x="232" y="344" fontSize="10" fill="#1e293b">Observed (in clinic)</text>

          <line x1="380" y1="340" x2="405" y2="340" stroke="#1e3a8a" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" />
          <text x="412" y="344" fontSize="10" fill="#1e293b">Unobserved (at home)</text>

          <circle cx="570" cy="340" r="4" fill="#1e3a8a" />
          <text x="580" y="344" fontSize="10" fill="#1e293b">Measurement points</text>
        </svg>
      </div>
    </div>
  );
});

export default Problem2Overlay;
