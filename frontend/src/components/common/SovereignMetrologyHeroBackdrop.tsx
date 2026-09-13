import React from "react";

interface SovereignMetrologyHeroBackdropProps {
  className?: string;
  showChakra?: boolean;
}

/**
 * SovereignMetrologyHeroBackdrop
 * Contextual, authentic Government of India administrative backdrop for NIRIKSHAK.
 * Grounded in the Department of Consumer Affairs & Legal Metrology Division:
 * - Central Secretariat / Ministry Administrative Colonnade architecture
 * - The Dharma Chakra (Ashoka Chakra) sacred 24-ray geometry (stately, static, dignified)
 * - The Sovereign Scales of Truth & Metrology (विधिक मापविज्ञान तुला)
 * - High-security guilloche curves & warm sovereign horizon
 */
export const SovereignMetrologyHeroBackdrop: React.FC<SovereignMetrologyHeroBackdropProps> = ({
  className = "",
  showChakra = true,
}) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Sovereign Navy Foundation Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#061220] via-[#0A2240] to-[#0F2D54]" />

      {/* 2. Warm Amber Dusk Horizon Glow (Authoritative National Portal Ambient Lighting) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(212, 175, 55, 0.35) 0%, rgba(27, 54, 93, 0.1) 50%, transparent 80%)",
        }}
      />

      {/* 3. Subtle Sovereign Security Guilloche / Metrology Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* 4. Scalable SVG Architectural & Heraldic Silhouette */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-full object-cover"
        viewBox="0 0 1440 560"
        preserveAspectRatio="xMidYMax meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Colonnade & Secretariat Gradient */}
          <linearGradient id="colonnadeGrad" x1="720" y1="200" x2="720" y2="560" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0B1A2C" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#05101C" stopOpacity="0.98" />
          </linearGradient>

          {/* Golden Rim Highlight */}
          <linearGradient id="tulaGoldGlow" x1="600" y1="140" x2="840" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
          </linearGradient>

          {/* Chakra Ambient Radial Aura */}
          <radialGradient id="sacredAura" cx="720" cy="180" r="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#1B365D" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#0B1D3A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Background: Dignified Static Ashoka Chakra Sacred Geometry --- */}
        {showChakra && (
          <g className="opacity-25" transform="translate(720, 180)">
            <circle cx="0" cy="0" r="130" stroke="#FDE68A" strokeWidth="1.2" strokeDasharray="5 5" />
            <circle cx="0" cy="0" r="115" stroke="#93C5FD" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="95" stroke="#D4AF37" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="26" stroke="#FDE68A" strokeWidth="1.8" fill="none" />
            <circle cx="0" cy="0" r="7" fill="#D4AF37" />

            {/* 24 Statutory Spokes of Ashoka Chakra */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              const rad = (angle * Math.PI) / 180;
              const x1 = 26 * Math.cos(rad);
              const y1 = 26 * Math.sin(rad);
              const x2 = 95 * Math.cos(rad);
              const y2 = 95 * Math.sin(rad);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                  strokeOpacity="0.8"
                />
              );
            })}
          </g>
        )}

        {/* Ambient Radial Aura behind central heraldry */}
        <circle cx="720" cy="180" r="160" fill="url(#sacredAura)" />

        {/* --- Central Colonnade: Krishi Bhawan / Central Secretariat Classical Architecture --- */}
        <g fill="url(#colonnadeGrad)">
          {/* Base Stepped Plinth extending horizontally */}
          <rect x="180" y="520" width="1080" height="40" rx="3" />
          <rect x="240" y="495" width="960" height="25" rx="2" />
          <rect x="300" y="475" width="840" height="20" />

          {/* Colonnade Pillars — Classical Government Architecture (Left Flank) */}
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={`left-col-${i}`}>
              <rect x={340 + i * 36} y="280" width="12" height="195" rx="1.5" />
              {/* Capital & Base */}
              <rect x={337 + i * 36} y="274" width="18" height="6" rx="1" fill="#244874" />
              <rect x={337 + i * 36} y="469" width="18" height="6" rx="1" fill="#142840" />
            </g>
          ))}

          {/* Colonnade Pillars — Classical Government Architecture (Right Flank) */}
          {Array.from({ length: 9 }).map((_, i) => (
            <g key={`right-col-${i}`}>
              <rect x={770 + i * 36} y="280" width="12" height="195" rx="1.5" />
              {/* Capital & Base */}
              <rect x={767 + i * 36} y="274" width="18" height="6" rx="1" fill="#244874" />
              <rect x={767 + i * 36} y="469" width="18" height="6" rx="1" fill="#142840" />
            </g>
          ))}

          {/* Entablature & Grand Frieze spanning the colonnade */}
          <rect x="320" y="258" width="800" height="16" rx="2" />
          <rect x="300" y="244" width="840" height="14" rx="2" />
          <rect x="280" y="232" width="880" height="12" rx="2" />

          {/* Central Pediment with Ashoka Emblem niche */}
          <polygon points="620,232 720,175 820,232" />
          <polygon points="635,232 720,185 805,232" fill="#061220" />
        </g>

        {/* --- Centerpiece: The Sovereign Scales of Legal Metrology (तुला) Silhouette --- */}
        <g stroke="url(#tulaGoldGlow)" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Center Pillar */}
          <line x1="720" y1="210" x2="720" y2="475" stroke="#D4AF37" strokeWidth="4" />
          <circle cx="720" cy="205" r="5" fill="#FDE68A" stroke="#D4AF37" strokeWidth="2" />

          {/* Balance Arm Beam */}
          <path d="M 640,235 Q 720,220 800,235" stroke="#FDE68A" strokeWidth="3.5" />
          <circle cx="720" cy="225" r="6" fill="#0A2240" stroke="#FDE68A" strokeWidth="2" />

          {/* Left Pan */}
          <line x1="640" y1="235" x2="615" y2="320" stroke="#D4AF37" strokeWidth="1.2" />
          <line x1="640" y1="235" x2="665" y2="320" stroke="#D4AF37" strokeWidth="1.2" />
          <path d="M 605,320 Q 640,336 675,320 Z" fill="#D4AF37" fillOpacity="0.4" stroke="#FDE68A" strokeWidth="1.2" />

          {/* Right Pan */}
          <line x1="800" y1="235" x2="775" y2="320" stroke="#D4AF37" strokeWidth="1.2" />
          <line x1="800" y1="235" x2="825" y2="320" stroke="#D4AF37" strokeWidth="1.2" />
          <path d="M 765,320 Q 800,336 835,320 Z" fill="#D4AF37" fillOpacity="0.4" stroke="#FDE68A" strokeWidth="1.2" />

          {/* Base Mount */}
          <polygon points="695,475 745,475 755,495 685,495" fill="#142840" stroke="#D4AF37" strokeWidth="1.5" />
        </g>

        {/* Horizon Baseline */}
        <line x1="0" y1="559" x2="1440" y2="559" stroke="#1E3A5F" strokeWidth="1" strokeOpacity="0.5" />
      </svg>

      {/* 5. Bottom Gradient Transition to Content */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
    </div>
  );
};
