import React, { useState } from 'react';
import { Lock, CheckCircle2, Star, Play, Unlock, Award } from 'lucide-react';
import { MediaConfig, StudentProgress } from '../types/media';
import { TikiCharacter, BimoCharacter } from '../components/characters/TikiBimo';
import { audioEngine } from '../utils/audioEngine';
import { getButtonStyleClass } from '../utils/designHelpers';

interface AdventureMapProps {
  config: MediaConfig;
  progress: StudentProgress;
  onSelectLevel: (levelId: number) => void;
  onOpenRewards: () => void;
}

export const AdventureMap: React.FC<AdventureMapProps> = ({
  config,
  progress,
  onSelectLevel,
  onOpenRewards,
}) => {
  const [mapFailed, setMapFailed] = useState(false);

  const isLevelUnlocked = (levelId: number) => {
    if (config.learning.unlockAllLevels) return true;
    if (levelId === 1) return true;
    return progress.completedLevels.includes(levelId - 1);
  };

  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);
  const btnShape = getButtonStyleClass(config.design.buttonShape);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-sky-200 bg-sky-100 shadow-sm">
        {!mapFailed && config.images.mapBg ? (
          <img
            src={config.images.mapBg}
            alt="Peta Petualangan Dunia Waktu"
            referrerPolicy="no-referrer"
            onError={() => setMapFailed(true)}
            className="h-52 w-full object-cover sm:h-64"
          />
        ) : (
          <div className="h-52 w-full bg-gradient-to-r from-sky-300 via-teal-200 to-amber-200 sm:h-64" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-4 p-6 text-white sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-amber-300">
              Peta Dunia Waktu · {progress.completedLevels.length} dari {config.levels.length} Area Selesai
            </p>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
              Peta Petualangan {config.tikiName} &amp; {config.bimoName}
            </h1>
            <p className="mt-0.5 text-xs text-sky-100">{config.dialogs.mapSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur-xs">
              <span className="font-mono-num">{totalStars}/{config.levels.length * 3}</span> Bintang
            </div>
            <button
              type="button"
              onClick={onOpenRewards}
              className={`inline-flex min-h-[42px] items-center gap-1.5 bg-amber-400 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:bg-amber-300 whitespace-nowrap ${btnShape}`}
            >
              <Award className="h-4 w-4" />
              Penghargaan ({progress.earnedBadges.length})
            </button>
          </div>
        </div>
      </div>

      {config.learning.unlockAllLevels && (
        <div className="flex items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          <Unlock className="h-4 w-4 shrink-0 text-teal-700" />
          <span>Mode Guru aktif: seluruh {config.levels.length} area petualangan terbuka untuk dijelajahi langsung.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {config.levels.map((level, index) => {
          const unlocked = isLevelUnlocked(level.id);
          const completed = progress.completedLevels.includes(level.id);
          const stars = progress.levelStars[level.id] ?? 0;
          const bestScore = progress.levelBestScores[level.id] ?? 0;
          const showTiki = index % 2 === 0;

          return (
            <div
              key={level.id}
              className={`flex flex-col justify-between rounded-3xl border p-5 transition ${
                unlocked
                  ? 'border-sky-200 bg-white shadow-sm hover:border-sky-400'
                  : 'border-slate-200 bg-slate-50/80 opacity-85'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
                  <span>
                    Area {level.id} · {level.questionCount} Soal · {level.difficulty}
                  </span>
                  {completed ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Selesai
                    </span>
                  ) : unlocked ? (
                    <span className="font-bold text-sky-700">Terbuka</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-slate-500">
                      <Lock className="h-3.5 w-3.5" /> Terkunci
                    </span>
                  )}
                </div>

                {level.customImageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-sky-100">
                    <img
                      src={level.customImageUrl}
                      alt={level.areaName}
                      referrerPolicy="no-referrer"
                      className="h-28 w-full object-cover"
                    />
                  </div>
                ) : null}

                <div className="flex items-center gap-3 rounded-2xl bg-sky-50/70 p-3">
                  <div className="shrink-0">
                    {showTiki ? (
                      <TikiCharacter
                        pose={completed ? 'excited' : 'pointing'}
                        size={66}
                        customImageUrl={config.images.tikiImageUrl}
                      />
                    ) : (
                      <BimoCharacter
                        pose={completed ? 'celebrating' : 'happy'}
                        size={66}
                        customImageUrl={config.images.bimoImageUrl}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-extrabold text-slate-900">
                      {level.areaName}
                    </h2>
                    <p className="text-xs font-bold" style={{ color: level.accentColor }}>
                      Misi: {level.gameTitle}
                    </p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">{level.description}</p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1" aria-label={`${stars} dari 3 bintang`}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-5 w-5 ${
                          s <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">{level.badgeName}</span>
                    {bestScore > 0 && (
                      <span className="font-mono-num ml-2 text-slate-500">· Skor {bestScore}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {unlocked ? (
                  <button
                    type="button"
                    onClick={() => {
                      audioEngine.playClick(config.audio);
                      onSelectLevel(level.id);
                    }}
                    style={{ backgroundColor: level.accentColor }}
                    className={`flex min-h-[46px] w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-extrabold text-white shadow-xs transition hover:brightness-110 whitespace-nowrap ${btnShape}`}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {completed ? 'Main Lagi' : 'Masuk Area'}
                  </button>
                ) : (
                  <div className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-500">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="truncate">{level.unlockRequirement}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
