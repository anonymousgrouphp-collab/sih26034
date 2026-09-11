import React from "react";

interface IndiaGateHeroBackdropProps {
  className?: string;
  showChakra?: boolean;
}

export const IndiaGateHeroBackdrop: React.FC<IndiaGateHeroBackdropProps> = ({
  className = "",
  showChakra = true,
}) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Sovereign Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05111F] via-[#091D36] to-[#0E2A4D]" />

      {/* 2. Warm Dusk Amber Horizon Glow (reflecting the dusk lighting on india.gov.in) */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 65%, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.15) 45%, transparent 75%)",
        }}
      />

      {/* 3. Subtle Sovereign Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* 4. Scalable SVG Architectural Silhouette (India Gate + Ashoka Sacred Geometry) */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-full object-cover"
        viewBox="0 0 1440 560"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle monument gradient */}
          <linearGradient id="monumentGradient" x1="720" y1="120" x2="720" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#0B1A2C" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#05101C" stopOpacity="0.95" />
          </linearGradient>

          {/* Golden rim highlight gradient for arch roof */}
          <linearGradient id="rimGlow" x1="600" y1="120" x2="840" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
          </linearGradient>

          {/* Chakra Glow */}
          <radialGradient id="chakraAura" cx="720" cy="190" r="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Background Ashoka Chakra Sacred Geometry (Ambient Rotating Glow) --- */}
        {showChakra && (
          <g className="origin-[720px_190px] animate-[spin_120s_linear_infinite] motion-reduce:animate-none opacity-20">
            <circle cx="720" cy="190" r="140" stroke="#FDE68A" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="720" cy="190" r="120" stroke="#93C5FD" strokeWidth="0.75" />
            <circle cx="720" cy="190" r="100" stroke="#F59E0B" strokeWidth="1.2" />
            <circle cx="720" cy="190" r="28" stroke="#FDE68A" strokeWidth="1.5" fill="none" />
            <circle cx="720" cy="190" r="8" fill="#F59E0B" />

            {/* 24 Rays of Ashoka Chakra */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              const x1 = 720 + 28 * Math.cos(rad);
              const y1 = 190 + 28 * Math.sin(rad);
              const x2 = 720 + 100 * Math.cos(rad);
              const y2 = 190 + 100 * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                  strokeOpacity="0.7"
                />
              );
            })}
          </g>
        )}

        {/* Chakra Ambient Radial Aura */}
        <circle cx="720" cy="190" r="160" fill="url(#chakraAura)" />

        {/* --- Background Government Colonnade / Horizon Landscape --- */}
        {/* Distant Rashtrapati Bhavan / Secretariat Colonnade Silhouettes */}
        <g opacity="0.15" fill="#142C48">
          {/* Left Colonnade */}
          <rect x="80" y="440" width="360" height="12" rx="2" />
          <rect x="90" y="452" width="340" height="90" />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={`lcol-${i}`} x={105 + i * 24} y="452" width="6" height="88" fill="#0A1828" />
          ))}
          <path d="M 230 440 Q 260 410 290 440 Z" fill="#1B385C" />

          {/* Right Colonnade */}
          <rect x="1000" y="440" width="360" height="12" rx="2" />
          <rect x="1010" y="452" width="340" height="90" />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={`rcol-${i}`} x={1025 + i * 24} y="452" width="6" height="88" fill="#0A1828" />
          ))}
          <path d="M 1150 440 Q 1180 410 1210 440 Z" fill="#1B385C" />
        </g>

        {/* --- Centerpiece: The Monument of India Gate Silhouette --- */}
        <g fill="url(#monumentGradient)">
          {/* 1. Base Podium & Stepped Plinth */}
          <rect x="520" y="525" width="400" height="35" rx="3" />
          <rect x="545" y="505" width="350" height="20" rx="2" />
          <rect x="565" y="490" width="310" height="15" />

          {/* 2. Main Pylons (Left & Right Massive Piers) */}
          {/* Left Pier */}
          <path d="M 580 490 L 590 260 L 655 260 L 655 490 Z" />
          {/* Right Pier */}
          <path d="M 785 490 L 785 260 L 850 260 L 860 490 Z" />

          {/* 3. Central Great Archway Portal */}
          {/* Arch Springing line at y=360, Arch Apex at y=295 */}
          <path
            d="M 655 490 L 655 360 C 655 315 675 295 720 295 C 765 295 785 315 785 360 L 785 490 Z"
            fill="#061220"
          />
          {/* Arch Inner Vault Depth Accent */}
          <path
            d="M 660 490 L 660 365 C 660 325 680 305 720 305 C 760 305 780 325 780 365 L 780 490 Z"
            fill="#030910"
            opacity="0.8"
          />

          {/* 4. Secondary Side Archways (Typical of India Gate architecture) */}
          <path d="M 605 440 L 605 385 C 605 370 613 360 625 360 C 637 360 645 370 645 385 L 645 440 Z" fill="#040D18" />
          <path d="M 795 440 L 795 385 C 795 370 803 360 815 360 C 827 360 835 370 835 385 L 835 440 Z" fill="#040D18" />

          {/* 5. Entablature & String Courses above Main Arch */}
          <rect x="585" y="248" width="270" height="12" rx="1" />
          <rect x="575" y="235" width="290" height="13" rx="1.5" />
          <rect x="580" y="215" width="280" height="20" />

          {/* Inscription Panel / Frieze (Where "INDIA" is carved on India Gate) */}
          <rect x="635" y="220" width="170" height="12" rx="1" fill="#132742" />

          {/* 6. Attic Storey & Crowning Cornice */}
          <rect x="590" y="195" width="260" height="20" />
          <rect x="570" y="180" width="300" height="15" rx="2" />
          <rect x="610" y="160" width="220" height="20" rx="1" />

          {/* 7. Shallow Dome / Ceremonial Urn on Top Roof */}
          <path d="M 660 160 Q 720 142 780 160 Z" fill="#1F3D64" />
          {/* Roof Torch Bowl Basin */}
          <rect x="700" y="145" width="40" height="8" rx="2" fill="#2E5587" />
          <circle cx="720" cy="143" r="3" fill="#F59E0B" opacity="0.8" />
        </g>

        {/* Monument Architectural Highlights (Sun Rim Light) */}
        <line x1="570" y1="180" x2="870" y2="180" stroke="url(#rimGlow)" strokeWidth="2.5" />
        <line x1="575" y1="235" x2="865" y2="235" stroke="url(#rimGlow)" strokeWidth="1.5" />
        <line x1="565" y1="490" x2="875" y2="490" stroke="url(#rimGlow)" strokeWidth="1" />

        {/* Ambient Ground Horizon Line */}
        <line x1="0" y1="559" x2="1440" y2="559" stroke="#1E3A5F" strokeWidth="1" strokeOpacity="0.4" />
      </svg>

      {/* 5. Bottom Gradient Fade for Soft Transition into Content */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
    </div>
  );
};
