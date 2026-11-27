import React from 'react';
import { Star, Coins, Award, Trophy } from 'lucide-react';
import { MediaConfig, StudentProgress } from '../types/media';
import { BadgeEmblem } from './GameLevelView';
import { TikiCharacter, BimoCharacter } from '../components/characters/TikiBimo';

interface RewardsPageProps {
  config: MediaConfig;
  progress: StudentProgress;
  onGoMap: () => void;
}

export const RewardsPage: React.FC<RewardsPageProps> = ({
  config,
  progress,
  onGoMap,
}) => {
  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-purple-700">Pencapaian &amp; Hadiah</p>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Koleksi Penghargaan
          </h1>
        </div>
        <button
          type="button"
          onClick={onGoMap}
          className="min-h-[42px] rounded-xl bg-sky-600 px-5 py-2 text-sm font-bold text-white hover:bg-sky-700 whitespace-nowrap"
        >
          Kembali ke Peta Petualangan
        </button>
      </div>

      {/* Top Stats Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl border border-amber-200 bg-white p-5 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Star className="h-7 w-7 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Bintang</p>
            <p className="font-mono-num text-2xl font-extrabold text-slate-900">
              {totalStars} / {config.levels.length * 3}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-sky-200 bg-white p-5 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Skor</p>
            <p className="font-mono-num text-2xl font-extrabold text-slate-900">
              {progress.totalScore} Poin
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-teal-200 bg-white p-5 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <Coins className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Koin Penjelajah</p>
            <p className="font-mono-num text-2xl font-extrabold text-slate-900">
              {progress.coins} Koin
            </p>
          </div>
        </div>
      </div>

      {/* 6 Badges Gallery */}
      <section className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            <h2 className="font-display text-xl font-extrabold text-slate-900">
              Lencana Penjelajah Waktu ({progress.earnedBadges.length}/{config.levels.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <TikiCharacter pose="excited" size={56} />
            <BimoCharacter pose="celebrating" size={56} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {config.levels.map((lvl) => {
            const earned = progress.earnedBadges.includes(lvl.badgeName);
            const stars = progress.levelStars[lvl.id] ?? 0;

            return (
              <div
                key={lvl.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 ${
                  earned
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <BadgeEmblem icon={lvl.badgeIcon} earned={earned} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Area {lvl.id} · {earned ? 'Sudah Diraih' : 'Belum Diraih'}
                  </p>
                  <h3 className="font-display text-base font-extrabold text-slate-900">
                    {lvl.badgeName}
                  </h3>
                  <p className="text-xs text-slate-600">{lvl.areaName}</p>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Progress History */}
      <section className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-display text-xl font-extrabold text-slate-900">
          Riwayat Permainan Terakhir
        </h2>
        {progress.history.length === 0 ? (
          <p className="text-sm text-slate-500">
            Belum ada riwayat permainan. Ayo mulai petualangan di Peta Dunia Waktu!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-4">Waktu</th>
                  <th className="py-2 pr-4">Area Permainan</th>
                  <th className="py-2 pr-4">Benar / Salah</th>
                  <th className="py-2 pr-4">Bintang</th>
                  <th className="py-2 text-right">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {progress.history.slice(0, 10).map((h) => (
                  <tr key={h.id}>
                    <td className="py-2.5 pr-4 text-xs text-slate-500 whitespace-nowrap">{h.date}</td>
                    <td className="py-2.5 pr-4 font-semibold text-slate-900">{h.levelName}</td>
                    <td className="font-mono-num py-2.5 pr-4 text-xs text-slate-700">
                      {h.correctCount} / {h.wrongCount}
                    </td>
                    <td className="font-mono-num py-2.5 pr-4 text-amber-600 font-bold">
                      {h.stars} Bintang
                    </td>
                    <td className="font-mono-num py-2.5 text-right font-bold text-slate-900">
                      {h.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
