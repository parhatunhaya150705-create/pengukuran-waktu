import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  RotateCcw,
  Shuffle,
  Plus,
  Minus,
  ZoomIn,
  ZoomOut,
  Star,
} from 'lucide-react';
import { AudioSettings, ClockAppearance, ClockNumberStyle } from '../../types/media';
import { audioEngine } from '../../utils/audioEngine';

export type ClockAnimationSpeed = 'slow' | 'normal' | 'fast';

export interface InteractiveClockProps {
  totalMinutes: number;
  onChangeMinutes?: (nextMinutes: number) => void;
  interactiveDrag?: boolean;
  clickableNumbers?: boolean;
  clickableHands?: boolean;
  onNumberClick?: (num: number) => void;
  onHandClick?: (hand: 'hour_hand' | 'minute_hand') => void;
  highlightedNumber?: number | null;
  highlightedHand?: 'hour_hand' | 'minute_hand' | null;
  showDigital?: boolean;
  hiddenDigitalLabel?: string;
  showControls?: boolean;
  showMinuteSlider?: boolean;
  showZoomControls?: boolean;
  snapStep?: 1 | 5 | 15 | 30;
  animationSpeed?: ClockAnimationSpeed;
  sizePx?: number;
  clockFaceColor?: string;
  clockBezelColor?: string;
  clockNumberColor?: string;
  hourHandColor?: string;
  minuteHandColor?: string;
  numberStyle?: ClockNumberStyle;
  clockAppearance?: ClockAppearance;
  showMinuteTicks?: boolean;
  audioSettings?: AudioSettings;
  helperHighlightHalfHour?: boolean;
  feedbackStatus?: 'idle' | 'correct' | 'wrong';
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const COLORFUL_NUM_COLORS = [
  '#0284C7', '#0D9488', '#16A34A', '#CA8A04', '#EA580C', '#DC2626',
  '#9333EA', '#2563EB', '#0891B2', '#059669', '#D97706', '#E11D48',
];

const NUMBER_WORDS: Record<number, string> = {
  1: 'satu',
  2: 'dua',
  3: 'tiga',
  4: 'empat',
  5: 'lima',
  6: 'enam',
  7: 'tujuh',
  8: 'delapan',
  9: 'sembilan',
  10: 'sepuluh',
  11: 'sebelas',
  12: 'dua belas',
};

const ANIMATION_DURATION_MS: Record<ClockAnimationSpeed, number> = {
  slow: 620,
  normal: 260,
  fast: 100,
};

export function normalizeMinutes(mins: number): number {
  const m = Math.round(mins) % 720;
  return m < 0 ? m + 720 : m;
}

export function getHourAndMinute(totalMinutes: number): { hour: number; minute: number } {
  const norm = normalizeMinutes(totalMinutes);
  const h = Math.floor(norm / 60);
  const hour = h === 0 ? 12 : h;
  const minute = norm % 60;
  return { hour, minute };
}

export function getHandAngles(totalMinutes: number): { hourAngle: number; minuteAngle: number } {
  const norm = normalizeMinutes(totalMinutes);
  const minute = norm % 60;
  return {
    hourAngle: norm * 0.5,
    minuteAngle: minute * 6,
  };
}

export function formatDigitalTime(totalMinutes: number): string {
  const { hour, minute } = getHourAndMinute(totalMinutes);
  return `${String(hour).padStart(2, '0')}.${String(minute).padStart(2, '0')}`;
}

export function formatIndonesianSpokenTime(totalMinutes: number): string {
  const { hour, minute } = getHourAndMinute(totalMinutes);
  if (minute === 0) {
    return `Pukul ${NUMBER_WORDS[hour]} tepat`;
  }
  if (minute === 30) {
    const nextHour = hour === 12 ? 1 : hour + 1;
    return `Pukul ${NUMBER_WORDS[hour]} lewat 30 (setengah ${NUMBER_WORDS[nextHour]})`;
  }
  return `Pukul ${NUMBER_WORDS[hour]} lewat ${minute} menit`;
}

export function describeHandPositions(totalMinutes: number): {
  hourDesc: string;
  minuteDesc: string;
  isExactHour: boolean;
  isHalfHour: boolean;
} {
  const { hour, minute } = getHourAndMinute(totalMinutes);
  const nextHour = hour === 12 ? 1 : hour + 1;

  let hourDesc = '';
  if (minute === 0) {
    hourDesc = `Jarum pendek menunjuk tepat ke angka ${hour}`;
  } else if (minute < 30) {
    hourDesc = `Jarum pendek bergeser perlahan di antara angka ${hour} dan ${nextHour}`;
  } else if (minute === 30) {
    hourDesc = `Jarum pendek berada tepat di tengah antara angka ${hour} dan ${nextHour}`;
  } else {
    hourDesc = `Jarum pendek berada di antara angka ${hour} dan ${nextHour}, semakin mendekati angka ${nextHour}`;
  }

  let minuteDesc = '';
  if (minute === 0) {
    minuteDesc = 'Jarum panjang menunjuk tepat ke angka 12 (00 menit)';
  } else if (minute === 30) {
    minuteDesc = 'Jarum panjang menunjuk tepat ke angka 6 (30 menit)';
  } else if (minute % 5 === 0) {
    const targetTickNum = minute / 5;
    minuteDesc = `Jarum panjang menunjuk ke angka ${targetTickNum} (${minute} menit)`;
  } else {
    const prevTickNum = Math.floor(minute / 5) || 12;
    minuteDesc = `Jarum panjang berada di garis menit ke-${minute} (lewat angka ${prevTickNum})`;
  }

  return {
    hourDesc,
    minuteDesc,
    isExactHour: minute === 0,
    isHalfHour: minute === 30,
  };
}

export interface ClockVerificationResult {
  isCorrect: boolean;
  isHourHandCorrect: boolean;
  isMinuteHandCorrect: boolean;
  actualHour: number;
  actualMinute: number;
  expectedHour: number;
  expectedMinute: number;
  feedbackMessage: string;
  hourStatusText: string;
  minuteStatusText: string;
}

export function verifyClockAnswer(
  currentTotalMinutes: number,
  targetHour: number,
  targetMinute: number
): ClockVerificationResult {
  const expectedHour = ((Math.round(targetHour) % 12) + 12) % 12 || 12;
  const expectedMinute = ((Math.round(targetMinute) % 60) + 60) % 60;
  const expectedNorm = normalizeMinutes((expectedHour % 12) * 60 + expectedMinute);
  const actualNorm = normalizeMinutes(currentTotalMinutes);

  const actual = getHourAndMinute(actualNorm);
  const expectedAngles = getHandAngles(expectedNorm);
  const actualAngles = getHandAngles(actualNorm);

  const isHourHandCorrect = actual.hour === expectedHour;
  const isMinuteHandCorrect = actual.minute === expectedMinute;
  const anglesMatch =
    Math.abs(actualAngles.hourAngle - expectedAngles.hourAngle) < 0.01 &&
    Math.abs(actualAngles.minuteAngle - expectedAngles.minuteAngle) < 0.01;
  const isCorrect = isHourHandCorrect && isMinuteHandCorrect && anglesMatch;

  const targetStr = `${String(expectedHour).padStart(2, '0')}.${String(expectedMinute).padStart(2, '0')}`;
  const nextExpectedHour = expectedHour === 12 ? 1 : expectedHour + 1;

  const expectedHourPhrase =
    expectedMinute === 0
      ? `menunjuk angka ${expectedHour}`
      : `berada di antara angka ${expectedHour} dan ${nextExpectedHour}`;

  const expectedMinutePhrase =
    expectedMinute === 0
      ? 'menunjuk angka 12'
      : expectedMinute === 30
        ? 'menunjuk angka 6'
        : expectedMinute % 5 === 0
          ? `menunjuk angka ${expectedMinute / 5}`
          : `di menit ke-${expectedMinute}`;

  const hourStatusText = isHourHandCorrect
    ? `Jarum pendek benar (${expectedHourPhrase})`
    : `Jarum pendek perlu diarahkan ${expectedHourPhrase}`;

  const minuteStatusText = isMinuteHandCorrect
    ? `Jarum panjang benar (${expectedMinutePhrase})`
    : `Jarum panjang perlu diarahkan ${expectedMinutePhrase}`;

  let feedbackMessage = '';
  if (isCorrect) {
    if (expectedMinute === 0) {
      feedbackMessage = `Hebat! Pukul ${targetStr} tepat! Jarum pendek menunjuk angka ${expectedHour} dan jarum panjang menunjuk angka 12.`;
    } else if (expectedMinute === 30) {
      feedbackMessage = `Tepat sekali! Pukul ${targetStr} (setengah ${NUMBER_WORDS[nextExpectedHour]})! Jarum panjang menunjuk angka 6 dan jarum pendek berada di antara angka ${expectedHour} dan ${nextExpectedHour}.`;
    } else {
      feedbackMessage = `Benar sekali! Pukul ${targetStr}! Jarum pendek ${expectedHourPhrase} dan jarum panjang ${expectedMinutePhrase}.`;
    }
  } else if (isHourHandCorrect && !isMinuteHandCorrect) {
    feedbackMessage = `Hampir tepat! Jarum pendek sudah benar, tapi untuk pukul ${targetStr}, arahkan jarum panjang ${expectedMinutePhrase}.`;
  } else if (!isHourHandCorrect && isMinuteHandCorrect) {
    feedbackMessage = `Jarum panjang sudah tepat ${expectedMinutePhrase}! Sekarang atur jarum pendek agar ${expectedHourPhrase}.`;
  } else {
    feedbackMessage = `Belum tepat (jam kamu menunjukkan ${formatDigitalTime(actualNorm)}). Untuk pukul ${targetStr}, arahkan jarum pendek ${expectedHourPhrase} dan jarum panjang ${expectedMinutePhrase}.`;
  }

  return {
    isCorrect,
    isHourHandCorrect,
    isMinuteHandCorrect,
    actualHour: actual.hour,
    actualMinute: actual.minute,
    expectedHour,
    expectedMinute,
    feedbackMessage,
    hourStatusText,
    minuteStatusText,
  };
}

function shortestAngleDelta(fromDeg: number, toModDeg: number): number {
  const fromMod = ((fromDeg % 360) + 360) % 360;
  let diff = toModDeg - fromMod;
  if (diff > 180) diff -= 360;
  if (diff <= -180) diff += 360;
  return diff;
}

export const InteractiveClock: React.FC<InteractiveClockProps> = ({
  totalMinutes,
  onChangeMinutes,
  interactiveDrag = true,
  clickableNumbers = false,
  clickableHands = false,
  onNumberClick,
  onHandClick,
  highlightedNumber = null,
  highlightedHand = null,
  showDigital = true,
  hiddenDigitalLabel,
  showControls = true,
  showMinuteSlider = false,
  showZoomControls = false,
  snapStep = 1,
  animationSpeed = 'normal',
  sizePx = 320,
  clockFaceColor = '#FFFFFF',
  clockBezelColor = '#0284C7',
  clockNumberColor = '#0F172A',
  hourHandColor = '#1D4ED8',
  minuteHandColor = '#EA580C',
  numberStyle = 'arabic',
  clockAppearance = 'classic',
  showMinuteTicks = true,
  audioSettings,
  helperHighlightHalfHour = false,
  feedbackStatus = 'idle',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingHand, setDraggingHand] = useState<'hour' | 'minute' | null>(null);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [zoomOffset, setZoomOffset] = useState<number>(0);

  const norm = normalizeMinutes(totalMinutes);
  const { minute } = getHourAndMinute(norm);
  const { hourAngle: targetHourMod, minuteAngle: targetMinMod } = getHandAngles(norm);

  // Continuous visual angles so crossing 12 o'clock never spins backwards
  const [visualDeg, setVisualDeg] = useState<{ hour: number; minute: number }>({
    hour: targetHourMod,
    minute: targetMinMod,
  });
  const visualDegRef = useRef(visualDeg);
  const prevNormRef = useRef(norm);
  const pendingDirectionRef = useRef<'forward' | 'backward' | null>(null);
  const rafRef = useRef<number | null>(null);

  const dragDataRef = useRef<{
    lastPointerDeg: number;
    unwrappedMinDeg: number;
    unwrappedHourDeg: number;
    lastReportedNorm: number;
  }>({
    lastPointerDeg: 0,
    unwrappedMinDeg: norm * 6,
    unwrappedHourDeg: targetHourMod,
    lastReportedNorm: norm,
  });

  useEffect(() => {
    if (prevNormRef.current === norm) return;
    prevNormRef.current = norm;

    const dir = pendingDirectionRef.current;
    pendingDirectionRef.current = null;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const startH = visualDegRef.current.hour;
    const startM = visualDegRef.current.minute;

    let dH = shortestAngleDelta(startH, targetHourMod);
    let dM = shortestAngleDelta(startM, targetMinMod);

    // Ensure directional consistency if delta is exactly 180 deg or forced
    if (dir === 'forward' && dM < -0.01) dM += 360;
    if (dir === 'backward' && dM > 0.01) dM -= 360;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Zero-latency update during active hand or slider dragging
    if (draggingHand !== null || isSliderDragging || prefersReducedMotion) {
      const next = {
        hour: startH + dH,
        minute: startM + dM,
      };
      visualDegRef.current = next;
      setVisualDeg(next);
      return;
    }

    const duration = ANIMATION_DURATION_MS[animationSpeed];
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = {
        hour: startH + dH * eased,
        minute: startM + dM * eased,
      };
      visualDegRef.current = next;
      setVisualDeg(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        const settled = {
          hour: ((next.hour % 360) + 360) % 360,
          minute: ((next.minute % 360) + 360) % 360,
        };
        visualDegRef.current = settled;
        setVisualDeg(settled);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [norm, targetHourMod, targetMinMod, draggingHand, isSliderDragging, animationSpeed]);

  const getPointerAngle = useCallback((clientX: number, clientY: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, []);

  const handleHandPointerDown = (
    hand: 'hour' | 'minute',
    e: React.PointerEvent<SVGGElement>
  ) => {
    if (clickableHands && onHandClick) {
      e.stopPropagation();
      onHandClick(hand === 'hour' ? 'hour_hand' : 'minute_hand');
      return;
    }
    if (!interactiveDrag || !onChangeMinutes) return;

    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const startDeg = getPointerAngle(e.clientX, e.clientY);
    dragDataRef.current = {
      lastPointerDeg: startDeg,
      unwrappedMinDeg: norm * 6,
      unwrappedHourDeg: targetHourMod,
      lastReportedNorm: norm,
    };
    setDraggingHand(hand);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingHand || !onChangeMinutes) return;

    const deg = getPointerAngle(e.clientX, e.clientY);
    let delta = deg - dragDataRef.current.lastPointerDeg;
    if (delta > 180) delta -= 360;
    if (delta <= -180) delta += 360;
    dragDataRef.current.lastPointerDeg = deg;

    if (draggingHand === 'minute') {
      dragDataRef.current.unwrappedMinDeg += delta;
      const stepDeg = snapStep * 6;
      const snappedSteps = Math.round(dragDataRef.current.unwrappedMinDeg / stepDeg);
      const nextTotal = normalizeMinutes(snappedSteps * snapStep);

      if (nextTotal !== dragDataRef.current.lastReportedNorm) {
        dragDataRef.current.lastReportedNorm = nextTotal;
        if (audioSettings) audioEngine.playTick(audioSettings, 'minute');
        onChangeMinutes(nextTotal);
      }
    } else if (draggingHand === 'hour') {
      dragDataRef.current.unwrappedHourDeg += delta;
      const currentMin = dragDataRef.current.lastReportedNorm % 60;
      const rawHourFloat = (dragDataRef.current.unwrappedHourDeg / 360) * 12 - currentMin / 60;
      const snappedHour = ((Math.round(rawHourFloat) % 12) + 12) % 12;
      const nextTotal = normalizeMinutes(snappedHour * 60 + currentMin);

      if (nextTotal !== dragDataRef.current.lastReportedNorm) {
        dragDataRef.current.lastReportedNorm = nextTotal;
        if (audioSettings) audioEngine.playTick(audioSettings, 'hour');
        onChangeMinutes(nextTotal);
      }
    }
  };

  const handlePointerUp = () => {
    setDraggingHand(null);
  };

  const stepMinutes = (delta: number) => {
    if (!onChangeMinutes) return;
    pendingDirectionRef.current = delta > 0 ? 'forward' : 'backward';
    if (audioSettings) {
      audioEngine.playTick(audioSettings, Math.abs(delta) >= 60 ? 'hour' : 'minute');
    }
    onChangeMinutes(normalizeMinutes(norm + delta));
  };

  const handleMinuteSliderChange = (nextMin: number) => {
    if (!onChangeMinutes) return;
    const clampedMin = Math.max(0, Math.min(59, Math.round(nextMin)));
    const currentHourIndex = Math.floor(norm / 60);
    const nextTotal = normalizeMinutes(currentHourIndex * 60 + clampedMin);
    if (nextTotal !== norm) {
      if (audioSettings) audioEngine.playTick(audioSettings, 'minute');
      onChangeMinutes(nextTotal);
    }
  };

  const handleRandomize = () => {
    if (!onChangeMinutes) return;
    if (audioSettings) audioEngine.playClick(audioSettings);
    const randomHour = Math.floor(Math.random() * 12);
    let randomMin = 0;
    if (snapStep === 1) {
      randomMin = Math.floor(Math.random() * 60);
    } else if (snapStep === 5) {
      randomMin = Math.floor(Math.random() * 12) * 5;
    } else if (snapStep === 15) {
      const opts = [0, 15, 30, 45];
      randomMin = opts[Math.floor(Math.random() * opts.length)];
    } else {
      randomMin = Math.random() > 0.5 ? 30 : 0;
    }
    let next = randomHour * 60 + randomMin;
    if (next === norm) {
      next = normalizeMinutes(next + 67);
    }
    onChangeMinutes(next);
  };

  const handleReset = () => {
    if (!onChangeMinutes) return;
    if (audioSettings) audioEngine.playClick(audioSettings);
    onChangeMinutes(0);
  };

  const effectiveSizePx = Math.min(440, Math.max(210, sizePx + zoomOffset));
  const zoomPercent = Math.round((effectiveSizePx / sizePx) * 100);
  const cx = 160;
  const cy = 160;

  return (
    <div className="flex w-full flex-col items-center gap-3.5 select-none">
      {/* Zoom Toolbar */}
      {showZoomControls && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1">
          <button
            type="button"
            onClick={() => {
              if (audioSettings) audioEngine.playClick(audioSettings);
              setZoomOffset((z) => Math.max(210 - sizePx, z - 35));
            }}
            disabled={effectiveSizePx <= 210}
            aria-label="Perkecil jam"
            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:bg-white disabled:opacity-40 whitespace-nowrap"
          >
            <ZoomOut className="h-3.5 w-3.5" /> Perkecil
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioSettings) audioEngine.playClick(audioSettings);
              setZoomOffset(0);
            }}
            className="font-mono-num min-h-[36px] rounded-lg px-2 py-1 text-xs font-bold text-slate-600 transition hover:bg-white"
            title="Kembalikan ukuran normal"
          >
            {zoomPercent}%
          </button>
          <button
            type="button"
            onClick={() => {
              if (audioSettings) audioEngine.playClick(audioSettings);
              setZoomOffset((z) => Math.min(440 - sizePx, z + 35));
            }}
            disabled={effectiveSizePx >= 440}
            aria-label="Perbesar jam"
            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:bg-white disabled:opacity-40 whitespace-nowrap"
          >
            <ZoomIn className="h-3.5 w-3.5" /> Perbesar
          </button>
        </div>
      )}

      {/* Analog SVG Clock Dial */}
      <div
        className={`relative flex items-center justify-center rounded-full p-2 transition-shadow ${
          feedbackStatus === 'correct'
            ? 'animate-clock-success ring-4 ring-emerald-400/60'
            : feedbackStatus === 'wrong'
              ? 'animate-clock-wrong ring-4 ring-amber-400/55'
              : ''
        }`}
        style={{ width: effectiveSizePx, height: effectiveSizePx, maxWidth: '100%' }}
      >
        {feedbackStatus === 'correct' && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <Star
              className="animate-star-pop absolute -top-2 left-6 h-7 w-7 fill-amber-400 text-amber-500 drop-shadow-sm"
              style={{ animationDelay: '0ms' }}
            />
            <Star
              className="animate-star-pop absolute top-4 -right-2 h-8 w-8 fill-emerald-400 text-emerald-600 drop-shadow-sm"
              style={{ animationDelay: '90ms' }}
            />
            <Star
              className="animate-star-pop absolute -bottom-1 left-4 h-7 w-7 fill-amber-400 text-amber-500 drop-shadow-sm"
              style={{ animationDelay: '160ms' }}
            />
            <Star
              className="animate-star-pop absolute bottom-6 -right-1 h-6 w-6 fill-sky-400 text-sky-600 drop-shadow-sm"
              style={{ animationDelay: '220ms' }}
            />
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox="0 0 320 320"
          className="h-full w-full touch-none drop-shadow-md"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="img"
          aria-label={`Jam analog menunjukkan ${formatDigitalTime(norm)}`}
        >
          {/* Outer Clock Frame (Bezel) */}
          {clockAppearance === 'minimal' ? (
            <circle
              cx={cx}
              cy={cy}
              r="146"
              fill={clockFaceColor}
              stroke={feedbackStatus === 'correct' ? '#10B981' : clockBezelColor}
              strokeWidth="6"
            />
          ) : (
            <>
              <circle
                cx={cx}
                cy={cy}
                r="152"
                fill={feedbackStatus === 'correct' ? '#059669' : clockBezelColor}
                stroke="#0F172A"
                strokeOpacity="0.15"
                strokeWidth="3"
              />
              <circle cx={cx} cy={cy} r="142" fill="#E0F2FE" fillOpacity="0.7" />
              <circle
                cx={cx}
                cy={cy}
                r="134"
                fill={clockFaceColor}
                stroke={clockBezelColor}
                strokeOpacity="0.45"
                strokeWidth="3"
              />
            </>
          )}

          {/* Playful decorative inner ring */}
          {clockAppearance === 'playful' && (
            <circle
              cx={cx}
              cy={cy}
              r="72"
              fill="none"
              stroke={clockBezelColor}
              strokeOpacity="0.18"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
          )}

          {/* Half-hour helper arc */}
          {helperHighlightHalfHour && (
            <path
              d="M 160 32 A 128 128 0 0 1 160 288"
              fill="none"
              stroke="#C4B5FD"
              strokeWidth="6"
              strokeDasharray="6 6"
              opacity="0.7"
            />
          )}

          {/* Minute Tick Marks (00 to 59) */}
          {showMinuteTicks &&
            Array.from({ length: 60 }).map((_, i) => {
              const angleRad = ((i * 6 - 90) * Math.PI) / 180;
              const isMajor = i % 5 === 0;
              const isActiveMinute = interactiveDrag && i === minute;
              const rOuter = 126;
              const rInner = isMajor ? 115 : 120;
              const x1 = cx + rInner * Math.cos(angleRad);
              const y1 = cy + rInner * Math.sin(angleRad);
              const x2 = cx + rOuter * Math.cos(angleRad);
              const y2 = cy + rOuter * Math.sin(angleRad);

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActiveMinute ? minuteHandColor : isMajor ? clockNumberColor : '#94A3B8'}
                  strokeWidth={isActiveMinute ? 3.5 : isMajor ? 3 : 1.5}
                  strokeLinecap="round"
                />
              );
            })}

          {/* Numbers 1 to 12 */}
          {Array.from({ length: 12 }).map((_, idx) => {
            const num = idx + 1;
            const angleRad = ((num * 30 - 90) * Math.PI) / 180;
            const rNum = 97;
            const x = cx + rNum * Math.cos(angleRad);
            const y = cy + rNum * Math.sin(angleRad);
            const isHighlighted = highlightedNumber === num;
            const isHalfHourSix = helperHighlightHalfHour && num === 6;

            const numColor = isHighlighted
              ? '#92400E'
              : clockAppearance === 'colorful'
                ? COLORFUL_NUM_COLORS[idx]
                : clockNumberColor;

            const labelText = numberStyle === 'roman' ? ROMAN_NUMERALS[idx] : String(num);

            return (
              <g
                key={num}
                onClick={(e) => {
                  if (clickableNumbers && onNumberClick) {
                    e.stopPropagation();
                    onNumberClick(num);
                  }
                }}
                className={clickableNumbers ? 'cursor-pointer' : undefined}
              >
                {(isHighlighted || isHalfHourSix || clickableNumbers || clockAppearance === 'playful') && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isHighlighted ? 20 : 17}
                    fill={
                      isHighlighted
                        ? '#FEF08A'
                        : isHalfHourSix
                          ? '#EDE9FE'
                          : clockAppearance === 'playful'
                            ? '#F1F5F9'
                            : 'transparent'
                    }
                    stroke={
                      isHighlighted ? '#EAB308' : isHalfHourSix ? '#7C3AED' : 'transparent'
                    }
                    strokeWidth="2.5"
                  />
                )}

                {numberStyle === 'dots' ? (
                  <circle cx={x} cy={y} r={num % 3 === 0 ? 7 : 4.5} fill={numColor} />
                ) : (
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={numColor}
                    fontSize={numberStyle === 'roman' ? '16' : '21'}
                    fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                    className="select-none"
                  >
                    {labelText}
                  </text>
                )}
              </g>
            );
          })}

          {/* Hour Hand */}
          <g
            transform={`rotate(${visualDeg.hour} ${cx} ${cy})`}
            onPointerDown={(e) => handleHandPointerDown('hour', e)}
            className={
              interactiveDrag || clickableHands ? 'cursor-grab active:cursor-grabbing' : undefined
            }
          >
            {/* Generous touch/mouse grab hit target */}
            <line x1={cx} y1={cy + 14} x2={cx} y2={cy - 80} stroke="transparent" strokeWidth="32" />
            {(highlightedHand === 'hour_hand' || draggingHand === 'hour') && (
              <line
                x1={cx}
                y1={cy + 10}
                x2={cx}
                y2={cy - 70}
                stroke={draggingHand === 'hour' ? '#38BDF8' : '#FACC15'}
                strokeWidth="18"
                strokeLinecap="round"
                opacity="0.6"
              />
            )}
            <line
              x1={cx}
              y1={cy + 12}
              x2={cx}
              y2={cy - 64}
              stroke={hourHandColor}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <polygon
              points={`${cx - 8},${cy - 60} ${cx + 8},${cy - 60} ${cx},${cy - 75}`}
              fill={hourHandColor}
            />
            {interactiveDrag && (
              <circle
                cx={cx}
                cy={cy - 54}
                r={draggingHand === 'hour' ? '6.5' : '5'}
                fill="#FFFFFF"
                stroke={hourHandColor}
                strokeWidth="3"
              />
            )}
          </g>

          {/* Minute Hand */}
          <g
            transform={`rotate(${visualDeg.minute} ${cx} ${cy})`}
            onPointerDown={(e) => handleHandPointerDown('minute', e)}
            className={
              interactiveDrag || clickableHands ? 'cursor-grab active:cursor-grabbing' : undefined
            }
          >
            {/* Generous touch/mouse grab hit target */}
            <line x1={cx} y1={cy + 16} x2={cx} y2={cy - 116} stroke="transparent" strokeWidth="28" />
            {(highlightedHand === 'minute_hand' || draggingHand === 'minute') && (
              <line
                x1={cx}
                y1={cy + 10}
                x2={cx}
                y2={cy - 104}
                stroke={draggingHand === 'minute' ? '#FB923C' : '#FACC15'}
                strokeWidth="15"
                strokeLinecap="round"
                opacity="0.65"
              />
            )}
            <line
              x1={cx}
              y1={cy + 14}
              x2={cx}
              y2={cy - 98}
              stroke={minuteHandColor}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <polygon
              points={`${cx - 6},${cy - 94} ${cx + 6},${cy - 94} ${cx},${cy - 109}`}
              fill={minuteHandColor}
            />
            {interactiveDrag && (
              <circle
                cx={cx}
                cy={cy - 95}
                r={draggingHand === 'minute' ? '7.5' : '6'}
                fill="#FFFFFF"
                stroke={minuteHandColor}
                strokeWidth="3"
              />
            )}
          </g>

          {/* Center Pivot */}
          <circle cx={cx} cy={cy} r="10" fill="#0F172A" />
          <circle cx={cx} cy={cy} r="4.5" fill="#FACC15" />
        </svg>
      </div>

      {/* Active Drag Feedback Line */}
      {interactiveDrag && draggingHand && (
        <p className="text-xs font-extrabold text-sky-700">
          {draggingHand === 'hour'
            ? 'Menggerakkan Jarum Pendek (Jam)'
            : 'Menggerakkan Jarum Panjang (Menit)'}
        </p>
      )}

      {/* Hand Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-6 rounded-full" style={{ backgroundColor: hourHandColor }} />
          Jarum Pendek (Jam)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-7 rounded-full" style={{ backgroundColor: minuteHandColor }} />
          Jarum Panjang (Menit)
        </span>
      </div>

      {/* Digital Clock Readout or Hidden Challenge State */}
      {showDigital ? (
        <div className="flex flex-col items-center rounded-2xl border border-sky-200 bg-white px-6 py-3 shadow-sm text-center">
          <span className="font-mono-num text-3xl font-bold tracking-wider text-slate-900 md:text-4xl">
            {formatDigitalTime(norm)}
          </span>
          <span className="mt-0.5 text-sm font-semibold text-sky-800">
            {formatIndonesianSpokenTime(norm)}
          </span>
        </div>
      ) : (
        hiddenDigitalLabel && (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 px-4 py-2 text-center text-xs font-bold text-amber-900">
            {hiddenDigitalLabel}
          </div>
        )
      )}

      {/* Minute Slider (00 to 59) */}
      {showMinuteSlider && onChangeMinutes && (
        <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor="clock-minute-slider" className="text-xs font-bold text-slate-700">
              Slider Atur Menit (00 – 59)
            </label>
            <span className="font-mono-num text-sm font-extrabold text-sky-800">
              {showDigital ? `${String(minute).padStart(2, '0')} menit` : '00 – 59'}
            </span>
          </div>
          <input
            id="clock-minute-slider"
            type="range"
            min={0}
            max={59}
            step={1}
            value={minute}
            onPointerDown={() => setIsSliderDragging(true)}
            onPointerUp={() => setIsSliderDragging(false)}
            onPointerCancel={() => setIsSliderDragging(false)}
            onBlur={() => setIsSliderDragging(false)}
            onChange={(e) => handleMinuteSliderChange(Number(e.target.value))}
            aria-label="Slider pengaturan menit dari 00 sampai 59"
            className="h-3 w-full cursor-pointer accent-sky-600 touch-pan-x"
          />
          <div className="font-mono-num mt-1 flex justify-between text-[11px] font-semibold text-slate-500">
            <span>00</span>
            <span>15</span>
            <span>30</span>
            <span>45</span>
            <span>59</span>
          </div>
        </div>
      )}

      {/* Interactive Hand Controls: 1-Minute & 1-Hour Intervals */}
      {showControls && onChangeMinutes && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => stepMinutes(-60)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-sky-50 active:scale-95 whitespace-nowrap"
          >
            <Minus className="h-3.5 w-3.5" /> 1 JAM
          </button>
          <button
            type="button"
            onClick={() => stepMinutes(-1)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-extrabold text-sky-900 shadow-xs transition hover:bg-sky-100 active:scale-95 whitespace-nowrap"
          >
            <Minus className="h-3.5 w-3.5" /> 1 MENIT
          </button>
          <button
            type="button"
            onClick={() => stepMinutes(1)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-extrabold text-sky-900 shadow-xs transition hover:bg-sky-100 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" /> 1 MENIT
          </button>
          <button
            type="button"
            onClick={() => stepMinutes(60)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-sky-50 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" /> 1 JAM
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 active:scale-95 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-900 transition hover:bg-teal-100 active:scale-95 whitespace-nowrap"
          >
            <Shuffle className="h-3.5 w-3.5" /> Acak Waktu
          </button>
        </div>
      )}
    </div>
  );
};
