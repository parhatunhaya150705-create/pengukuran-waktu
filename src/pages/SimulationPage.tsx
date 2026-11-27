import React, { useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Shuffle,
  Volume2,
  BookOpen,
  X,
  AlertCircle,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { MediaConfig } from '../types/media';
import {
  InteractiveClock,
  ClockAnimationSpeed,
  ClockVerificationResult,
  describeHandPositions,
  formatDigitalTime,
  getHourAndMinute,
  verifyClockAnswer,
} from '../components/clock/InteractiveClock';
import { CharacterDialogBox } from '../components/characters/TikiBimo';
import { audioEngine } from '../utils/audioEngine';
import { getButtonStyleClass, getClockSizePixels } from '../utils/designHelpers';

interface SimulationPageProps {
  config: MediaConfig;
}

type SimMode = 'learn' | 'challenge' | 'experiment';
type ChallengeFilter = 'all' | 'exact' | 'half' | 'advanced';

const CHALLENGE_POOL_EXACT = [
  { h: 1, m: 0 },
  { h: 3, m: 0 },
  { h: 4, m: 0 },
  { h: 6, m: 0 },
  { h: 7, m: 0 },
  { h: 9, m: 0 },
  { h: 12, m: 0 },
];

const CHALLENGE_POOL_HALF = [
  { h: 2, m: 30 },
  { h: 4, m: 30 },
  { h: 6, m: 30 },
  { h: 8, m: 30 },
  { h: 10, m: 30 },
];

const CHALLENGE_POOL_ADVANCED = [
  { h: 3, m: 15 },
  { h: 7, m: 45 },
  { h: 10, m: 15 },
  { h: 5, m: 45 },
];

export const SimulationPage: React.FC<SimulationPageProps> = ({ config }) => {
  const [mode, setMode] = useState<SimMode>(config.learning.defaultSimMode);
  const [snapStep, setSnapStep] = useState<1 | 5 | 15 | 30>(1);
  const [animationSpeed, setAnimationSpeed] = useState<ClockAnimationSpeed>('normal');
  const [totalMinutes, setTotalMinutes] = useState<number>(180); // 03.00 default
  const [challengeFilter, setChallengeFilter] = useState<ChallengeFilter>('all');
  const [target, setTarget] = useState<{ h: number; m: number }>({ h: 4, m: 30 });
  const [streak, setStreak] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  const [challengeFeedback, setChallengeFeedback] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    result: ClockVerificationResult | null;
  }>({ status: 'idle', result: null });

  const pickNewTarget = (filterOverride?: ChallengeFilter) => {
    const activeFilter = filterOverride ?? challengeFilter;
    let pool = [...CHALLENGE_POOL_EXACT, ...CHALLENGE_POOL_HALF];

    if (activeFilter === 'exact' || config.learning.timeScope === 'exact_only') {
      pool = CHALLENGE_POOL_EXACT;
    } else if (activeFilter === 'half') {
      pool = CHALLENGE_POOL_HALF;
    } else if (activeFilter === 'advanced') {
      pool = [...CHALLENGE_POOL_EXACT, ...CHALLENGE_POOL_HALF, ...CHALLENGE_POOL_ADVANCED];
      if (snapStep === 30) {
        setSnapStep(15);
      }
    }

    const candidates = pool.filter((item) => !(item.h === target.h && item.m === target.m));
    const finalPool = candidates.length > 0 ? candidates : pool;
    const next = finalPool[Math.floor(Math.random() * finalPool.length)];

    setTarget(next);
    setChallengeFeedback({ status: 'idle', result: null });

    const nextStr = `${String(next.h).padStart(2, '0')}.${String(next.m).padStart(2, '0')}`;
    audioEngine.speak(`Tunjukkan pukul ${nextStr} pada jam analog!`, config.audio, 'bimo');
  };

  const handleCheckChallenge = () => {
    const verification = verifyClockAnswer(totalMinutes, target.h, target.m);

    if (verification.isCorrect) {
      audioEngine.playCorrect(config.audio);
      audioEngine.playStar(config.audio);
      setStreak((s) => s + 1);
      setChallengeFeedback({ status: 'correct', result: verification });
      audioEngine.speak(verification.feedbackMessage, config.audio, 'tiki');
    } else {
      audioEngine.playWrong(config.audio);
      setStreak(0);
      setChallengeFeedback({ status: 'wrong', result: verification });
      audioEngine.speak(verification.feedbackMessage, config.audio, 'bimo');
    }
  };

  const { minute } = getHourAndMinute(totalMinutes);
  const handDesc = describeHandPositions(totalMinutes);
  const experimentPrompt =
    minute === 0
      ? 'Jarum panjang berada tepat di angka 12! Ini disebut JAM TEPAT. Jarum pendek menunjuk tepat ke angka jamnya.'
      : minute === 30
        ? 'Aha! Jarum panjang bergerak ke angka 6! Ini disebut SETENGAH JAM (.30), dan jarum pendek ikut bergerak tepat ke tengah antara dua angka!'
        : `Sekarang pukul ${formatDigitalTime(totalMinutes)}. Coba gerakkan jarum panjang ke angka 12 (jam tepat) atau angka 6 (setengah jam).`;

  const clockSizePx = getClockSizePixels(config.design.clockSize);
  const btnShape = getButtonStyleClass(config.design.buttonShape);

  const tutorialSteps = [
    {
      title: '1. Geser Jarum Pendek untuk Mengatur Jam',
      desc: 'Sentuh atau klik jarum pendek (lebih tebal) lalu tarik memutar ke angka 1 sampai 12. Untuk pukul 04.00, jarum pendek menunjuk tepat ke angka 4.',
      demoMinutes: 240, // 04.00
      demoLabel: 'Contoh 04.00',
    },
    {
      title: '2. Geser Jarum Panjang untuk Jam Tepat & Setengah Jam',
      desc: 'Tarik jarum panjang (lebih panjang) ke angka 12 untuk jam tepat (.00) atau ke angka 6 untuk setengah jam (.30). Perhatikan jarum pendek ikut bergeser ke tengah angka!',
      demoMinutes: 270, // 04.30
      demoLabel: 'Contoh 04.30',
    },
    {
      title: '3. Gunakan Tombol +1 Menit, Slider & Kecepatan Animasi',
      desc: 'Kamu bisa memakai tombol +1 MENIT, -1 MENIT, +1 JAM, -1 JAM, slider menit 00–59, mengatur kecepatan animasi jarum, serta memperbesar atau memperkecil jam!',
      demoMinutes: 239, // 03.59
      demoLabel: 'Contoh 03.59',
    },
  ];

  const activeTut = tutorialSteps[tutorialStep] ?? tutorialSteps[0];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold text-sky-700">
            Simulasi Jam Analog Interaktif · Materi Matematika Kelas 2 SD
          </p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Simulasi Jam Dunia Waktu
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-2xl border border-sky-200 bg-white p-1 shadow-xs">
            {[
              { id: 'learn' as const, label: 'Mode Belajar' },
              { id: 'challenge' as const, label: 'Mode Tantangan' },
              { id: 'experiment' as const, label: 'Mode Eksperimen' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  setMode(tab.id);
                  setChallengeFeedback({ status: 'idle', result: null });
                }}
                className={`min-h-[40px] rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap sm:text-sm ${
                  mode === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              audioEngine.playClick(config.audio);
              setShowTutorial((v) => !v);
            }}
            className={`inline-flex min-h-[42px] items-center gap-1.5 border px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${btnShape} ${
              showTutorial
                ? 'border-amber-400 bg-amber-100 text-amber-950'
                : 'border-sky-200 bg-white text-sky-900 hover:bg-sky-50'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            {showTutorial ? 'Tutup Tutorial' : 'Tutorial Gerakkan Jarum'}
          </button>
        </div>
      </div>

      {/* Interactive Tutorial Drawer */}
      {showTutorial && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/70 pb-3">
            <div>
              <p className="text-xs font-bold text-amber-800">
                Panduan Interaktif · Langkah {tutorialStep + 1} dari {tutorialSteps.length}
              </p>
              <h2 className="font-display text-lg font-extrabold text-slate-900">
                {activeTut.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowTutorial(false)}
              aria-label="Tutup tutorial"
              className="inline-flex min-h-[36px] items-center gap-1 rounded-xl border border-amber-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-amber-100"
            >
              <X className="h-4 w-4" /> Tutup
            </button>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="max-w-2xl text-sm leading-relaxed text-slate-800">{activeTut.desc}</p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  setTotalMinutes(activeTut.demoMinutes);
                  audioEngine.speak(activeTut.desc, config.audio, 'tiki');
                }}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 whitespace-nowrap"
              >
                <Compass className="h-4 w-4" /> {activeTut.demoLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  setTutorialStep((s) => (s + 1) % tutorialSteps.length);
                }}
                className="inline-flex min-h-[40px] items-center gap-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-950 hover:bg-amber-100 whitespace-nowrap"
              >
                Langkah Berikutnya <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Zone Simulation Stage */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Zone: Interactive Analog Clock Stage */}
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm lg:col-span-7 sm:p-6">
          {/* Interval & Animation Speed Controls */}
          <div className="flex w-full flex-col gap-2.5 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Interval Geser:</span>
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { step: 1 as const, label: '1 Menit (00–59)' },
                  { step: 5 as const, label: '5 Menit' },
                  { step: 30 as const, label: 'Tepat & .30' },
                ].map((opt) => (
                  <button
                    key={opt.step}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick(config.audio);
                      setSnapStep(opt.step);
                    }}
                    className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-bold transition whitespace-nowrap ${
                      snapStep === opt.step
                        ? 'bg-white text-sky-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">Animasi:</span>
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { id: 'slow' as const, label: 'Lambat' },
                  { id: 'normal' as const, label: 'Normal' },
                  { id: 'fast' as const, label: 'Cepat' },
                ].map((spd) => (
                  <button
                    key={spd.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick(config.audio);
                      setAnimationSpeed(spd.id);
                    }}
                    className={`min-h-[34px] rounded-lg px-2.5 py-1 text-xs font-bold transition whitespace-nowrap ${
                      animationSpeed === spd.id
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {spd.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <InteractiveClock
            totalMinutes={totalMinutes}
            onChangeMinutes={(next) => {
              setTotalMinutes(next);
              if (challengeFeedback.status !== 'idle') {
                setChallengeFeedback({ status: 'idle', result: null });
              }
            }}
            interactiveDrag
            showDigital={mode !== 'challenge'}
            hiddenDigitalLabel="Waktu digital disembunyikan dalam Mode Tantangan"
            showControls
            showMinuteSlider
            showZoomControls
            snapStep={snapStep}
            animationSpeed={animationSpeed}
            sizePx={clockSizePx}
            clockFaceColor={config.design.clockFaceColor}
            clockBezelColor={config.design.clockBezelColor}
            clockNumberColor={config.design.clockNumberColor}
            hourHandColor={config.design.hourHandColor}
            minuteHandColor={config.design.minuteHandColor}
            numberStyle={config.design.clockNumberStyle}
            clockAppearance={config.design.clockAppearance}
            showMinuteTicks={config.design.showMinuteTicks}
            audioSettings={config.audio}
            helperHighlightHalfHour={mode === 'experiment'}
            feedbackStatus={mode === 'challenge' ? challengeFeedback.status : 'idle'}
          />
        </div>

        {/* Right Zone: Control & Concept Deck */}
        <div className="space-y-5 lg:col-span-5">
          {mode === 'learn' && (
            <>
              <div className="space-y-4 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Mode Belajar Bebas
                  </h2>
                  <button
                    type="button"
                    onClick={() =>
                      audioEngine.speak(
                        `${handDesc.hourDesc}. ${handDesc.minuteDesc}.`,
                        config.audio,
                        'tiki'
                      )
                    }
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-200 whitespace-nowrap"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Bacakan Posisi
                  </button>
                </div>

                {/* Real-time hand position breakdown */}
                <div className="space-y-2 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm">
                  <p className="font-bold text-slate-900">Posisi Jarum Saat Ini:</p>
                  <p className="text-slate-700">· {handDesc.hourDesc}</p>
                  <p className="text-slate-700">· {handDesc.minuteDesc}</p>
                </div>

                {/* Organized Grade 2 Quick Presets */}
                <div className="space-y-3">
                  <div>
                    <p className="mb-1.5 text-xs font-bold text-slate-600">
                      Coba Cepat Jam Tepat (.00):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['01.00', '03.00', '04.00', '06.00', '09.00', '12.00'].map((timeStr) => {
                        const [hh, mm] = timeStr.split('.').map(Number);
                        const mins = (hh % 12) * 60 + mm;
                        return (
                          <button
                            key={timeStr}
                            type="button"
                            onClick={() => {
                              audioEngine.playClick(config.audio);
                              setTotalMinutes(mins);
                              audioEngine.speak(`Pukul ${timeStr} tepat`, config.audio, 'tiki');
                            }}
                            className={`font-mono-num min-h-[40px] rounded-xl border px-3 py-1.5 text-sm font-bold transition ${
                              totalMinutes === mins
                                ? 'border-sky-600 bg-sky-600 text-white'
                                : 'border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100'
                            }`}
                          >
                            {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-bold text-slate-600">
                      Coba Cepat Setengah Jam (.30):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['02.30', '04.30', '06.30', '08.30', '10.30'].map((timeStr) => {
                        const [hh, mm] = timeStr.split('.').map(Number);
                        const mins = (hh % 12) * 60 + mm;
                        return (
                          <button
                            key={timeStr}
                            type="button"
                            onClick={() => {
                              audioEngine.playClick(config.audio);
                              setTotalMinutes(mins);
                              audioEngine.speak(`Pukul ${timeStr}`, config.audio, 'tiki');
                            }}
                            className={`font-mono-num min-h-[40px] rounded-xl border px-3 py-1.5 text-sm font-bold transition ${
                              totalMinutes === mins
                                ? 'border-purple-600 bg-purple-600 text-white'
                                : 'border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100'
                            }`}
                          >
                            {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="mb-1.5 text-xs font-bold text-slate-600">
                      Latihan Pergerakan 1 Menit (00–59):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['03.00', '03.01', '03.29', '03.59'].map((timeStr) => {
                        const [hh, mm] = timeStr.split('.').map(Number);
                        const mins = (hh % 12) * 60 + mm;
                        return (
                          <button
                            key={timeStr}
                            type="button"
                            onClick={() => {
                              audioEngine.playClick(config.audio);
                              setTotalMinutes(mins);
                              audioEngine.speak(`Pukul ${timeStr}`, config.audio, 'tiki');
                            }}
                            className={`font-mono-num min-h-[40px] rounded-xl border px-3 py-1.5 text-sm font-bold transition ${
                              totalMinutes === mins
                                ? 'border-teal-600 bg-teal-600 text-white'
                                : 'border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100'
                            }`}
                          >
                            {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <CharacterDialogBox
                character="tiki"
                characterName={config.tikiName}
                pose="happy"
                text={config.dialogs.simLearnHint}
                customImageUrl={config.images.tikiImageUrl}
                onSpeak={() => audioEngine.speak(config.dialogs.simLearnHint, config.audio, 'tiki')}
              />
            </>
          )}

          {mode === 'challenge' && (
            <div className="space-y-4 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">Mode Tantangan</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Benar berturut-turut: <span className="font-mono-num font-bold text-emerald-700">{streak}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => pickNewTarget()}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-200 whitespace-nowrap"
                >
                  <Shuffle className="h-3.5 w-3.5" /> Soal Baru
                </button>
              </div>

              {/* Challenge Difficulty Filter */}
              <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
                {[
                  { id: 'all' as const, label: 'Campuran Kelas 2' },
                  { id: 'exact' as const, label: 'Jam Tepat (.00)' },
                  { id: 'half' as const, label: 'Setengah Jam (.30)' },
                  ...(config.learning.showAdvancedChallenge
                    ? [{ id: 'advanced' as const, label: 'Lanjutan (.15 / .45)' }]
                    : []),
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      audioEngine.playClick(config.audio);
                      setChallengeFilter(f.id);
                      pickNewTarget(f.id);
                    }}
                    className={`min-h-[34px] flex-1 rounded-lg px-2.5 py-1 text-xs font-bold transition whitespace-nowrap ${
                      challengeFilter === f.id
                        ? 'bg-white text-amber-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Target Prompt Box */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                <p className="text-xs font-bold text-amber-900">
                  Putar jarum jam hingga menunjukkan pukul:
                </p>
                <p className="font-mono-num mt-1 text-4xl font-extrabold text-slate-900">
                  {String(target.h).padStart(2, '0')}.{String(target.m).padStart(2, '0')}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    audioEngine.speak(
                      `Tunjukkan pukul ${String(target.h).padStart(2, '0')}.${String(target.m).padStart(2, '0')} pada jam!`,
                      config.audio,
                      'bimo'
                    )
                  }
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-sky-800 hover:underline"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Dengarkan Soal
                </button>
              </div>

              <button
                type="button"
                onClick={handleCheckChallenge}
                style={{ backgroundColor: '#059669' }}
                className={`flex min-h-[48px] w-full items-center justify-center gap-2 px-5 py-3 text-base font-extrabold text-white shadow-sm transition hover:brightness-110 ${btnShape}`}
              >
                <CheckCircle2 className="h-5 w-5" /> Periksa Jawaban
              </button>

              {/* Accurate Hand-by-Hand Diagnostic Feedback */}
              {challengeFeedback.status !== 'idle' && challengeFeedback.result && (
                <div className="space-y-3">
                  <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      {challengeFeedback.result.isHourHandCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      )}
                      <span
                        className={
                          challengeFeedback.result.isHourHandCorrect
                            ? 'text-emerald-800'
                            : 'text-amber-900'
                        }
                      >
                        {challengeFeedback.result.hourStatusText}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {challengeFeedback.result.isMinuteHandCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      )}
                      <span
                        className={
                          challengeFeedback.result.isMinuteHandCorrect
                            ? 'text-emerald-800'
                            : 'text-amber-900'
                        }
                      >
                        {challengeFeedback.result.minuteStatusText}
                      </span>
                    </div>
                  </div>

                  <CharacterDialogBox
                    character={challengeFeedback.status === 'correct' ? 'tiki' : 'bimo'}
                    characterName={
                      challengeFeedback.status === 'correct' ? config.tikiName : config.bimoName
                    }
                    pose={challengeFeedback.status === 'correct' ? 'excited' : 'thinking'}
                    text={challengeFeedback.result.feedbackMessage}
                    customImageUrl={
                      challengeFeedback.status === 'correct'
                        ? config.images.tikiImageUrl
                        : config.images.bimoImageUrl
                    }
                    tone={challengeFeedback.status === 'correct' ? 'success' : 'hint'}
                  />

                  {challengeFeedback.status === 'correct' && (
                    <button
                      type="button"
                      onClick={() => pickNewTarget()}
                      style={{ backgroundColor: config.design.buttonColor }}
                      className={`flex min-h-[44px] w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-extrabold text-white transition hover:brightness-110 ${btnShape}`}
                    >
                      Soal Tantangan Berikutnya <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'experiment' && (
            <div className="space-y-4 rounded-3xl border border-purple-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-slate-900">Mode Eksperimen</h2>
                <button
                  type="button"
                  onClick={() => audioEngine.speak(experimentPrompt, config.audio, 'bimo')}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-900 hover:bg-purple-200 whitespace-nowrap"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Dengarkan
                </button>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                  <HelpCircle className="h-4 w-4" /> Pertanyaan Eksplorasi {config.tikiName} &amp;{' '}
                  {config.bimoName}:
                </p>
                <p className="mt-1.5 text-sm font-bold text-slate-900">
                  &ldquo;{config.dialogs.simExperimentQuestion}&rdquo;
                </p>
              </div>

              <div className="space-y-1.5 rounded-2xl border border-purple-100 bg-slate-50 p-4 text-xs font-semibold text-slate-700">
                <p className="font-bold text-slate-900">Hasil Pengamatan Langsung:</p>
                <p>· {handDesc.hourDesc}</p>
                <p>· {handDesc.minuteDesc}</p>
              </div>

              <CharacterDialogBox
                character="bimo"
                characterName={config.bimoName}
                pose={minute === 30 ? 'celebrating' : 'thinking'}
                text={experimentPrompt}
                customImageUrl={config.images.bimoImageUrl}
                onSpeak={() => audioEngine.speak(experimentPrompt, config.audio, 'bimo')}
                tone={minute === 30 ? 'success' : 'neutral'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
