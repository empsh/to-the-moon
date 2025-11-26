
import React from 'react';
import { SkinType } from '../types';

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  skin?: SkinType;
  fill?: string;
}

// Vue arrière de Trump avec Jetpack pour le mode 3D - REDESIGN ULTRA REALISTIC CARICATURE
export const TrumpBackIcon = ({ className, style, skin = SkinType.DEFAULT }: IconProps) => {
  
  // Configuration des palettes de couleurs selon le Skin
  const isDarkMaga = skin === SkinType.DARK_MAGA;
  const isGolden = skin === SkinType.GOLDEN_GOD;
  const isRedHat = skin === SkinType.RED_HAT;

  // Couleurs de base
  let suitFill = "url(#suitGradient)";
  let suitStroke = "#1e3a8a";
  let tieFill = "url(#tieGradient)";
  let hairFill = "url(#hairGradient)";
  // TEINT : Plus orangé/bronzé pour la ressemblance signature
  let skinFill = "#ffad60"; 
  let jetpackBody = "url(#goldMetal)";
  let jetpackStroke = "#b45309";
  
  if (isDarkMaga) {
    suitFill = "#0f172a"; // Almost Black
    suitStroke = "#06b6d4"; // Cyan Neon
    tieFill = "#06b6d4"; // Cyan Tie
    hairFill = "#e2e8f0"; // White/Silver Hair
    skinFill = "#94a3b8"; // Pale skin
    jetpackBody = "#1e293b"; // Dark metal
    jetpackStroke = "#06b6d4"; // Cyan glowing rims
  } else if (isGolden) {
    suitFill = "url(#goldMetal)";
    suitStroke = "#b45309";
    tieFill = "url(#goldMetal)"; // Gold Tie
    hairFill = "#fef08a"; // Bright Yellow Gold
    skinFill = "#fcd34d"; // Gold Skin
    jetpackBody = "#fff"; // Diamond/Platinum
    jetpackStroke = "#fef08a";
  } else if (isRedHat) {
      // Standard suit but Red Hat logic handled in render
  } else if (skin === SkinType.DEFAULT) {
      // SANTA TRUMP
      suitFill = "url(#santaSuitGradient)"; // Red Suit
      suitStroke = "#991b1b"; // Dark Red
      // Tie remains Red
  }

  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className} 
      style={style}
    >
      <defs>
        <linearGradient id="hairGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" /> {/* Yellow-400 */}
          <stop offset="100%" stopColor="#eab308" /> {/* Yellow-500 */}
        </linearGradient>
        <linearGradient id="suitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" /> {/* Blue-900 */}
          <stop offset="100%" stopColor="#172554" /> {/* Blue-950 */}
        </linearGradient>
        <linearGradient id="santaSuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" /> {/* Red-500 */}
          <stop offset="100%" stopColor="#b91c1c" /> {/* Red-700 */}
        </linearGradient>
        <linearGradient id="tieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dc2626" /> {/* Red-600 */}
          <stop offset="50%" stopColor="#ef4444" /> {/* Red-500 */}
          <stop offset="100%" stopColor="#b91c1c" /> {/* Red-700 */}
        </linearGradient>
        <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="50%" stopColor="#fff" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      
      {/* JETPACK WINGS/FLAMES */}
      <g transform="translate(100, 120)">
         {/* Left Thruster */}
         <rect x="-60" y="-10" width="30" height="50" rx="5" fill={jetpackBody} stroke={jetpackStroke} strokeWidth="2" />
         <path d="M-55 40 L-45 80 L-35 40 Z" fill="#ef4444" className="animate-pulse" />
         <path d="M-52 40 L-45 70 L-38 40 Z" fill="#fde047" className="animate-pulse" />
         
         {/* Right Thruster */}
         <rect x="30" y="-10" width="30" height="50" rx="5" fill={jetpackBody} stroke={jetpackStroke} strokeWidth="2" />
         <path d="M35 40 L45 80 L55 40 Z" fill="#ef4444" className="animate-pulse" />
         <path d="M38 40 L45 70 L52 40 Z" fill="#fde047" className="animate-pulse" />
         
         {/* Center Tank */}
         <rect x="-20" y="-20" width="40" height="60" rx="10" fill={isDarkMaga ? "#000" : "#d1d5db"} stroke={jetpackStroke} strokeWidth="2" />
         {isGolden && <text x="0" y="20" textAnchor="middle" fontSize="20" fill="#b45309" fontWeight="bold">$</text>}
      </g>

      {/* BODY (Boxy Suit) */}
      <path 
        d="M50,180 L50,80 Q50,60 70,60 L130,60 Q150,60 150,80 L150,180 Z" 
        fill={suitFill} 
        stroke={suitStroke} 
        strokeWidth="3"
      />
      
      {/* SANTA FUR (If Default Skin) */}
      {skin === SkinType.DEFAULT && (
        <>
            <path d="M70,60 L130,60 L130,70 L70,70 Z" fill="#fff" stroke="#e5e7eb" strokeWidth="1" /> {/* Collar Fur */}
            <rect x="95" y="60" width="10" height="120" fill="#fff" opacity="0.9" /> {/* Vertical Fur Trim */}
        </>
      )}

      {/* HEAD (Squarish, Jowls visible from back) */}
      <path 
        d="M70,60 L70,30 Q70,10 100,10 Q130,10 130,30 L130,60 Z" 
        fill={skinFill}
      />
      {/* Jowls sticking out side */}
      <ellipse cx="68" cy="45" rx="5" ry="10" fill={skinFill} />
      <ellipse cx="132" cy="45" rx="5" ry="10" fill={skinFill} />

      {/* HAIR (Iconic Helmet Structure) */}
      <path 
        d="M65,30 Q60,10 80,5 Q100,-5 120,5 Q140,10 135,30 L135,45 Q135,55 125,50 L120,40 L80,40 L75,50 Q65,55 65,45 Z" 
        fill={hairFill}
        stroke="#b45309"
        strokeWidth="1"
      />
      {/* The Swoosh Details */}
      <path d="M80,5 Q100,0 120,10" fill="none" stroke="#ca8a04" strokeWidth="2" />
      <path d="M70,20 Q80,15 90,20" fill="none" stroke="#ca8a04" strokeWidth="2" />
      <path d="M110,20 Q120,15 130,20" fill="none" stroke="#ca8a04" strokeWidth="2" />
      
      {/* RED HAT (If Red Hat Skin) */}
      {isRedHat && (
          <g>
              <path d="M60,25 L140,25 L135,10 Q100,0 65,10 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
              <text x="100" y="22" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">MAGA</text>
              <rect x="130" y="20" width="20" height="5" rx="2" fill="#dc2626" transform="rotate(10 130 20)" /> {/* Peak */}
          </g>
      )}

      {/* SANTA HAT (If Default Skin) */}
      {skin === SkinType.DEFAULT && (
          <g transform="translate(0, -10)">
              <path d="M60,25 Q100,-10 140,25" fill="#ef4444" stroke="#991b1b" strokeWidth="2" /> {/* Main Hat Body base approximation */}
              <path d="M60,25 L100,-20 L140,25 Z" fill="#ef4444" /> {/* Cone */}
              <circle cx="100" cy="-20" r="12" fill="white" /> {/* Pompon */}
              <rect x="55" y="22" width="90" height="10" rx="5" fill="white" /> {/* White Trim */}
          </g>
      )}

      {/* TIE (Long Red Tie blowing back) */}
      {!isRedHat && skin !== SkinType.DEFAULT && (
        <path 
            d="M90,60 L110,60 L105,140 L95,140 Z" 
            fill={tieFill}
            stroke="#7f1d1d"
            strokeWidth="1"
        />
      )}
      {/* For Santa skin, tie is hidden by fur or smaller, let's keep it minimal or hidden */}
      
    </svg>
  );
};

// SLEDGE TRUMP for North Pole Mode
export const SledgeTrumpIcon = ({ className, style }: IconProps) => {
    return (
        <svg viewBox="0 0 200 200" className={className} style={style}>
             {/* Sledge Skis */}
             <rect x="40" y="160" width="120" height="10" rx="5" fill="#1e293b" />
             <rect x="30" y="150" width="10" height="20" rx="2" fill="#1e293b" />
             <path d="M160 160 Q180 150 180 130" fill="none" stroke="#1e293b" strokeWidth="5" />

             {/* Sledge Body */}
             <path d="M40 150 L160 150 L150 120 L50 120 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
             <text x="100" y="140" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">TRUMP 1</text>
             
             {/* Trump Sitting */}
             <path d="M60 120 L60 80 Q60 60 80 60 L120 60 Q140 60 140 80 L140 120 Z" fill="#ef4444" /> {/* Santa Suit Back */}
             
             {/* Head */}
             <path d="M75 60 L75 40 Q75 20 100 20 Q125 20 125 40 L125 60 Z" fill="#ffad60" />
             <path d="M70 40 Q65 20 85 15 Q100 10 115 15 Q135 20 130 40 L70 40 Z" fill="#fde047" stroke="#b45309" strokeWidth="1" /> {/* Hair */}
             
             {/* Santa Hat */}
             <path d="M70 30 Q100 -10 130 30" fill="#ef4444" />
             <circle cx="130" cy="30" r="8" fill="white" />

             {/* Exhaust */}
             <path d="M30 140 L10 140 L0 130" fill="none" stroke="#64748b" strokeWidth="3" />
             <circle cx="0" cy="130" r="5" fill="#64748b" opacity="0.5" className="animate-ping" />
        </svg>
    )
}

// --- NEW SANTA TRUMP FACE ICON (For Modal) ---
export const SantaTrumpFaceIcon = ({ className }: { className?: string }) => {
    return (
        <svg viewBox="0 0 200 200" className={className}>
            <defs>
                <linearGradient id="faceSkin" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffcd90" />
                    <stop offset="100%" stopColor="#ffad60" />
                </linearGradient>
            </defs>

            {/* Suit Shoulders */}
            <path d="M20 180 Q50 150 100 150 Q150 150 180 180 L180 200 L20 200 Z" fill="#ef4444" />
            <path d="M70 150 L130 150 L130 200 L70 200 Z" fill="#fff" /> {/* Center Fur */}

            {/* Neck */}
            <rect x="75" y="130" width="50" height="30" fill="#ffad60" />
            
            {/* Face Shape */}
            <path d="M50 60 Q50 140 100 150 Q150 140 150 60 Q150 20 100 20 Q50 20 50 60 Z" fill="url(#faceSkin)" stroke="#d97706" strokeWidth="2" />
            
            {/* Eyes */}
            <path d="M70 70 Q80 65 90 70" fill="none" stroke="#d97706" strokeWidth="2" />
            <circle cx="80" cy="75" r="3" fill="#1e3a8a" />
            <rect x="70" y="65" width="20" height="10" fill="#fff" opacity="0.3" rx="2"/> {/* Under eye bag */}

            <path d="M110 70 Q120 65 130 70" fill="none" stroke="#d97706" strokeWidth="2" />
            <circle cx="120" cy="75" r="3" fill="#1e3a8a" />
            <rect x="110" y="65" width="20" height="10" fill="#fff" opacity="0.3" rx="2"/>

            {/* Nose */}
            <path d="M100 70 L95 100 L105 100 Z" fill="#ffad60" />
            
            {/* Mouth (Pouting) */}
            <circle cx="100" cy="120" r="5" fill="#be123c" />
            
            {/* Hair */}
            <path d="M40 50 Q30 30 50 20 Q100 -10 150 20 Q170 30 160 50 L160 60 Q150 40 100 40 Q50 40 40 60 Z" fill="#fde047" stroke="#b45309" strokeWidth="2" />

            {/* Santa Hat */}
            <path d="M40 30 Q100 -20 160 30" fill="#ef4444" stroke="#991b1b" strokeWidth="3" />
            <path d="M40 30 L160 30 L100 -50 Z" fill="#ef4444" />
            <circle cx="180" cy="40" r="15" fill="white" />
            <rect x="35" y="30" width="130" height="15" rx="7" fill="white" />
        </svg>
    )
}

// --- DECOR ICONS ---
export const MountainRangeIcon = ({ className, style, fill = "#cbd5e1" }: IconProps & { fill?: string }) => (
    <svg viewBox="0 0 200 100" className={className} style={style}>
        <path d="M0 100 L50 20 L100 100" fill={fill} />
        <path d="M50 100 L100 10 L150 100" fill={fill} opacity="0.8" />
        <path d="M100 100 L150 30 L200 100" fill={fill} opacity="0.6" />
        {/* Snow caps */}
        <path d="M35 44 L50 20 L65 44 L50 35 Z" fill="white" />
        <path d="M85 37 L100 10 L115 37 L100 28 Z" fill="white" />
        <path d="M135 51 L150 30 L165 51 L150 42 Z" fill="white" />
    </svg>
);

export const NorthPoleVillageIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 400 100" className={className} style={style}>
        {/* Factory */}
        <rect x="50" y="40" width="80" height="60" fill="#991b1b" />
        <polygon points="50,40 90,10 130,40" fill="#7f1d1d" />
        <rect x="100" y="20" width="10" height="20" fill="#555" /> {/* Chimney */}
        <circle cx="105" cy="15" r="5" fill="#ccc" opacity="0.5" className="animate-ping" />
        {/* Windows */}
        <rect x="60" y="60" width="20" height="20" fill="#fef08a" />
        <rect x="100" y="60" width="20" height="20" fill="#fef08a" />
        
        {/* Elves House */}
        <rect x="250" y="50" width="60" height="50" fill="#166534" />
        <polygon points="250,50 280,20 310,50" fill="#14532d" />
        <rect x="270" y="70" width="20" height="30" fill="#fef08a" />
    </svg>
);

export const SantaMoonIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 200 200" className={className} style={style}>
        <circle cx="100" cy="100" r="80" fill="#fef9c3" />
        <circle cx="100" cy="100" r="75" fill="#fef08a" />
        {/* Silhouette */}
        <path d="M40 100 L60 100 L70 90 L50 90 Z" fill="#000" opacity="0.6" /> {/* Sleigh */}
        <path d="M80 95 L100 95 L110 85" fill="none" stroke="#000" strokeWidth="2" opacity="0.6" /> {/* Reins */}
        <circle cx="120" cy="90" r="5" fill="#000" opacity="0.6" /> {/* Reindeer */}
        <circle cx="140" cy="85" r="5" fill="#000" opacity="0.6" />
        <circle cx="160" cy="80" r="5" fill="#000" opacity="0.6" />
    </svg>
);

// --- CRYPTO ICONS ---
export const PhantomIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className}>
        <path d="M20 50 Q20 20 50 20 Q80 20 80 50 L80 90 L70 80 L60 90 L50 80 L40 90 L30 80 L20 90 Z" fill="#AB9FF2" />
        <circle cx="40" cy="50" r="5" fill="#fff" />
        <circle cx="60" cy="50" r="5" fill="#fff" />
    </svg>
);

export const SolanaIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className}>
        <defs>
             <linearGradient id="sol" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#9945FF" />
                  <stop offset="100%" stopColor="#14F195" />
             </linearGradient>
        </defs>
        <path d="M10 30 L30 10 L90 10 L70 30 Z" fill="url(#sol)" />
        <path d="M90 50 L70 70 L10 70 L30 50 Z" fill="url(#sol)" />
        <path d="M10 70 L30 50 L90 50 L70 70 Z" fill="none" /> 
        <path d="M10 70 L30 90 L90 90 L70 70 Z" fill="url(#sol)" />
    </svg>
);

export const TrumpTokenIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className}>
      <circle cx="32" cy="32" r="30" fill="#fcd34d" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="#b45309" strokeWidth="2" />
      {/* T for Trump */}
      <path d="M20 18 L44 18" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
      <path d="M32 18 L32 46" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
    </svg>
);

export const AirdropIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className}>
        {/* Parachute */}
        <path d="M20 40 Q50 -10 80 40" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
        <path d="M20 40 L40 60" stroke="#000" strokeWidth="1" />
        <path d="M80 40 L60 60" stroke="#000" strokeWidth="1" />
        <path d="M50 40 L50 60" stroke="#000" strokeWidth="1" />
        {/* Box */}
        <rect x="40" y="60" width="20" height="20" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
        <path d="M40 70 L60 70" stroke="#d97706" strokeWidth="2" />
        <path d="M50 60 L50 80" stroke="#d97706" strokeWidth="2" />
    </svg>
);

// Other Existing Icons...
export const BitcoinIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <circle cx="32" cy="32" r="30" fill="#f7931a" />
      <path d="M44 24h-4v-4h-4v4h-2v-4h-4v4h-2.5c-1.5 0-2.5 1-2.5 2.5v2c0 1.5 1 2.5 2.5 2.5h2.5v12h-2.5c-1.5 0-2.5 1-2.5 2.5v2c0 1.5 1 2.5 2.5 2.5h2.5v4h4v-4h4v4h4v-4h3c2.5 0 4.5-2 4.5-4.5 0-1.8-1-3.3-2.5-4 1.5-.7 2.5-2.2 2.5-4 0-2.5-2-4.5-4.5-4.5z" fill="#fff" />
    </svg>
);

export const DogeIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <circle cx="32" cy="32" r="30" fill="#ba9f33" />
      <text x="32" y="40" fontSize="35" textAnchor="middle" fill="#fff" fontWeight="bold">D</text>
    </svg>
);

export const TrumpIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 100 100" className={className} style={style}>
      <rect width="100" height="100" fill="#0f172a" />
      <path d="M50 20 Q80 20 80 50 Q80 80 50 80 Q20 80 20 50 Q20 20 50 20" fill="#ffad60" />
      <path d="M20 40 Q20 10 50 10 Q80 10 80 40" fill="#fde047" />
    </svg>
);

export const TaxIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <rect x="10" y="10" width="44" height="44" rx="5" fill="#ef4444" />
      <text x="32" y="42" fontSize="20" textAnchor="middle" fill="#fff" fontWeight="bold">TAX</text>
    </svg>
);

export const SecIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <circle cx="32" cy="32" r="30" fill="#334155" />
      <text x="32" y="42" fontSize="18" textAnchor="middle" fill="#fff" fontWeight="bold">SEC</text>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" className="animate-spin" />
    </svg>
);

export const FakeNewsIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <rect x="10" y="10" width="44" height="44" fill="#fff" stroke="#000" strokeWidth="2" />
        <path d="M15 20h34M15 30h34M15 40h20" stroke="#000" strokeWidth="2" />
        <text x="32" y="35" fontSize="40" textAnchor="middle" fill="red" opacity="0.8" transform="rotate(-20 32 32)">FAKE</text>
    </svg>
);

export const WallIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <rect x="4" y="10" width="56" height="44" fill="#fb923c" stroke="#c2410c" strokeWidth="2" />
      <path d="M4 25h56M4 40h56M20 10v15M40 10v15M10 25v15M30 25v15M50 25v15M20 40v14M40 40v14" stroke="#c2410c" strokeWidth="2" />
    </svg>
);

export const MagnetIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <path d="M10 20 Q10 0 32 0 Q54 0 54 20 L54 40 Q54 50 44 50 L40 50 L40 20 Q40 10 32 10 Q24 10 24 20 L24 50 L20 50 Q10 50 10 40 Z" fill="#ef4444" />
      <rect x="10" y="40" width="14" height="10" fill="#e5e7eb" />
      <rect x="40" y="40" width="14" height="10" fill="#e5e7eb" />
    </svg>
);

export const RocketIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <path d="M32 2 Q50 20 50 40 L40 60 L32 50 L24 60 L14 40 Q14 20 32 2" fill="#3b82f6" />
      <circle cx="32" cy="30" r="8" fill="#93c5fd" />
      <path d="M24 60 L32 70 L40 60" fill="#f59e0b" className="animate-pulse" />
    </svg>
);

export const TeslaCoilIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
      <rect x="24" y="40" width="16" height="24" fill="#334155" />
      <circle cx="32" cy="20" r="16" fill="#0ea5e9" className="animate-pulse-scale" />
      <path d="M32 20 L10 10 M32 20 L54 10 M32 20 L10 40 M32 20 L54 40" stroke="#7dd3fc" strokeWidth="2" className="animate-spin" style={{transformOrigin: '32px 20px'}} />
    </svg>
);

export const ElonTruckIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 100 50" className={className} style={style}>
        <path d="M0 40 L10 20 L40 0 L90 20 L100 40" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="15" y="40" width="15" height="10" fill="black" />
        <rect x="70" y="40" width="15" height="10" fill="black" />
        <path d="M40 5 L80 20" stroke="#0ea5e9" strokeWidth="2" opacity="0.8" /> {/* Window */}
    </svg>
);

export const DietCokeIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <rect x="20" y="10" width="24" height="44" fill="#e5e7eb" />
        <rect x="20" y="20" width="24" height="24" fill="#dc2626" />
        <text x="32" y="35" fontSize="10" textAnchor="middle" fill="white" fontWeight="bold">DIET</text>
    </svg>
);

export const CovfefeIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <circle cx="32" cy="32" r="28" fill="#a855f7" className="animate-pulse" />
        <text x="32" y="36" fontSize="12" textAnchor="middle" fill="white">???</text>
    </svg>
);

export const HamberderIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <rect x="12" y="14" width="40" height="10" rx="5" fill="#fbbf24" /> {/* Bun Top */}
        <rect x="10" y="24" width="44" height="6" rx="2" fill="#166534" /> {/* Lettuce */}
        <rect x="12" y="30" width="40" height="8" rx="2" fill="#7f1d1d" /> {/* Meat */}
        <rect x="12" y="40" width="40" height="8" rx="4" fill="#fbbf24" /> {/* Bun Bottom */}
    </svg>
);

export const GoldenSneakersIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <path d="M10 40 L20 20 L40 20 L50 40 L50 50 L10 50 Z" fill="#fcd34d" />
        <rect x="10" y="50" width="40" height="5" fill="#fff" />
        <path d="M30 25 L45 25" stroke="#fff" strokeWidth="2" />
        <circle cx="35" cy="35" r="4" fill="#ef4444" /> {/* T logo */}
    </svg>
);

// --- CHRISTMAS ENTITIES ---
export const GiftIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <rect x="12" y="20" width="40" height="36" fill="#ef4444" />
        <rect x="28" y="20" width="8" height="36" fill="#fde047" />
        <rect x="12" y="34" width="40" height="8" fill="#fde047" />
        <path d="M28 20 Q20 0 32 10 Q44 0 36 20" fill="none" stroke="#fde047" strokeWidth="4" />
    </svg>
);

export const PineTreeIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <polygon points="32,4 12,50 52,50" fill="#15803d" />
        <rect x="28" y="50" width="8" height="10" fill="#78350f" />
        <circle cx="20" cy="40" r="3" fill="#fde047" />
        <circle cx="40" cy="30" r="3" fill="#ef4444" />
        <circle cx="32" cy="20" r="3" fill="#3b82f6" />
    </svg>
);

export const SnowmanIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <circle cx="32" cy="46" r="14" fill="#fff" />
        <circle cx="32" cy="24" r="10" fill="#fff" />
        <rect x="26" y="8" width="12" height="8" fill="#1e293b" /> {/* Hat */}
        <rect x="22" y="16" width="20" height="2" fill="#1e293b" />
        <circle cx="30" cy="22" r="1" fill="#000" />
        <circle cx="34" cy="22" r="1" fill="#000" />
        <polygon points="32,24 32,28 38,26" fill="#f97316" /> {/* Nose */}
    </svg>
);

export const CandyCaneIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <path d="M24 16 Q24 4 36 4 T48 16 L48 56 Q48 60 40 60 T32 56 L32 16" fill="none" stroke="#fff" strokeWidth="12" strokeLinecap="round" />
        <path d="M24 16 Q24 4 36 4 T48 16 L48 56 Q48 60 40 60 T32 56 L32 16" fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" strokeDasharray="10, 10" />
    </svg>
);

export const CoalIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <path d="M10 30 L20 10 L50 20 L60 40 L40 60 L10 50 Z" fill="#1c1917" />
        <path d="M20 30 L30 20 L40 30 L30 40 Z" fill="#44403c" opacity="0.5" />
    </svg>
);

export const GrinchIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <path d="M10 10 Q32 0 54 10 L60 30 Q64 64 32 64 Q0 64 4 30 Z" fill="#65a30d" />
        <path d="M15 25 L25 30" stroke="#14532d" strokeWidth="3" /> {/* Eyebrows */}
        <path d="M49 25 L39 30" stroke="#14532d" strokeWidth="3" />
        <circle cx="20" cy="35" r="3" fill="#fbbf24" /> {/* Eyes */}
        <circle cx="44" cy="35" r="3" fill="#fbbf24" />
        <path d="M20 50 Q32 60 44 50" fill="none" stroke="#000" strokeWidth="3" /> {/* Smile */}
    </svg>
);

// --- NEW OBSTACLES & POWERUPS ---

export const SwampIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <path d="M5 40 Q20 30 35 40 Q50 50 60 40 L60 60 L5 60 Z" fill="#3f6212" opacity="0.8" />
        <path d="M10 50 Q25 45 40 50 Q55 55 50 50" fill="none" stroke="#84cc16" strokeWidth="2" />
        <circle cx="20" cy="45" r="3" fill="#bef264" className="animate-ping" />
        <circle cx="50" cy="55" r="2" fill="#bef264" className="animate-ping" style={{animationDelay: '0.5s'}} />
    </svg>
);

export const MysteryBoxIcon = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 64 64" className={className} style={style}>
        <rect x="12" y="12" width="40" height="40" rx="5" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
        <text x="32" y="44" fontSize="30" textAnchor="middle" fill="#fff" fontWeight="bold">?</text>
        <path d="M12 12 L52 52 M52 12 L12 52" stroke="#b45309" strokeWidth="1" opacity="0.3" />
    </svg>
);

export const LaserEyesEffect = ({ className, style }: IconProps) => (
    <svg viewBox="0 0 200 600" className={className} style={style}>
        <line x1="80" y1="0" x2="80" y2="600" stroke="#ef4444" strokeWidth="5" className="animate-pulse" />
        <line x1="120" y1="0" x2="120" y2="600" stroke="#ef4444" strokeWidth="5" className="animate-pulse" />
        <line x1="80" y1="0" x2="80" y2="600" stroke="#fecaca" strokeWidth="2" />
        <line x1="120" y1="0" x2="120" y2="600" stroke="#fecaca" strokeWidth="2" />
    </svg>
);