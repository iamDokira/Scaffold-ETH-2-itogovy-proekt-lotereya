// SVG-иконки в стиле «Русского лото» — бочонок, билет, мешок, трофей, люди, раунд

export function BarrelIcon({ className = "w-10 h-10", number = 7 }: { className?: string; number?: number }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="barrel-body" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#F5DEB3" />
          <stop offset="100%" stopColor="#D2B48C" />
        </radialGradient>
        <radialGradient id="barrel-end" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#FFE4B5" />
          <stop offset="100%" stopColor="#DEB887" />
        </radialGradient>
      </defs>
      {/* Бочонок */}
      <ellipse cx="32" cy="32" rx="18" ry="22" fill="url(#barrel-body)" stroke="#5C3A1E" strokeWidth="2" />
      {/* Полоски */}
      <path d="M14 22 Q32 18 50 22" stroke="#8B5A2B" strokeWidth="1.5" fill="none" />
      <path d="M14 32 Q32 34 50 32" stroke="#8B5A2B" strokeWidth="1.5" fill="none" />
      <path d="M14 42 Q32 46 50 42" stroke="#8B5A2B" strokeWidth="1.5" fill="none" />
      {/* Крышка с номером */}
      <ellipse cx="32" cy="32" rx="9" ry="10" fill="url(#barrel-end)" stroke="#5C3A1E" strokeWidth="1.5" />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fontSize="11"
        fontWeight="900"
        fill="#8B0000"
        fontFamily="Arial Black, Arial"
      >
        {number}
      </text>
    </svg>
  );
}

export function TicketIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ticket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </linearGradient>
      </defs>
      <rect x="6" y="16" width="52" height="32" rx="3" fill="url(#ticket-grad)" stroke="#8B0000" strokeWidth="2.5" />
      {/* Зубцы */}
      <circle cx="6" cy="22" r="2" fill="#8B0000" />
      <circle cx="6" cy="32" r="2" fill="#8B0000" />
      <circle cx="6" cy="42" r="2" fill="#8B0000" />
      <circle cx="58" cy="22" r="2" fill="#8B0000" />
      <circle cx="58" cy="32" r="2" fill="#8B0000" />
      <circle cx="58" cy="42" r="2" fill="#8B0000" />
      {/* Сетка */}
      <line x1="18" y1="24" x2="48" y2="24" stroke="#8B0000" strokeWidth="1.2" strokeDasharray="2 2" />
      <line x1="18" y1="32" x2="48" y2="32" stroke="#8B0000" strokeWidth="1.2" strokeDasharray="2 2" />
      <line x1="18" y1="40" x2="48" y2="40" stroke="#8B0000" strokeWidth="1.2" strokeDasharray="2 2" />
      <text x="32" y="36" textAnchor="middle" fontSize="9" fontWeight="900" fill="#8B0000" fontFamily="Arial Black">
        ЛОТО
      </text>
    </svg>
  );
}

export function TrophyIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cup-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
      <path
        d="M20 10 L44 10 L42 28 Q42 36 32 38 Q22 36 22 28 Z"
        fill="url(#cup-grad)"
        stroke="#8B0000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M20 14 Q12 14 12 22 Q12 28 20 28" stroke="#8B0000" strokeWidth="2.5" fill="none" />
      <path d="M44 14 Q52 14 52 22 Q52 28 44 28" stroke="#8B0000" strokeWidth="2.5" fill="none" />
      <rect x="28" y="38" width="8" height="8" fill="#B8860B" stroke="#8B0000" strokeWidth="2" />
      <rect x="20" y="46" width="24" height="6" rx="1" fill="#8B0000" />
      {/* Звезда */}
      <path d="M32 18 L34 24 L40 24 L35 28 L37 34 L32 30 L27 34 L29 28 L24 24 L30 24 Z" fill="#FFF8DC" />
    </svg>
  );
}

export function PeopleIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="22" r="8" fill="#FFD700" stroke="#8B0000" strokeWidth="2.5" />
      <path d="M8 50 Q8 38 24 38 Q40 38 40 50" stroke="#8B0000" strokeWidth="2.5" fill="#F5DEB3" />
      <circle cx="44" cy="26" r="6" fill="#FFD700" stroke="#8B0000" strokeWidth="2" />
      <path d="M32 52 Q32 42 44 42 Q56 42 56 52" stroke="#8B0000" strokeWidth="2" fill="#F5DEB3" />
    </svg>
  );
}

export function RoundIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="22" fill="#F5DEB3" stroke="#8B0000" strokeWidth="2.5" />
      <path d="M32 14 L32 32 L44 38" stroke="#8B0000" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="32" r="3" fill="#8B0000" />
    </svg>
  );
}
