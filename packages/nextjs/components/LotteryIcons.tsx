// SVG-иконки в стиле «Русского лото» — бочонок, билет, мешок

export function BarrelIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Бочонок */}
      <ellipse cx="32" cy="32" rx="18" ry="22" fill="#F5DEB3" stroke="#8B4513" strokeWidth="2.5" />
      <path d="M14 22 Q32 18 50 22" stroke="#8B4513" strokeWidth="2" fill="none" />
      <path d="M14 42 Q32 46 50 42" stroke="#8B4513" strokeWidth="2" fill="none" />
      <ellipse cx="32" cy="32" rx="8" ry="9" fill="#FFD700" stroke="#8B4513" strokeWidth="1.5" />
      <text x="32" y="36" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8B0000" fontFamily="Arial">
        7
      </text>
      <circle cx="24" cy="32" r="1.5" fill="#8B4513" />
      <circle cx="40" cy="32" r="1.5" fill="#8B4513" />
    </svg>
  );
}

export function TicketIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="48" height="24" rx="3" fill="#FFD700" stroke="#8B0000" strokeWidth="2.5" />
      <circle cx="8" cy="32" r="3" fill="#8B0000" />
      <circle cx="56" cy="32" r="3" fill="#8B0000" />
      <line x1="20" y1="26" x2="44" y2="26" stroke="#8B0000" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="20" y1="32" x2="44" y2="32" stroke="#8B0000" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="20" y1="38" x2="44" y2="38" stroke="#8B0000" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

export function TrophyIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 12 L44 12 L42 28 Q42 36 32 38 Q22 36 22 28 Z"
        fill="#FFD700"
        stroke="#8B0000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 16 Q12 16 12 24 Q12 30 20 30" stroke="#8B0000" strokeWidth="2.5" fill="none" />
      <path d="M44 16 Q52 16 52 24 Q52 30 44 30" stroke="#8B0000" strokeWidth="2.5" fill="none" />
      <rect x="28" y="38" width="8" height="8" fill="#FFD700" stroke="#8B0000" strokeWidth="2" />
      <rect x="22" y="46" width="20" height="6" rx="1" fill="#8B0000" />
      <path d="M32 20 L34 26 L40 26 L35 30 L37 36 L32 32 L27 36 L29 30 L24 26 L30 26 Z" fill="#FFF8DC" />
    </svg>
  );
}

export function PeopleIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="22" r="8" fill="#FFD700" stroke="#8B0000" strokeWidth="2.5" />
      <path d="M8 50 Q8 38 24 38 Q40 38 40 50" stroke="#8B0000" strokeWidth="2.5" fill="#F5DEB3" />
      <circle cx="44" cy="26" r="6" fill="#FFD700" stroke="#8B0000" strokeWidth="2" />
      <path d="M32 52 Q32 42 44 42 Q56 42 56 52" stroke="#8B0000" strokeWidth="2" fill="#F5DEB3" />
    </svg>
  );
}

export function RoundIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" fill="#F5DEB3" stroke="#8B0000" strokeWidth="2.5" />
      <path d="M32 14 L32 32 L44 38" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="32" r="3" fill="#8B0000" />
    </svg>
  );
}
