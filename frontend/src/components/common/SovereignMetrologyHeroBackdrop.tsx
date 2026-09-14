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

      {/* 4. Scalable Sovereign Architectural Skyline Silhouette (Grounded at Bottom Edge) */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-36 opacity-20 pointer-events-none"
        viewBox="0 0 1440 144"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="govSkylineGrad" x1="720" y1="0" x2="720" y2="144" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#1E3A5F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#061220" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Central Secretariat / Raisina Classical Architectural Skyline Silhouette */}
        <g fill="url(#govSkylineGrad)">
          {/* Base stepped foundation */}
          <rect x="0" y="128" width="1440" height="16" />
          <rect x="120" y="120" width="1200" height="8" />

          {/* Central Dome & Classical Portico */}
          <path d="M 680,120 L 680,72 Q 720,40 760,72 L 760,120 Z" />
          <rect x="670" y="68" width="100" height="6" rx="1" />
          {/* Kalash / Finial on Central Dome */}
          <line x1="720" y1="40" x2="720" y2="28" stroke="#D4AF37" strokeWidth="2" />
          <circle cx="720" cy="26" r="2.5" fill="#D4AF37" />

          {/* Symmetrical Left Wing Colonnades */}
          <rect x="420" y="86" width="220" height="34" rx="1" />
          <rect x="410" y="82" width="240" height="4" rx="1" />
          <rect x="220" y="96" width="170" height="24" rx="1" />
          <rect x="210" y="92" width="190" height="4" rx="1" />

          {/* Symmetrical Right Wing Colonnades */}
          <rect x="800" y="86" width="220" height="34" rx="1" />
          <rect x="790" y="82" width="240" height="4" rx="1" />
          <rect x="1050" y="96" width="170" height="24" rx="1" />
          <rect x="1040" y="92" width="190" height="4" rx="1" />
        </g>

        {/* Delicate Golden Horizon Line */}
        <line x1="0" y1="128" x2="1440" y2="128" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.3" />
      </svg>

      {/* 5. Bottom Gradient Transition to Content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#061220] to-transparent" />
    </div>
  );
};
