import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Gauge, ArrowRight, Volume2 } from 'lucide-react';
import { MediaConfig } from '../types/media';
import { InteractiveClock } from '../components/clock/InteractiveClock';
import { CharacterDialogBox } from '../components/characters/TikiBimo';
import { audioEngine } from '../utils/audioEngine';
import { getClockSizePixels } from '../utils/designHelpers';

interface DemoAnimationPageProps {
  config: MediaConfig;
  onTryYourself: () => void;
}

export const DemoAnimationPage: React.FC<DemoAnimationPageProps> = ({
  config,
  onTryYourself,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [narrationPhase, setNarrationPhase] = useState<'start' | 'moving' | 'end'>('start');

  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.round(140 / speed);
    const timer = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= 30) {
          setIsPlaying(false);
          setNarrationPhase('end');
          audioEngine.speak(config.dialogs.demoStepEnd, config.audio, 'tiki', 'demo_end');
          return 30;
        }
        const next = prev + 1;
        if (next === 1) {
          setNarrationPhase('moving');
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, speed, config.audio, config.dialogs.demoStepEnd]);

  const handlePlayToggle = () => {
    if (!isPlaying) {
      if (step >= 30) {
        setStep(0);
        setNarrationPhase('start');
      }
      if (step === 0 || step >= 30) {
        audioEngine.speak(config.dialogs.demoStepStart, config.audio, 'tiki', 'demo_start');
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    audioEngine.stopNarration();
    setStep(0);
    setNarrationPhase('start');
    setIsPlaying(true);
    audioEngine.speak(config.dialogs.demoStepStart, config.audio, 'tiki', 'demo_start');
  };

  const currentMessage =
    step === 0
      ? config.dialogs.demoStepStart
      : step < 30
        ? config.dialogs.demoStepMoving
        : config.dialogs.demoStepEnd;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-sky-700">Demonstrasi Animasi Interaktif</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Lihat Cara Membaca Jam (03.00 ke 03.30)
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            audioEngine.stopNarration();
            onTryYourself();
          }}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 whitespace-nowrap"
        >
          COBA SENDIRI <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
        <div className="flex flex-col items-center rounded-3xl border border-sky-200 bg-white p-6 shadow-sm lg:col-span-6">
          <InteractiveClock
            totalMinutes={180 + step}
            interactiveDrag={false}
            showDigital
            showControls={false}
            helperHighlightHalfHour={step > 0}
            sizePx={getClockSizePixels(config.design.clockSize)}
            clockFaceColor={config.design.clockFaceColor}
            clockBezelColor={config.design.clockBezelColor}
            clockNumberColor={config.design.clockNumberColor}
            hourHandColor={config.design.hourHandColor}
            minuteHandColor={config.design.minuteHandColor}
            numberStyle={config.design.clockNumberStyle}
            clockAppearance={config.design.clockAppearance}
            showMinuteTicks={config.design.showMinuteTicks}
          />
        </div>

        <div className="space-y-5 lg:col-span-6">
          <div className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-slate-900">
                Pemutar Animasi Langkah demi Langkah
              </h2>
              <button
                type="button"
                onClick={() => audioEngine.speak(currentMessage, config.audio, 'tiki')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-200"
              >
                <Volume2 className="h-3.5 w-3.5" /> Narasi
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>03.00 (Jam Tepat)</span>
                <span className="font-mono-num text-sky-700">+{step} Menit</span>
                <span>03.30 (Setengah Jam)</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={step}
                onChange={(e) => {
                  setIsPlaying(false);
                  const val = Number(e.target.value);
                  setStep(val);
                  setNarrationPhase(val === 0 ? 'start' : val === 30 ? 'end' : 'moving');
                }}
                aria-label="Garis waktu animasi jam"
                className="h-3 w-full cursor-pointer accent-sky-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePlayToggle}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-sky-700 whitespace-nowrap"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                {isPlaying ? 'Jeda' : step >= 30 ? 'Putar Lagi' : 'Putar Animasi'}
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4" /> Ulangi
              </button>

              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <Gauge className="mx-1.5 h-4 w-4 text-slate-500" />
                {[
                  { val: 0.5, label: 'Lambat' },
                  { val: 1, label: 'Normal' },
                  { val: 1.5, label: 'Cepat' },
                ].map((sp) => (
                  <button
                    key={sp.val}
                    type="button"
                    onClick={() => setSpeed(sp.val)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      speed === sp.val
                        ? 'bg-white text-sky-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className={`rounded-xl p-2.5 ${narrationPhase === 'start' ? 'bg-sky-100 font-bold text-sky-900' : 'bg-slate-50 text-slate-500'}`}>
                1. Pukul 03.00
              </div>
              <div className={`rounded-xl p-2.5 ${narrationPhase === 'moving' ? 'bg-amber-100 font-bold text-amber-900' : 'bg-slate-50 text-slate-500'}`}>
                2. Jarum Bergerak
              </div>
              <div className={`rounded-xl p-2.5 ${narrationPhase === 'end' ? 'bg-emerald-100 font-bold text-emerald-900' : 'bg-slate-50 text-slate-500'}`}>
                3. Pukul 03.30
              </div>
            </div>
          </div>

          <CharacterDialogBox
            character="tiki"
            characterName={config.tikiName}
            pose={step >= 30 ? 'excited' : 'pointing'}
            text={currentMessage}
            customImageUrl={config.images.tikiImageUrl}
            onSpeak={() => audioEngine.speak(currentMessage, config.audio, 'tiki')}
            tone={step >= 30 ? 'success' : 'neutral'}
          />
        </div>
      </div>
    </div>
  );
};
