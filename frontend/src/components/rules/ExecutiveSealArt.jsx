import React from 'react';

/**
 * ExecutiveSealArt: Renders ultra-premium, high-resolution official vector seals
 * for SSA TEAM Lead Admin and Constitutional Ratification.
 */
export const ExecutiveSealArt = ({ type = 'gold_crest', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-20 h-20 min-w-[80px]',
    md: 'w-32 h-32 min-w-[128px]',
    lg: 'w-44 h-44 min-w-[176px]',
    xl: 'w-56 h-56 min-w-[224px]'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (type === 'dual_brand') {
    // 2. WEBLETS × STACKADDA PRESIDENTIAL DUAL BRAND SEAL
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${currentSize} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl filter">
          <defs>
            <linearGradient id="dbGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="dbGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="50%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id="dbGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            {/* Circular Path for Top Text */}
            <path id="dbTextTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
            {/* Circular Path for Bottom Text */}
            <path id="dbTextBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
          </defs>

          {/* Ribbon Tails hanging down */}
          <path d="M 80,165 L 70,196 L 85,188 L 100,196 L 94,165 Z" fill="#991b1b" opacity="0.9" />
          <path d="M 106,165 L 100,196 L 115,188 L 130,196 L 120,165 Z" fill="#b91c1c" opacity="0.9" />

          {/* Outer Scalloped Gear Ring (32 Points) */}
          <circle cx="100" cy="100" r="92" fill="url(#dbGradOuter)" stroke="#fef08a" strokeWidth="2.5" />
          
          {/* Radial Decorative Points */}
          <circle cx="100" cy="100" r="85" fill="none" stroke="#fde047" strokeWidth="1" strokeDasharray="3,3" />

          {/* Inner Field */}
          <circle cx="100" cy="100" r="76" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="100" cy="100" r="62" fill="url(#dbGradInner)" stroke="#b45309" strokeWidth="1.5" />

          {/* Top Curved Text */}
          <text fill="#fef08a" fontSize="8.5" fontWeight="900" letterSpacing="1.2" fontFamily="sans-serif">
            <textPath href="#dbTextTop" startOffset="50%" textAnchor="middle">
              ★ WEBLETS × STACKADDA ★
            </textPath>
          </text>

          {/* Bottom Curved Text */}
          <text fill="#fef08a" fontSize="7.5" fontWeight="800" letterSpacing="1" fontFamily="sans-serif">
            <textPath href="#dbTextBottom" startOffset="50%" textAnchor="middle">
              ★ CONSTITUTIONAL CHARTER ★
            </textPath>
          </text>

          {/* Center Insignia */}
          <g transform="translate(100, 100)">
            {/* Heraldic Shield */}
            <path d="M -22,-18 L 22,-18 C 22,10 0,26 0,26 C 0,26 -22,10 -22,-18 Z" fill="#991b1b" stroke="#d97706" strokeWidth="1.5" />
            <text x="0" y="-3" fill="#fef08a" fontSize="11" fontWeight="900" textAnchor="middle" fontFamily="monospace">W × S</text>
            <text x="0" y="8" fill="#fde68a" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">FOUNDERS</text>
            <text x="0" y="16" fill="#fef08a" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2026</text>
          </g>

          {/* Center Banner Ribbon */}
          <path d="M 45,102 Q 100,110 155,102 L 150,114 Q 100,122 50,114 Z" fill="url(#dbGoldRibbon)" stroke="#fef08a" strokeWidth="0.8" />
          <text x="100" y="112" fill="#fffbeb" fontSize="6.5" fontWeight="900" letterSpacing="0.8" textAnchor="middle" fontFamily="sans-serif">
            RATIFIED & SEALED
          </text>
        </svg>
      </div>
    );
  }

  if (type === 'protocol') {
    // 3. EMERALD SECURITY & OPERATING PROTOCOL v2.0 SEAL
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${currentSize} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl filter">
          <defs>
            <linearGradient id="protoGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
            <linearGradient id="protoGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <path id="protoTextTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
            <path id="protoTextBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
          </defs>

          {/* Outer Border with Security Guilloche teeth */}
          <circle cx="100" cy="100" r="92" fill="url(#protoGradOuter)" stroke="#fde047" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="86" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2,3" />

          {/* Middle Band */}
          <circle cx="100" cy="100" r="77" fill="#064e3b" stroke="#f59e0b" strokeWidth="1.8" />
          <circle cx="100" cy="100" r="62" fill="#ecfdf5" stroke="#047857" strokeWidth="1.5" />

          {/* Top Curved Text */}
          <text fill="#fef08a" fontSize="8" fontWeight="900" letterSpacing="1.2" fontFamily="sans-serif">
            <textPath href="#protoTextTop" startOffset="50%" textAnchor="middle">
              ★ OPERATING PROTOCOL v2.0 ★
            </textPath>
          </text>

          {/* Bottom Curved Text */}
          <text fill="#fef08a" fontSize="7" fontWeight="800" letterSpacing="1" fontFamily="sans-serif">
            <textPath href="#protoTextBottom" startOffset="50%" textAnchor="middle">
              ★ 2-STRIKE CONSTITUTION ★
            </textPath>
          </text>

          {/* Center Graphic: Security Padlock & Legal Scale */}
          <g transform="translate(100, 96)">
            {/* Padlock Arch */}
            <path d="M -9,-2 A 9,9 0 0,1 9,-2 L 9,6 L -9,6 Z" fill="none" stroke="#d97706" strokeWidth="3" />
            {/* Padlock Body */}
            <rect x="-14" y="5" width="28" height="22" rx="4" fill="#047857" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="0" cy="14" r="2.5" fill="#fde047" />
            <path d="M 0,14 L 0,20" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          <text x="100" y="132" fill="#065f46" fontSize="6.5" fontWeight="900" letterSpacing="0.8" textAnchor="middle" fontFamily="monospace">
            STRICT VERIFIED
          </text>
        </svg>
      </div>
    );
  }

  if (type === 'royal_onyx') {
    // 4. ROYAL ONYX & PLATINUM SUPREME LEAD ADMIN SEAL
    return (
      <div className={`relative inline-flex items-center justify-center select-none ${currentSize} ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl filter">
          <defs>
            <linearGradient id="onyxGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="onyxGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <path id="onyxTextTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
            <path id="onyxTextBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
          </defs>

          {/* Platinum / Chrome Scallop edge */}
          <circle cx="100" cy="100" r="92" fill="url(#onyxGradOuter)" stroke="#e2e8f0" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3,3" />

          {/* Inner Onyx Field */}
          <circle cx="100" cy="100" r="76" fill="#020617" stroke="url(#onyxGold)" strokeWidth="2" />
          <circle cx="100" cy="100" r="62" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />

          {/* Top Curved Text */}
          <text fill="#fef08a" fontSize="8" fontWeight="900" letterSpacing="1.2" fontFamily="sans-serif">
            <textPath href="#onyxTextTop" startOffset="50%" textAnchor="middle">
              ★ LEAD ADMIN AUTHORITY ★
            </textPath>
          </text>

          {/* Bottom Curved Text */}
          <text fill="#fef08a" fontSize="7" fontWeight="800" letterSpacing="1" fontFamily="sans-serif">
            <textPath href="#onyxTextBottom" startOffset="50%" textAnchor="middle">
              ★ PERPETUAL SUPREME STATUS ★
            </textPath>
          </text>

          {/* Crown & Stars Insignia */}
          <g transform="translate(100, 92)">
            {/* Crown */}
            <path d="M -16,8 L -18,-8 L -8,0 L 0,-10 L 8,0 L 18,-8 L 16,8 Z" fill="url(#onyxGold)" stroke="#fef08a" strokeWidth="1" />
            <circle cx="-18" cy="-9" r="1.5" fill="#ffffff" />
            <circle cx="0" cy="-11" r="2" fill="#ffffff" />
            <circle cx="18" cy="-9" r="1.5" fill="#ffffff" />
            <rect x="-16" y="9" width="32" height="4" rx="1" fill="#ca8a04" />
          </g>

          <text x="100" y="122" fill="#ffffff" fontSize="9" fontWeight="900" letterSpacing="1" textAnchor="middle" fontFamily="monospace">
            SSA TEAM
          </text>
          <text x="100" y="131" fill="#eab308" fontSize="6" fontWeight="bold" letterSpacing="0.5" textAnchor="middle" fontFamily="sans-serif">
            CHIEF EXECUTOR
          </text>
        </svg>
      </div>
    );
  }

  // 1. DEFAULT: SSA TEAM IMPERIAL GOLD CREST SEAL
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${currentSize} ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl filter">
        <defs>
          <linearGradient id="goldGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id="goldGradInner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <path id="goldTextTop" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
          <path id="goldTextBottom" d="M 170,100 A 70,70 0 0,1 30,100" fill="none" />
        </defs>

        {/* Hanging Royal Blue & Gold Ribbon Tails */}
        <path d="M 82,165 L 72,197 L 87,189 L 100,197 L 95,165 Z" fill="#1e3a8a" stroke="#d97706" strokeWidth="0.8" />
        <path d="M 105,165 L 100,197 L 114,189 L 128,197 L 118,165 Z" fill="#1e40af" stroke="#f59e0b" strokeWidth="0.8" />

        {/* 24-Point Gold Starburst Ring */}
        <circle cx="100" cy="100" r="92" fill="url(#goldGradOuter)" stroke="#fef9c3" strokeWidth="2.5" />
        
        {/* Double Beaded Rings */}
        <circle cx="100" cy="100" r="85" fill="none" stroke="#78350f" strokeWidth="1.2" strokeDasharray="3,2" />
        <circle cx="100" cy="100" r="77" fill="#78350f" stroke="#fef08a" strokeWidth="2" />
        <circle cx="100" cy="100" r="63" fill="url(#goldGradInner)" stroke="#b45309" strokeWidth="2" />

        {/* Top Text */}
        <text fill="#fef08a" fontSize="8.2" fontWeight="900" letterSpacing="1.2" fontFamily="sans-serif">
          <textPath href="#goldTextTop" startOffset="50%" textAnchor="middle">
            ★ SSA TEAM EXECUTIVE COUNCIL ★
          </textPath>
        </text>

        {/* Bottom Text */}
        <text fill="#fef08a" fontSize="7.2" fontWeight="800" letterSpacing="1" fontFamily="sans-serif">
          <textPath href="#goldTextBottom" startOffset="50%" textAnchor="middle">
            ★ RATIFIED & IMMUTABLE • 2026 ★
          </textPath>
        </text>

        {/* Center Imperial Crest: 3 Stars & Crown */}
        <g transform="translate(100, 88)">
          {/* 3 Golden Stars representing 3 Founders */}
          <polygon points="0,-12 3,-4 11,-4 5,2 7,10 0,5 -7,10 -5,2 -11,-4 -3,-4" fill="#d97706" />
          <polygon points="-16,-6 -14,0 -7,0 -12,4 -10,11 -16,7 -22,11 -20,4 -25,0 -18,0" fill="#b45309" transform="scale(0.7) translate(-10, -5)" />
          <polygon points="16,-6 18,0 25,0 20,4 22,11 16,7 10,11 12,4 7,0 14,0" fill="#b45309" transform="scale(0.7) translate(10, -5)" />
        </g>

        {/* Text Inside Inner Gold Medallion */}
        <text x="100" y="112" fill="#78350f" fontSize="11" fontWeight="900" letterSpacing="1.5" textAnchor="middle" fontFamily="monospace">
          SSA TEAM
        </text>
        <text x="100" y="122" fill="#92400e" fontSize="6.5" fontWeight="bold" letterSpacing="0.8" textAnchor="middle" fontFamily="sans-serif">
          LEAD ADMIN WITNESS
        </text>
        <text x="100" y="130" fill="#b45309" fontSize="5.5" fontWeight="extrabold" letterSpacing="0.5" textAnchor="middle" fontFamily="monospace">
          ★ OFFICIAL SEAL ★
        </text>
      </svg>
    </div>
  );
};
