import React, { useEffect, useState } from 'react';
import {
  Play,
  BookOpen,
  Compass,
  Volume2,
  Settings,
  Edit3,
  Film,
  SkipForward,
  Clock,
} from 'lucide-react';
import { AppView, MediaConfig, StudentProgress } from '../types/media';
import { TikiCharacter, BimoCharacter } from '../components/characters/TikiBimo';
import { InteractiveClock } from '../components/clock/InteractiveClock';
import { audioEngine } from '../utils/audioEngine';
import { getButtonStyleClass } from '../utils/designHelpers';

interface HomePageProps {
  config: MediaConfig;
  progress: StudentProgress;
  onNavigate: (view: AppView) => void;
  onOpenAudio: () => void;
  onOpenTeacher: (initialTab?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  config,
  progress,
  onNavigate,
  onOpenAudio,
  onOpenTeacher,
}) => {
  const [heroMinutes, setHeroMinutes] = useState(180);
  const [showStoryCard, setShowStoryCard] = useState(true);
  const [bgFailed, setBgFailed] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroMinutes((prev) => (prev + 30) % 720);
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);
  const buttonRadiusClass = getButtonStyleClass(config.design.buttonShape);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-sky-200 bg-sky-100 shadow-sm">
        {!bgFailed && config.images.heroBg ? (
          <img
            src={config.images.heroBg}
            alt="Latar Dunia Waktu"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/55 to-sky-950/35" />

        <svg
          viewBox="0 0 180 60"
          className="animate-cloud pointer-events-none absolute top-4 left-12 w-36 opacity-80"
          aria-hidden="true"
        >
          <path
            d="M35 45H145C157 45 166 36 166 25C166 15 158 7 148 7C144 7 140 8 137 10C132 4 123 0 113 0C98 0 85 11 82 24C79 22 74 20 69 20C57 20 48 29 48 40H35C26 40 20 45 35 45Z"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
        </svg>
        <svg
          viewBox="0 0 180 60"
          className="animate-cloud-slow pointer-events-none absolute top-8 right-16 hidden w-44 opacity-75 md:block"
          aria-hidden="true"
        >
          <path
            d="M35 45H145C157 45 166 36 166 25C166 15 158 7 148 7C144 7 140 8 137 10C132 4 123 0 113 0C98 0 85 11 82 24C79 22 74 20 69 20C57 20 48 29 48 40H35C26 40 20 45 35 45Z"
            fill="#FFFFFF"
            fillOpacity="0.8"
          />
        </svg>

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 px-6 py-10 md:px-10 lg:grid-cols-12 lg:py-12">
          <div className="space-y-5 text-white lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 text-sm font-semibold text-sky-200">
              <Clock className="h-5 w-5 text-amber-300" />
              <span>{config.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{config.className}</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
                {config.title}
              </h1>
              <p className="font-display text-lg font-semibold text-amber-200 sm:text-xl">
                {config.subtitle}
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-sky-50 sm:text-base">
                {config.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onNavigate('map');
                }}
                style={{ backgroundColor: config.design.buttonColor }}
                className={`inline-flex min-h-[48px] items-center gap-2.5 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:brightness-110 active:scale-[0.99] whitespace-nowrap ${buttonRadiusClass}`}
              >
                <Play className="h-5 w-5 fill-current" />
                MULAI PETUALANGAN
              </button>

              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onNavigate('learn');
                }}
                className={`inline-flex min-h-[48px] items-center gap-2 bg-amber-400 px-6 py-3 text-base font-extrabold text-slate-950 shadow-md transition hover:bg-amber-300 whitespace-nowrap ${buttonRadiusClass}`}
              >
                <BookOpen className="h-5 w-5" />
                BELAJAR DULU
              </button>

              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onNavigate('demo');
                }}
                className={`inline-flex min-h-[48px] items-center gap-2 border border-white/40 bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur-xs transition hover:bg-white/25 whitespace-nowrap ${buttonRadiusClass}`}
              >
                <Film className="h-4 w-4" />
                LIHAT CARA MEMBACA JAM
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onNavigate('guide');
                }}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/25 whitespace-nowrap"
              >
                <Compass className="h-4 w-4" /> PANDUAN
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onOpenAudio();
                }}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/25 whitespace-nowrap"
              >
                <Volume2 className="h-4 w-4" /> PENGATURAN SUARA
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onOpenTeacher('guide');
                }}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/25 whitespace-nowrap"
              >
                <Settings className="h-4 w-4" /> MODE GURU
              </button>
              <button
                type="button"
                onClick={() => {
                  audioEngine.playClick(config.audio);
                  onOpenTeacher('texts');
                }}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-teal-500/85 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-500 whitespace-nowrap"
              >
                <Edit3 className="h-4 w-4" /> EDIT MEDIA
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 lg:col-span-5">
            <div className="relative flex items-end justify-center gap-2">
              <div className="animate-bob hidden sm:block">
                <TikiCharacter
                  pose="pointing"
                  size={120}
                  customImageUrl={config.images.tikiImageUrl}
                />
              </div>

              <div className="rounded-full bg-white/95 p-2 shadow-xl">
                <InteractiveClock
                  totalMinutes={heroMinutes}
                  interactiveDrag={false}
                  showDigital={false}
                  showControls={false}
                  sizePx={190}
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

              <div className="animate-bob hidden sm:block" style={{ animationDelay: '0.6s' }}>
                <BimoCharacter
                  pose="excited"
                  size={120}
                  customImageUrl={config.images.bimoImageUrl}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 sm:hidden">
              <TikiCharacter pose="pointing" size={88} customImageUrl={config.images.tikiImageUrl} />
              <BimoCharacter pose="excited" size={88} customImageUrl={config.images.bimoImageUrl} />
            </div>
          </div>
        </div>
      </section>

      {showStoryCard && (
        <section className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="flex shrink-0 items-center gap-2">
              <TikiCharacter pose="happy" size={100} customImageUrl={config.images.tikiImageUrl} />
              <BimoCharacter pose="happy" size={100} customImageUrl={config.images.bimoImageUrl} />
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-500 md:justify-start">
                <span>Cerita Pembuka</span>
                <span aria-hidden="true">·</span>
                <span>{config.tikiName} &amp; {config.bimoName}</span>
                <span aria-hidden="true">·</span>
                <span>{config.schoolName}</span>
              </div>
              <p className="text-base leading-relaxed font-medium text-slate-800 md:text-lg">
                &ldquo;{config.introNarration}&rdquo;
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
                <button
                  type="button"
                  onClick={() =>
                    audioEngine.speak(
                      config.introNarration,
                      config.audio,
                      'tiki',
                      'intro_narration'
                    )
                  }
                  className={`inline-flex min-h-[44px] items-center gap-2 bg-sky-100 px-4 py-2 text-sm font-bold text-sky-900 transition hover:bg-sky-200 whitespace-nowrap ${buttonRadiusClass}`}
                >
                  <Volume2 className="h-4 w-4" /> Dengarkan Cerita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.stopNarration();
                    setShowStoryCard(false);
                  }}
                  className={`inline-flex min-h-[44px] items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 whitespace-nowrap ${buttonRadiusClass}`}
                >
                  <SkipForward className="h-4 w-4" /> Lewati Cerita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioEngine.stopNarration();
                    audioEngine.playClick(config.audio);
                    onNavigate('map');
                  }}
                  style={{ backgroundColor: config.design.buttonColor }}
                  className={`inline-flex min-h-[44px] items-center gap-2 px-5 py-2 text-sm font-bold text-white transition hover:brightness-110 whitespace-nowrap ${buttonRadiusClass}`}
                >
                  <Play className="h-4 w-4 fill-current" /> Mulai Petualangan
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => onNavigate('simulation')}
          className="flex flex-col items-start justify-between rounded-2xl border border-sky-200 bg-white p-5 text-left shadow-xs transition hover:border-sky-400 hover:bg-sky-50/40"
        >
          <span className="font-display text-lg font-bold text-slate-900">
            Simulasi Jam Interaktif
          </span>
          <span className="mt-1 text-sm text-slate-600">
            Putar langsung jarum pendek &amp; panjang dalam Mode Belajar, Tantangan, atau Eksperimen.
          </span>
          <span className="mt-4 text-xs font-bold text-sky-700">Buka Simulasi Jam →</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('learn')}
          className="flex flex-col items-start justify-between rounded-2xl border border-teal-200 bg-white p-5 text-left shadow-xs transition hover:border-teal-400 hover:bg-teal-50/40"
        >
          <span className="font-display text-lg font-bold text-slate-900">
            Materi Pembelajaran
          </span>
          <span className="mt-1 text-sm text-slate-600">
            Pelajari angka jam, fungsi jarum, jam tepat, setengah jam, dan jadwal harian.
          </span>
          <span className="mt-4 text-xs font-bold text-teal-700">Mulai Belajar →</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('map')}
          className="flex flex-col items-start justify-between rounded-2xl border border-amber-200 bg-white p-5 text-left shadow-xs transition hover:border-amber-400 hover:bg-amber-50/40"
        >
          <span className="font-display text-lg font-bold text-slate-900">
            Peta 6 Dunia Waktu
          </span>
          <span className="mt-1 text-sm text-slate-600">
            Selesaikan {progress.completedLevels.length}/{config.levels.length} area petualangan dan raih semua lencana!
          </span>
          <span className="mt-4 text-xs font-bold text-amber-700">Lihat Peta →</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('rewards')}
          className="flex flex-col items-start justify-between rounded-2xl border border-purple-200 bg-white p-5 text-left shadow-xs transition hover:border-purple-400 hover:bg-purple-50/40"
        >
          <span className="font-display text-lg font-bold text-slate-900">
            Koleksi Penghargaan
          </span>
          <span className="font-mono-num mt-1 text-sm text-slate-600">
            {totalStars} Bintang · {progress.earnedBadges.length} Lencana · {progress.coins} Koin
          </span>
          <span className="mt-4 text-xs font-bold text-purple-700">Lihat Koleksi →</span>
        </button>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-sky-200/70 pt-4 text-xs text-slate-500">
        <div>
          <span>{config.mediaName}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>{config.schoolName}</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Pengajar: {config.teacherName}</span>
        </div>
        <button
          type="button"
          onClick={() => onOpenTeacher('texts')}
          className="font-semibold text-sky-700 hover:underline"
        >
          Buka Editor Visual Media
        </button>
      </footer>
    </div>
  );
};
