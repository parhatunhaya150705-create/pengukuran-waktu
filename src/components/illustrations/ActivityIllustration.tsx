import React, { useState } from 'react';
import { ActivityKey } from '../../types/media';

interface ActivityIllustrationProps {
  activityKey: ActivityKey;
  customImageUrl?: string;
  alt: string;
  className?: string;
}

export const ActivityIllustration: React.FC<ActivityIllustrationProps> = ({
  activityKey,
  customImageUrl,
  alt,
  className = 'w-full h-36',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (customImageUrl && !imgFailed) {
    return (
      <img
        src={customImageUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl ${className}`}>
      <svg viewBox="0 0 240 150" className="h-full w-full" role="img" aria-label={alt}>
        {activityKey === 'bangun' && (
          <g>
            <rect width="240" height="150" fill="#E0F2FE" />
            <circle cx="195" cy="36" r="18" fill="#FACC15" />
            <rect x="24" y="96" width="192" height="54" fill="#BAE6FD" />
            {/* Bed */}
            <rect x="46" y="76" width="128" height="44" rx="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
            <rect x="46" y="92" width="128" height="32" rx="6" fill="#38BDF8" />
            <rect x="52" y="68" width="32" height="18" rx="6" fill="#FEF08A" stroke="#CA8A04" strokeWidth="2" />
            {/* Stretching kid */}
            <circle cx="98" cy="64" r="15" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
            <path d="M84 58C86 48 110 48 112 58" fill="#3B2314" />
            <path d="M88 64Q98 71 108 64" stroke="#9F1239" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M84 74L72 58M112 74L124 58" stroke="#FACC15" strokeWidth="7" strokeLinecap="round" />
          </g>
        )}

        {activityKey === 'mandi' && (
          <g>
            <rect width="240" height="150" fill="#ECFEFF" />
            <rect x="0" y="106" width="240" height="44" fill="#CFFAFE" />
            {/* Shower head */}
            <path d="M180 10V36H158" stroke="#64748B" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M148 36H168L164 46H152L148 36Z" fill="#0284C7" />
            {/* Water drops */}
            <line x1="152" y1="54" x2="148" y2="66" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="160" y1="56" x2="158" y2="68" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="167" y1="54" x2="169" y2="66" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            {/* Bathtub + bubbles */}
            <path d="M52 88H164V112C164 124 150 130 134 130H82C66 130 52 124 52 112V88Z" fill="#FFFFFF" stroke="#0891B2" strokeWidth="3" />
            <circle cx="84" cy="84" r="12" fill="#FFFFFF" stroke="#A5F3FC" strokeWidth="2" />
            <circle cx="102" cy="80" r="14" fill="#FFFFFF" stroke="#A5F3FC" strokeWidth="2" />
            <circle cx="122" cy="85" r="11" fill="#FFFFFF" stroke="#A5F3FC" strokeWidth="2" />
            {/* Duck */}
            <circle cx="142" cy="80" r="8" fill="#FACC15" />
            <polygon points="149,79 156,81 149,83" fill="#EA580C" />
          </g>
        )}

        {activityKey === 'sarapan' && (
          <g>
            <rect width="240" height="150" fill="#FEF9C3" />
            <rect x="20" y="96" width="200" height="54" rx="8" fill="#FDE68A" stroke="#D97706" strokeWidth="3" />
            {/* Plate */}
            <ellipse cx="110" cy="108" rx="44" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />
            <ellipse cx="110" cy="107" rx="30" ry="11" fill="#F1F5F9" />
            {/* Bread & Egg */}
            <rect x="86" y="96" width="24" height="16" rx="4" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <circle cx="125" cy="105" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="125" cy="105" r="4.5" fill="#FACC15" />
            {/* Milk glass */}
            <rect x="172" y="72" width="22" height="34" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
            <rect x="174" y="82" width="18" height="22" fill="#E0F2FE" />
          </g>
        )}

        {activityKey === 'sekolah' && (
          <g>
            <rect width="240" height="150" fill="#BAE6FD" />
            <circle cx="44" cy="34" r="16" fill="#FACC15" />
            <rect x="0" y="114" width="240" height="36" fill="#86EFAC" />
            {/* School building */}
            <rect x="64" y="48" width="112" height="68" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
            <polygon points="56,50 120,20 184,50" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
            <rect x="106" y="80" width="28" height="36" rx="3" fill="#0284C7" />
            <rect x="74" y="66" width="20" height="18" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
            <rect x="146" y="66" width="20" height="18" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
            {/* Flag */}
            <line x1="32" y1="44" x2="32" y2="114" stroke="#475569" strokeWidth="3" />
            <rect x="33" y="45" width="22" height="8" fill="#DC2626" />
            <rect x="33" y="53" width="22" height="8" fill="#FFFFFF" />
          </g>
        )}

        {activityKey === 'belajar' && (
          <g>
            <rect width="240" height="150" fill="#F0FDF4" />
            {/* Chalkboard */}
            <rect x="42" y="20" width="156" height="68" rx="6" fill="#15803D" stroke="#92400E" strokeWidth="5" />
            <text x="120" y="50" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">12 + 3 = 15</text>
            <text x="120" y="70" textAnchor="middle" fill="#BBF7D0" fontSize="11">Matematika Jam</text>
            {/* Desk & Book */}
            <rect x="62" y="106" width="116" height="44" rx="4" fill="#FDBA74" stroke="#C2410C" strokeWidth="2.5" />
            <path d="M90 96H120V114H90Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
            <path d="M120 96H150V114H120Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          </g>
        )}

        {activityKey === 'istirahat' && (
          <g>
            <rect width="240" height="150" fill="#ECFDF5" />
            <rect x="0" y="106" width="240" height="44" fill="#6EE7B7" />
            {/* Bench */}
            <rect x="52" y="84" width="136" height="14" rx="4" fill="#D97706" stroke="#92400E" strokeWidth="2" />
            <rect x="64" y="98" width="10" height="22" fill="#92400E" />
            <rect x="166" y="98" width="10" height="22" fill="#92400E" />
            {/* Lunchbox & Bottle */}
            <rect x="86" y="66" width="38" height="20" rx="5" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
            <rect x="136" y="58" width="18" height="28" rx="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
            {/* Apple */}
            <circle cx="170" cy="76" r="9" fill="#EF4444" />
            <path d="M170 67Q174 61 178 64" stroke="#16A34A" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {activityKey === 'pulang' && (
          <g>
            <rect width="240" height="150" fill="#FEF3C7" />
            <circle cx="120" cy="34" r="18" fill="#F59E0B" />
            <rect x="0" y="108" width="240" height="42" fill="#86EFAC" />
            {/* Cozy Home */}
            <rect x="76" y="60" width="88" height="54" fill="#FFFBEB" stroke="#D97706" strokeWidth="2.5" />
            <polygon points="66,62 120,28 174,62" fill="#0D9488" stroke="#115E59" strokeWidth="2.5" />
            <rect x="108" y="82" width="24" height="32" rx="3" fill="#F59E0B" />
            {/* Winding path */}
            <path d="M108 114Q120 134 150 150H90Q106 132 108 114Z" fill="#FDE68A" />
          </g>
        )}

        {activityKey === 'bermain' && (
          <g>
            <rect width="240" height="150" fill="#E0F2FE" />
            <circle cx="194" cy="40" r="16" fill="#FB923C" />
            <rect x="0" y="102" width="240" height="48" fill="#4ADE80" />
            {/* Swing set */}
            <line x1="60" y1="36" x2="140" y2="36" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
            <line x1="60" y1="36" x2="46" y2="112" stroke="#0284C7" strokeWidth="4" />
            <line x1="140" y1="36" x2="154" y2="112" stroke="#0284C7" strokeWidth="4" />
            <line x1="88" y1="36" x2="88" y2="86" stroke="#64748B" strokeWidth="2" />
            <line x1="112" y1="36" x2="112" y2="86" stroke="#64748B" strokeWidth="2" />
            <rect x="82" y="86" width="36" height="7" rx="3" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
            {/* Soccer ball */}
            <circle cx="182" cy="116" r="15" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
            <polygon points="182,108 189,113 186,121 178,121 175,113" fill="#1E293B" />
          </g>
        )}

        {activityKey === 'makan_malam' && (
          <g>
            <rect width="240" height="150" fill="#312E81" />
            <circle cx="42" cy="30" r="10" fill="#FEF08A" />
            <circle cx="198" cy="26" r="2" fill="#FFFFFF" />
            <circle cx="174" cy="40" r="2" fill="#FFFFFF" />
            {/* Dining Table */}
            <rect x="34" y="96" width="172" height="54" rx="8" fill="#F59E0B" stroke="#92400E" strokeWidth="3" />
            {/* Warm Lamp */}
            <line x1="120" y1="0" x2="120" y2="38" stroke="#CBD5E1" strokeWidth="2.5" />
            <polygon points="96,52 144,52 134,34 106,34" fill="#FACC15" />
            {/* Bowl & Rice */}
            <path d="M90 92H150C148 112 136 120 120 120C104 120 92 112 90 92Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M96 92C102 80 138 80 144 92Z" fill="#FEF9C3" />
          </g>
        )}

        {activityKey === 'tidur' && (
          <g>
            <rect width="240" height="150" fill="#1E1B4B" />
            {/* Crescent Moon & Stars */}
            <path d="M188 26A16 16 0 1 0 206 46A12 12 0 1 1 188 26Z" fill="#FDE047" />
            <circle cx="52" cy="30" r="2.5" fill="#FEF08A" />
            <circle cx="88" cy="22" r="2" fill="#FEF08A" />
            <circle cx="144" cy="36" r="2.5" fill="#FEF08A" />
            {/* Cozy Bed */}
            <rect x="44" y="88" width="152" height="44" rx="10" fill="#312E81" stroke="#6366F1" strokeWidth="2.5" />
            <rect x="52" y="76" width="38" height="20" rx="7" fill="#E0E7FF" />
            <rect x="82" y="88" width="112" height="36" rx="8" fill="#818CF8" />
            {/* Sleeping head */}
            <circle cx="72" cy="78" r="13" fill="#FCD5B5" />
            <path d="M66 78Q70 81 74 78" stroke="#1E293B" strokeWidth="2" fill="none" strokeLinecap="round" />
            <text x="98" y="64" fill="#E0E7FF" fontSize="13" fontWeight="bold">Zzz</text>
          </g>
        )}
      </svg>
    </div>
  );
};
