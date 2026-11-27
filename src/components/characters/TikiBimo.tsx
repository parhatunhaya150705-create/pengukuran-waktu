import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

export type TikiPose = 'happy' | 'pointing' | 'thinking' | 'excited' | 'surprised' | 'running';
export type BimoPose = 'happy' | 'confused' | 'thinking' | 'celebrating' | 'excited';

interface CharacterProps {
  pose?: string;
  className?: string;
  size?: number;
  customImageUrl?: string;
}

export const TikiCharacter: React.FC<CharacterProps & { pose?: TikiPose }> = ({
  pose = 'happy',
  className = '',
  size = 160,
  customImageUrl,
}) => {
  const [imgErr, setImgErr] = useState(false);

  if (customImageUrl && !imgErr) {
    return (
      <img
        src={customImageUrl}
        alt="Karakter Tiki"
        referrerPolicy="no-referrer"
        onError={() => setImgErr(true)}
        style={{ width: size, height: size * 1.1 }}
        className={`rounded-2xl object-contain ${className}`}
      />
    );
  }

  const isPointing = pose === 'pointing';
  const isExcited = pose === 'excited';
  const isThinking = pose === 'thinking';
  const isSurprised = pose === 'surprised';
  const isRunning = pose === 'running';

  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 160 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Karakter Tiki"
    >
      <ellipse cx="80" cy="174" rx="34" ry="7" fill="#0F172A" fillOpacity="0.1" />
      <path
        d="M107 46C125 44 134 62 126 82C120 88 112 85 110 76C108 66 104 54 107 46Z"
        fill="#3B2314"
        stroke="#24140B"
        strokeWidth="2.5"
      />
      <circle cx="109" cy="48" r="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
      <path d="M44 54C42 74 47 88 55 90L105 90C112 86 115 72 114 54Z" fill="#3B2314" />
      <g transform={isRunning ? 'rotate(-8 80 140)' : undefined}>
        <rect x="61" y="132" width="12" height="24" rx="5" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        <rect x="87" y="132" width="12" height="24" rx="5" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        <rect x="61" y="145" width="12" height="10" fill="#FFFFFF" />
        <rect x="87" y="145" width="12" height="10" fill="#FFFFFF" />
        <path d="M55 154H75V167C75 169 73 171 70 171H55C51 171 49 167 51 163L55 154Z" fill="#0284C7" stroke="#075985" strokeWidth="2.5" />
        <rect x="51" y="166" width="24" height="5" rx="2.5" fill="#78350F" />
        <path d="M85 154H105L109 163C111 167 109 171 105 171H90C87 171 85 169 85 167V154Z" fill="#0284C7" stroke="#075985" strokeWidth="2.5" />
        <rect x="85" y="166" width="24" height="5" rx="2.5" fill="#78350F" />
      </g>
      <path d="M55 116H105L110 138C110 141 107 143 104 143H56C53 143 50 141 50 138L55 116Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
      <line x1="80" y1="126" x2="80" y2="143" stroke="#0369A1" strokeWidth="2" />
      {isExcited ? (
        <g>
          <path d="M56 88C42 78 36 62 38 50" stroke="#FCD5B5" strokeWidth="11" strokeLinecap="round" />
          <path d="M56 88C47 81 42 72 40 64" stroke="#FACC15" strokeWidth="13" strokeLinecap="round" />
          <circle cx="38" cy="48" r="6" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M55 90C43 98 41 112 45 120" stroke="#FCD5B5" strokeWidth="11" strokeLinecap="round" />
          <path d="M55 90C48 95 45 103 44 109" stroke="#FACC15" strokeWidth="13" strokeLinecap="round" />
          <circle cx="46" cy="121" r="6" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        </g>
      )}
      <path d="M54 84C54 79 59 76 66 76H94C101 76 106 79 106 84L104 120H56L54 84Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2.5" />
      <path d="M65 76L80 90L95 76H65Z" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
      <rect x="85" y="96" width="12" height="10" rx="2.5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
      <path d="M62 77L102 119" stroke="#92400E" strokeWidth="5" strokeLinecap="round" />
      <rect x="97" y="112" width="18" height="16" rx="4" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
      <path d="M97 118H115" stroke="#92400E" strokeWidth="2" />
      <circle cx="106" cy="120" r="2" fill="#FEF3C7" />
      {isPointing ? (
        <g>
          <path d="M105 88C119 84 134 78 144 72" stroke="#FCD5B5" strokeWidth="11" strokeLinecap="round" />
          <path d="M105 88C115 86 123 82 129 79" stroke="#FACC15" strokeWidth="13" strokeLinecap="round" />
          <circle cx="145" cy="71" r="6" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : isExcited ? (
        <g>
          <path d="M105 88C118 78 124 62 122 50" stroke="#FCD5B5" strokeWidth="11" strokeLinecap="round" />
          <path d="M105 88C113 81 118 72 120 64" stroke="#FACC15" strokeWidth="13" strokeLinecap="round" />
          <circle cx="122" cy="48" r="6" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : isThinking ? (
        <g>
          <path d="M105 90C118 92 116 74 104 68" stroke="#FCD5B5" strokeWidth="10" strokeLinecap="round" />
          <path d="M105 90C112 91 114 84 113 79" stroke="#FACC15" strokeWidth="12" strokeLinecap="round" />
          <circle cx="102" cy="68" r="5.5" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M105 90C117 98 119 112 115 120" stroke="#FCD5B5" strokeWidth="11" strokeLinecap="round" />
          <path d="M105 90C112 95 115 103 116 109" stroke="#FACC15" strokeWidth="13" strokeLinecap="round" />
          <circle cx="114" cy="121" r="6" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2" />
        </g>
      )}
      <rect x="74" y="69" width="12" height="10" rx="4" fill="#FCD5B5" />
      <circle cx="80" cy="48" r="29" fill="#FCD5B5" stroke="#D99B72" strokeWidth="2.5" />
      <path d="M50 45C50 26 64 16 80 16C97 16 110 26 110 45C102 35 93 32 82 35C73 31 62 35 50 45Z" fill="#3B2314" stroke="#24140B" strokeWidth="2.5" />
      <rect x="56" y="29" width="11" height="5" rx="2.5" transform="rotate(-18 56 29)" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      <ellipse cx="62" cy="56" rx="5" ry="3" fill="#FDA4AF" fillOpacity="0.65" />
      <ellipse cx="98" cy="56" rx="5" ry="3" fill="#FDA4AF" fillOpacity="0.65" />
      <g>
        <ellipse cx="68" cy="48" rx="4.5" ry={isSurprised ? 6 : 5.5} fill="#1E293B" />
        <circle cx="69.5" cy="46" r="1.8" fill="#FFFFFF" />
        <ellipse cx="92" cy="48" rx="4.5" ry={isSurprised ? 6 : 5.5} fill="#1E293B" />
        <circle cx="93.5" cy="46" r="1.8" fill="#FFFFFF" />
        <path d={isThinking ? 'M63 39Q68 36 73 40' : 'M63 40Q68 37 73 40'} stroke="#24140B" strokeWidth="2.2" strokeLinecap="round" />
        <path d={isThinking ? 'M87 38Q92 34 97 38' : 'M87 40Q92 37 97 40'} stroke="#24140B" strokeWidth="2.2" strokeLinecap="round" />
      </g>
      <path d="M79 52Q81 54 79 55" stroke="#C27D54" strokeWidth="2" strokeLinecap="round" />
      {isSurprised ? (
        <ellipse cx="80" cy="63" rx="4.5" ry="5.5" fill="#9F1239" stroke="#881337" strokeWidth="1.5" />
      ) : isThinking ? (
        <path d="M75 63Q80 61 85 63" stroke="#9F1239" strokeWidth="2.5" strokeLinecap="round" />
      ) : isExcited ? (
        <path d="M71 59Q80 71 89 59Z" fill="#9F1239" stroke="#881337" strokeWidth="1.5" />
      ) : (
        <path d="M72 60Q80 68 88 60" stroke="#9F1239" strokeWidth="2.6" strokeLinecap="round" />
      )}
    </svg>
  );
};

export const BimoCharacter: React.FC<CharacterProps & { pose?: BimoPose }> = ({
  pose = 'happy',
  className = '',
  size = 160,
  customImageUrl,
}) => {
  const [imgErr, setImgErr] = useState(false);

  if (customImageUrl && !imgErr) {
    return (
      <img
        src={customImageUrl}
        alt="Karakter Bimo"
        referrerPolicy="no-referrer"
        onError={() => setImgErr(true)}
        style={{ width: size, height: size * 1.1 }}
        className={`rounded-2xl object-contain ${className}`}
      />
    );
  }

  const isCelebrating = pose === 'celebrating' || pose === 'excited';
  const isConfused = pose === 'confused';
  const isThinking = pose === 'thinking';

  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 160 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Karakter Bimo"
    >
      <ellipse cx="80" cy="174" rx="34" ry="7" fill="#0F172A" fillOpacity="0.1" />
      <rect x="48" y="80" width="64" height="40" rx="10" fill="#15803D" stroke="#14532D" strokeWidth="2.5" />
      <rect x="60" y="132" width="13" height="24" rx="5" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
      <rect x="87" y="132" width="13" height="24" rx="5" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
      <rect x="60" y="145" width="13" height="9" fill="#FFFFFF" />
      <rect x="87" y="145" width="13" height="9" fill="#FFFFFF" />
      <path d="M54 154H75V167C75 169 73 171 70 171H53C49 171 48 167 50 163L54 154Z" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
      <rect x="50" y="166" width="25" height="5" rx="2.5" fill="#FFF7ED" />
      <path d="M85 154H106L110 163C112 167 111 171 107 171H90C87 171 85 169 85 167V154Z" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
      <rect x="85" y="166" width="25" height="5" rx="2.5" fill="#FFF7ED" />
      <path d="M55 117H105L108 139C108 141 106 143 103 143H84L80 132L76 143H57C54 143 52 141 52 139L55 117Z" fill="#F97316" stroke="#C2410C" strokeWidth="2.5" />
      {isCelebrating ? (
        <g>
          <path d="M55 88C40 76 34 60 36 48" stroke="#FBD3B3" strokeWidth="11" strokeLinecap="round" />
          <path d="M55 88C46 80 41 72 39 64" stroke="#FEF3C7" strokeWidth="13" strokeLinecap="round" />
          <circle cx="36" cy="46" r="6" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M54 89C43 97 41 112 45 120" stroke="#FBD3B3" strokeWidth="11" strokeLinecap="round" />
          <path d="M54 89C48 94 45 102 44 109" stroke="#FEF3C7" strokeWidth="13" strokeLinecap="round" />
          <circle cx="46" cy="121" r="6" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
        </g>
      )}
      <path d="M54 84C54 79 59 76 66 76H94C101 76 106 79 106 84L104 120H56L54 84Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
      <path d="M54 84C54 79 59 76 66 76H74V120H56L54 84Z" fill="#16A34A" stroke="#15803D" strokeWidth="2.5" />
      <path d="M86 76H94C101 76 106 79 106 84L104 120H86V76Z" fill="#16A34A" stroke="#15803D" strokeWidth="2.5" />
      <rect x="89" y="96" width="11" height="10" rx="2" fill="#FB923C" stroke="#C2410C" strokeWidth="1.5" />
      <circle cx="65" cy="94" r="5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      {isCelebrating ? (
        <g>
          <path d="M105 88C120 76 126 60 124 48" stroke="#FBD3B3" strokeWidth="11" strokeLinecap="round" />
          <path d="M105 88C114 80 119 72 121 64" stroke="#FEF3C7" strokeWidth="13" strokeLinecap="round" />
          <circle cx="124" cy="46" r="6" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : isThinking || isConfused ? (
        <g>
          <path d="M106 89C118 89 116 70 105 64" stroke="#FBD3B3" strokeWidth="10" strokeLinecap="round" />
          <path d="M106 89C112 89 114 82 113 77" stroke="#FEF3C7" strokeWidth="12" strokeLinecap="round" />
          <circle cx="104" cy="64" r="5.5" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <path d="M106 89C117 97 119 112 115 120" stroke="#FBD3B3" strokeWidth="11" strokeLinecap="round" />
          <path d="M106 89C112 94 115 102 116 109" stroke="#FEF3C7" strokeWidth="13" strokeLinecap="round" />
          <circle cx="114" cy="121" r="6" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2" />
        </g>
      )}
      <rect x="74" y="69" width="12" height="10" rx="4" fill="#FBD3B3" />
      <circle cx="80" cy="48" r="29" fill="#FBD3B3" stroke="#D99B72" strokeWidth="2.5" />
      <path d="M50 43C49 23 65 14 81 14C98 14 112 24 110 43C104 34 98 30 92 32C86 27 77 28 70 33C64 29 56 34 50 43Z" fill="#451A03" stroke="#290F02" strokeWidth="2.5" />
      <path d="M77 14C79 7 86 7 89 15" fill="#451A03" stroke="#290F02" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="61" cy="56" rx="5" ry="3" fill="#FDA4AF" fillOpacity="0.6" />
      <ellipse cx="99" cy="56" rx="5" ry="3" fill="#FDA4AF" fillOpacity="0.6" />
      <ellipse cx="68" cy="48" rx="4.5" ry="5.5" fill="#1E293B" />
      <circle cx="69.5" cy="46" r="1.8" fill="#FFFFFF" />
      <ellipse cx="92" cy="48" rx="4.5" ry="5.5" fill="#1E293B" />
      <circle cx="93.5" cy="46" r="1.8" fill="#FFFFFF" />
      <path d={isConfused ? 'M63 40Q68 35 73 39' : 'M63 39Q68 36 73 39'} stroke="#290F02" strokeWidth="2.2" strokeLinecap="round" />
      <path d={isConfused ? 'M87 42Q92 38 97 37' : 'M87 39Q92 36 97 39'} stroke="#290F02" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M79 52Q81 54 79 55" stroke="#C27D54" strokeWidth="2" strokeLinecap="round" />
      {isConfused || isThinking ? (
        <path d="M74 63Q79 60 85 63" stroke="#9F1239" strokeWidth="2.5" strokeLinecap="round" />
      ) : isCelebrating ? (
        <path d="M71 59Q80 71 89 59Z" fill="#9F1239" stroke="#881337" strokeWidth="1.5" />
      ) : (
        <path d="M72 60Q80 68 88 60" stroke="#9F1239" strokeWidth="2.6" strokeLinecap="round" />
      )}
    </svg>
  );
};

interface DialogProps {
  character: 'tiki' | 'bimo';
  characterName: string;
  pose?: TikiPose | BimoPose;
  text: string;
  onSpeak?: () => void;
  tone?: 'neutral' | 'success' | 'hint';
  customImageUrl?: string;
}

export const CharacterDialogBox: React.FC<DialogProps> = ({
  character,
  characterName,
  pose = 'happy',
  text,
  onSpeak,
  tone = 'neutral',
  customImageUrl,
}) => {
  const toneStyles =
    tone === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
      : tone === 'hint'
        ? 'bg-amber-50 border-amber-200 text-amber-950'
        : 'bg-white border-sky-200 text-slate-800';

  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm ${toneStyles}`}>
      <div className="shrink-0">
        {character === 'tiki' ? (
          <TikiCharacter pose={pose as TikiPose} size={76} customImageUrl={customImageUrl} />
        ) : (
          <BimoCharacter pose={pose as BimoPose} size={76} customImageUrl={customImageUrl} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-bold text-slate-900">{characterName}</span>
          {onSpeak && (
            <button
              type="button"
              onClick={onSpeak}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-900 transition-colors hover:bg-sky-200 focus-visible:outline-2 focus-visible:outline-sky-600 whitespace-nowrap shrink-0"
              aria-label="Dengarkan suara"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Dengarkan
            </button>
          )}
        </div>
        <p className="text-sm leading-relaxed md:text-base">{text}</p>
      </div>
    </div>
  );
};
